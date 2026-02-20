import Navbar from "../components/Navbar";
import Match from "../components/Match";
import { useEffect, useState } from "react";

function Matching() {

    const [matches, setMatches] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {

        //  BACKEND DISABLED FOR SPRINT 1
        /*
        fetch("/api/matches")
          .then(res => res.json())
          .then(data => setMatches(data));
        */

        //  MOCK DATA FOR PRESENTATION
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
            }
        ]);

    }, []);

    const handleHeart = () => {

        const likedUser = matches[currentIndex];

        fetch("/api/save-match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(likedUser)
        });

        nextMatch();
    };

    const handleReject = () => {
        nextMatch();
    };

    const nextMatch = () => {
        setCurrentIndex(prev => prev + 1);
    };

    if (matches.length === 0) {
        return <p>Loading...</p>;
    }

    if (currentIndex >= matches.length) {
        return <p>No more matches</p>;
    }

    return (
        <>
            <Navbar />

            <div className="container d-flex justify-content-center align-items-center faded-background min-vh-100;">

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
