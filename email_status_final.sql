-- Combined Migration Script for Email Status Updates

-- 1. Update the Constraint to allow 'Sending'
-- We drop the possibly existing constraint first to avoid conflicts.
-- If your constraint has a different name, you may need to adjust this. 
-- The default name for a check constraint on 'status' is often 'email_logs_status_check'.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_logs_status_check') THEN
        ALTER TABLE email_logs DROP CONSTRAINT email_logs_status_check;
    END IF;
END $$;

-- Add the new constraint with 'Sending' included
ALTER TABLE email_logs ADD CONSTRAINT email_logs_status_check 
    CHECK (status IN ('Sent', 'Failed', 'Skipped', 'Sending'));

-- 2. Add Index for Performance
-- This speeds up querying for 'Sending' emails.
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
