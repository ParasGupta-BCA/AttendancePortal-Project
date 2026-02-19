-- Add a column to track when the last weekly report was sent
-- This helps prevents sending duplicate emails if the cron job retries
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS last_report_sent_at TIMESTAMP;
