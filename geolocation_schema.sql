-- 1. Create Settings Table for Dynamic Configuration
CREATE TABLE IF NOT EXISTS attendance_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(50) UNIQUE NOT NULL,
    value VARCHAR(255) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert Default Geolocation Settings (Based on User Input)
-- Coordinates: 28.677205646567142, 77.11256301478895
-- Radius: 200 meters (To cover the campus area widely as requested)

INSERT INTO attendance_settings (key, value, description)
VALUES 
('campus_lat', '28.677205646567142', 'Latitude of the college campus center'),
('campus_long', '77.11256301478895', 'Longitude of the college campus center'),
('allowed_radius_meters', '200', 'Allowed radius in meters for students to mark attendance')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;

-- 3. Create Scan Logs Table for Analytics
CREATE TABLE IF NOT EXISTS scan_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE SET NULL,
    scan_status VARCHAR(50) NOT NULL, -- 'SUCCESS', 'OUT_OF_RANGE', 'INVALID_QR', 'EXPIRED', 'ERROR'
    lat DECIMAL(9,6),
    long DECIMAL(9,6),
    distance_meters DECIMAL(10,2), -- Distance from campus center at time of scan
    ip_address VARCHAR(50),
    device_info TEXT,
    message TEXT, -- Error message or success note
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: Make sure 'uuid-ossp' extension is enabled (it likely is from the previous schema)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
