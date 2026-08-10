const sendEmail = async (options) => {
  console.log('\n======================================================');
  console.log('📬 [MOCK EMAIL] Password Reset Link:');
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(options.message);
  console.log('======================================================\n');
  return;
};

export default sendEmail;
