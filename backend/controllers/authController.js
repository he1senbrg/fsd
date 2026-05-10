const crypto = require('crypto');
const User = require('../models/User');
const PendingSignup = require('../models/PendingSignup');
const { generateToken } = require('../utils/tokenUtils');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const EmailService = require('../services/EmailService');

// POST /api/auth/register
exports.register = catchAsync(async (req, res, next) => {
  const { fullName, email, password, role } = req.body;

  // check if user already there
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
  }

  const otp = crypto.randomInt(10000, 100000).toString();
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  await PendingSignup.findOneAndUpdate(
    { email },
    { fullName, email, password, role, otpHash, otpExpires },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  try {
    await EmailService.sendSignupOTP({ fullName, email, otp });
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    return next(
      new AppError('Failed to send OTP email. Please check your email configuration.', 500),
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'OTP sent to your email. It is valid for 10 minutes.',
  });
});

// POST /api/auth/register/verify-otp
exports.verifySignupOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
  }

  const pending = await PendingSignup.findOne({ email });
  if (!pending) {
    return next(
      new AppError('No signup request found for this email. Please request OTP again.', 404),
    );
  }

  if (pending.otpExpires.getTime() < Date.now()) {
    await PendingSignup.deleteOne({ _id: pending._id });
    return next(new AppError('OTP expired. Please request a new OTP.', 400));
  }

  const otpHash = crypto.createHash('sha256').update(String(otp)).digest('hex');
  if (pending.otpHash !== otpHash) {
    return next(new AppError('Invalid OTP', 400));
  }

  const user = await User.create({
    fullName: pending.fullName,
    email: pending.email,
    password: pending.password,
    role: pending.role,
  });

  await PendingSignup.deleteOne({ _id: pending._id });

  const token = generateToken(user._id);
  EmailService.sendWelcome(user).catch(() => {});

  res.status(201).json({
    status: 'success',
    data: { token, user },
  });
});

// POST /api/auth/login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  const expiresIn = rememberMe ? '30d' : '7d';
  const token = generateToken(user._id, expiresIn);

  if (rememberMe) {
    user.rememberToken = token;
    await user.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: 'success',
    data: { token, user },
  });
});

// POST /api/auth/forgot-password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('No user found with that email', 404));
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  // reset email
  await EmailService.sendPasswordReset(user, resetToken);

  res.status(200).json({
    status: 'success',
    message: 'Password reset link sent to your email',
  });
});

// POST /api/auth/reset-password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const jwtToken = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful',
    data: { token: jwtToken },
  });
});

// POST /api/auth/logout
exports.logout = catchAsync(async (req, res) => {
  // for clear remember token
  if (req.user) {
    req.user.rememberToken = undefined;
    await req.user.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

// GET /api/auth/me
exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
});
