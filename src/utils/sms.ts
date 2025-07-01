// src/utils/sms.ts
import Twilio from 'twilio';

// Initialize Twilio client
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID!;
const twilioAuthToken  = process.env.TWILIO_AUTH_TOKEN!;
const twilioFromNumber = process.env.TWILIO_FROM_NUMBER!;
const twilioClient = Twilio(twilioAccountSid, twilioAuthToken);

/**
 * Send an SMS via Twilio
 * @param to - recipient phone number in E.164 format
 * @param body - message body
 */
export async function sendSms(
  to: string,
  body: string
): Promise<void> {
  try {
    await twilioClient.messages.create({
      to,
      from: twilioFromNumber,
      body,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error sending SMS:', error.message);
    }else{
      console.error('Unexpected error sending SMS');
    }
    throw error;
  }
}
