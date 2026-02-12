const scoreMatch = require("./scoreMatch");

module.exports = function rankMatches(user, candidates) {
    return candidates
        .map(candidate => ({
            ...candidate,
            score: scoreMatch(user, candidate)
        }))
        .sort((a, b) => b.score - a.score);
};