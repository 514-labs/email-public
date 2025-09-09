# Boreal Cloud Email Notification System

This [Moose](https://docs.fiveonefour.com/moose) project processes user signup events from [Clerk](https://clerk.com) in real-time and sends personalized welcome emails through [Resend](https://resend.com). 

<a href="https://docs.fiveonefour.com/moose/"><img src="https://raw.githubusercontent.com/514-labs/moose/main/logo-m-light.png" alt="moose logo" height="100px"></a>

### Architecture

```
Clerk Signup → Webhook → Moose API → Streaming Topic → Email Processor Consumer Function → Resend
```

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Add your RESEND_API_KEY
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## Setup Guide

### 1. [Resend](https://resend.com) Configuration

Create an API Key. Ensure you have verified a domain, or use their test domain.

### 2. [Clerk](https://clerk.com) Configuration

1. **Access Clerk Dashboard**: Go to your Clerk project dashboard at [dashboard.clerk.com](https://dashboard.clerk.com)
2. **Navigate to Webhooks**: In your project, go to Configure → Webhooks
3. **Add New Endpoint**:
   - Click "Add Endpoint"
   - **Endpoint URL**: 
     - For production: `https://your-boreal-deployment.boreal.cloud/ingest/UserSignup`
     - For local development: `https://your-ngrok-url.ngrok.io/ingest/UserSignup`
   - **Events to Subscribe**: Check only `user.created`
   - **Description**: "Boreal Cloud welcome emails"
   - Click "Create"
4. **Test the Webhook**: 
   - Create a test user signup in your application
   - Check your application logs for successful webhook delivery
   - Verify email delivery (will only send to @fiveonefour.com in dev mode)

### 3. Boreal Cloud Deployment

[Boreal Cloud](https://www.boreal.cloud) is the easiest way to deploy Moose applications to production:

1. **Push your code** to GitHub
2. **Connect your repo** to Boreal Cloud
3. **Set environment variables** in Boreal dashboard:
   - `RESEND_API_KEY`
   - `EMAIL_MODE=production` (when ready for production)
4. **Deploy** with one click

Your application will be available at `https://your-app-name.boreal.cloud`.

## Environment Configuration

Create `.env` file:
```
RESEND_API_KEY=your_resend_api_key
EMAIL_MODE=test  # Set to 'production' to send emails to all users
FROM_EMAIL=onboarding@resend.dev  # Change to welcome@boreal.cloud after domain verification
TEST_EMAIL_DOMAIN=@yourdomain.com  # Domain for test emails in test mode
```

## Email Templates

Email templates are in `app/templates/welcome.ts`. The template uses a simple variable substitution system with `{{variableName}}` placeholders.

## Development

Configuration options:
- **Test Mode**: Only sends emails to addresses matching `TEST_EMAIL_DOMAIN` (defaults to `@yourdomain.com`)
- **Production Mode**: Set `EMAIL_MODE=production` to send to all users
- **Monitoring**: Failed emails go to Dead Letter Queue for analysis

### 1. Test with Clerk Webhooks (Full Flow)
Use ngrok to expose your local Moose server to receive Clerk webhooks:

1. **Install ngrok**: [Download from ngrok.com](https://ngrok.com/download)
2. **Start your Moose server**: `npm run dev` (runs on http://localhost:4000)
3. **Expose with ngrok**: `ngrok http 4000`
4. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)
5. **Update Clerk webhook**: In Clerk dashboard → Webhooks → Add your endpoint:
   - URL: `https://abc123.ngrok.io/ingest/UserSignup`
   - Events: `user.created`
6. **Test by creating a user** in your Clerk application

### 2. Test API Directly (Email Flow Only)
Test the email processing without Clerk by calling the local API directly:

```bash
curl -X POST http://localhost:4000/ingest/UserSignup \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "id": "user_test_123",
      "first_name": "Test",
      "last_name": "User",
      "email_addresses": [{
        "id": "email_123",
        "email_address": "test@yourdomain.com"
      }],
      "primary_email_address_id": "email_123"
    },
    "type": "user.created"
  }'
```

Make sure `test@yourdomain.com` matches your `TEST_EMAIL_DOMAIN` setting.

## Built with Moose

This project demonstrates Moose's streaming capabilities for real-time event processing. Learn more about [Moose](https://docs.fiveonefour.com/moose) and join the [community](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg).
