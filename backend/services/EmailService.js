const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail({ to, subject, html }) {
    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP configuration incomplete. Email not sent.');
        return;
      }
      await this.transporter.sendMail({
        from: `"KalaSetu" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      console.error(`Email failed to ${to}:`, err.message);
      throw err;
    }
  }

  async sendWelcome(user) {
    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to KalaSetu!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Welcome to KalaSetu, ${user.fullName}!</h1>
          <p>We're thrilled to have you join our community of artists and art lovers.</p>
          <p>Complete your profile to get started and discover amazing art and artists.</p>
          <a href="${process.env.FRONTEND_URL}/profile" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            Complete Your Profile
          </a>
        </div>
      `,
    });
  }

  async sendSignupOTP({ fullName, email, otp }) {
    await this.sendEmail({
      to: email,
      subject: 'Your KalaSetu signup OTP (valid for 10 minutes)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Verify your email</h1>
          <p>Hi ${fullName}, use the OTP below to complete your KalaSetu signup.</p>
          <div style="margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111;">
            ${otp}
          </div>
          <p>This OTP is valid for 10 minutes.</p>
          <p style="margin-top: 16px; color: #666;">If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.sendEmail({
      to: user.email,
      subject: 'Reset Your Password — KalaSetu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Password Reset</h1>
          <p>Hi ${user.fullName}, you requested a password reset.</p>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            Reset Password
          </a>
          <p style="margin-top: 16px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendBookingConfirmation(user, order) {
    await this.sendEmail({
      to: user.email,
      subject: `Booking Confirmed — ${order.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Booking Confirmed! 🎉</h1>
          <p>Hi ${user.fullName}, your booking has been confirmed.</p>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Amount:</strong> ₹${order.totalAmount}</p>
          <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            View Order
          </a>
        </div>
      `,
    });
  }

  async sendOrderConfirmation(user, order) {
    await this.sendEmail({
      to: user.email,
      subject: `Order Confirmed — ${order.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Order Confirmed! 🛍️</h1>
          <p>Hi ${user.fullName}, your order has been placed successfully.</p>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Total:</strong> ₹${order.totalAmount}</p>
          <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            View Order
          </a>
        </div>
      `,
    });
  }

  async sendCampaignFunded(user, campaign) {
    await this.sendEmail({
      to: user.email,
      subject: `Campaign Funded — ${campaign.title} 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Congratulations! 🎉</h1>
          <p>Hi ${user.fullName}, your campaign "<strong>${campaign.title}</strong>" has been successfully funded!</p>
          <p><strong>Goal:</strong> ₹${campaign.goalAmount}</p>
          <p><strong>Raised:</strong> ₹${campaign.raisedAmount}</p>
          <p><strong>Backers:</strong> ${campaign.backerCount}</p>
        </div>
      `,
    });
  }

  async sendApplicationStatus(user, opportunity, status) {
    await this.sendEmail({
      to: user.email,
      subject: `Application ${status} — ${opportunity.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Application Update</h1>
          <p>Hi ${user.fullName}, your application for "<strong>${opportunity.title}</strong>" has been <strong>${status}</strong>.</p>
        </div>
      `,
    });
  }

  async sendCampaignRefund(user, campaign) {
    await this.sendEmail({
      to: user.email,
      subject: `Campaign Refund — ${campaign.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Campaign Refund</h1>
          <p>Hi ${user.fullName}, the campaign "<strong>${campaign.title}</strong>" did not reach its funding goal.</p>
          <p>Your contribution has been refunded as per our all-or-nothing policy.</p>
        </div>
      `,
    });
  }
}

module.exports = new EmailService();
