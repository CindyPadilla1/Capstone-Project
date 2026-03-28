// profileController.js
const pool = require("../config/db");
const {
    toId,
    RELIGION, ETHNICITY, EDUCATION,
    SMOKING, DRINKING, COFFEE, DIET,
    ACTIVITY_LEVEL, MUSIC, GAMER, READER,
    TRAVEL, PET_INTEREST, PERSONALITY,
    DATING_GOALS, ASTROLOGY, POLITICAL,
    CHILDREN, FAMILY_ORIENTED, GENDER,
} = require("../utils/labelToId");

// ─── POST /profile/save ────────────────────────────────────────────────────
exports.saveProfile = async (req, res) => {
    const user_id = req.user?.id || req.body.user_id;
    if (!user_id) return res.status(400).json({ error: "user_id is required." });

    const {
        name, location, bio, height, gender, religion, ethnicity,
        education, familyOriented, smoker, drinker, coffeeDrinker,
        diet, activityLevel, musicPref, gamer, reader, travel, pets,
        personality, datingGoal, astrology, children, politicalStanding,
    } = req.body;

    try {
        let first_name = null, last_name = null;
        if (name && name.trim()) {
            const parts = name.trim().split(" ");
            first_name = parts[0] || null;
            last_name  = parts.slice(1).join(" ") || null;
        }

        await pool.query(
            `UPDATE users SET
                first_name          = COALESCE($1,  first_name),
                last_name           = COALESCE($2,  last_name),
                location_city       = COALESCE($3,  location_city),
                bio                 = COALESCE($4,  bio),
                height_inches       = COALESCE($5,  height_inches),
                gender_identity     = COALESCE($6,  gender_identity),
                religion_id         = COALESCE($7,  religion_id),
                ethnicity_id        = COALESCE($8,  ethnicity_id),
                education_career_id = COALESCE($9,  education_career_id),
                family_oriented     = COALESCE($10, family_oriented),
                smoking_id          = COALESCE($11, smoking_id),
                drinking_id         = COALESCE($12, drinking_id),
                coffee_id           = COALESCE($13, coffee_id),
                diet_id             = COALESCE($14, diet_id),
                activity_level      = COALESCE($15, activity_level),
                music               = COALESCE($16, music),
                gamer               = COALESCE($17, gamer),
                reader              = COALESCE($18, reader),
                travel              = COALESCE($19, travel),
                pet_interest        = COALESCE($20, pet_interest),
                personality_type    = COALESCE($21, personality_type),
                dating_goals        = COALESCE($22, dating_goals),
                astrology           = COALESCE($23, astrology),
                children            = COALESCE($24, children),
                political           = COALESCE($25, political)
            WHERE user_id = $26`,
            [
                first_name, last_name, location || null, bio || null, height || null,
                toId(GENDER, gender), toId(RELIGION, religion), toId(ETHNICITY, ethnicity),
                toId(EDUCATION, education), toId(FAMILY_ORIENTED, familyOriented),
                toId(SMOKING, smoker), toId(DRINKING, drinker), toId(COFFEE, coffeeDrinker),
                toId(DIET, diet), toId(ACTIVITY_LEVEL, activityLevel), toId(MUSIC, musicPref),
                toId(GAMER, gamer), toId(READER, reader), toId(TRAVEL, travel),
                toId(PET_INTEREST, pets), toId(PERSONALITY, personality),
                toId(DATING_GOALS, datingGoal), toId(ASTROLOGY, astrology),
                toId(CHILDREN, children), toId(POLITICAL, politicalStanding),
                user_id
            ]
        );

        res.json({ message: "Profile saved successfully." });
    } catch (err) {
        console.error("saveProfile error:", err.message);
        res.status(500).json({ error: "Failed to save profile." });
    }
};

// ─── POST /profile/preferences ─────────────────────────────────────────────
exports.savePreferences = async (req, res) => {
    const user_id = req.user?.id || req.body.user_id;
    if (!user_id) return res.status(400).json({ error: "user_id is required." });

    const {
        genderPref, minAge, maxAge, minHeight, maxHeight,
        politicalPref, childrenPref, datingGoalPref,
    } = req.body;

    try {
        const genderMap = { "Male": 2, "Man": 2, "Female": 3, "Woman": 3, "Non-binary": 4 };
        const preferred_gender = (genderPref && genderPref !== "No preference")
            ? (genderMap[genderPref] || null) : null;

        const prefResult = await pool.query(
            `INSERT INTO preferences
                (user_id, preferred_age_min, preferred_age_max,
                 preferred_height_min, preferred_height_max,
                 preferred_political_affil, preferred_want_children,
                 preferred_dating_goals)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
             ON CONFLICT (user_id) DO UPDATE SET
                preferred_age_min         = EXCLUDED.preferred_age_min,
                preferred_age_max         = EXCLUDED.preferred_age_max,
                preferred_height_min      = EXCLUDED.preferred_height_min,
                preferred_height_max      = EXCLUDED.preferred_height_max,
                preferred_political_affil = EXCLUDED.preferred_political_affil,
                preferred_want_children   = EXCLUDED.preferred_want_children,
                preferred_dating_goals    = EXCLUDED.preferred_dating_goals
             RETURNING preference_id`,
            [
                user_id,
                minAge    || 18,
                maxAge    || 100,
                minHeight || 60,
                maxHeight || 80,
                toId(POLITICAL,    politicalPref),
                toId(CHILDREN,     childrenPref),
                toId(DATING_GOALS, datingGoalPref),
            ]
        );

        const preference_id = prefResult.rows[0].preference_id;

        // Save gender preference in preference_genders table
        await pool.query(
            "DELETE FROM preference_genders WHERE preference_id = $1",
            [preference_id]
        );
        if (preferred_gender) {
            await pool.query(
                "INSERT INTO preference_genders (preference_id, gender_type_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [preference_id, preferred_gender]
            );
        }

        res.json({ message: "Preferences saved successfully." });
    } catch (err) {
        console.error("savePreferences error:", err.message);
        res.status(500).json({ error: "Failed to save preferences." });
    }
};

// ─── GET /profile/preferences ──────────────────────────────────────────────
// Called by UserContext on login to restore preference sliders.
// Returns preference values as human-readable strings so frontend can
// map them back to the correct toggle/dropdown values.
exports.getPreferences = async (req, res) => {
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            `SELECT
                p.preferred_age_min,
                p.preferred_age_max,
                p.preferred_height_min,
                p.preferred_height_max,
                dg.dating_goal_name   AS preferred_dating_goal,
                wc.want_children      AS preferred_children,
                po.political_affil    AS preferred_political,
                array_agg(pg.gender_type_id) FILTER (WHERE pg.gender_type_id IS NOT NULL) AS preferred_gender_ids
             FROM preferences p
             LEFT JOIN dating_goals   dg ON dg.dating_goals_id    = p.preferred_dating_goals
             LEFT JOIN want_children  wc ON wc.want_children_id   = p.preferred_want_children
             LEFT JOIN political_affil po ON po.political_affil_id = p.preferred_political_affil
             LEFT JOIN preference_genders pg ON pg.preference_id  = p.preference_id
             WHERE p.user_id = $1
             GROUP BY p.preference_id, dg.dating_goal_name, wc.want_children, po.political_affil`,
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.json({ preferences: null });
        }

        const row = result.rows[0];

        // Map gender_type_id back to frontend string
        const genderIdMap = { 1: "No preference", 2: "Male", 3: "Female", 4: "Non-binary" };
        const genderIds   = row.preferred_gender_ids || [];
        const genderPref  = genderIds.length > 0
            ? (genderIdMap[genderIds[0]] || "No preference")
            : "No preference";

        res.json({
            preferences: {
                genderPref,
                minAge:         row.preferred_age_min    || 18,
                maxAge:         row.preferred_age_max    || 100,
                minHeight:      row.preferred_height_min || 60,
                maxHeight:      row.preferred_height_max || 80,
                datingGoalPref: row.preferred_dating_goal || "",
                childrenPref:   row.preferred_children    || "",
                politicalPref:  row.preferred_political   || "",
            }
        });
    } catch (err) {
        console.error("getPreferences error:", err.message);
        res.status(500).json({ error: "Failed to load preferences." });
    }
};