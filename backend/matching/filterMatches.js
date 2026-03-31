// filterMatches.js
// Stage 1 of the matching pipeline — hard constraint filtering.
// IDs verified from live DB:
// dating_goals: 1=No preference, 2=Casual, 3=Serious, 4=Long-term
// want_children: 1=No preference, 2=Want kids, 3=Have kids, 4=Don't want kids, 5=Open

const TRUST_ELIMINATION_THRESHOLD = 30;

function getAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const today = new Date();
    const dob   = new Date(dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}

function genderMatch(user, candidate) {
    const preferred = user.preferences?.preferred_genders || [];
    if (!preferred || preferred.length === 0) return true;
    return preferred.includes(candidate.gender_identity);
}

// dating_goals: 1=No pref, 2=Casual, 3=Serious, 4=Long-term
// Serious(3) and Long-term(4) are compatible with each other
function datingGoalsCompatible(userGoal, candidateGoal) {
    if (!userGoal || !candidateGoal) return true;
    if (userGoal === 1 || candidateGoal === 1) return true; // No preference
    if (userGoal === candidateGoal) return true;
    const longTermGroup = [3, 4]; // Serious + Long-term compatible
    if (longTermGroup.includes(userGoal) && longTermGroup.includes(candidateGoal)) return true;
    return false;
}

// want_children: 1=No pref, 2=Want kids, 3=Have kids, 4=Don't want kids, 5=Open
function childrenCompatible(userChildren, candidateChildren) {
    if (!userChildren || !candidateChildren) return true;
    if (userChildren === 1 || candidateChildren === 1) return true; // No preference
    if (userChildren === 5 || candidateChildren === 5) return true; // Open
    // Don't want kids(4) vs Want kids(2) — incompatible
    if ((userChildren === 4 && candidateChildren === 2) ||
        (userChildren === 2 && candidateChildren === 4)) return false;
    return true;
}

module.exports = function filterMatches(user, candidates) {
    const prefs = user.preferences;

    return candidates.filter(candidate => {
        // Trust threshold
        if (candidate.trust_score !== null &&
            candidate.trust_score !== undefined &&
            candidate.trust_score <= TRUST_ELIMINATION_THRESHOLD) return false;

        // Must be active
        if (candidate.account_status !== "active") return false;

        // Location filter — only filter if BOTH have location_state set
        if (user.location_state && candidate.location_state) {
            if (user.location_state !== candidate.location_state) return false;
        }

        if (!prefs) return true;

        // Age range
        const candidateAge = getAge(candidate.date_of_birth);
        if (prefs.preferred_age_min && candidateAge !== null) {
            if (candidateAge < prefs.preferred_age_min) return false;
        }
        if (prefs.preferred_age_max && candidateAge !== null) {
            if (candidateAge > prefs.preferred_age_max) return false;
        }

        // Gender preference
        if (!genderMatch(user, candidate)) return false;

        // Height range
        if (prefs.preferred_height_min && candidate.height_inches !== null && candidate.height_inches !== undefined) {
            if (candidate.height_inches < prefs.preferred_height_min) return false;
        }
        if (prefs.preferred_height_max && candidate.height_inches !== null && candidate.height_inches !== undefined) {
            if (candidate.height_inches > prefs.preferred_height_max) return false;
        }

        // Dating goals
        if (!datingGoalsCompatible(user.dating_goals, candidate.dating_goals)) return false;

        // Children
        if (!childrenCompatible(user.children, candidate.children)) return false;

        return true;
    });
};