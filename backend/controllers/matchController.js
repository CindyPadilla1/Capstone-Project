const generateMatches = require("../services/matchingService");

exports.getMatches = (req, res) => {
    const mockUser = {
        age: 22,
        location: "WI",
        interests: ["music", "movies"],
        activityLevel: "medium"
    };

    const mockCandidates = [
        { age: 23, location: "WI", interests: ["music"], activityLevel: "medium" },
        { age: 30, location: "IL", interests: ["sports"], activityLevel: "high" }
    ];

    const constraints = {
        minAge: 18,
        maxAge: 30,
        location: "WI"
    };

    const matches = generateMatches(mockUser, mockCandidates, constraints);

    res.json(matches);
};