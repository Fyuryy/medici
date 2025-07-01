// src/utils/email.ts
import sgMail from '@sendgrid/mail';

// Initialize SendGrid client
const sendgridApiKey = process.env.SENDGRID_API_KEY!;
sgMail.setApiKey(sendgridApiKey);



export interface EmailAttachment {
  content: string  // base64
  filename: string
  type: string     // MIME type, e.g. 'image/png'
  disposition?: 'attachment' | 'inline'
  content_id?: string
}


/**     
 * Send an email via SendGrid
 * @param to - recipient email address
 * @param subject - email subject
 * @param text - plain text content
 * @param html - optional HTML content
 */




export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
  attachments?: EmailAttachment[]
): Promise<void> {
  console.log(
  '▶️ sendEmail env:',
  'API_KEY?', !!process.env.SENDGRID_API_KEY,
  'FROM?', process.env.EMAIL_FROM_ADDRESS
  );
  const msg: sgMail.MailDataRequired = {
    to,
    from: process.env.EMAIL_FROM_ADDRESS!,
    subject,
    text,
    html,
    attachments
  };

  console.log(`✉️ Calling SendGrid.send to ${to} from ${msg.from}`);
  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    if (err instanceof Error) {
      console.error('SendGrid error:', err.message);
    } else {
      console.error('SendGrid unexpected error');
    }
// then:
  throw err;
  }
}
