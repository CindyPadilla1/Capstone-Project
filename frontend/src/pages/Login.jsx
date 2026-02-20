import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

        // Basic validation
        if (!email.includes("@")) {
            setError("Please enter a valid email.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setError("");

        //  Backend disabled for sprint
        // fetch("/api/login"...)

        navigate("/profile");
    };

    return (
        <div className="faded-background d-flex justify-content-center align-items-center min-vh-100">

            <div className="login-card p-4 text-center">
                <h1 className="aura-logo">Aura</h1>
                <h2 className="mb-4 fs-2">Login</h2>

                <form onSubmit={handleLogin}>

                    <div className="mb-3">
                        <input
                            type="email"
                            className="form-control custom-input"
                            placeholder="✉ Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control custom-input"
                            placeholder="🔒 Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-danger small mb-3">
                            {error}
                        </p>
                    )}

                    <button type="submit" className="submit-btn">
                        Lets Go →
                    </button>

                </form>

                <div className="mt-3 small">
                    <p className="mb-1 text-decoration-underline">
                        Forgot Password?
                    </p>

                    <p>
                        Don’t have account?{" "}
                        <a href="/signup" className="text-dark fw-bold">
                            Sign Up
                        </a>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Login;
