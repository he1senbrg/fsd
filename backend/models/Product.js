const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: [true, 'Product name is required'], trim: true },
        description: { type: String, default: '' },
        category: {
            type: String,
            enum: ['textiles', 'woodwork', 'jewelry', 'pottery', 'metalCrafts', 'paintings'],
            required: [true, 'Category is required'],
        },
        price: { type: Number, required: [true, 'Price is required'], min: 0 },
        originalPrice: { type: Number },
        images: [{ type: String }],
        region: { type: String, default: '' },
        stock: { type: Number, default: 0, min: 0 },
        badge: { type: String, default: '' },
        rating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ region: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);