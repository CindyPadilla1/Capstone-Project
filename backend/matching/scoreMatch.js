// scoreMatch.js
// Stage 2 of the matching pipeline — weighted compatibility scoring.
// All IDs verified from live DB via checkSeeds.js.
//
// activity_level: 1=No preference, 2=Low, 3=Medium, 4=High
// drinking:       1=Yes, 2=No, 3=Social
// smoking:        1=Yes, 2=No, 3=Occasionally
// dating_goals:   1=No preference, 2=Casual, 3=Serious, 4=Long-term
// political_affil:1=No preference, 2=Very Liberal, 3=Liberal, 4=Moderate,
//                 5=Conservative, 6=Very Conservative, 7=Apolitical
// religion_type:  1=No preference, 2=Atheist, 3=Agnostic, 4=Buddhist,
//                 5=Catholic, 6=Christian, 7=Hindu, 8=Jewish, 9=Mormon,
//                 10=Muslim, 11=Spiritual (non-religious)
// personality:    1=Introvert, 2=Extrovert, 3=Ambivert
// travel:         1=Love it, 2=Occasionally, 3=Not really
// gamer:          1=Yes, 2=No, 3=Casual
// family_oriented:1=No preference, 2=Yes, 3=No

const POLITICAL_NO_PREF_ID    = 1;
const POLITICAL_APOLITICAL_ID = 7;
const RELIGION_NO_PREF_ID     = 1;
const RELIGION_SPIRITUAL_ID   = 11;
const AMBIVERT_ID             = 3;
const ACTIVITY_NO_PREF_ID     = 1;
const DATING_NO_PREF_ID       = 1;
const FAMILY_NO_PREF_ID       = 1;

// ─── LIFESTYLE DIMENSION (25 pts) ──────────────────────────────────────────
function scoreLifestyle(userA, userB) {
    let score = 0;

    // Activity level — 1=No pref, 2=Low, 3=Medium, 4=High
    if (userA.activity_level && userB.activity_level) {
        const a = userA.activity_level;
        const b = userB.activity_level;
        // Skip scoring if either has "No preference"
        if (a !== ACTIVITY_NO_PREF_ID && b !== ACTIVITY_NO_PREF_ID) {
            const diff = Math.abs(a - b);
            if (diff === 0) score += 10;
            else if (diff === 1) score += 5;
        } else {
            score += 5; // partial credit if one has no preference
        }
    }

    // Drinking — 1=Yes, 2=No, 3=Social
    if (userA.drinking_id && userB.drinking_id) {
        if (userA.drinking_id === userB.drinking_id) score += 6;
        else if (userA.drinking_id === 3 || userB.drinking_id === 3) score += 2;
    }

    // Smoking — 1=Yes, 2=No, 3=Occasionally
    if (userA.smoking_id && userB.smoking_id) {
        if (userA.smoking_id === userB.smoking_id) score += 4;
        else if (userA.smoking_id === 3 || userB.smoking_id === 3) score += 1;
    }

    // Diet — exact match
    if (userA.diet_id && userB.diet_id) {
        if (userA.diet_id === userB.diet_id) score += 3;
    }

    // Coffee — exact match
    if (userA.coffee_id && userB.coffee_id) {
        if (userA.coffee_id === userB.coffee_id) score += 2;
    }

    return Math.min(25, score);
}

// ─── INTERESTS DIMENSION (25 pts) ──────────────────────────────────────────
function scoreInterests(userA, userB) {
    let score = 0;

    // Music — exact match
    if (userA.music && userB.music) {
        if (userA.music === userB.music) score += 8;
    }

    // Pet interest — exact match
    if (userA.pet_interest && userB.pet_interest) {
        if (userA.pet_interest === userB.pet_interest) score += 3;
    }

    // Reader — exact match
    if (userA.reader && userB.reader) {
        if (userA.reader === userB.reader) score += 3;
    }

    // Travel — ordinal: 1=Love it, 2=Occasionally, 3=Not really
    if (userA.travel && userB.travel) {
        const diff = Math.abs(userA.travel - userB.travel);
        if (diff === 0) score += 7;
        else if (diff === 1) score += 3;
    }

    // Gamer — 1=Yes, 2=No, 3=Casual
    if (userA.gamer && userB.gamer) {
        if (userA.gamer === userB.gamer) score += 4;
        else if (userA.gamer === 3 || userB.gamer === 3) score += 2;
    }

    return Math.min(25, score);
}

// ─── PERSONALITY DIMENSION (15 pts) ────────────────────────────────────────
// 1=Introvert, 2=Extrovert, 3=Ambivert
function scorePersonality(userA, userB) {
    if (!userA.personality_type || !userB.personality_type) return 0;
    if (userA.personality_type === AMBIVERT_ID || userB.personality_type === AMBIVERT_ID) return 12;
    if (userA.personality_type === userB.personality_type) return 15;
    return 6; // Introvert + Extrovert
}

// ─── VALUES DIMENSION (25 pts) ─────────────────────────────────────────────
function scoreValues(userA, userB) {
    let score = 0;

    // Religion
    if (userA.religion_id && userB.religion_id) {
        const a = userA.religion_id;
        const b = userB.religion_id;
        if (a === RELIGION_NO_PREF_ID || b === RELIGION_NO_PREF_ID) {
            score += 4; // partial credit for no preference
        } else if (a === b) {
            score += 10;
        } else if (a === RELIGION_SPIRITUAL_ID || b === RELIGION_SPIRITUAL_ID) {
            score += 4;
        }
    }

    // Family oriented — 1=No pref, 2=Yes, 3=No
    if (userA.family_oriented && userB.family_oriented) {
        const a = userA.family_oriented;
        const b = userB.family_oriented;
        if (a === FAMILY_NO_PREF_ID || b === FAMILY_NO_PREF_ID) {
            score += 4;
        } else if (a === b) {
            score += 8;
        }
    }

    // Political — 1=No pref, 2=VeryLib..6=VeryConservative, 7=Apolitical
    if (userA.political && userB.political) {
        const a = userA.political;
        const b = userB.political;
        if (a === POLITICAL_NO_PREF_ID || b === POLITICAL_NO_PREF_ID) {
            score += 3;
        } else if (a === POLITICAL_APOLITICAL_ID || b === POLITICAL_APOLITICAL_ID) {
            score += 3;
        } else {
            const diff = Math.abs(a - b);
            if (diff === 0) score += 7;
            else if (diff === 1) score += 4;
            else if (diff === 2) score += 1;
        }
    }

    return Math.min(25, score);
}

// ─── TRUST BONUS (10 pts) ──────────────────────────────────────────────────
function scoreTrust(candidate) {
    if (candidate.trust_score === null || candidate.trust_score === undefined) return 5;
    return Math.round((candidate.trust_score / 100) * 10);
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────
module.exports = function scoreMatch(userA, userB) {
    const lifestyle   = scoreLifestyle(userA, userB);
    const interests   = scoreInterests(userA, userB);
    const personality = scorePersonality(userA, userB);
    const values      = scoreValues(userA, userB);
    const trust       = scoreTrust(userB);

    const totalScore = lifestyle + interests + personality + values + trust;

    return {
        totalScore,
        breakdown: { lifestyle, interests, personality, values, trust }
    };
};