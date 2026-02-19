import prisma from '../prisma/client.js';

const normalizeQueryTags = (raw) => {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : String(raw).split(',');
  const cleaned = list
    .map((tag) => String(tag).trim().toLowerCase())
    .filter((tag) => tag.length);
  return [...new Set(cleaned)];
};

export const listTags = async (req, res) => {
  try {
    const names = normalizeQueryTags(req.query.tags);
    const where = names.length ? { name: { in: names } } : {};
    const tags = await prisma.tag.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list tags.', error: error.message });
  }
};

export default { listTags };
