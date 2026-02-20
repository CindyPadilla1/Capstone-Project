import { useState } from "react";
import Sidebar from "./Sidebar";

function Navbar() {
    const [open, setOpen] = useState(false);

    const toggleSidebar = () => {
        setOpen(!open);
    };
    return (
        <>
            <nav className="navbar navbar-dark navbar-color px-4">
                <span
                    className="navbar-brand"
                    onClick={toggleSidebar}
                    style={{ cursor: "pointer" }}
                >
                  ☰
                </span>

                <div className="d-flex gap-3 text-white">
                    <i className="bi bi-bell"></i>
                    <i className="bi bi-share"></i>
                    <i className="bi bi-search"></i>
                </div>
            </nav>
            <Sidebar isOpen={open} toggle={toggleSidebar} />
        </>
    );
}

export default Navbar;