import Navbar from "../components/Navbar";
import { useState } from "react";

function Profile() {

    const [name, setName] = useState("Yoma");
    const [location, setLocation] = useState("IL");
    const [religion, setReligion] = useState("Atheist");
    const [political, setPolitical] = useState("Democrat");
    const [ageRange, setAgeRange] = useState(30);

    return (
        <>
            <Navbar />
            <div className="container  d-flex justify-content-center align-items-center text-center faded-background min-vh-100 min-vw-100">

                <div className="login-card p-4 text-center mb-4">
                    <div className="bg-white">
                        <img
                            src="https://tinyurl.com/5846evr2"
                            className="rounded mb-5 mt-5"
                            alt="profile"
                        />
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
                        <label>Match Age Range</label>
                        <input
                            type="range"
                            min="18"
                            max="60"
                            className="form-range"
                            value={ageRange}
                            onChange={(e) => setAgeRange(e.target.value)}
                        />
                        <p>{ageRange}</p>
                    </div>

                    <div className="mb-3 text-start">
                        <label>Religion Preference</label>
                        <input
                            className="form-control"
                            value={religion}
                            onChange={(e) => setReligion(e.target.value)}
                        />
                    </div>

                    <div className="mb-3 text-start">
                        <label>Political Preference</label>
                        <input
                            className="form-control"
                            value={political}
                            onChange={(e) => setPolitical(e.target.value)}
                        />
                    </div>

                    <div>
                        <button className="btn btn-danger me-2 mb-2">
                            Get Aura +
                        </button>
                    </div>

                    <div>
                        <button className="btn btn-outline-danger me-2">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;
