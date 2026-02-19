-- SQL to Fix Incorrect Dates in Database

-- This query updates the 'marked_at' (entry time) in your records
-- to match the 'start_time' (class date) of the session.
-- It only affects "MANUAL" attendance sessions.

UPDATE attendance_records
SET marked_at = s.start_time
FROM attendance_sessions s
WHERE attendance_records.session_id = s.id
AND s.qr_code = 'MANUAL';

-- Run this in your Neon / SQL Console.
