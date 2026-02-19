-- Optimization for Real-Time Email Status
-- We are adding an index to the 'status' column to ensure fast querying when checking for 'Sending' emails.

CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- Note: The system will now use the status 'Sending'. 
-- If you have defined 'status' as an ENUM type in your database configuration, 
-- you must manually add 'Sending' to that enum. 
-- If 'status' is a standard TEXT or VARCHAR column (default behavior), no further action is needed.
