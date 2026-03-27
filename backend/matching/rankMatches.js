// rankMatches.js
// Stage 3 of the matching pipeline — score every filtered candidate and sort.
//
// Trust score tiers (internal_score from trust_score table):
//   ≤ 30    → eliminated in filterMatches (never reaches here)
//   31–50   → ranking penalty applied (demoted but not removed)
//   51–100  → no penalty

const scoreMatch = require("./scoreMatch");

const TRUST_PENALTY_THRESHOLD = 50;  // scores 31–50 → penalized
const TRUST_PENALTY_AMOUNT    = 15;  // points deducted from adjusted score

module.exports = function rankMatches(user, filteredCandidates) {
    return filteredCandidates
        .map(candidate => {
            const result       = scoreMatch(user, candidate);
            let adjustedScore  = result.totalScore;

            // Apply ranking penalty for low-trust candidates (31–50)
            // Candidates at or below 30 were already eliminated in filterMatches
            const trustScore  = candidate.trust_score;
            const isPenalized = trustScore !== null &&
                trustScore !== undefined &&
                trustScore <= TRUST_PENALTY_THRESHOLD;

            if (isPenalized) {
                adjustedScore = Math.max(0, adjustedScore - TRUST_PENALTY_AMOUNT);
            }

            return {
                user_id:         candidate.user_id,
                score:           Math.round(adjustedScore),
                raw_score:       Math.round(result.totalScore),
                trust_penalized: isPenalized,
                breakdown:       result.breakdown
            };
        })
        .sort((a, b) => b.score - a.score); // highest compatibility first
};