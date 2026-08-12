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

  // Strip spaces from App Password (e.g. "dbju mevd hbyy cqsd" -> "dbjumevdhbyycqsd")
  const cleanPassword = (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');
  const isGmail = process.env.SMTP_HOST.includes('gmail');

  const transporterConfig = isGmail
    ? {
        service: 'gmail',
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: cleanPassword,
        },
      }
    : {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: cleanPassword,
        },
      };

  const transporter = nodemailer.createTransport(transporterConfig);

  const message = {
    from: `${process.env.FROM_NAME || 'Omris Home Kitchen'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.htmlMessage || options.message,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('✅ Email sent successfully: %s', info.messageId);
    return true;
  } catch (error) {
    console.warn('⚠️ SMTP Authentication/Network Error:', error.message);
    
    // In development mode, fallback to logging the password reset link directly in terminal console
    // so invalid SMTP credentials will not crash the backend server or block developer testing.
    if (process.env.NODE_ENV === 'development') {
      console.log('\n======================================================');
      console.log('📬 [DEV MOCK EMAIL] Password Reset Link:');
      console.log(`To: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(options.message);
      console.log('======================================================\n');
      return true;
    }

    throw error;
  }
};

export default sendEmail;
