// safety/transitionValidator.js
// Validates whether a message-level transition is allowed
// given the current conversation state, consent proxy, and escalation.
//
// Valid transitions per spec:
//   S0 → S1: both users have initiated and replied
//   S1 → S2: >= 3 alternating exchanges
//   S2 → S3: no resistance in last 5 msgs, consent proxy >= 0.6, escalation = normal
//
// Invalid transitions always blocked:
//   S0 → S2 or S3
//   S1 → S3 (skipping S2)
//   Any → S3 when consent proxy < 0.4
//   Any → S3 after refusal

module.exports = function isValidTransition(currentState, messageLevel, state) {
    const { consent_proxy_score, resistance_count, escalation_level } = state;
    const consent = parseFloat(consent_proxy_score);

    // S3-level content — strictest rules
    if (messageLevel === 3) {
        // Must be in S2 to attempt S3 content
        if (currentState === 'S0' || currentState === 'S1') return false;
        // Hard block if consent is very low
        if (consent < 0.4) return false;
        if (currentState === 'S2') {
            if (consent < 0.6)             return false;
            if (resistance_count > 0)      return false;
            if (escalation_level !== 'normal') return false;
        }
    }

    // S2-level content not allowed in S0
    if (messageLevel === 2 && currentState === 'S0') return false;

    return true;
};