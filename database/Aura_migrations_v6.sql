ALTER TABLE date_scheduling
DROP CONSTRAINT IF EXISTS check_schedule_status;
ALTER TABLE date_scheduling
ADD CONSTRAINT check_schedule_status
CHECK (status IN ('pending', 'approved', 'rejected', 'modified'));