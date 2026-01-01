-- FORCE RESET FOR JAN 1, 2026
-- Using timestamp comparison to avoid timezone casting issues.

DELETE FROM attendance_sessions
WHERE start_time >= '2026-01-01 00:00:00';
