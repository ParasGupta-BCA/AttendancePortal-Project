-- RESET ATTENDANCE FOR 01/01/2026
-- This will delete all sessions started on this day.
-- Because of 'ON DELETE CASCADE', all related attendance_records (Present/Absent) will also be deleted.

DELETE FROM attendance_sessions
WHERE start_time::date = '2026-01-01';
