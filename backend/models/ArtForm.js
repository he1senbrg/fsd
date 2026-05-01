const mongoose = require('mongoose');

const artFormSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Art form name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    isOfficial: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('ArtForm', artFormSchema);
