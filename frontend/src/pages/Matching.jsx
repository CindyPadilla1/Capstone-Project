import Navbar from "../components/Navbar";
import Match from "../components/Match";
import { useEffect, useState, useCallback } from "react";

function Matching() {
    const [matches, setMatches] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // BACKEND DISABLED FOR SPRINT 1
        /*
        fetch("/api/matches")
          .then(res => res.json())
          .then(data => setMatches(data));
        */

        //mock data
        setMatches([
            {
                name: "Beatrice",
                location: "Chicago",
                age: 27,
                gender: "Female",
                starRating: 4,
                image: "https://picsum.photos/300"
            },
            {
                name: "Ariana",
                location: "New York",
                age: 24,
                gender: "Female",
                starRating: 5,
                image: "https://picsum.photos/301"
            },
            {
                name: "Sofia",
                location: "Los Angeles",
                age: 26,
                gender: "Female",
                starRating: 3,
                image: "https://picsum.photos/302"
            }
        ]);
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

        // BACKEND DISABLED
        /*
        fetch("/api/save-match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(likedUser)
        });
        */

        setCurrentIndex((prev) => Math.min(prev + 1, matches.length - 1));
    };

    const handleReject = () => {
        setCurrentIndex((prev) => Math.min(prev + 1, matches.length - 1));
    };

    if (matches.length === 0) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <Navbar />

            <div className="container d-flex flex-column justify-content-center align-items-center faded-background min-vh-100 min-vw-100">

                <p className="text-white small mb-2" style={{ opacity: 0.7 }}>
                    Scroll ↑ for next · Scroll ↓ for previous
                </p>

                <p className="text-white small mb-3" style={{ opacity: 0.7 }}>
                    {currentIndex + 1} / {matches.length}
                </p>

                <Match
                    user={matches[currentIndex]}
                    onHeart={handleHeart}
                    onReject={handleReject}
                />
            </div>
        </>
    );
}

export default Matching;
