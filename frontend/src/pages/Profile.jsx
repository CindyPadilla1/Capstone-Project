import Navbar from "../components/Navbar";
import StarRating from "../components/StarRating";
import { useState } from "react";

import beatrice from '../assets/beatrice.png'

function Profile() {

    const [starRating] = useState(3);
    const [name, setName] = useState("Yoma");
    const [location, setLocation] = useState("IL");
    const [gender, setGender] = useState("Male");
    const [minAge, setMinAge] = useState(18);
    const [maxAge, setMaxAge] = useState(100);

    const handleSave = () => {

        // BACKEND DISABLED
        /*
        fetch("/api/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user)
        });
        */

        // Prototype behavior
        alert("Profile saved successfully!");
    };

    return (
        <>
            <Navbar />

            <div className="container  d-flex justify-content-center align-items-center text-center faded-background min-vh-100 min-vw-100">

                <div className="login-card p-4 text-center mb-4">
                    <div className="bg-white">
                        <img
                            src={beatrice}
                            className="rounded mb-3 mt-5 img-fluid"
                            alt="profile"
                            style={{ width: "70%", aspectRatio: "1/1", objectFit: "cover" }}
                        />
                        <div className="pb-2">
                            <StarRating  rating={starRating} />
                        </div>

                    </div>
                    <h3 className="mt-3">Profile</h3>

                    <div className="mb-3 text-start">
                        <label>Name</label>
                        <input
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="mb-3 text-start">
                        <label>Location</label>
                        <input
                            className="form-control"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div className="mb-3 text-start">
                        <label>Match Age Range: {minAge} - {maxAge}</label>
                        <input
                            type="range"
                            min="18"
                            max="100"
                            value={minAge}
                            onChange={(e) => setMinAge(e.target.value)}
                            className="form-range"
                        />

                        <input
                            type="range"
                            min="18"
                            max="100"
                            value={maxAge}
                            onChange={(e) => setMaxAge(e.target.value)}
                            className="form-range"
                        />
                    </div>

                    <div className="mb-3 text-start">
                        <label>Gender Preference</label>
                        <input
                            className="form-control"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        />
                    </div>

                    <div>
                        <button className="btn btn-danger me-2 mb-2">
                            Get Aura +
                        </button>
                    </div>

                    <div>
                        <button
                            className="btn btn-outline-danger me-2"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;
