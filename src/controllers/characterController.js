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

export const createCharacter = async (req, res) => {
  try {
    const worldId = Number(req.params.worldId || req.body.worldId);
    const { name, gender, race, appearance, history, generate = {} } = req.body;

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

    const character = await prisma.character.create({
      data: {
        worldId: world.id,
        name: resolvedName,
        gender,
        race: resolvedRace,
        appearance: resolvedAppearance,
        story: resolvedStory
      }
    });

    return res.status(201).json(character);
  } catch (error) {
    console.error('[createCharacter] error:', error);
    const status = error.message.includes('required') ? 400 : 500;
    return res.status(status).json({ message: `Falha ao criar personagem. ${error.message}` });
  }
};

export const listCharactersByWorld = async (req, res) => {
  try {
    const worldId = Number(req.params.id);
    const world = await ensureWorldOwnership(worldId, req.userId);
    if (!world) {
      return res.status(404).json({ message: 'World not found.' });
    }

    const characters = await prisma.character.findMany({
      where: { worldId: world.id },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(characters);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list characters.', error: error.message });
  }
};

export const updateCharacter = async (req, res) => {
  try {
    const characterId = Number(req.params.id);
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { world: true }
    });

    if (!character || character.world.userId !== req.userId) {
      return res.status(404).json({ message: 'Character not found.' });
    }

    const { name, gender, race, appearance, history } = req.body;

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

    return res.status(200).json(updated);
  } catch (error) {
    const status = error.message.includes('required') ? 400 : 500;
    return res.status(status).json({ message: 'Failed to update character.', error: error.message });
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

    return res.status(200).json(character);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch character.', error: error.message });
  }
};
