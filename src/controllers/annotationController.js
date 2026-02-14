import prisma from '../prisma/client.js';

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
      orderBy: { updatedAt: 'desc' }
    });

    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list annotations.', error: error.message });
  }
};

export const createAnnotation = async (req, res) => {
  try {
    const worldId = Number(req.params.worldId || req.body.worldId);
    const { title = 'Nova anotação', content = '' } = req.body;

    const world = await ensureWorldOwnership(worldId, req.userId);
    if (!world) {
      return res.status(404).json({ message: 'World not found.' });
    }

    const note = await prisma.annotation.create({
      data: {
        worldId: world.id,
        title: title.trim() || 'Sem título',
        content: content || ''
      }
    });

    return res.status(201).json(note);
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

    const { title, content } = req.body;

    const updated = await prisma.annotation.update({
      where: { id },
      data: {
        title: title !== undefined ? (title.trim() || 'Sem título') : existing.title,
        content: content !== undefined ? content : existing.content
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update annotation.', error: error.message });
  }
};

export const getAnnotation = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const note = await prisma.annotation.findUnique({
      where: { id },
      include: { world: true }
    });

    if (!note || note.world.userId !== req.userId) {
      return res.status(404).json({ message: 'Annotation not found.' });
    }

    const { world, ...payload } = note;
    return res.status(200).json(payload);
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
