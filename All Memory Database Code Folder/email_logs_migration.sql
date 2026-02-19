-- Create email_logs table to track sent emails and enforce rate limits
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Sent', 'Failed', 'Skipped')) NOT NULL,
    error_message TEXT,
    context VARCHAR(100) DEFAULT 'Attendance Notification', -- e.g., 'Attendance Notification', 'Announcement'
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster querying of daily limits
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
