function Navbar() {
    return (
        <nav className="navbar navbar-dark navbar-color px-4">

            <span className="navbar-brand mb-0 h1">
                ☰
            </span>

            <div className="d-flex gap-3 text-white">

                <i className="bi bi-bell"></i>
                <i className="bi bi-share"></i>
                <i className="bi bi-search"></i>
            </div>

        </nav>
    );
}

export default Navbar;
