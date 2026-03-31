// safety/safetyEngine.js
// Feature 3: Adaptive Conversation Safety & Consent Engine — Backend Enforcement
//
// This is the main entry point. Called BEFORE every message insert.
// Orchestrates: classifier → escalationTracker → consentScorer →
//               transitionValidator → stateDetector → decision
//
// Returns: { action: 'deliver' | 'prompt' | 'block', reason, cooldown }
//
// Blocked messages are never inserted into the DB and never reach the recipient.

const pool               = require('../config/db');
const classifyMessage    = require('./classifier');
const computeEscalation  = require('./escalationTracker');
const updateConsentProxy = require('./consentScorer');
const isValidTransition  = require('./transitionValidator');
const computeNextState   = require('./stateDetector');

// ─── LOAD OR INITIALIZE SAFETY STATE ─────────────────────────────────────
async function getOrCreateState(match_id) {
    const existing = await pool.query(
        'SELECT * FROM conversation_safety_state WHERE match_id = $1',
        [match_id]
    );
    if (existing.rows.length > 0) return existing.rows[0];

    const created = await pool.query(
        `INSERT INTO conversation_safety_state
            (match_id, current_state, consent_proxy_score,
             unanswered_count, repeat_request_count, resistance_count,
             escalation_level, last_updated)
         VALUES ($1, 'S0', 0.50, 0, 0, 0, 'normal', NOW())
         RETURNING *`,
        [match_id]
    );
    return created.rows[0];
}

// ─── LOAD RECENT MESSAGE HISTORY ─────────────────────────────────────────
async function getRecentMessages(match_id, limit = 10) {
    const result = await pool.query(
        `SELECT sender_id, content, sent_at
         FROM message
         WHERE match_id = $1
         ORDER BY sent_at DESC
         LIMIT $2`,
        [match_id, limit]
    );
    return result.rows.reverse(); // oldest first
}

// ─── SAVE UPDATED STATE ───────────────────────────────────────────────────
async function saveState(match_id, s) {
    await pool.query(
        `UPDATE conversation_safety_state SET
            current_state        = $1,
            consent_proxy_score  = $2,
            unanswered_count     = $3,
            repeat_request_count = $4,
            resistance_count     = $5,
            escalation_level     = $6,
            last_updated         = NOW()
         WHERE match_id = $7`,
        [
            s.current_state,
            s.consent_proxy_score,
            s.unanswered_count,
            s.repeat_request_count,
            s.resistance_count,
            s.escalation_level,
            match_id
        ]
    );
}

// ─── MAIN EVALUATE FUNCTION ───────────────────────────────────────────────
module.exports = async function evaluate(match_id, sender_id, content) {
    const state    = await getOrCreateState(match_id);
    const messages = await getRecentMessages(match_id);

    const { messageLevel, isResistance } = classifyMessage(content);
    const currentState = state.current_state;

    // Step 1 — Update escalation counters
    const escalation = computeEscalation(state, isResistance, sender_id, messages);

    // Step 2 — Update consent proxy
    const newConsent = updateConsentProxy(state.consent_proxy_score, messages, sender_id);

    // Step 3 — Resistance detected → block immediately + drop consent score
    if (isResistance) {
        await saveState(match_id, {
            ...state,
            ...escalation,
            current_state:       currentState,
            consent_proxy_score: Math.max(0, newConsent - 0.15)
        });
        return {
            action:   'block',
            reason:   'Message blocked: a refusal or resistance was detected in this conversation.',
            cooldown: true
        };
    }

    // Step 4 — Restrict escalation → block
    if (escalation.escalation_level === 'restrict') {
        await saveState(match_id, {
            ...state,
            ...escalation,
            current_state:       currentState,
            consent_proxy_score: newConsent
        });
        return {
            action:   'block',
            reason:   'Message blocked: conversation is restricted due to repeated unanswered messages or pressure.',
            cooldown: true
        };
    }

    // Step 5 — Validate state transition
    const transitionOk = isValidTransition(currentState, messageLevel, {
        ...state,
        consent_proxy_score: newConsent
    });

    if (!transitionOk) {
        await saveState(match_id, {
            ...state,
            ...escalation,
            current_state:       currentState,
            consent_proxy_score: newConsent
        });
        return {
            action:   'block',
            reason:   'Message blocked: this type of content is not appropriate yet for this conversation.',
            cooldown: false
        };
    }

    // Step 6 — Compute next state
    const nextState = computeNextState(currentState, messageLevel, messages);

    // Step 7 — Warning level → deliver but include a safety prompt
    if (escalation.escalation_level === 'warning') {
        await saveState(match_id, {
            current_state:       nextState,
            consent_proxy_score: newConsent,
            ...escalation
        });
        return {
            action:   'prompt',
            reason:   'Heads up: the other person may need more space. Be mindful of their responses.',
            cooldown: false
        };
    }

    // Step 8 — All clear → deliver
    await saveState(match_id, {
        current_state:       nextState,
        consent_proxy_score: newConsent,
        ...escalation
    });

    return { action: 'deliver', reason: null, cooldown: false };
};