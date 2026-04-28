const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: [true, 'Event title is required'], trim: true },
        category: {
            type: String,
            enum: [
                'performance', 'workshop', 'exhibition', 'festival',
                'competition', 'concert', 'culturalNight', 'craftFair', 'lectureDemo',
            ],
            required: true,
        },
        artForm: { type: String, default: '' },
        description: { type: String, default: '' },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        time: { type: String, default: '' },
        venue: { type: String, default: '' },
        isOnline: { type: Boolean, default: false },
        coverImage: { type: String, default: '' },
        eventType: {
            type: String,
            enum: ['free', 'paid', 'inviteOnly'],
            default: 'free',
        },
        ticketTiers: [
            {
                name: { type: String },
                price: { type: Number, default: 0 },
                totalQty: { type: Number, default: 0 },
                soldQty: { type: Number, default: 0 },
            },
        ],
        maxAttendees: { type: Number },
        attendeeCount: { type: Number, default: 0 },
        lookingFor: { type: String, default: '' },
        status: {
            type: String,
            enum: ['draft', 'published', 'cancelled', 'completed'],
            default: 'published',
        },
    },
    { timestamps: true }
);

eventSchema.index({ startDate: 1, category: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);