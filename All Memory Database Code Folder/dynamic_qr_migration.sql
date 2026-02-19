-- Dynamic QR Code Settings Migration

-- 1. Ensure attendance_settings table exists (if not already created by geolocation_schema.sql)
CREATE TABLE IF NOT EXISTS attendance_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(50) UNIQUE NOT NULL,
    value VARCHAR(255) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert Default QR Refresh Interval (5 seconds)
INSERT INTO attendance_settings (key, value, description)
VALUES 
('qr_refresh_interval', '5', 'Interval in seconds for dynamic QR code refresh')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, description = EXCLUDED.description, updated_at = CURRENT_TIMESTAMP;

-- 3. Verify Insertion
SELECT * FROM attendance_settings WHERE key = 'qr_refresh_interval';
