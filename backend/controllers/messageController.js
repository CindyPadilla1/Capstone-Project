// messageController.js
// POST /messages/send        — send a message in a match
// GET  /messages/:matchId    — load message history for a chat

const pool         = require("../config/db");
const evaluate     = require("../safety/safetyEngine"); // Feature 3

// ─── POST /messages/send ───────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
    const sender_id = req.user.id;
    const { match_id, content } = req.body;

    if (!match_id || !content) {
        return res.status(400).json({ error: "match_id and content are required." });
    }
    if (!content.trim()) {
        return res.status(400).json({ error: "Message cannot be empty." });
    }

    try {
        const matchCheck = await pool.query(
            `SELECT match_id, match_status, user1_id, user2_id
             FROM matches WHERE match_id = $1`,
            [match_id]
        );

        if (matchCheck.rows.length === 0) {
            return res.status(404).json({ error: "Match not found." });
        }

        const match = matchCheck.rows[0];

        if (match.match_status !== "active") {
            return res.status(403).json({ error: "Cannot send messages in an inactive match." });
        }

        if (match.user1_id !== sender_id && match.user2_id !== sender_id) {
            return res.status(403).json({ error: "You are not part of this match." });
        }

        // ── Feature 3: Safety interception (pre-send) ─────────────────────
        const decision = await evaluate(match_id, sender_id, content.trim());

        if (decision.action === 'block') {
            return res.status(403).json({
                blocked:  true,
                reason:   decision.reason,
                cooldown: decision.cooldown
            });
        }

        const safetyPrompt = decision.action === 'prompt' ? decision.reason : null;
        // ──────────────────────────────────────────────────────────────────

        const result = await pool.query(
            `INSERT INTO message (match_id, sender_id, content, sent_at)
             VALUES ($1, $2, $3, NOW())
             RETURNING message_id, match_id, sender_id, content, sent_at`,
            [match_id, sender_id, content.trim()]
        );

        const savedMessage = result.rows[0];

        // Emit via socket if available
        const io = req.app.get("io");
        if (io) {
            io.to(`match_${match_id}`).emit("new_message", savedMessage);
        }

        res.status(201).json({
            message:       "Message sent.",
            safety_prompt: safetyPrompt, // null if normal, string if warning
            data:          savedMessage
        });
    } catch (err) {
        console.error("sendMessage error:", err.message);
        res.status(500).json({ error: "Failed to send message." });
    }
};

// ─── GET /messages/:matchId ────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
    const sender_id = req.user.id;
    const matchId   = parseInt(req.params.matchId);

    if (isNaN(matchId)) {
        return res.status(400).json({ error: "Invalid match ID." });
    }

    try {
        const matchCheck = await pool.query(
            `SELECT user1_id, user2_id FROM matches WHERE match_id = $1`,
            [matchId]
        );

        if (matchCheck.rows.length === 0) {
            return res.status(404).json({ error: "Match not found." });
        }

        const { user1_id, user2_id } = matchCheck.rows[0];
        if (user1_id !== sender_id && user2_id !== sender_id) {
            return res.status(403).json({ error: "You are not part of this match." });
        }

        const result = await pool.query(
            `SELECT message_id, match_id, sender_id, content, sent_at, read_at
             FROM message
             WHERE match_id = $1
             ORDER BY sent_at ASC
             LIMIT 50`,
            [matchId]
        );

        // Mark messages as read
        await pool.query(
            `UPDATE message SET read_at = NOW()
             WHERE match_id = $1 AND sender_id != $2 AND read_at IS NULL`,
            [matchId, sender_id]
        );

        res.json({ match_id: matchId, messages: result.rows });
    } catch (err) {
        console.error("getMessages error:", err.message);
        res.status(500).json({ error: "Failed to load messages." });
    }
};

// ─── POST /messages/date-request ──────────────────────────────────────────
exports.sendDateRequest = async (req, res) => {
    const sender_id = req.user.id;
    const { match_id, venue_type, proposed_datetime } = req.body;

    if (!match_id || !venue_type || !proposed_datetime) {
        return res.status(400).json({ error: "match_id, venue_type, and proposed_datetime are required." });
    }

    try {
        const scheduleResult = await pool.query(
            `INSERT INTO date_scheduling (match_id, proposed_datetime, venue_type, status, created_at)
             VALUES ($1, $2, $3, 'pending', NOW())
             RETURNING schedule_id`,
            [match_id, proposed_datetime, venue_type]
        );

        const schedule_id = scheduleResult.rows[0].schedule_id;

        const messageText = `📅 Date Request: How about ${venue_type} on ${proposed_datetime}?`;
        await pool.query(
            `INSERT INTO message (match_id, sender_id, content, sent_at)
             VALUES ($1, $2, $3, NOW())`,
            [match_id, sender_id, messageText]
        );

        res.status(201).json({ message: "Date request sent.", schedule_id });
    } catch (err) {
        console.error("sendDateRequest error:", err.message);
        res.status(500).json({ error: "Failed to send date request." });
    }
};