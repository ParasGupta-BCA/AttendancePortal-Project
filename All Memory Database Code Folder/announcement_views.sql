-- Create Announcement Views Table to track read status
CREATE TABLE IF NOT EXISTS announcement_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(announcement_id, user_id) -- Ensure a user only has one view record per announcement
);

-- Index for faster queries on user_id (for fetching unread count)
CREATE INDEX IF NOT EXISTS idx_announcement_views_user_id ON announcement_views(user_id);
