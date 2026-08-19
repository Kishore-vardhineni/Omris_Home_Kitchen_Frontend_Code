import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * Sends an SMS message using Twilio.
 * @param {string} to - The recipient's mobile number (e.g., '9876543210' or '+919876543210')
 * @param {string} body - The message content
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
const sendSms = async (to, body) => {
  try {
    if (!client) {
      console.warn('⚠️ Twilio is not configured. Missing credentials in .env');
      console.log(`[DEV SMS to ${to}]: ${body}`);
      return true; // Return true in dev so the app doesn't break
    }

    // Ensure the number has a country code. Defaulting to +91 (India) if none provided.
    let formattedTo = to.startsWith('+') ? to : `+91${to}`;

    const message = await client.messages.create({
      body: body,
      from: twilioPhoneNumber,
      to: formattedTo,
    });

    console.log(`✅ SMS sent successfully to ${formattedTo}. SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${to}:`, error.message);
    return false;
  }
};

export default sendSms;
