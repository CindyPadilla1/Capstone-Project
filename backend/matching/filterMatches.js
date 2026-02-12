module.exports = function filterMatches(users, constraints) {
    return users.filter(user => {
        return (
            user.age >= constraints.minAge &&
            user.age <= constraints.maxAge &&
            user.location === constraints.location
        );
    });
};