function Login() {
    return (
        <div className="login-page d-flex justify-content-center align-items-center min-vh-100">

            <div className="login-card p-4 text-center">
                <h1 className="aura-logo">Aura</h1>
                <h2 className="mb-4 fs-2">Login</h2>

                <form>
                    <div className="mb-3">
                        <input
                            type="email"
                            className="form-control custom-input"
                            placeholder="✉ Email"
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control custom-input"
                            placeholder="🔒 Password"
                        />
                    </div>

                    <button className="submit-btn text-end">
                        →
                    </button>

                </form>
                <div className="mt-3 small">
                    <p className="mb-1 text-decoration-underline">
                        Forgot Password?
                    </p>

                    <p>
                        Don’t have account?{" "}
                        <a href="/signup" className="text-dark fw-bold">Sign Up</a>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Login;
