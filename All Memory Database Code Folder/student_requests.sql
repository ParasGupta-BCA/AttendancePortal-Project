-- Create a table to store student signup requests
-- This table mimics the structure of users + students combined, with a status field.

CREATE TABLE IF NOT EXISTS student_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    -- password_hash removed, will use default 'student' on cleanup
    enrollment_no VARCHAR(50) UNIQUE NOT NULL,
    erp_id VARCHAR(50) UNIQUE NOT NULL,
    course_year VARCHAR(20) DEFAULT 'BCA VI',
    section VARCHAR(10) DEFAULT 'Morning',
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster filtering by status
CREATE INDEX idx_student_requests_status ON student_requests(status);
