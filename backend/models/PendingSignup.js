const mongoose = require('mongoose');

const pendingSignupSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['artist', 'artLover', 'organizer', 'sponsor'],
      required: true,
    },
    otpHash: { type: String, required: true },
    otpExpires: { type: Date, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('PendingSignup', pendingSignupSchema);
