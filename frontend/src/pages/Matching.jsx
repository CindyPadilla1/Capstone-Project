import Navbar from "../components/Navbar";
import StarRating from "../components/StarRating";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const API = "http://localhost:4000";

function Pill({ label }) {
    if (!label) return null;
    return <span className="match-pill">{label}</span>;
}

function InfoRow({ icon, text }) {
    if (!text) return null;
    return (
        <div className="match-info-row">
            <span style={{ flexShrink: 0, width: "20px" }}>{icon}</span>
            <span>{text}</span>
        </div>
    );
}

function MatchCard({ user, onHeart, onReject, likesLeft }) {
    const [animating, setAnimating] = useState(null);
    const outOfLikes = likesLeft !== null && likesLeft <= 0;

    const fire = (dir, cb) => {
        setAnimating(dir);
        setTimeout(() => { setAnimating(null); cb(); }, 350);
    };

    const cardClass = [
        "match-card",
        animating === "heart"  ? "animating-heart"  : "",
        animating === "reject" ? "animating-reject" : "",
    ].join(" ").trim();

    return (
        <div className={cardClass}>

            {/* Photo */}
            <div style={{ position: "relative" }}>
                <img src={user.image} alt={user.name}
                     style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
                <div className="match-card-gradient" />
                <div className="match-card-identity">
                    <div className="match-card-identity-name">
                        {user.name}{user.age ? `, ${user.age}` : ""}
                    </div>
                    {user.location && (
                        <div className="match-card-identity-location">📍 {user.location}</div>
                    )}
                </div>
                <div className="match-card-stars">
                    <StarRating rating={user.starRating} />
                </div>
            </div>

            {/* Info */}
            <div style={{ padding: "14px 16px 8px" }}>
                <div className="d-flex flex-wrap gap-2 mb-3">
                    <Pill label={user.gender} />
                    {user.age && <Pill label={`${user.age} yrs`} />}
                    {user.height && <Pill label={user.height} />}
                    {user.personality_name && <Pill label={user.personality_name} />}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 12px", marginBottom: "10px" }}>
                    <InfoRow icon="🎯" text={user.dating_goals_name} />
                    <InfoRow icon="🙏" text={user.religion_name} />
                    <InfoRow icon="⚡" text={user.activity_name && `Activity: ${user.activity_name}`} />
                    <InfoRow icon="👶" text={user.children_name} />
                    <InfoRow icon="🗳️" text={user.political_name} />
                    <InfoRow icon="🎵" text={user.music_name} />
                    <InfoRow icon="🚬" text={user.smoking_name && `Smoking: ${user.smoking_name}`} />
                    <InfoRow icon="🍷" text={user.drinking_name && `Drinking: ${user.drinking_name}`} />
                    <InfoRow icon="🥗" text={user.diet_name} />
                    <InfoRow icon="👨‍👩‍👧" text={user.family_oriented_name && `Family: ${user.family_oriented_name}`} />
                    <InfoRow icon="🎓" text={user.education_name} />
                </div>

                {user.bio && <div className="match-bio">"{user.bio}"</div>}

                {user.score !== undefined && (
                    <div className="match-score">Match score: {user.score}</div>
                )}
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-center gap-5 pb-4 pt-2">
                <button
                    className="match-action-btn-reject"
                    onClick={() => fire("reject", onReject)}
                >✕</button>

                <button
                    className="match-action-btn-heart"
                    onClick={() => { if (!outOfLikes) fire("heart", onHeart); }}
                    disabled={outOfLikes}
                    title={outOfLikes ? "Daily like limit reached" : "Like"}
                >❤️</button>
            </div>
        </div>
    );
}

function MatchedPortal({ matchedUsers, onOpenChat }) {
    if (!matchedUsers || matchedUsers.length === 0) return null;
    return (
        <div className="liked-portal mt-4 p-3">
            <p className="text-white fw-bold mb-3">
                🎉 Matches — {matchedUsers.length} {matchedUsers.length === 1 ? "match" : "matches"}
            </p>
            {matchedUsers.map((u, i) => (
                <div key={i}
                     className="liked-portal-row d-flex align-items-center gap-3 p-2 mb-2 rounded"
                     onClick={() => onOpenChat(u)}
                     style={{ cursor: "pointer", background: "rgba(255,255,255,0.92)" }}
                >
                    <img src={u.image} alt={u.name} className="rounded-circle"
                         style={{ width: "44px", height: "44px", objectFit: "cover", border: "2px solid #c94b5b" }} />
                    <div className="flex-grow-1">
                        <div className="fw-bold small">{u.name}</div>
                        <div className="text-muted" style={{ fontSize: "12px" }}>
                            {[u.location, u.age && `${u.age} yrs`, u.gender].filter(Boolean).join(" · ")}
                        </div>
                    </div>
                    <span className="liked-portal-badge">Message →</span>
                </div>
            ))}
        </div>
    );
}

export default function Matching() {
    const {
        matches, setMatches, matchesLoading, matchesError,
        currentUser, token,
        matchedUsers, addMatchedUser,
        rejectUser,
    } = useUser();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [likesLeft, setLikesLeft]       = useState(null);
    const [showItsMatch, setShowItsMatch] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { if (!currentUser) navigate("/"); }, [currentUser, navigate]);
    useEffect(() => { setCurrentIndex(0); }, [matches]);

    const handleHeart = async () => {
        const liked = matches[currentIndex];
        if (!liked || !currentUser) return;

        setMatches(prev => prev.filter(m => m.user_id !== liked.user_id));

        try {
            const res = await fetch(`${API}/matches/${currentUser.user_id}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ liked_user_id: liked.user_id }),
            });
            const data = await res.json();

            if (res.status === 409) return;

            if (data.likes_left !== undefined) setLikesLeft(data.likes_left);

            if (data.match_created) {
                addMatchedUser(liked);
                setShowItsMatch(true);
                setTimeout(() => setShowItsMatch(false), 2000);
            }
        } catch (err) {
            console.error("Like failed:", err);
        }
    };

    const handleReject = () => {
        const rejected = matches[currentIndex];
        if (!rejected) return;
        rejectUser(rejected.user_id);
        setMatches(prev => prev.filter(m => m.user_id !== rejected.user_id));
    };

    const handleOpenChat = (user) => navigate("/chat", { state: { selectedMatch: user } });
    const allSwiped = currentIndex >= (matches?.length ?? 0);

    if (matchesLoading) return (
        <><Navbar />
            <div className="faded-background d-flex justify-content-center align-items-center min-vh-100 min-vw-100">
                <p className="text-white">Finding your matches...</p>
            </div></>
    );

    if (matchesError) return (
        <><Navbar />
            <div className="faded-background d-flex justify-content-center align-items-center min-vh-100 min-vw-100">
                <p className="text-danger">{matchesError}</p>
            </div></>
    );

    return (
        <>
            <Navbar />

            {showItsMatch && (
                <div className="its-a-match-overlay d-flex flex-column align-items-center justify-content-center">
                    <div style={{ fontSize: "56px" }}>❤️</div>
                    <h2 className="text-white fw-bold mt-3">It's a match!</h2>
                </div>
            )}

            <div className="faded-background min-vh-100 min-vw-100 d-flex flex-column align-items-center pt-4 pb-5">

                {!allSwiped && matches.length > 0 && (
                    <p className="text-white small mb-3" style={{ opacity: 0.7 }}>
                        {currentIndex + 1} / {matches.length}
                        {likesLeft !== null && (
                            <span className="ms-3">
                                ❤️ {likesLeft} like{likesLeft !== 1 ? "s" : ""} left today
                            </span>
                        )}
                    </p>
                )}

                {allSwiped || matches.length === 0 ? (
                    <div className="text-center text-white p-5">
                        <div style={{ fontSize: "48px" }}>
                            {matches.length === 0 ? "🔍" : "✨"}
                        </div>
                        <h5 className="mt-3">
                            {matches.length === 0 ? "No matches found yet" : "You've seen everyone!"}
                        </h5>
                        <p className="small opacity-75">
                            {matches.length === 0
                                ? "Complete your profile to get better matches."
                                : "Check back tomorrow for new matches."}
                        </p>
                    </div>
                ) : (
                    <MatchCard
                        user={matches[currentIndex]}
                        onHeart={handleHeart}
                        onReject={handleReject}
                        likesLeft={likesLeft}
                    />
                )}

                <MatchedPortal matchedUsers={matchedUsers} onOpenChat={handleOpenChat} />
            </div>
        </>
    );
}