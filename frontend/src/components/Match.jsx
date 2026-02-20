import StarRating from "./StarRating";

function Match({user, onHeart, onReject}) {

    return (
        <div className="login-card p-4 text-center mb-4">

            <div className="bg-white">

                <img
                    src={user.image}
                    className="rounded mb-3 mt-5 img-fluid"
                    alt="profile"
                    style={{
                        width: "70%",
                        aspectRatio: "1/1",
                        objectFit: "cover"
                    }}
                />

                <div className="pb-2">
                    <StarRating rating={user.starRating} />
                </div>

            </div>

            <h3 className="mt-3">{user.name}</h3>

            <div className="mb-3 text-start">
                <label>Location</label>
                <input
                    className="form-control"
                    value={user.location}
                    disabled
                />
            </div>

            <div className="mb-3 text-start">
                <label>Age</label>
                <input
                    className="form-control"
                    value={user.age}
                    disabled
                />
            </div>

            <div className="mb-3 text-start">
                <label>Gender</label>
                <input
                    className="form-control"
                    value={user.gender}
                    disabled
                />
            </div>

            {/* ACTION BUTTONS */}
            <div className="d-flex justify-content-between mt-3">

                <button
                    className="btn btn-outline-danger w-45"
                    onClick={onReject}
                >
                    ❌
                </button>

                <button
                    className="btn btn-danger w-45"
                    onClick={onHeart}
                >
                    ❤️
                </button>

            </div>

        </div>
    );
}

export default Match;