// realtime/socketServer.js
// Real-time messaging using Socket.io
// Each match gets its own room: "match_{matchId}"

const { verifyToken } = require("../utils/jwtHelper");

module.exports = function initSocket(io) {

    // Authenticate every socket connection via JWT
    io.use((socket, next) => {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.replace("Bearer ", "");

        if (!token) return next(new Error("No token provided."));

        try {
            const decoded  = verifyToken(token);
            socket.userId  = decoded.id;
            next();
        } catch {
            next(new Error("Invalid token."));
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: user ${socket.userId}`);

        // ── Join a match room ──────────────────────────────────────────────
        socket.on("join_match", ({ match_id }) => {
            if (!match_id) return;
            socket.join(`match_${match_id}`);
            console.log(`User ${socket.userId} joined match room ${match_id}`);
        });

        // ── Leave a match room ─────────────────────────────────────────────
        socket.on("leave_match", ({ match_id }) => {
            if (!match_id) return;
            socket.leave(`match_${match_id}`);
        });

        // ── Send a message via socket ──────────────────────────────────────
        socket.on("send_message", async ({ match_id, content }) => {
            if (!match_id || !content?.trim()) return;

            try {
                const pool = require("../config/db");

                const matchCheck = await pool.query(
                    `SELECT user1_id, user2_id, match_status FROM matches WHERE match_id = $1`,
                    [match_id]
                );

                if (matchCheck.rows.length === 0) {
                    socket.emit("error", { message: "Match not found." });
                    return;
                }

                const match = matchCheck.rows[0];

                if (match.match_status !== "active") {
                    socket.emit("error", { message: "Match is not active." });
                    return;
                }

                if (match.user1_id !== socket.userId && match.user2_id !== socket.userId) {
                    socket.emit("error", { message: "You are not part of this match." });
                    return;
                }

                const result = await pool.query(
                    `INSERT INTO message (match_id, sender_id, content, sent_at)
                     VALUES ($1, $2, $3, NOW())
                     RETURNING message_id, match_id, sender_id, content, sent_at`,
                    [match_id, socket.userId, content.trim()]
                );

                // Broadcast to everyone in the match room
                io.to(`match_${match_id}`).emit("new_message", result.rows[0]);

            } catch (err) {
                console.error("socket send_message error:", err.message);
                socket.emit("error", { message: "Failed to send message." });
            }
        });

        // ── Typing indicators ──────────────────────────────────────────────
        socket.on("typing", ({ match_id }) => {
            socket.to(`match_${match_id}`).emit("user_typing", { user_id: socket.userId });
        });

        socket.on("stop_typing", ({ match_id }) => {
            socket.to(`match_${match_id}`).emit("user_stop_typing", { user_id: socket.userId });
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: user ${socket.userId}`);
        });
    });
};