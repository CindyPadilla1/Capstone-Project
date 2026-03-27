import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const API = "http://localhost:4000";

function Navbar() {
    const [open, setOpen]                   = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs]       = useState(false);
    const notifRef                          = useRef(null);
    const { currentUser, token }            = useUser();
    const navigate                          = useNavigate();
    const toggle = () => setOpen(!open);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => {
        if (!currentUser || !token) return;

        const fetchNotifications = async () => {
            try {
                const res = await fetch(`${API}/dates/notifications/${currentUser.user_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const data = await res.json();
                setNotifications(data.notifications || []);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [currentUser, token]);

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleNotifClick = async (notif) => {
        setNotifications(prev =>
            prev.map(n => n.notification_id === notif.notification_id ? { ...n, is_read: true } : n)
        );

        if (notif.type === "date_request") {
            navigate("/dates/respond", { state: { notification: notif } });
        } else if (notif.type === "date_accepted") {
            navigate("/chat");
        } else if (notif.type === "post_date_survey") {
            navigate("/post-date-survey", {
                state: { schedule_id: notif.payload?.schedule_id }
            });
        }

        setShowNotifs(false);
    };

    const notifLabel = (notif) => {
        if (notif.type === "date_request") {
            return `📅 Date request at ${notif.payload?.venue_name || "a venue"}`;
        }
        if (notif.type === "date_accepted") {
            return `✅ Your date was accepted!`;
        }
        if (notif.type === "post_date_survey") {
            return `📝 How did your date go? Fill out your survey.`;
        }
        return "New notification";
    };

    return (
        <>
            <nav className="navbar navbar-dark navbar-color px-4" style={{ position: "relative", zIndex: 1100 }}>
                <span className="navbar-brand" onClick={toggle} style={{ cursor: "pointer" }}>☰</span>

                <div className="d-flex gap-3 text-white align-items-center">

                    {/* Notification bell */}
                    <div ref={notifRef} style={{ position: "relative" }}>
                        <i
                            className="bi bi-bell"
                            style={{ cursor: "pointer", fontSize: "1.1rem" }}
                            onClick={() => setShowNotifs(!showNotifs)}
                        />
                        {unreadCount > 0 && (
                            <span style={{
                                position: "absolute", top: "-6px", right: "-8px",
                                background: "#ff3b30", color: "white",
                                borderRadius: "50%", fontSize: "10px",
                                width: "16px", height: "16px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 700,
                            }}>
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}

                        {/* Dropdown panel */}
                        {showNotifs && (
                            <div style={{
                                position: "absolute", top: "30px", right: 0,
                                background: "white", borderRadius: "12px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                                minWidth: "280px", maxHeight: "320px",
                                overflowY: "auto", zIndex: 2000,
                            }}>
                                {notifications.length === 0 ? (
                                    <div className="p-3 text-muted small text-center">
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div
                                            key={notif.notification_id}
                                            onClick={() => handleNotifClick(notif)}
                                            style={{
                                                padding: "12px 16px",
                                                borderBottom: "1px solid #f0f0f0",
                                                cursor: "pointer",
                                                background: notif.is_read ? "white" : "#fff5f5",
                                                fontSize: "13px",
                                            }}
                                        >
                                            <div style={{ fontWeight: notif.is_read ? 400 : 700 }}>
                                                {notifLabel(notif)}
                                            </div>
                                            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "3px" }}>
                                                {new Date(notif.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <i className="bi bi-share" style={{ cursor: "pointer" }} />
                    <i className="bi bi-search" style={{ cursor: "pointer" }} />
                </div>
            </nav>

            {/* Sidebar */}
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