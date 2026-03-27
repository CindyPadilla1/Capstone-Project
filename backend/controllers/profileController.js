// profileController.js
// POST /profile/save        — saves questionnaire + profile fields
// POST /profile/preferences — saves partner preferences
//
// Frontend sends human-readable strings like "Christian", "Ambivert", "Casual".
// This controller converts them to integer IDs before writing to the DB.

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
// Called after Questionnaire.jsx and from Profile.jsx save button.
// Accepts string labels from frontend, converts to IDs, updates users table.
exports.saveProfile = async (req, res) => {
    // Get user_id from JWT (set by authMiddleware) or from body as fallback
    const user_id = req.user?.id || req.body.user_id;

    if (!user_id) {
        return res.status(400).json({ error: "user_id is required." });
    }

    const {
        name,
        location,
        bio,
        height,           // number in inches from slider
        // String labels from frontend
        gender,
        religion,
        ethnicity,
        education,
        familyOriented,
        smoker,
        drinker,
        coffeeDrinker,
        diet,
        activityLevel,
        musicPref,
        gamer,
        reader,
        travel,
        pets,
        personality,
        datingGoal,
        astrology,
        children,
        politicalStanding,
    } = req.body;

    try {
        // Split name into first/last if provided
        let first_name = null;
        let last_name  = null;
        if (name && name.trim()) {
            const parts = name.trim().split(" ");
            first_name = parts[0] || null;
            last_name  = parts.slice(1).join(" ") || null;
        }

        // Convert all string labels to integer IDs
        const religion_id         = toId(RELIGION,        religion);
        const ethnicity_id        = toId(ETHNICITY,       ethnicity);
        const education_career_id = toId(EDUCATION,       education);
        const smoking_id          = toId(SMOKING,         smoker);
        const drinking_id         = toId(DRINKING,        drinker);
        const coffee_id           = toId(COFFEE,          coffeeDrinker);
        const diet_id             = toId(DIET,            diet);
        const activity_level      = toId(ACTIVITY_LEVEL,  activityLevel);
        const music               = toId(MUSIC,           musicPref);
        const gamer_id            = toId(GAMER,           gamer);
        const reader_id           = toId(READER,          reader);
        const travel_id           = toId(TRAVEL,          travel);
        const pet_interest        = toId(PET_INTEREST,    pets);
        const personality_type    = toId(PERSONALITY,     personality);
        const dating_goals        = toId(DATING_GOALS,    datingGoal);
        const astrology_id        = toId(ASTROLOGY,       astrology);
        const children_id         = toId(CHILDREN,        children);
        const political           = toId(POLITICAL,       politicalStanding);
        const family_oriented     = toId(FAMILY_ORIENTED, familyOriented);
        const gender_identity     = toId(GENDER,          gender);

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
                first_name, last_name, location, bio, height || null,
                gender_identity, religion_id, ethnicity_id, education_career_id,
                family_oriented, smoking_id, drinking_id, coffee_id, diet_id,
                activity_level, music, gamer_id, reader_id, travel_id,
                pet_interest, personality_type, dating_goals, astrology_id,
                children_id, political,
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
// Called from Preferences.jsx and Profile.jsx save button.
// Converts string preference labels to IDs and upserts into preferences table.
exports.savePreferences = async (req, res) => {
    const user_id = req.user?.id || req.body.user_id;

    if (!user_id) {
        return res.status(400).json({ error: "user_id is required." });
    }

    const {
        genderPref,
        minAge,
        maxAge,
        minHeight,
        maxHeight,
        religionPref,
        politicalPref,
        childrenPref,
        activityPref,
        datingGoalPref,
        familyOrientedPref,
    } = req.body;

    try {
        // Convert gender preference to gender_type_id array
        const genderMap = { "Male": 2, "Man": 2, "Female": 3, "Woman": 3, "Non-binary": 4 };
        let preferred_genders = [];
        if (genderPref && genderPref !== "No preference") {
            const gId = genderMap[genderPref];
            if (gId) preferred_genders = [gId];
        }

        const preferred_political_affil = toId(POLITICAL,      politicalPref);
        const preferred_want_children   = toId(CHILDREN,       childrenPref);
        const preferred_activity_level  = toId(ACTIVITY_LEVEL, activityPref);
        const preferred_dating_goals    = toId(DATING_GOALS,   datingGoalPref);
        const preferred_religion        = toId(RELIGION,       religionPref);

        // Upsert preferences row
        const prefResult = await pool.query(
            `INSERT INTO preferences
                (user_id, preferred_age_min, preferred_age_max,
                 preferred_height_min, preferred_height_max,
                 preferred_political_affil, preferred_want_children,
                 preferred_dating_goals)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
                minAge  || 18,
                maxAge  || 100,
                minHeight || 60,
                maxHeight || 80,
                preferred_political_affil,
                preferred_want_children,
                preferred_dating_goals,
            ]
        );

        const preference_id = prefResult.rows[0].preference_id;

        // Replace preferred_genders
        await pool.query(
            "DELETE FROM preference_genders WHERE preference_id = $1",
            [preference_id]
        );
        for (const gId of preferred_genders) {
            await pool.query(
                "INSERT INTO preference_genders (preference_id, gender_type_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [preference_id, gId]
            );
        }

        res.json({ message: "Preferences saved successfully." });
    } catch (err) {
        console.error("savePreferences error:", err.message);
        res.status(500).json({ error: "Failed to save preferences." });
    }
};