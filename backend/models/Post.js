const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },
    hashtags: [{ type: String }],
    media: [
      {
        url: { type: String },
        type: { type: String, enum: ['image', 'video'] },
        thumbnail: { type: String },
      },
    ],
    embeddedEvent: {
      month: { type: String },
      date: { type: String },
      title: { type: String },
      location: { type: String },
      time: { type: String },
    },
    postType: {
      type: String,
      enum: ['general', 'performance', 'craft', 'workshop'],
      default: 'general',
    },
    linkedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    imageVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed', 'skipped'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ postType: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
