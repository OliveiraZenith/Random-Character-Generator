import bcrypt from 'bcrypt';

const resolveSaltRounds = () => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
  if (Number.isNaN(rounds) || rounds < 4) {
    return 10;
  }
  return rounds;
};

export const hashPassword = async (password) => {
  const rounds = resolveSaltRounds();
  return bcrypt.hash(password, rounds);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export default {
  hashPassword,
  comparePassword
};
