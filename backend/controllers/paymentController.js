const { v4: uuidv4 } = require('uuid');
const catchAsync = require('../utils/catchAsync');

// fake payments (auto succeed)
exports.processPayment = catchAsync(async (req, res) => {
  const { amount, type } = req.body;
  const paymentId = `pay_stub_${uuidv4()}`;
  console.log(`Payment: ₹${amount} | Type: ${type} | ID: ${paymentId}`);
  res.status(200).json({ status: 'success', data: { success: true, paymentId } });
});

exports.processRefund = catchAsync(async (req, res) => {
  const { paymentId } = req.body;
  const refundId = `ref_stub_${uuidv4()}`;
  console.log(`Refund: ${paymentId} → ${refundId}`);
  res.status(200).json({ status: 'success', data: { success: true, refundId } });
});

exports.getPaymentHistory = catchAsync(async (req, res) => {
  res.status(200).json({ status: 'success', data: { payments: [] } });
});
