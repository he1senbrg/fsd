const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        lastMessage: { type: String, default: '' },
        lastMessageAt: { type: Date, default: Date.now },
        tab: {
            type: String,
            enum: ['primary', 'requests'],
            default: 'primary',
        },
    },
    { timestamps: true }
);

conversationSchema.index({ participants: 1 });

const messageSchema = new mongoose.Schema(
    {
        conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, default: '' },
        attachments: [
            {
                url: { type: String },
                type: { type: String },
            },
        ],
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { Conversation, Message };