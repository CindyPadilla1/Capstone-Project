import Navbar from "../components/Navbar";
import Match from "../components/Match";
import { useEffect, useState, useCallback } from "react";

const API_BASE = "http://localhost:4000";
const DEMO_USER_ID = 1;

function MatchingTest() {
    const [matches, setMatches]           = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [likesLeft, setLikesLeft]       = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/matches/${DEMO_USER_ID}`)
            .then(res => {
                if (!res.ok) throw new Error(`Server returned ${res.status}`);
                return res.json();
            })
            .then(data => {
                setMatches(data.matches || []);
                setLikesLeft(data.likes_left ?? null);
                setLoading(false);
            })
            .catch(err => {
                setError("Could not reach backend: " + err.message);
                setLoading(false);
            });
    }, []);

    const handleWheel = useCallback((e) => {
        if (e.deltaY < 0) {
            setCurrentIndex((prev) => Math.min(prev + 1, matches.length - 1));
        } else {
            setCurrentIndex((prev) => Math.max(prev - 1, 0));
        }
    }, [matches.length]);

    useEffect(() => {
        window.addEventListener("wheel", handleWheel);
        return () => window.removeEventListener("wheel", handleWheel);
    }, [handleWheel]);

    const handleHeart = () => {
        const likedUser = matches[currentIndex];
        fetch(`${API_BASE}/matches/${DEMO_USER_ID}/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ liked_user_id: likedUser.user_id }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.likes_left !== undefined) setLikesLeft(data.likes_left);
            })
            .catch(err => console.error("Like failed:", err));
        setCurrentIndex((prev) => Math.min(prev + 1, matches.length - 1));
    };

    const handleReject = () => {
        setCurrentIndex((prev) => Math.min(prev + 1, matches.length - 1));
    };

    if (loading) return (
        <>
            <Navbar />
            <div className="container d-flex justify-content-center align-items-center faded-background min-vh-100 min-vw-100">
                <p className="text-white">Finding your matches…</p>
            </div>
        </>
    );

    if (error) return (
        <>
            <Navbar />
            <div className="container d-flex justify-content-center align-items-center faded-background min-vh-100 min-vw-100">
                <p className="text-white">{error}</p>
            </div>
        </>
    );

    if (matches.length === 0) return (
        <>
            <Navbar />
            <div className="container d-flex justify-content-center align-items-center faded-background min-vh-100 min-vw-100">
                <p className="text-white">No matches found.</p>
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="container d-flex flex-column justify-content-center align-items-center faded-background min-vh-100 min-vw-100">
                <p className="text-white small mb-2" style={{ opacity: 0.7 }}>
                    Scroll ↑ for next · Scroll ↓ for previous
                </p>
                <p className="text-white small mb-1" style={{ opacity: 0.7 }}>
                    {currentIndex + 1} / {matches.length}
                </p>
                {likesLeft !== null && (
                    <p className="text-white small mb-3" style={{ opacity: 0.7 }}>
                        ❤️ {likesLeft} like{likesLeft !== 1 ? "s" : ""} remaining today
                    </p>
                )}
                <Match
                    user={matches[currentIndex]}
                    onHeart={handleHeart}
                    onReject={handleReject}
                />
            </div>
        </>
    );
}

export default MatchingTest;
