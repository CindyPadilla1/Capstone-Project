import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {

    const [profile, setProfile] = useState({
        profilePic: null,
        name: "Yoma",
        location: "IL",
        dob: "",
        gender: "",
        height: 68,
        religion: "",
        ethnicity: "",
        education: "",
        familyOriented: "",
        smoker: "",
        drinker: "",
        coffeeDrinker: "",
        diet: "",
        activityLevel: "",
        musicPref: "",
        gamer: "",
        reader: "",
        travel: "",
        pets: "",
        personality: "",
        datingGoal: "",
        bio: "",
        astrology: "",
        children: "",
        politicalStanding: "",
    });

    const [preferences, setPreferences] = useState({
        genderPref: "",
        minAge: 18,
        maxAge: 100,
        religionPref: "",
        ethnicityPref: "",
        minHeight: 60,
        maxHeight: 80,
        politicalPref: "",
        childrenPref: "",
        educationPref: "",
        activityPref: "",
        familyOrientedPref: "",
        datingGoalPref: "",
    });

    return (
        <UserContext.Provider value={{ profile, setProfile, preferences, setPreferences }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}