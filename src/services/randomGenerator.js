import prisma from '../prisma/client.js';

export const getRandomValue = async ({ type, theme, country, gender, excludeValues = [] }) => {
  // Prefer data do país informado, mas se faltar, caia para qualquer país do tema.
  const whereBase = country
    ? { type, theme, OR: [{ country }, { country: null }] }
    : { type, theme };

  const withGender = type === 'name' && gender
    ? { AND: [whereBase, { OR: [{ gender }, { gender: null }] }] }
    : whereBase;

  let options = await prisma.randomData.findMany({ where: withGender });

  // Fallback: se não houver dados para o país informado, ignora país e tenta geral do tema.
  if (!options.length && country) {
    options = await prisma.randomData.findMany({ where: { type, theme } });
  }

  // Remove valores já utilizados, se fornecidos
  if (excludeValues.length) {
    const excludeSet = new Set(excludeValues.map((v) => v.trim().toLowerCase()));
    options = options.filter((opt) => !excludeSet.has(opt.value.trim().toLowerCase()));
  }

  if (!options.length) {
    throw new Error('Não existem mais nomes únicos aleatórios disponíveis.');
  }

  const index = Math.floor(Math.random() * options.length);
  return options[index].value;
};
