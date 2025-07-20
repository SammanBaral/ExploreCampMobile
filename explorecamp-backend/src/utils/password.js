import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// to hash plain text password before saving
export const hashPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

// to compare plain password with hashed one (used during login)
export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
