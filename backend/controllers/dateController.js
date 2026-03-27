// controllers/dateController.js
// Handles date requests, responses, and post-date survey triggering.

const pool = require("../config/db");

exports.sendDateRequest = async (req, res) => {
    const { match_id, sender_id, venue_type, venue_name, proposed_datetime } = req.body;

    if (!match_id || !sender_id || !venue_type || !proposed_datetime) {
        return res.status(400).json({ error: "match_id, sender_id, venue_type, and proposed_datetime are required." });
    }

    try {
        const matchResult = await pool.query(
            `SELECT user1_id, user2_id FROM matches WHERE match_id = $1 AND match_status = 'active'`,
            [match_id]
        );
        if (matchResult.rows.length === 0) {
            return res.status(404).json({ error: "Match not found or inactive." });
        }

        const { user1_id, user2_id } = matchResult.rows[0];
        const recipient_id = user1_id === sender_id ? user2_id : user1_id;

        const scheduleResult = await pool.query(
            `INSERT INTO date_scheduling (match_id, proposed_datetime, venue_type, venue_name, status, created_at)
             VALUES ($1, $2, $3, $4, 'pending', NOW())
             RETURNING schedule_id`,
            [match_id, proposed_datetime, venue_type, venue_name || null]
        );
        const schedule_id = scheduleResult.rows[0].schedule_id;

        await pool.query(
            `INSERT INTO message (match_id, sender_id, content, sent_at)
             VALUES ($1, $2, $3, NOW())`,
            [match_id, sender_id, `📅 Date Request: How about ${venue_name || venue_type} on ${new Date(proposed_datetime).toLocaleString()}?`]
        );

        await pool.query(
            `INSERT INTO notifications (user_id, type, payload, is_read, created_at)
             VALUES ($1, 'date_request', $2, false, NOW())`,
            [recipient_id, JSON.stringify({ schedule_id, sender_id, venue_name, proposed_datetime, match_id })]
        );

        res.status(201).json({ message: "Date request sent.", schedule_id });
    } catch (err) {
        console.error("sendDateRequest error:", err.message);
        res.status(500).json({ error: "Failed to send date request." });
    }
};

exports.respondToDate = async (req, res) => {
    const { scheduleId } = req.params;
    const { response, user_id } = req.body;

    if (!["approved", "rejected"].includes(response)) {
        return res.status(400).json({ error: "Response must be 'approved' or 'rejected'." });
    }

    try {
        const result = await pool.query(
            `UPDATE date_scheduling SET status = $1 WHERE schedule_id = $2
             RETURNING match_id, proposed_datetime, venue_name`,
            [response, scheduleId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Date not found." });
        }

        const { match_id, proposed_datetime, venue_name } = result.rows[0];

        await pool.query(
            `UPDATE notifications SET is_read = true
             WHERE payload->>'schedule_id' = $1`,
            [scheduleId.toString()]
        );

        if (response === "approved") {
            const matchResult = await pool.query(
                `SELECT user1_id, user2_id FROM matches WHERE match_id = $1`,
                [match_id]
            );
            const { user1_id, user2_id } = matchResult.rows[0];

            await pool.query(
                `INSERT INTO notifications (user_id, type, payload, is_read, created_at)
                 VALUES ($1, 'date_accepted', $2, false, NOW())`,
                [user_id === user1_id ? user2_id : user1_id,
                    JSON.stringify({ schedule_id: scheduleId, venue_name, proposed_datetime })]
            );

            await pool.query(
                `INSERT INTO survey_trigger (schedule_id, user1_id, user2_id, trigger_at, sent, created_at)
                 VALUES ($1, $2, $3, $4::timestamptz, false, NOW())
                 ON CONFLICT (schedule_id) DO NOTHING`,
                [scheduleId, user1_id, user2_id, proposed_datetime]
            );
        }

        res.json({ message: `Date ${response}.` });
    } catch (err) {
        console.error("respondToDate error:", err.message);
        res.status(500).json({ error: "Failed to respond to date." });
    }
};

exports.getNotifications = async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
        const result = await pool.query(
            `SELECT notification_id, type, payload, is_read, created_at
             FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 20`,
            [userId]
        );

        const notifications = result.rows.map(n => ({
            ...n,
            payload: typeof n.payload === "string" ? JSON.parse(n.payload) : n.payload,
        }));

        res.json({ notifications });
    } catch (err) {
        console.error("getNotifications error:", err.message);
        res.status(500).json({ error: "Failed to fetch notifications." });
    }
};

exports.checkAndSendSurveys = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT st.*, ds.proposed_datetime, ds.venue_name
             FROM survey_trigger st
             JOIN date_scheduling ds ON ds.schedule_id = st.schedule_id
             WHERE st.sent = false
               AND st.trigger_at <= NOW()`
        );

        for (const trigger of result.rows) {
            const surveyPayload = JSON.stringify({
                schedule_id: trigger.schedule_id,
                venue_name:  trigger.venue_name,
            });

            await pool.query(
                `INSERT INTO notifications (user_id, type, payload, is_read, created_at)
                 VALUES ($1, 'post_date_survey', $2, false, NOW()),
                        ($3, 'post_date_survey', $2, false, NOW())`,
                [trigger.user1_id, surveyPayload, trigger.user2_id]
            );

            await pool.query(
                `UPDATE survey_trigger SET sent = true WHERE schedule_id = $1`,
                [trigger.schedule_id]
            );
        }

        res.json({ triggered: result.rows.length });
    } catch (err) {
        console.error("checkAndSendSurveys error:", err.message);
        res.status(500).json({ error: "Survey check failed." });
    }
};