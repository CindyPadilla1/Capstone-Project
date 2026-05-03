SELECT user_id, first_name, last_name, location_city, location_state
FROM users
ORDER BY user_id;
UPDATE users SET location_state = 'IL'
WHERE location_city = 'Chicago' AND (location_state IS NULL OR location_state = '');
UPDATE users SET location_state = 'TX'
WHERE location_city = 'Austin' AND (location_state IS NULL OR location_state = '');
UPDATE users SET location_state = 'CA'
WHERE location_city = 'Los Angeles' AND (location_state IS NULL OR location_state = '');
UPDATE users
SET
    location_state = TRIM(SPLIT_PART(location_city, ',', 2)),
    location_city  = TRIM(SPLIT_PART(location_city, ',', 1))
WHERE location_city LIKE '%,%';
SELECT user_id, first_name, last_name, location_city, location_state
FROM users
WHERE location_state IS NULL OR location_state = ''
ORDER BY user_id;
SELECT user_id, first_name, last_name,
       location_city || ', ' || location_state AS location
FROM users
WHERE location_city IS NOT NULL
ORDER BY user_id;