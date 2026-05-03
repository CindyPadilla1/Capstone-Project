ALTER TABLE trust_score_history
ADD COLUMN score_before integer;
ALTER TABLE user_availability
DROP COLUMN time_slot;
ALTER TABLE user_availability
ADD COLUMN day_of_week varchar CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'));
ALTER TABLE user_availability
ADD COLUMN start_time time;
ALTER TABLE user_availability
ADD COLUMN end_time time;
ALTER TABLE user_availability
ADD COLUMN is_available boolean DEFAULT true;
ALTER TABLE safety_actions
ADD CONSTRAINT check_action_taken
CHECK (action_taken IN ('allowed', 'warned', 'blocked', 'cooldown', 'restricted'));