import { useState } from "react";

function Navbar() {
    const [open, setOpen] = useState(false);
    const toggle = () => setOpen(!open);

    return (
        <>
            <nav className="navbar navbar-dark navbar-color px-4">
                <span className="navbar-brand" onClick={toggle} style={{ cursor: "pointer" }}>☰</span>
                <div className="d-flex gap-3 text-white">
                    <i className="bi bi-bell"></i>
                    <i className="bi bi-share"></i>
                    <i className="bi bi-search"></i>
                </div>
            </nav>

            <div className={`sidebar ${open ? "open" : ""}`}>
                <button className="close-btn" onClick={toggle}>×</button>
                <ul className="list-unstyled mt-4">
                    <li><a href="/profile">Profile</a></li>
                    <li><a href="/matching">Matching</a></li>
                    <li><a href="/dates">Date Planner</a></li>
                    <li><a href="/chat">Messages</a></li>
                    <li><a href="/">Logout</a></li>
                </ul>
            </div>
        </>
    );
}

export default Navbar;