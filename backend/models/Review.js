const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        target: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        text: { type: String, default: '' },
    },
    { timestamps: true }
);

reviewSchema.index({ reviewer: 1, target: 1 }, { unique: true });
reviewSchema.index({ target: 1 });

module.exports = mongoose.model('Review', reviewSchema);