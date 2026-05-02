const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    type: {
      type: String,
      enum: ['teaching', 'performance', 'exhibition', 'festival', 'workshop'],
      required: true,
    },
    artForm: { type: String, default: '' },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    isRemote: { type: Boolean, default: false },
    payType: {
      type: String,
      enum: ['fixed', 'stipend', 'honorarium', 'commission', 'prize'],
      default: 'fixed',
    },
    payAmount: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    deadline: { type: Date },
    slots: { type: Number, default: 1 },
    applicationCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ['open', 'closed', 'filled'],
      default: 'open',
    },
  },
  { timestamps: true },
);

opportunitySchema.index({ type: 1, deadline: 1 });
opportunitySchema.index({ artForm: 1 });
opportunitySchema.index({ status: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
