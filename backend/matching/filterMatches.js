// filterMatches.js
// Stage 1 of the matching pipeline — hard constraint filtering.
//
// Pipeline order (matches Feature 1 spec exactly):
//   1. Trust elimination  — remove users below safety threshold
//   2. Account status     — active users only
//   3. Age range          — from user's preferences
//   4. Gender preference  — what the logged-in user wants
//   5. Height range       — from user's preferences (height_inches)
//   6. Dating goals       — compatible intent required
//   7. Children           — must be compatible
//
// Location is NOT a hard filter here — it is preference-based soft scoring.
// Removing it as a hard block prevents silent match elimination during demo.

const TRUST_ELIMINATION_THRESHOLD = 30; // internal_score ≤ 30 → removed entirely

// ─── Age helper ────────────────────────────────────────────────────────────
function getAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const today = new Date();
    const dob   = new Date(dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}

// ─── Gender preference check ───────────────────────────────────────────────
// One-directional: does the logged-in user's preference include this candidate?
function genderMatch(user, candidate) {
    const preferred = user.preferences?.preferred_genders || [];
    if (preferred.length === 0) return true; // no preference = open to all
    return preferred.includes(candidate.gender_identity);
}

// ─── Dating goals compatibility ────────────────────────────────────────────
// Long-term (2) and Exclusive/Serious (3) are treated as compatible
// Casual (1) must match casual — mixing casual with serious is a hard fail
function datingGoalsCompatible(userGoal, candidateGoal) {
    if (!userGoal || !candidateGoal) return true; // not set = no constraint
    if (userGoal === candidateGoal) return true;
    const longTermGroup = [2, 3]; // Serious / Long-term — compatible with each other
    if (longTermGroup.includes(userGoal) && longTermGroup.includes(candidateGoal)) return true;
    return false;
}

// ─── Children preference compatibility ────────────────────────────────────
// IDs (from seed): 1=Wants children, 2=Has children, 3=Does not want, 4=Open/flexible
// Hard incompatibility: wants children vs does not want
function childrenCompatible(userChildren, candidateChildren) {
    if (!userChildren || !candidateChildren) return true;
    if (userChildren === 4 || candidateChildren === 4) return true; // open/flexible = always compatible
    // Wants (1) vs Does not want (3) = hard fail in both directions
    if ((userChildren === 1 && candidateChildren === 3) ||
        (userChildren === 3 && candidateChildren === 1)) return false;
    return true;
}

// ─── MAIN FILTER ───────────────────────────────────────────────────────────
module.exports = function filterMatches(user, candidates) {
    const prefs = user.preferences;

    return candidates.filter(candidate => {

        // ── 1. Trust elimination ─────────────────────────────────────────
        // Users at or below threshold are never shown — safety non-negotiable
        if (candidate.trust_score !== null &&
            candidate.trust_score !== undefined &&
            candidate.trust_score <= TRUST_ELIMINATION_THRESHOLD) {
            return false;
        }

        // ── 2. Account must be active ────────────────────────────────────
        if (candidate.account_status !== 'active') return false;

        // ── 3–7 require preferences — skip remaining checks if not set ───
        if (!prefs) return true;

        // ── 3. Age range ─────────────────────────────────────────────────
        const candidateAge = getAge(candidate.date_of_birth);
        if (prefs.preferred_age_min && candidateAge !== null) {
            if (candidateAge < prefs.preferred_age_min) return false;
        }
        if (prefs.preferred_age_max && candidateAge !== null) {
            if (candidateAge > prefs.preferred_age_max) return false;
        }

        // ── 4. Gender preference ─────────────────────────────────────────
        if (!genderMatch(user, candidate)) return false;

        // ── 5. Height range (stored in height_inches) ────────────────────
        if (prefs.preferred_height_min && candidate.height_inches !== null && candidate.height_inches !== undefined) {
            if (candidate.height_inches < prefs.preferred_height_min) return false;
        }
        if (prefs.preferred_height_max && candidate.height_inches !== null && candidate.height_inches !== undefined) {
            if (candidate.height_inches > prefs.preferred_height_max) return false;
        }

        // ── 6. Dating goals compatibility ────────────────────────────────
        if (!datingGoalsCompatible(user.dating_goals, candidate.dating_goals)) return false;

        // ── 7. Children compatibility ────────────────────────────────────
        if (!childrenCompatible(user.children, candidate.children)) return false;

        return true; // passed all constraints
    });
};