function Sidebar({ isOpen, toggle }) {
    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <button className="close-btn" onClick={toggle}>
                ×
            </button>

            <ul className="list-unstyled mt-4">

                <li><a href="/profile">Profile</a></li>
                <li><a href="/matching">Matching</a></li>
                <li><a href="/dates">Date Planner</a></li>
                <li><a href="/chat">Messages</a></li>
                <li><a href="/">Logout</a></li>

            </ul>
        </div>
    );
}

export default Sidebar;