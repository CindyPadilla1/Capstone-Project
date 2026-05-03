UPDATE users
SET password_hash = '$2b$10$RIyatva2/Qc33XpWHLrjx.UbEsT4e3Z/E7LdurYh0ECxogjeuW3AS'
WHERE email LIKE '%@test.com';
SELECT user_id, first_name, email,
    CASE WHEN password_hash = '$2b$10$RIyatva2/Qc33XpWHLrjx.UbEsT4e3Z/E7LdurYh0ECxogjeuW3AS' THEN 'password123 ok' ELSE 'WRONG HASH' END AS password_status,
    account_status
FROM users
WHERE email LIKE '%@test.com'
ORDER BY user_id;
