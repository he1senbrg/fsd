const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'underReview', 'accepted', 'rejected'],
      default: 'pending',
    },
    coverLetter: { type: String, default: '' },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

applicationSchema.index({ opportunity: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
