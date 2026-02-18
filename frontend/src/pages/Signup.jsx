function Signup() {
    return (
        <div className="signin-page d-flex flex-column justify-content-center align-items-center min-vh-100">

            <div className="p-4 text-center">
                <h1 className="fs-3 text-white">Tell us your vibe.</h1>
                <h2 className="fs-6 text-white">Let us get to know you.</h2>
            </div>
            <div className="signin-card p-4 text-center">
                <form>
                    <div className="mb-3">
                        <p className="text-start">
                            First Name:
                            <input
                                type="firstName"
                                className="form-control custom-input bg-light"
                                placeholder="Beatrice"
                            />
                        </p>
                    </div>

                    <div className="mb-3">
                        <p className="text-start">
                            Last Name:
                            <input
                                type="lastName"
                                className="form-control custom-input bg-light"
                                placeholder="Almadani"
                            />
                        </p>
                    </div>

                    <div className="mb-3">
                        <p className="text-start">
                            Location:
                            <input
                                type="location"
                                className="form-control custom-input bg-light"
                                placeholder="Aurora, IL"
                            />
                        </p>
                    </div>

                    <div className="mb-3">
                        <p className="text-start">
                            Age:
                            <input
                                type="age"
                                className="form-control custom-input bg-light"
                                placeholder="18+"
                            />
                        </p>
                    </div>

                    <button className="submit-btn">
                        Next
                    </button>

                </form>
                <div className="mt-3 small">
                    <p>
                        <a href="/" className="text-dark">Back to Login</a>
                    </p>
                </div>

            </div>
        </div>
    );
}
export default Signup;