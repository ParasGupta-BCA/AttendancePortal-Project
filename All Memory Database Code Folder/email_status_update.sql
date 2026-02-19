-- The `status` column has a CHECK constraint that limits values to 'Sent', 'Failed', 'Skipped'.
-- We need to update this constraint to allow 'Sending' as a valid status.

-- 1. Drop the existing constraint (if it exists by default name or specific name)
-- Note: The constraint name 'email_logs_status_check' is the default for a column check constraint in Postgres, 
-- but if it was named differently, you might need to check your table definition.
-- We use a DO block to safely drop it.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_logs_status_check') THEN
        ALTER TABLE email_logs DROP CONSTRAINT email_logs_status_check;
    END IF;
END $$;

-- 2. Add the new constraint with 'Sending' included
ALTER TABLE email_logs ADD CONSTRAINT email_logs_status_check 
    CHECK (status IN ('Sent', 'Failed', 'Skipped', 'Sending'));
