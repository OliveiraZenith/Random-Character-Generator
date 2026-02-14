import prisma from '../prisma/client.js';

const isValidTheme = (theme) => ['fantasia', 'medieval', 'atual'].includes(theme);

export const createWorld = async (req, res) => {
  try {
    const { name, theme, country } = req.body;

    if (!name || !theme || !isValidTheme(theme)) {
      return res.status(400).json({ message: 'Name and a valid theme are required.' });
    }

    const sanitizedCountry = theme === 'atual' ? country || null : null;

    const world = await prisma.world.create({
      data: {
        name,
        theme,
        country: sanitizedCountry,
        userId: req.userId
      }
    });

    return res.status(201).json(world);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create world.', error: error.message });
  }
};

export const listWorlds = async (req, res) => {
  try {
    const worlds = await prisma.world.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(worlds);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list worlds.', error: error.message });
  }
};

export const updateWorld = async (req, res) => {
  try {
    const worldId = Number(req.params.id);
    const { name, theme, country } = req.body;

    const world = await prisma.world.findUnique({ where: { id: worldId } });
    if (!world || world.userId !== req.userId) {
      return res.status(404).json({ message: 'World not found.' });
    }

    if (theme && !isValidTheme(theme)) {
      return res.status(400).json({ message: 'Invalid theme.' });
    }

    const nextTheme = theme || world.theme;
    const sanitizedCountry = nextTheme === 'atual' ? country ?? world.country : null;

    const updated = await prisma.world.update({
      where: { id: worldId },
      data: {
        name: name ?? world.name,
        theme: nextTheme,
        country: sanitizedCountry
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update world.', error: error.message });
  }
};

export const deleteWorld = async (req, res) => {
  try {
    const worldId = Number(req.params.id);
    const world = await prisma.world.findUnique({ where: { id: worldId } });

    if (!world || world.userId !== req.userId) {
      return res.status(404).json({ message: 'World not found.' });
    }

    await prisma.world.delete({ where: { id: worldId } });
    return res.status(200).json({ message: 'World deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete world.', error: error.message });
  }
};
