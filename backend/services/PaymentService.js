const { v4: uuidv4 } = require('uuid');

// fake payment for now
class PaymentService {
  static async processPayment(amount, userId, type) {
    const paymentId = `pay_stub_${uuidv4()}`;
    console.log(
      `Payment processed: ₹${amount} | User: ${userId} | Type: ${type} | ID: ${paymentId}`,
    );
    return { success: true, paymentId };
  }

  static async processRefund(paymentId) {
    const refundId = `ref_stub_${uuidv4()}`;
    console.log(`Refund processed: PaymentID: ${paymentId} | RefundID: ${refundId}`);
    return { success: true, refundId };
  }

  static calculateCommission(totalAmount) {
    const platformFee = Math.round(totalAmount * 0.05 * 100) / 100;
    const sellerAmount = totalAmount - platformFee;
    return { sellerAmount, platformFee };
  }
}

module.exports = PaymentService;
