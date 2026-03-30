// safety/stateDetector.js
// Computes the next conversation state based on current state,
// message level, and recent message history.
//
// States: S0 (Intro) → S1 (Flirting) → S2 (Personal) → S3 (Intimate)
// Transitions only advance — never go backward automatically.

module.exports = function computeNextState(currentState, messageLevel, messages) {
    // Count alternating exchanges (sender switches)
    let alternating = 0;
    for (let i = 1; i < messages.length; i++) {
        if (messages[i].sender_id !== messages[i - 1].sender_id) alternating++;
    }

    // Unique senders in history
    const senders = new Set(messages.map(m => m.sender_id));

    // S0 → S1: both users have sent at least 1 message + S1-level content
    if (currentState === 'S0' && messageLevel >= 1 && senders.size >= 2) {
        return 'S1';
    }

    // S1 → S2: 3+ alternating exchanges + S2-level content
    if (currentState === 'S1' && messageLevel >= 2 && alternating >= 3) {
        return 'S2';
    }

    // S2 → S3: transition validator already confirmed this is safe
    if (currentState === 'S2' && messageLevel === 3) {
        return 'S3';
    }

    // Stay in current state
    return currentState;
};