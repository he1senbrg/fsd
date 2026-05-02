const jwt = require('jsonwebtoken');

const generateToken = (userId, expiresIn) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

module.exports = { generateToken, generateRefreshToken };
