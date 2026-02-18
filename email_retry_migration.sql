-- Adds a 'body' column to the email_logs table to store the HTML content of the email
-- This allows the system to resend the exact email content if it fails.

ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS retry_count INT DEFAULT 0;
