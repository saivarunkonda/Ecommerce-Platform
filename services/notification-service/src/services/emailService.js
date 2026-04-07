const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const htmlContent = generateEmailTemplate(template, data);

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@ecommerce.com',
      to,
      subject,
      html: htmlContent
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

const generateEmailTemplate = (template, data) => {
  const templates = {
    'order-confirmation': `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> ${data.orderNumber}</p>
      <p><strong>Total:</strong> $${data.totalAmount}</p>
      <p>Items: ${data.items}</p>
      <p>We'll notify you when your order ships.</p>
    `,
    'payment-confirmation': `
      <h1>Payment Confirmation</h1>
      <p>Your payment has been processed.</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Amount:</strong> $${data.amount}</p>
      <p><strong>Status:</strong> ${data.status}</p>
    `,
    'shipping-confirmation': `
      <h1>Your Order Has Shipped!</h1>
      <p>Great news! Your order ${data.orderNumber} is on its way.</p>
      <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
      <p>You can track your shipment using this tracking number.</p>
    `
  };

  return templates[template] || '<p>Email template not found</p>';
};

module.exports = { sendEmail };
