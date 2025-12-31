-- CLEANUP DUPLICATES
-- Deletes 'Absent' records if the student is also marked 'Present' 
-- for the SAME subject on the SAME day.

DELETE FROM attendance_records ar_absent
USING attendance_records ar_present, attendance_sessions s_absent, attendance_sessions s_present, timetable t
WHERE ar_absent.status = 'Absent'
AND ar_present.status = 'Present'
AND ar_absent.student_id = ar_present.student_id
-- Match sessions
AND ar_absent.session_id = s_absent.id
AND ar_present.session_id = s_present.id
-- Match Timetable / Subject Date
AND s_absent.timetable_id = s_present.timetable_id
AND s_absent.start_time::date = s_present.start_time::date
-- Execute Delete
AND ar_absent.id != ar_present.id;
