// authController.js
// POST /auth/signup — creates a new user
// POST /auth/login  — validates credentials, returns JWT
// GET  /auth/me     — returns current user profile (called by UserContext on load)

const pool   = require("../config/db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

// ─── POST /auth/signup ─────────────────────────────────────────────────────
// Expects: { firstName, lastName, location, dob, email, password }
// Alex's signup.jsx sends dob as "MM/DD/YYYY" string (not age number).
exports.signup = async (req, res) => {
    const { firstName, lastName, location, dob, age, email, password } = req.body;

    if (!firstName || !lastName || !location || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }
    if (!email.includes("@")) {
        return res.status(400).json({ error: "Invalid email address." });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Support both dob (MM/DD/YYYY) and age (number) from frontend
    let date_of_birth;
    if (dob) {
        // Alex sends MM/DD/YYYY — convert to YYYY-MM-DD for postgres
        const parts = dob.split("/");
        if (parts.length === 3) {
            const [month, day, year] = parts;
            date_of_birth = `${year}-${month.padStart(2,"0")}-${day.padStart(2,"0")}`;
            const birthYear = parseInt(year);
            const userAge = new Date().getFullYear() - birthYear;
            if (userAge < 18) {
                return res.status(400).json({ error: "You must be 18 or older." });
            }
        } else {
            return res.status(400).json({ error: "Invalid date of birth format." });
        }
    } else if (age) {
        // Fallback: age as number
        if (age < 18) return res.status(400).json({ error: "You must be 18 or older." });
        const birthYear = new Date().getFullYear() - parseInt(age);
        date_of_birth = `${birthYear}-01-01`;
    } else {
        return res.status(400).json({ error: "Date of birth is required." });
    }

    try {
        const existing = await pool.query(
            "SELECT user_id FROM users WHERE email = $1", [email]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "An account with this email already exists." });
        }

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO users
                (first_name, last_name, email, password_hash, date_of_birth, location_city, account_status, created_at, role_id, tier_id)
             VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW(), 1, 1)
             RETURNING user_id, first_name, last_name, email`,
            [firstName, lastName, email, password_hash, date_of_birth, location]
        );

        const newUser = result.rows[0];

        // Create default trust score
        await pool.query(
            "INSERT INTO trust_score (user_id, internal_score, last_updated) VALUES ($1, 75, NOW())",
            [newUser.user_id]
        );

        // Generate JWT
        const jwt = require("jsonwebtoken");
        const token = jwt.sign(
            { id: newUser.user_id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "Account created successfully.",
            token,
            user: newUser
        });
    } catch (err) {
        console.error("signup error:", err.message);
        res.status(500).json({ error: "Signup failed. Please try again." });
    }
};

// ─── POST /auth/login ──────────────────────────────────────────────────────
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const result = await pool.query(
            `SELECT u.user_id, u.first_name, u.last_name, u.email, u.password_hash, u.account_status
             FROM users u WHERE u.email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const user = result.rows[0];

        if (user.account_status !== "active") {
            return res.status(403).json({ error: "This account has been suspended or banned." });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        await pool.query(
            "UPDATE users SET last_login = NOW() WHERE user_id = $1",
            [user.user_id]
        );

        const jwt = require("jsonwebtoken");
        const token = jwt.sign(
            { id: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful.",
            token,
            user: {
                user_id:    user.user_id,
                first_name: user.first_name,
                last_name:  user.last_name,
                email:      user.email,
            }
        });
    } catch (err) {
        console.error("login error:", err.message);
        res.status(500).json({ error: "Login failed. Please try again." });
    }
};

// ─── GET /auth/me ──────────────────────────────────────────────────────────
// Called by UserContext.loadUserProfile() on every login/page load.
// Returns full user profile with all joined label names.
exports.getMe = async (req, res) => {
    try {
        const userId = req.user.id; // set by authMiddleware

        const result = await pool.query(
            `SELECT
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.date_of_birth,
                u.height_inches,
                u.location_city,
                u.location_state,
                u.bio,
                u.profile_photo_url,
                gt.gender_name,
                rt.religion_name,
                et.ethnicity_name,
                ec.education_career_name,
                sm.smoking_name,
                dr.drinking_name,
                co.coffee_name,
                di.diet_name,
                al.activity_name,
                mu.music_name,
                pe.personality_type_name,
                dg.dating_goals_name,
                po.political_name,
                ch.children_name,
                fo.family_oriented_name,
                u.gamer,
                u.reader,
                u.travel,
                u.pet_interest,
                u.astrology,
                u.family_oriented,
                ts.internal_score AS trust_score
            FROM users u
            LEFT JOIN gender_type         gt ON gt.gender_type_id       = u.gender_identity
            LEFT JOIN religion_type       rt ON rt.religion_type_id     = u.religion_id
            LEFT JOIN ethnicity_type      et ON et.ethnicity_type_id    = u.ethnicity_id
            LEFT JOIN education_career    ec ON ec.education_career_id  = u.education_career_id
            LEFT JOIN smoking_type        sm ON sm.smoking_id           = u.smoking_id
            LEFT JOIN drinking_type       dr ON dr.drinking_id          = u.drinking_id
            LEFT JOIN coffee_type         co ON co.coffee_id            = u.coffee_id
            LEFT JOIN diet_type           di ON di.diet_id              = u.diet_id
            LEFT JOIN activity_level_type al ON al.activity_level_id   = u.activity_level
            LEFT JOIN music_type          mu ON mu.music_id             = u.music
            LEFT JOIN personality_type    pe ON pe.personality_type_id  = u.personality_type
            LEFT JOIN dating_goals_type   dg ON dg.dating_goals_id      = u.dating_goals
            LEFT JOIN political_affil     po ON po.political_id         = u.political
            LEFT JOIN children_type       ch ON ch.children_id          = u.children
            LEFT JOIN family_oriented_type fo ON fo.family_oriented_id  = u.family_oriented
            LEFT JOIN trust_score         ts ON ts.user_id              = u.user_id
            WHERE u.user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error("getMe error:", err.message);
        res.status(500).json({ error: "Failed to load profile." });
    }
};