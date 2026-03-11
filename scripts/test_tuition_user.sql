-- test_tuition_user.sql
-- Run this in your Supabase SQL Editor to create a test account

DO $$
DECLARE
    new_org_id UUID;
BEGIN
    -- 1. Create a Test Tuition Center
    INSERT INTO institutions (name, slug)
    VALUES ('Demo Tuition Center', 'demo-tuition')
    RETURNING id INTO new_org_id;

    -- 2. Create an Admin User for this center
    -- Password is 'password123' (hashed via bcrypt)
    INSERT INTO users (role, email, password_hash, full_name, institution_id)
    VALUES (
        'admin',
        'admin@tuition.com',
        '$2y$10$8/Xl.A7A6K57mD34Zf2yQ.02d2JbM/c52V7I9V4c8xYyO9pYc3Z5G', 
        'Tuition Admin',
        new_org_id
    );
END $$;
