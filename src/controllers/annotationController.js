import prisma from '../prisma/client.js';

const normalizeTagsInput = (raw) => {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : String(raw).split(',');
  const cleaned = list
    .map((tag) => String(tag).trim().toLowerCase())
    .filter((tag) => tag.length);
  return [...new Set(cleaned)];
};

const upsertTags = async (names) => {
  if (!names.length) return [];
  const existing = await prisma.tag.findMany({ where: { name: { in: names } } });
  const existingSet = new Set(existing.map((t) => t.name));
  const missing = names.filter((name) => !existingSet.has(name));

  if (missing.length) {
    await prisma.tag.createMany({ data: missing.map((name) => ({ name })) });
  }

  return prisma.tag.findMany({ where: { name: { in: names } } });
};

const replaceAnnotationTags = async (annotationId, tags) => {
  await prisma.annotationTag.deleteMany({ where: { annotationId } });
  if (!tags.length) return;
  await prisma.annotationTag.createMany({
    data: tags.map((tag, idx) => ({ annotationId, tagId: tag.id, position: idx })),
    skipDuplicates: true
  });
};

const serializeAnnotation = (annotation) => {
  const { annotationTags = [], world, ...rest } = annotation;
  return {
    ...rest,
    tags: annotationTags.map((at) => at.tag?.name).filter(Boolean)
  };
};

const ensureWorldOwnership = async (worldId, userId) => {
  const world = await prisma.world.findUnique({ where: { id: worldId } });
  if (!world || world.userId !== userId) return null;
  return world;
};

export const listAnnotationsByWorld = async (req, res) => {
  try {
    const worldId = Number(req.params.worldId || req.params.id);
    const world = await ensureWorldOwnership(worldId, req.userId);
    if (!world) {
      return res.status(404).json({ message: 'World not found.' });
    }

    const notes = await prisma.annotation.findMany({
      where: { worldId: world.id },
      include: { annotationTags: { include: { tag: true }, orderBy: { position: 'asc' } } },
      orderBy: [
        { order: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    return res.status(200).json(notes.map(serializeAnnotation));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list annotations.', error: error.message });
  }
};

export const createAnnotation = async (req, res) => {
  try {
    const worldId = Number(req.params.worldId || req.body.worldId);
    const { title = 'Nova anotação', content = '', tags: rawTags } = req.body;

    const world = await ensureWorldOwnership(worldId, req.userId);
    if (!world) {
      return res.status(404).json({ message: 'World not found.' });
    }

    const currentCount = await prisma.annotation.count({ where: { worldId: world.id } });

    const tagNames = normalizeTagsInput(rawTags);
    const tags = await upsertTags(tagNames);

    const note = await prisma.annotation.create({
      data: {
        worldId: world.id,
        title: title.trim() || 'Sem título',
        content: content || '',
        order: currentCount + 1,
        annotationTags: tags.length
          ? {
              createMany: {
                data: tags.map((tag, idx) => ({ tagId: tag.id, position: idx })),
                skipDuplicates: true
              }
            }
          : undefined
      },
      include: { annotationTags: { include: { tag: true }, orderBy: { position: 'asc' } } }
    });

    return res.status(201).json(serializeAnnotation(note));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create annotation.', error: error.message });
  }
};

export const updateAnnotation = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.annotation.findUnique({
      where: { id },
      include: { world: true }
    });

    if (!existing || existing.world.userId !== req.userId) {
      return res.status(404).json({ message: 'Annotation not found.' });
    }

    const { title, content, tags: rawTags } = req.body;

    const tagNames = rawTags !== undefined ? normalizeTagsInput(rawTags) : null;
    const tags = tagNames ? await upsertTags(tagNames) : null;

    const updated = await prisma.annotation.update({
      where: { id },
      data: {
        title: title !== undefined ? (title.trim() || 'Sem título') : existing.title,
        content: content !== undefined ? content : existing.content
      },
      include: { annotationTags: { include: { tag: true }, orderBy: { position: 'asc' } } }
    });

    if (tags) {
      await replaceAnnotationTags(updated.id, tags);
      const withTags = await prisma.annotation.findUnique({
        where: { id: updated.id },
        include: { annotationTags: { include: { tag: true }, orderBy: { position: 'asc' } } }
      });
      return res.status(200).json(serializeAnnotation(withTags));
    }

    return res.status(200).json(serializeAnnotation(updated));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update annotation.', error: error.message });
  }
};

export const getAnnotation = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const note = await prisma.annotation.findUnique({
      where: { id },
      include: { world: true, annotationTags: { include: { tag: true }, orderBy: { position: 'asc' } } }
    });

    if (!note || note.world.userId !== req.userId) {
      return res.status(404).json({ message: 'Annotation not found.' });
    }

    const { world, ...payload } = note;
    return res.status(200).json(serializeAnnotation(payload));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch annotation.', error: error.message });
  }
};

export const deleteAnnotation = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.annotation.findUnique({
      where: { id },
      include: { world: true }
    });

    if (!existing || existing.world.userId !== req.userId) {
      return res.status(404).json({ message: 'Annotation not found.' });
    }

    await prisma.annotation.delete({ where: { id } });
    return res.status(200).json({ message: 'Annotation deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete annotation.', error: error.message });
  }
};

export const reorderAnnotations = async (req, res) => {
  try {
    const worldId = Number(req.params.worldId || req.params.id);
    const { order } = req.body;

    if (!Array.isArray(order) || !order.length) {
      return res.status(400).json({ message: 'Order array is required.' });
    }

    const world = await ensureWorldOwnership(worldId, req.userId);
    if (!world) {
      return res.status(404).json({ message: 'World not found.' });
    }

    const notes = await prisma.annotation.findMany({
      where: { worldId: world.id },
      select: { id: true }
    });

    const validIds = new Set(notes.map((n) => n.id));
    const filteredOrder = order.filter((id) => validIds.has(Number(id))).map(Number);

    if (!filteredOrder.length) {
      return res.status(400).json({ message: 'No valid annotation ids to reorder.' });
    }

    const updates = filteredOrder.map((id, index) =>
      prisma.annotation.update({
        where: { id },
        data: { order: filteredOrder.length - index }
      })
    );

    await prisma.$transaction(updates);

    const reordered = await prisma.annotation.findMany({
      where: { worldId: world.id },
      include: { annotationTags: { include: { tag: true }, orderBy: { position: 'asc' } } },
      orderBy: [
        { order: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    return res.status(200).json(reordered.map(serializeAnnotation));
  } catch (error) {
    console.error('[reorderAnnotations] error:', error);
    return res.status(500).json({ message: 'Failed to reorder annotations.', error: error.message });
  }
};
