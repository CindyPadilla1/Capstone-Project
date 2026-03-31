// safety/escalationTracker.js
// Tracks behavioral escalation counters and computes escalation level.
//
// Counters:
//   unanswered_count    — consecutive messages without reply from other person
//   repeat_request_count — repeated requests (incremented externally if needed)
//   resistance_count    — detected refusals or resistance
//
// Escalation levels:
//   normal  — no counters active, healthy interaction
//   warning — unanswered >= 2 OR repeat >= 1, possible pressure
//   restrict — resistance detected OR unanswered >= 3, boundary violation

module.exports = function computeEscalation(state, isResistance, senderId, messages) {
    let { unanswered_count, repeat_request_count, resistance_count } = state;

    // Increment resistance counter if refusal detected
    if (isResistance) resistance_count += 1;

    // Unanswered: last 2 messages both from same sender = other person not replying
    const lastTwo = messages.slice(-2);
    if (lastTwo.length === 2 && lastTwo.every(m => m.sender_id === senderId)) {
        unanswered_count += 1;
    } else {
        unanswered_count = 0; // reset when other person replies
    }

    // Compute escalation level
    let escalation_level = 'normal';
    if (resistance_count > 0 || unanswered_count >= 3) {
        escalation_level = 'restrict';
    } else if (unanswered_count >= 2 || repeat_request_count >= 1) {
        escalation_level = 'warning';
    }

    return { unanswered_count, repeat_request_count, resistance_count, escalation_level };
};