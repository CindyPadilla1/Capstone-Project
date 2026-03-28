import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();
const API = "http://localhost:4000";

function mapGender(val) {
    if (!val) return "";
    return { "Man": "Male", "Woman": "Female", "Non-binary": "Non-binary" }[val] || val;
}

export function UserProvider({ children }) {

    const [currentUser, setCurrentUser] = useState(() => {
        try { const s = localStorage.getItem("user"); return s ? JSON.parse(s) : null; }
        catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);

    const [matches, setMatches]               = useState([]);
    const [matchesLoading, setMatchesLoading] = useState(false);
    const [matchesError, setMatchesError]     = useState(null);

    const [matchedUsers, setMatchedUsers] = useState(() => {
        try { const s = localStorage.getItem("matchedUsers"); return s ? JSON.parse(s) : []; }
        catch { return []; }
    });

    const [rejectedIds, setRejectedIds] = useState(() => {
        try { const s = localStorage.getItem("rejectedIds"); return s ? JSON.parse(s) : []; }
        catch { return []; }
    });

    const [profile, setProfile] = useState({
        profilePic:        null,
        name:              "",
        location:          "",
        dob:               "",
        gender:            "",
        height:            68,
        religion:          "",
        ethnicity:         "",
        education:         "",
        familyOriented:    "",
        smoker:            "",
        drinker:           "",
        coffeeDrinker:     "",
        diet:              "",
        activityLevel:     "",
        musicPref:         "",
        gamer:             "",
        reader:            "",
        travel:            "",
        pets:              "",
        personality:       "",
        datingGoal:        "",
        bio:               "",
        astrology:         "",
        children:          "",
        politicalStanding: "",
    });

    const [preferences, setPreferences] = useState({
        genderPref:         "",
        minAge:             18,
        maxAge:             100,
        religionPref:       "",
        ethnicityPref:      "",
        educationPref:      "",
        minHeight:          60,
        maxHeight:          80,
        politicalPref:      "",
        childrenPref:       "",
        activityPref:       "",
        familyOrientedPref: "",
        datingGoalPref:     "",
    });

    useEffect(() => {
        localStorage.setItem("matchedUsers", JSON.stringify(matchedUsers));
    }, [matchedUsers]);

    useEffect(() => {
        localStorage.setItem("rejectedIds", JSON.stringify(rejectedIds));
    }, [rejectedIds]);

    // ── Load profile from /auth/me ─────────────────────────────────────────
    const loadUserProfile = async (jwt) => {
        try {
            const res = await fetch(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            const u = data.user;

            setProfile((prev) => ({
                ...prev,
                name:              `${u.first_name || ""} ${u.last_name || ""}`.trim(),
                location:          u.location_city         || "",
                dob:               u.date_of_birth         || "",
                bio:               u.bio                   || "",
                height:            u.height_inches         || 68,
                profilePic:        u.profile_photo_url
                    ? (u.profile_photo_url.startsWith("http")
                        ? u.profile_photo_url
                        : `${API}${u.profile_photo_url}`)
                    : null,
                gender:            mapGender(u.gender_name),
                religion:          u.religion_name         || "",
                ethnicity:         u.ethnicity_name        || "",
                education:         u.education_career_name || "",
                smoker:            u.smoking_name          || "",
                drinker:           u.drinking_name         || "",
                coffeeDrinker:     u.coffee_name           || "",
                diet:              u.diet_name             || "",
                activityLevel:     u.activity_name         || "",
                musicPref:         u.music_name            || "",
                personality:       u.personality_type_name || "",
                datingGoal:        u.dating_goal_name      || "",
                politicalStanding: u.political_name        || "",
                children:          u.children_name         || "",
                astrology:         u.astrology_name        || "",
                familyOriented:    u.family_oriented_name  || "",
                gamer:             u.isgamer_name          || "",
                reader:            u.isreader_name         || "",
                travel:            u.travel_interest_name  || "",
                pets:              u.pet_interest_name     || "",
            }));
        } catch (err) {
            console.error("Failed to load user profile:", err);
        }
    };

    // ── Load preferences from /profile/preferences ─────────────────────────
    const loadPreferences = async (jwt) => {
        try {
            const res = await fetch(`${API}/profile/preferences`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            if (!data.preferences) return;

            const p = data.preferences;
            setPreferences((prev) => ({
                ...prev,
                genderPref:    p.genderPref    || "",
                minAge:        p.minAge        || 18,
                maxAge:        p.maxAge        || 100,
                minHeight:     p.minHeight     || 60,
                maxHeight:     p.maxHeight     || 80,
                datingGoalPref: p.datingGoalPref || "",
                childrenPref:  p.childrenPref  || "",
                politicalPref: p.politicalPref || "",
            }));
        } catch (err) {
            console.error("Failed to load preferences:", err);
        }
    };

    const login = (userData, jwtToken) => {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", jwtToken);
        setCurrentUser(userData);
        setToken(jwtToken);
        loadUserProfile(jwtToken);
        loadPreferences(jwtToken);
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setCurrentUser(null);
        setToken(null);
        setMatches([]);
        setMatchedUsers([]);
        setRejectedIds([]);
    };

    const addMatchedUser = (user) => {
        setMatchedUsers(prev =>
            prev.find(u => u.user_id === user.user_id) ? prev : [...prev, user]
        );
    };

    const rejectUser = (userId) => {
        setRejectedIds(prev =>
            prev.includes(userId) ? prev : [...prev, userId]
        );
    };

    useEffect(() => {
        if (!currentUser || !token) return;

        loadUserProfile(token);
        loadPreferences(token);

        const fetchAll = async () => {
            setMatchesLoading(true);
            setMatchesError(null);

            try {
                const res = await fetch(`${API}/matches/${currentUser.user_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) {
                    setMatchesError(data.error || "Failed to load matches.");
                    return;
                }

                const stored   = JSON.parse(localStorage.getItem("rejectedIds") || "[]");
                const filtered = (data.matches || []).filter(m => !stored.includes(m.user_id));
                setMatches(filtered);

                const mutualRes = await fetch(`${API}/matches/${currentUser.user_id}/mutual`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (mutualRes.ok) {
                    const mutualData = await mutualRes.json();
                    if (mutualData.matches?.length > 0) {
                        setMatchedUsers(prev => {
                            const existing = new Set(prev.map(u => u.user_id));
                            const newOnes  = mutualData.matches.filter(u => !existing.has(u.user_id));
                            return [...prev, ...newOnes];
                        });
                    }
                }
            } catch {
                setMatchesError("Could not connect to server.");
            } finally {
                setMatchesLoading(false);
            }
        };

        fetchAll();
    }, [currentUser, token]);

    return (
        <UserContext.Provider value={{
            currentUser, token, login, logout,
            matches, setMatches, matchesLoading, matchesError,
            matchedUsers, addMatchedUser,
            rejectedIds, rejectUser,
            profile, setProfile,
            preferences, setPreferences,
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() { return useContext(UserContext); }
