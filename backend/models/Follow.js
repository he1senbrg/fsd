const mongoose = require('mongoose');

const followSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    followee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

followSchema.index({ follower: 1, followee: 1 }, { unique: true });
followSchema.index({ followee: 1 });

module.exports = mongoose.model('Follow', followSchema);
