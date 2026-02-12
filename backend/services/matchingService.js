const filterMatches = require("../matching/filterMatches");
const rankMatches = require("../matching/rankMatches");

module.exports = function generateMatches(user, candidates, constraints) {
    const filtered = filterMatches(candidates, constraints);
    return rankMatches(user, filtered);
};