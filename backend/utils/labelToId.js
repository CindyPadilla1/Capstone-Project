// labelToId.js
// Converts frontend string labels to database integer IDs.
// These mappings MUST match Beka's seed insert order exactly.
// Frontend sends human-readable strings; DB stores integer FK IDs.

const RELIGION = {
    "Atheist":                1,
    "Agnostic":               2,
    "Buddhist":               3,
    "Catholic":               4,
    "Christian":              5,
    "Hindu":                  6,
    "Jewish":                 7,
    "Mormon":                 8,
    "Muslim":                 9,
    "Spiritual (non-religious)": 10,
    "Other":                  null,
    "Prefer not to say":      null,
};

const ETHNICITY = {
    "Asian":                  1,
    "Black / African American": 2,
    "Hispanic / Latino":      3,
    "Middle Eastern":         4,
    "Native American":        5,
    "Pacific Islander":       6,
    "White / Caucasian":      7,
    "Multiracial":            8,
    "Other":                  null,
    "Prefer not to say":      null,
};

const EDUCATION = {
    "High School":            1,
    "Some College":           2,
    "Associate's Degree":     3,
    "Bachelor's Degree":      4,
    "Master's Degree":        5,
    "Doctorate / PhD":        6,
    "Trade":                  7,
};

const SMOKING = {
    "Yes":          1,
    "No":           2,
    "Occasionally": 3,
};

const DRINKING = {
    "Yes":    1,
    "No":     2,
    "Social": 3,
};

const COFFEE = {
    "Yes": 1,
    "No":  2,
};

const DIET = {
    "Omnivore":   1,
    "Vegetarian": 2,
    "Vegan":      3,
    "Other":      4,
};

const ACTIVITY_LEVEL = {
    "Low":    1,
    "Medium": 2,
    "High":   3,
};

const MUSIC = {
    "Pop":              1,
    "Hip-Hop / Rap":    2,
    "R&B / Soul":       3,
    "Rock":             4,
    "Country":          5,
    "Electronic / EDM": 6,
    "Jazz / Blues":     7,
    "Classical":        8,
    "Latin":            9,
    "Everything":       10,
    "Other":            11,
};

const GAMER = {
    "Yes":    1,
    "No":     2,
    "Casual": 3,
};

const READER = {
    "Yes":         1,
    "No":          2,
    "Occasionally": 3,
};

const TRAVEL = {
    "Love it":     1,
    "Occasionally": 2,
    "Not really":  3,
};

const PET_INTEREST = {
    "Love animals": 1,
    "Have pets":    2,
    "Allergic":     3,
    "Not a fan":    4,
    "Neutral":      5,
};

const PERSONALITY = {
    "Introvert": 1,
    "Extrovert": 2,
    "Ambivert":  3,
};

const DATING_GOALS = {
    "Casual":    1,
    "Serious":   2,
    "Long-term": 3,
};

const ASTROLOGY = {
    "Aries":       1,
    "Taurus":      2,
    "Gemini":      3,
    "Cancer":      4,
    "Leo":         5,
    "Virgo":       6,
    "Libra":       7,
    "Scorpio":     8,
    "Sagittarius": 9,
    "Capricorn":   10,
    "Aquarius":    11,
    "Pisces":      12,
};

const POLITICAL = {
    "Very Liberal":      1,
    "Liberal":           2,
    "Moderate":          3,
    "Conservative":      4,
    "Very Conservative": 5,
    "Apolitical":        6,
    "Prefer not to say": null,
};

const CHILDREN = {
    "Have kids":      1,
    "Want kids":      2,
    "Don't want kids": 3,
    "Open":           4,
};

const FAMILY_ORIENTED = {
    "Yes": 1,
    "No":  2,
};

const GENDER = {
    "Male":       2,
    "Man":        2,
    "Female":     3,
    "Woman":      3,
    "Non-binary": 4,
};

// Helper — returns null if label is empty/missing, otherwise maps it
function toId(map, label) {
    if (!label || label === "") return null;
    const result = map[label];
    return result !== undefined ? result : null;
}

module.exports = {
    toId,
    RELIGION, ETHNICITY, EDUCATION,
    SMOKING, DRINKING, COFFEE, DIET,
    ACTIVITY_LEVEL, MUSIC, GAMER, READER,
    TRAVEL, PET_INTEREST, PERSONALITY,
    DATING_GOALS, ASTROLOGY, POLITICAL,
    CHILDREN, FAMILY_ORIENTED, GENDER,
};