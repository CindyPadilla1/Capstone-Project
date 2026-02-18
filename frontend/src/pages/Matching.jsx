function Matching() {
    return (
        <div className="container mt-5">

            <h2 className="text-center mb-4">Your Matches</h2>

            <div className="card mx-auto shadow" style={{ width: "18rem" }}>
                <img
                    src="https://via.placeholder.com/300"
                    className="card-img-top"
                    alt="profile"
                />

                <div className="card-body text-center">
                    <h5 className="card-title">Yoma, 28</h5>

                    <p className="card-text">
                        Loves hiking • Dogs • Movies
                    </p>

                    <button className="btn btn-success me-2">
                        Like
                    </button>

                    <button className="btn btn-secondary">
                        Pass
                    </button>
                </div>
            </div>

        </div>
    );
}

export default Matching;
