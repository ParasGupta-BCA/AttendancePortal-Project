-- ==========================================
-- ATTENDANCE PORTAL - COMPLETE DATABASE SETUP
-- ==========================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- USER MANAGEMENT & PROFILES
-- ==========================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'faculty', 'student')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty Profile
CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    designation VARCHAR(100),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students Profile
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    enrollment_no VARCHAR(50) UNIQUE NOT NULL,
    erp_id VARCHAR(50) UNIQUE NOT NULL,
    course_year VARCHAR(20) DEFAULT 'BCA VI',
    section VARCHAR(10) DEFAULT 'Morning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Requests (For Signup Approvals)
CREATE TABLE IF NOT EXISTS student_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    enrollment_no VARCHAR(50) UNIQUE NOT NULL,
    erp_id VARCHAR(50) UNIQUE NOT NULL,
    course_year VARCHAR(20) DEFAULT 'BCA VI',
    section VARCHAR(10) DEFAULT 'Morning',
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_student_requests_status ON student_requests(status);

-- ==========================================
-- ACADEMIC MANAGEMENT (DYNAMIC)
-- ==========================================

-- Courses Table (Dynamic Management)
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sections Table (Dynamic Management)
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    credits INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes Table (Legacy/Linking)
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL, 
    section VARCHAR(50) NOT NULL, 
    UNIQUE(name, section)
);

-- ==========================================
-- TIMETABLE & ATTENDANCE
-- ==========================================

-- Timetable
CREATE TABLE IF NOT EXISTS timetable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
    day_of_week VARCHAR(10) CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Sessions
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timetable_id UUID REFERENCES timetable(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NOT NULL,
    qr_code VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('Present', 'Absent', 'Late')) DEFAULT 'Present',
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_info VARCHAR(255),
    location_lat DECIMAL(9,6),
    location_long DECIMAL(9,6),
    UNIQUE(session_id, student_id)
);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Seed Courses
INSERT INTO courses (name) VALUES 
('BCA I'), ('BCA II'), ('BCA III'), ('BCA IV'), ('BCA V'), ('BCA VI') 
ON CONFLICT (name) DO NOTHING;

-- Seed Sections
INSERT INTO sections (name) VALUES 
('Morning'), ('Afternoon'), ('Evening') 
ON CONFLICT (name) DO NOTHING;

-- Seed Class
INSERT INTO classes (name, section) VALUES ('BCA VI', 'Morning') ON CONFLICT DO NOTHING;

-- Seed Subjects
INSERT INTO subjects (code, name, credits) VALUES 
('MKC', 'Data Warehousing and Data Mining', 3),
('NPN', 'Web Programming', 3),
('RD', 'Software Project Management', 3),
('RCH', 'R Programming', 3),
('Lab-WP', 'Lab on Web Programming', 2),
('Lab-DV', 'Lab on Data Visualization', 2),
('DM', 'Digital Marketing', 2),
('IC', 'Indian Culture', 2)
ON CONFLICT (code) DO NOTHING;

-- Seed Admin User (Password: hashed_secret)
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('admin@college.edu', 'hashed_secret', 'Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed Faculty Users
INSERT INTO users (email, password_hash, full_name, role) VALUES 
('mkc@college.edu', 'pass', 'Dr. Mahesh Chaubey', 'faculty'),
('npn@college.edu', 'pass', 'Mr. Nripesh Kumar', 'faculty'),
('rd@college.edu', 'pass', 'Ms. Rajni Dubey', 'faculty'),
('ak@college.edu', 'pass', 'Dr. Ajay Kumar', 'faculty'),
('vr@college.edu', 'pass', 'Dr. Vikas Rajput', 'faculty')
ON CONFLICT (email) DO NOTHING;
