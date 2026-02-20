import Navbar from "../components/Navbar";

function DatePlanner() {
    return (
        <>
            <Navbar />

            <div className="container mt-3 text-center faded-background min-vh-100 min-vw-100">

                <h3>Date Options?</h3>

                <p className="text-muted">
                    Check out stores in your area.
                </p>

                <div className="map mb-5"
                    >
                    Map goes here
                </div>

                <div>
                    <p className="text-muted">
                        Availablity :
                    </p>
                </div>

                <div className="text-start ">
                    <div className="card p-2 mb-4">
                        📍 Restaurant Name
                    </div>

                    <div className="card p-2 mb-4">
                        📍 Movie Theater
                    </div>

                    <div className="card p-2 mb-2">
                        📍 Coffee Shop
                    </div>
                </div>
            </div>
        </>
    );
}

export default DatePlanner;
