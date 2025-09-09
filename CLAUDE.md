# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Starts the Moose development server with live reloading
- `npm run build` - Builds the project using Docker

### Moose CLI  
- `npm run moose` - Access the Moose CLI for various tasks

## Architecture Overview

This is a Moose streaming application that sends welcome emails to new user signups via Clerk webhooks and Resend.

### Data Flow
1. **Clerk Webhook**: Receives `user.created` events at `/ingest/UserSignup`
2. **Stream Processing**: Events are processed in real-time via Redpanda streams
3. **Email Sending**: Welcome emails sent via Resend API with template variables
4. **Error Handling**: Failed emails go to Dead Letter Queue

### Key Components

**Data Models** (`app/ingest/models.ts`):
- `UserSignupEvent`: Clerk webhook event structure with email addresses
- `UserSignupPipeline`: Streaming-only pipeline (no OLAP table)

**Email Processing** (`app/ingest/transforms.ts`):
- Extracts email from Clerk event structure  
- Sends personalized welcome emails via Resend API
- Development safety: only sends to TEST_EMAIL_DOMAIN addresses unless EMAIL_MODE=production

**Email Templates** (`app/templates/welcome.ts`):
- Mad-lib style templates with variable substitution
- Customizable subject and HTML content

### Configuration
- `EMAIL_MODE=test` - Only sends to whitelisted domains (test mode)
- `EMAIL_MODE=production` - Sends to all users (production mode)
- `TEST_EMAIL_DOMAIN` - Domain for test emails in test mode (defaults to @yourdomain.com)
- Only uses `streaming_engine` - no workflows, OLAP, or other Moose modules
- Main config: `moose.config.toml`