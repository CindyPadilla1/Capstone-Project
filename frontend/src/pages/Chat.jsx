import { useState } from "react";
import Navbar from "../components/Navbar";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";

function Chat() {
    const [selectedMatch, setSelectedMatch] = useState(null);

    // MOCK DATA — replace with context or API later
    // These would come from the matches the user hearted in Matching.jsx
    const [likedMatches] = useState([
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

    return (
        <>
            <Navbar />
            <div className="container d-flex justify-content-center align-items-start faded-background min-vh-100 min-vw-100 pt-4">
                <div className="login-card p-4 mb-4" style={{ width: "90%", maxWidth: "500px" }}>
                    {selectedMatch ? (
                        <ChatWindow
                            match={selectedMatch}
                            onBack={() => setSelectedMatch(null)}
                        />
                    ) : (
                        <ChatList
                            matches={likedMatches}
                            onSelect={(match) => setSelectedMatch(match)}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default Chat;