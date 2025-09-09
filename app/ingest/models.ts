import {
  IngestPipeline,
  Key,
} from "@514labs/moose-lib";

/**
 * Boreal Cloud Email Notification Pipeline
 * Clerk Webhook → HTTP API → Stream → Email Processor → Resend API
 * No persistence needed - streaming-only pipeline for email delivery
 */

/** =======Data Models========= */

/** Clerk user.created webhook payload - exactly as received */
export interface UserSignupEvent {
  data: {
    id: Key<string>;               // Primary key - Clerk user ID
    first_name: string | null;
    last_name: string | null;
    created_at: number;
    updated_at: number;
    email_addresses: {
      id: string;
      email_address: string;
      verification?: any;
    }[];
    primary_email_address_id: string | null;
    image_url: string | null;
    profile_image_url: string | null;
    banned: boolean;
    locked: boolean;
    object: "user";
    [key: string]: any; // Other Clerk fields
  };
  event_attributes: {
    http_request: {
      client_ip: string;
      user_agent: string;
    };
  };
  instance_id: string;
  object: "event";
  timestamp: number;
  type: "user.created";
}

/** =======Pipeline Configuration========= */

/** User signup event ingestion - streaming only, no persistence */
export const UserSignupPipeline = new IngestPipeline<UserSignupEvent>("UserSignup", {
  table: false, // No persistence needed
  stream: true, // Enable real-time processing
  ingest: true, // POST /ingest/UserSignup
  deadLetterQueue: true, // DLQ as topic (default)
});
