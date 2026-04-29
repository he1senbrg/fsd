const mongoose = require('mongoose');

const productReviewSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        text: { type: String, default: '' },
    },
    { timestamps: true }
);

productReviewSchema.index({ product: 1, reviewer: 1 }, { unique: true });
productReviewSchema.index({ product: 1 });

module.exports = mongoose.model('ProductReview', productReviewSchema);
