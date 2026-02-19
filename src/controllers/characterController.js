import prisma from '../prisma/client.js';
import { getRandomValue } from '../services/randomGenerator.js';

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  return value === true || value === 'true' || value === 1 || value === '1';
};

const ensureWorldOwnership = async (worldId, userId) => {
  const world = await prisma.world.findUnique({ where: { id: worldId } });
  if (!world || world.userId !== userId) {
    return null;
  }
  return world;
};

const resolveRandomOrValue = async ({ useRandom, provided, type, world, gender, excludeValues = [] }) => {
  if (useRandom) {
    return getRandomValue({ type, theme: world.theme, country: world.country, gender, excludeValues });
  }
  if (!provided) {
    throw new Error(`Field ${type} is required when not random.`);
  }
  return provided;
};

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

const replaceCharacterTags = async (characterId, tagIds) => {
  await prisma.characterTag.deleteMany({ where: { characterId } });
  if (!tagIds.length) return;
  await prisma.characterTag.createMany({ data: tagIds.map((tagId) => ({ characterId, tagId })), skipDuplicates: true });
};

const serializeCharacter = (character) => {
  const { characterTags = [], ...rest } = character;
  return {
    ...rest,
    tags: characterTags.map((ct) => ct.tag?.name).filter(Boolean)
  };
};

export const createCharacter = async (req, res) => {
  try {
    const worldId = Number(req.params.worldId || req.body.worldId);
    const { name, gender, race, appearance, history, generate = {}, tags: rawTags } = req.body;

    const world = await ensureWorldOwnership(worldId, req.userId);
    if (!world) {
      return res.status(404).json({ message: 'World not found.' });
    }

    if (!gender || !['male', 'female'].includes(gender)) {
      return res.status(400).json({ message: 'Gender is required (male|female).' });
    }

    const isNameRandom = parseBoolean(generate.name);
    const isRaceRandom = parseBoolean(generate.race);
    const isAppearanceRandom = parseBoolean(generate.appearance);
    const isStoryRandom = parseBoolean(generate.history || generate.story);

    // Nomes já usados neste mundo para evitar duplicados locais
    const usedNames = isNameRandom
      ? (await prisma.character.findMany({
        where: { worldId: world.id },
        select: { name: true }
      })).map((c) => c.name)
      : [];

    const [resolvedName, resolvedRace, resolvedAppearance, resolvedStory] = await Promise.all([
      resolveRandomOrValue({ useRandom: isNameRandom, provided: name, type: 'name', world, gender, excludeValues: usedNames }),
      resolveRandomOrValue({ useRandom: isRaceRandom, provided: race, type: 'race', world, gender }),
      resolveRandomOrValue({ useRandom: isAppearanceRandom, provided: appearance, type: 'appearance', world, gender }),
      resolveRandomOrValue({ useRandom: isStoryRandom, provided: history, type: 'story', world, gender })
    ]);

    const currentCount = await prisma.character.count({ where: { worldId: world.id } });
    const tagNames = normalizeTagsInput(rawTags);
    const tags = await upsertTags(tagNames);

    const character = await prisma.character.create({
      data: {
        worldId: world.id,
        name: resolvedName,
        gender,
        race: resolvedRace,
        appearance: resolvedAppearance,
        story: resolvedStory,
        order: currentCount + 1,
        characterTags: tags.length
          ? {
              createMany: {
                data: tags.map((tag) => ({ tagId: tag.id })),
                skipDuplicates: true
              }
            }
          : undefined
      },
      include: { characterTags: { include: { tag: true } } }
    });

    return res.status(201).json(serializeCharacter(character));
  } catch (error) {
    console.error('[createCharacter] error:', error);
    const status = error.message.includes('required') ? 400 : 500;
    return res.status(status).json({ message: `Falha ao criar personagem. ${error.message}` });
  }
};

export const listCharactersByWorld = async (req, res) => {
  try {
    const worldId = Number(req.params.id);
    const tagQuery = normalizeTagsInput(req.query.tags);
    const world = await ensureWorldOwnership(worldId, req.userId);
    if (!world) {
      return res.status(404).json({ message: 'World not found.' });
    }

    const tagFilters = tagQuery.map((tag) => ({ characterTags: { some: { tag: { name: tag } } } }));

    const characters = await prisma.character.findMany({
      where: {
        worldId: world.id,
        AND: tagFilters
      },
      orderBy: [
        { order: 'desc' },
        { createdAt: 'desc' }
      ],
      include: { characterTags: { include: { tag: true } } }
    });

    return res.status(200).json(characters.map(serializeCharacter));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list characters.', error: error.message });
  }
};

export const updateCharacter = async (req, res) => {
  try {
    const characterId = Number(req.params.id);
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        world: true,
        characterTags: { include: { tag: true } }
      }
    });

    if (!character || character.world.userId !== req.userId) {
      return res.status(404).json({ message: 'Character not found.' });
    }

    const { name, gender, race, appearance, history, tags: rawTags } = req.body;
    const tagNames = rawTags !== undefined ? normalizeTagsInput(rawTags) : null;
    const tags = tagNames && tagNames.length ? await upsertTags(tagNames) : [];

    const updated = await prisma.character.update({
      where: { id: characterId },
      data: {
        name: name ?? character.name,
        gender: gender ?? character.gender,
        race: race ?? character.race,
        appearance: appearance ?? character.appearance,
        story: history ?? character.story
      }
    });

    if (tagNames !== null) {
      await replaceCharacterTags(characterId, tags.map((t) => t.id));
    }

    const withTags = await prisma.character.findUnique({
      where: { id: characterId },
      include: { characterTags: { include: { tag: true } } }
    });

    return res.status(200).json(serializeCharacter(withTags));
  } catch (error) {
    const status = error.message.includes('required') ? 400 : 500;
    return res.status(status).json({ message: 'Failed to update character.', error: error.message });
  }
};

export const reorderCharacters = async (req, res) => {
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

    const characters = await prisma.character.findMany({
      where: { worldId: world.id },
      select: { id: true }
    });

    const validIds = new Set(characters.map((c) => c.id));
    const filteredOrder = order.filter((id) => validIds.has(Number(id))).map(Number);

    if (!filteredOrder.length) {
      return res.status(400).json({ message: 'No valid character ids to reorder.' });
    }

    const updates = filteredOrder.map((id, index) =>
      prisma.character.update({
        where: { id },
        data: { order: filteredOrder.length - index }
      })
    );

    await prisma.$transaction(updates);

    const reordered = await prisma.character.findMany({
      where: { worldId: world.id },
      orderBy: [
        { order: 'desc' },
        { createdAt: 'desc' }
      ],
      include: { characterTags: { include: { tag: true } } }
    });

    return res.status(200).json(reordered.map(serializeCharacter));
  } catch (error) {
    console.error('[reorderCharacters] error:', error);
    return res.status(500).json({ message: 'Failed to reorder characters.', error: error.message });
  }
};

export const deleteCharacter = async (req, res) => {
  try {
    const characterId = Number(req.params.id);
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { world: true }
    });

    if (!character || character.world.userId !== req.userId) {
      return res.status(404).json({ message: 'Character not found.' });
    }

    await prisma.character.delete({ where: { id: characterId } });
    return res.status(200).json({ message: 'Character deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete character.', error: error.message });
  }
};

export const getCharacterById = async (req, res) => {
  try {
    const characterId = Number(req.params.id);
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { world: true }
    });

    if (!character || character.world.userId !== req.userId) {
      return res.status(404).json({ message: 'Character not found.' });
    }

    return res.status(200).json(serializeCharacter(character));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch character.', error: error.message });
  }
};
