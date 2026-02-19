-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Courses Table (e.g., BCA I, BCA II)
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sections Table (e.g., Morning, Evening)
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Seed Data (Initial Values)

-- Seed Courses
INSERT INTO courses (name) VALUES 
('BCA I'), 
('BCA II'), 
('BCA III'), 
('BCA IV'), 
('BCA V'), 
('BCA VI') 
ON CONFLICT (name) DO NOTHING;

-- Seed Sections
INSERT INTO sections (name) VALUES 
('Morning'), 
('Afternoon'), 
('Evening') 
ON CONFLICT (name) DO NOTHING;
