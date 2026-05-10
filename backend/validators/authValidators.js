const { body } = require('express-validator');

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const registerValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .matches(strongPasswordRegex)
    .withMessage(
      'Password must be at least 8 chars with uppercase, lowercase, number, and special character',
    ),
  body('role')
    .isIn(['artist', 'artLover', 'organizer', 'sponsor'])
    .withMessage('Role must be artist, artLover, organizer, or sponsor'),
];

const verifySignupOtpValidator = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp')
    .trim()
    .isLength({ min: 5, max: 5 })
    .withMessage('OTP must be exactly 5 digits')
    .isNumeric()
    .withMessage('OTP must contain only digits'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Please provide a valid email'),
];

const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .matches(strongPasswordRegex)
    .withMessage(
      'Password must be at least 8 chars with uppercase, lowercase, number, and special character',
    ),
];

module.exports = {
  registerValidator,
  verifySignupOtpValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};
