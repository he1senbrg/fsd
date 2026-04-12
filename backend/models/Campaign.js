const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
    {
        creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, maxlength: 60, trim: true },
        shortDescription: { type: String, default: '' },
        fullStory: { type: String, default: '' },
        category: {
            type: String,
            enum: ['visualArts', 'performingArts', 'textiles', 'heritage', 'music', 'education'],
            required: true,
        },
        location: { type: String, default: '' },
        goalAmount: { type: Number, required: true, min: 1 },
        raisedAmount: { type: Number, default: 0 },
        backerCount: { type: Number, default: 0 },
        deadline: { type: Date, required: true },
        duration: { type: Number, enum: [15, 30, 45, 60] },
        coverImage: { type: String, default: '' },
        videoUrl: { type: String, default: '' },
        rewardTiers: [
            {
                name: { type: String },
                amount: { type: Number },
                perks: [{ type: String }],
            },
        ],
        tags: [{ type: String }],
        status: {
            type: String,
            enum: ['draft', 'active', 'funded', 'failed', 'cancelled'],
            default: 'draft',
        },
        platformFee: { type: Number, default: 5 },
    },
    { timestamps: true }
);

campaignSchema.index({ status: 1, deadline: 1 });
campaignSchema.index({ creator: 1 });
campaignSchema.index({ category: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);