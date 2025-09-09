import 'dotenv/config';
import { UserSignupPipeline, UserSignupEvent } from "./models";
import { WELCOME_EMAIL_TEMPLATE, renderTemplate } from "../templates/welcome";

// Configuration
const EMAIL_MODE = process.env.EMAIL_MODE || "test";
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const TEST_EMAIL_DOMAIN = process.env.TEST_EMAIL_DOMAIN || "@yourdomain.com";

// Check if email is allowed (defaults to test mode if EMAIL_MODE not set)
function isEmailAllowed(email: string): boolean {
  return EMAIL_MODE === "production" || email.endsWith(TEST_EMAIL_DOMAIN);
}

// Extract email from Clerk event
function extractEmail(event: UserSignupEvent): string | null {
  const { email_addresses, primary_email_address_id } = event.data;
  
  if (!primary_email_address_id || !email_addresses.length) {
    return null;
  }
  
  const primaryEmail = email_addresses.find(addr => addr.id === primary_email_address_id);
  return primaryEmail?.email_address || null;
}

// Send email via Resend API
async function sendWelcomeEmail(event: UserSignupEvent): Promise<void> {
  const email = extractEmail(event);
  
  if (!email) {
    throw new Error(`No email found for user ${event.data.id}`);
  }
  
  // Check production flag and email domain
  if (!isEmailAllowed(email)) {
    console.log(`[DEV] Skipping email to ${email} - only ${TEST_EMAIL_DOMAIN} allowed in test mode. Set EMAIL_MODE=production to send to all users.`);
    return; // Skip sending, don't throw error
  }
  
  const firstName = event.data.first_name || "there";
  const variables = { firstName };
  
  const emailPayload = {
    to: email,
    from: FROM_EMAIL,
    subject: renderTemplate(WELCOME_EMAIL_TEMPLATE.subject, variables),
    html: renderTemplate(WELCOME_EMAIL_TEMPLATE.htmlContent, variables),
  };
  
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify(emailPayload),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} ${errorText}`);
  }
  
  const result = await response.json();
  console.log(`Email sent successfully to ${email}, Resend ID: ${result.id}`);
}

// Consumer to process signup events and send welcome emails
UserSignupPipeline.stream!.addConsumer(async (event: UserSignupEvent) => {
  try {
    console.log(`Processing signup for user: ${event.data.id}`);
    
    // Send welcome email
    await sendWelcomeEmail(event);
    
    console.log(`Welcome email sent for user ${event.data.id}`);
    
  } catch (error) {
    console.error(`Failed to send email for user ${event.data.id}:`, error);
    throw error; // This will send the event to DLQ
  }
});

// DLQ consumer for handling failed email sends
UserSignupPipeline.deadLetterQueue!.addConsumer((deadLetter) => {
  console.error("Email sending failed, event sent to DLQ:", {
    error: deadLetter.errorMessage,
    failedAt: deadLetter.failedAt,
    userId: deadLetter.originalRecord?.data?.id,
  });
});
