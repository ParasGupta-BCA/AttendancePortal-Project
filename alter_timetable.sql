-- ENABLE TIMETABLE EDITING (Soft Delete)
-- This allows Admins to "delete" classes without wiping history.

-- 1. Add is_active column
ALTER TABLE timetable 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- 2. Index for performance (optional but good)
-- CREATE INDEX idx_timetable_active ON timetable(is_active);

-- Now, all current slots are TRUE.
-- To "Delete" a slot: UPDATE timetable SET is_active = FALSE WHERE id = ...
-- To "View" Schedule: SELECT * FROM timetable WHERE is_active = TRUE ...
