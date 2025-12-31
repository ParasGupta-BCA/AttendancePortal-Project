-- BULK FINALIZE SCRIPT
-- Run this to close ALL currently open sessions and mark absentees.

-- 1. Insert 'Absent' for students who are missing from valid open sessions
INSERT INTO attendance_records (session_id, student_id, status, marked_at)
SELECT 
    s.id as session_id, 
    u.id as student_id, 
    'Absent', 
    s.start_time -- Use the session start time
FROM attendance_sessions s
JOIN timetable t ON s.timetable_id = t.id
JOIN classes c ON t.class_id = c.id
JOIN students u ON u.course_year = c.name AND u.section = c.section
WHERE s.is_active = TRUE -- Only for open sessions
AND u.id NOT IN (
    SELECT student_id FROM attendance_records WHERE session_id = s.id
);

-- 2. Close all sessions
UPDATE attendance_sessions
SET is_active = FALSE
WHERE is_active = TRUE;
