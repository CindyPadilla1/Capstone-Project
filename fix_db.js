require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
async function fix() {
  // Delete preference_genders rows linked to duplicate preferences
  await pool.query(`
    DELETE FROM preference_genders
    WHERE preference_id NOT IN (
      SELECT MAX(preference_id)
      FROM preferences
      GROUP BY user_id
    )
  `);
  console.log('✅ preference_genders cleaned');

  // Delete duplicate preferences, keep only latest per user
  await pool.query(`
    DELETE FROM preferences
    WHERE preference_id NOT IN (
      SELECT MAX(preference_id)
      FROM preferences
      GROUP BY user_id
    )
  `);
  console.log('✅ Duplicate preferences removed');

  // Add unique constraint
  await pool.query(`
    ALTER TABLE preferences
    ADD CONSTRAINT preferences_user_id_unique UNIQUE (user_id)
  `);
  console.log('✅ Unique constraint added — all done!');
  process.exit(0);
}
fix().catch(e => { console.error('❌', e.message); process.exit(1); });
