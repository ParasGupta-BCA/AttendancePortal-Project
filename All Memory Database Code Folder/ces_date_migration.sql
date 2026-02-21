-- CES Date Migration
-- Add CES date column to announcements table
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS ces_date DATE;

-- Index for fast lookup of upcoming CES announcements
CREATE INDEX IF NOT EXISTS idx_announcements_ces_date ON announcements(ces_date);
