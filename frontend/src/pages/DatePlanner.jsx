import Navbar from "../components/Navbar";

function DatePlanner() {
    return (
        <>
            <Navbar />

            <div className="container mt-3 text-center faded-background">

                <h3>Date Options?</h3>

                <p className="text-muted">
                    Check out stores in your area.
                </p>

                {/* Map Placeholder */}
                <div
                    style={{
                        height: "250px",
                        background: "#e0b4b4",
                        border: "3px solid purple",
                        borderRadius: "10px"
                    }}
                    className="mb-4"
                    >
                    Map goes here
                </div>

                <div className="text-start">
                    <div className="card p-2 mb-2">
                        📍 Restaurant Name
                    </div>

                    <div className="card p-2 mb-2">
                        📍 Movie Theater
                    </div>

                    <div className="card p-2">
                        📍 Coffee Shop
                    </div>
                </div>
            </div>
        </>
    );
}

export default DatePlanner;
