const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    backer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    rewardTier: { type: String, default: '' },
    paymentId: { type: String },
    status: {
      type: String,
      enum: ['completed', 'refunded'],
      default: 'completed',
    },
  },
  { timestamps: true },
);

contributionSchema.index({ campaign: 1 });
contributionSchema.index({ backer: 1 });

module.exports = mongoose.model('Contribution', contributionSchema);
