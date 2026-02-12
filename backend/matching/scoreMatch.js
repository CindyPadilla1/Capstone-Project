module.exports = function scoreMatch(userA, userB) {
    let score = 0;

    // Shared interests
    if (userA.interests.some(i => userB.interests.includes(i))) {
        score += 50;
    }

    // Activity level match
    if (userA.activityLevel === userB.activityLevel) {
        score += 25;
    }

    return score;
};