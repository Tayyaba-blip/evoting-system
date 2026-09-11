const bcrypt = require('bcryptjs');

/**
 * Hash a plain text password.
 * @param {string} password
 * @param {number} saltRounds
 * @returns {Promise<string>} hashed password
 */
const hashPassword = async (password, saltRounds = 12) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare plain text password with a hashed one.
 * @param {string} plain
 * @param {string} hashed
 * @returns {Promise<boolean>}
 */
const comparePassword = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};

/**
 * Generate a strong temporary password.
 * Format: Xx000000! (ensures uppercase, lowercase, number, special char)
 * @returns {string}
 */
const generateTempPassword = () => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '0123456789';
  const specials = '!@#$%';

  const rand = (str) => str[Math.floor(Math.random() * str.length)];
  const randN = (str, n) => Array.from({ length: n }, () => rand(str)).join('');

  const password =
    rand(upper) +
    rand(lower) +
    randN(digits, 4) +
    randN(lower, 2) +
    rand(specials);

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

module.exports = { hashPassword, comparePassword, generateTempPassword };