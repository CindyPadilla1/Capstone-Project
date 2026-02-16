const generateMatches = require("../services/matchingService");

exports.getMatches = (req, res) => {
    //demo user
    const mockUser = {
        age: 22,
        location: "WI",
        interests: ["music", "movies"],
        activityLevel: "medium"
    };
    //demo candidates
    const mockCandidates = [
        // 75 points → shared interest + same activity level
        { age: 23, location: "IL", interests: ["music"], activityLevel: "medium" },
        // 50 points → shared interest only
        { age: 25, location: "IL", interests: ["movies", "sports"], activityLevel: "high" },
        // 25 points → same activity level only
        { age: 24, location: "IL", interests: ["gaming"], activityLevel: "medium" },
        // 0 points → no shared interests, different activity
        { age: 27, location: "IL", interests: ["hiking", "biking"], activityLevel: "low" },
        // filtered out → wrong location
        { age: 21, location: "WI", interests: ["music"], activityLevel: "medium" },
        // filtered out → age too high
        { age: 80, location: "IL", interests: ["movies"], activityLevel: "medium" }
    ];

    //constraints- can change
    const constraints = {
        minAge: 18,
        maxAge: 30,
        location: "IL"
    };
    //ranked matches
    const matches = generateMatches(mockUser, mockCandidates, constraints);

    res.json(matches);
};