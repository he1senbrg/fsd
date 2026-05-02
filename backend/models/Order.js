const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderType: {
      type: String,
      enum: ['purchase', 'booking', 'crowdfunding'],
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        price: { type: Number },
      },
    ],
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    ticketTier: { type: String },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalAmount: { type: Number, required: true },
    platformCommission: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
    trackingInfo: {
      carrier: { type: String, default: '' },
      trackingNumber: { type: String, default: '' },
      estimatedDelivery: { type: Date },
    },
    paymentId: { type: String },
  },
  { timestamps: true },
);

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ orderType: 1 });

module.exports = mongoose.model('Order', orderSchema);
