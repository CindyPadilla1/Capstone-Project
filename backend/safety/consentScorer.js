// safety/consentScorer.js
// Updates the consent proxy score based on message reciprocity patterns.
//
// Consent proxy is a soft 0.0–1.0 estimate of mutual engagement.
// It is NOT a consent determination — only used to adjust risk sensitivity.
//
// Increases when: alternating replies, balanced initiation
// Decreases when: one-sided messaging, unanswered messages, after refusals

module.exports = function updateConsentProxy(currentScore, messages, senderId) {
    let score = parseFloat(currentScore);

    if (messages.length < 2) return score;

    const last = messages[messages.length - 1];
    const prev = messages[messages.length - 2];

    // Alternating replies = mutual engagement → increase
    if (last && prev && last.sender_id !== prev.sender_id) {
        score = Math.min(1.0, score + 0.05);
    } else {
        score = Math.max(0.0, score - 0.05);
    }

    // Last 3 all from same sender = one-sided pressure → decrease more
    const lastThree = messages.slice(-3);
    if (lastThree.length === 3 && lastThree.every(m => m.sender_id === senderId)) {
        score = Math.max(0.0, score - 0.10);
    }

    return parseFloat(score.toFixed(2));
};