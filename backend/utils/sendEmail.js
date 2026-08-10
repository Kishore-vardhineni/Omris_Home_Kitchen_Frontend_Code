import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // If SMTP configurations are not provided, gracefully log the url to the console
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log('\n======================================================');
    console.log('📬 [MOCK EMAIL] Password Reset Link:');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(options.message);
    console.log('======================================================\n');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Omris Home Kitchen'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.htmlMessage || options.message,
  };

  const info = await transporter.sendMail(message);
  console.log('✅ Email sent: %s', info.messageId);
};

export default sendEmail;
