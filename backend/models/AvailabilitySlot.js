const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema(
  {
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['free', 'booked'],
      default: 'free',
    },
  },
  { timestamps: true },
);

availabilitySlotSchema.index({ artist: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AvailabilitySlot', availabilitySlotSchema);
