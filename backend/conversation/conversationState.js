const STATE = {
    INTRODUCTORY: 0,
    FLIRTING: 1,
    PERSONAL: 2,
    INTIMATE: 3
};
const store = new Map();
function normalizeMatchId(matchId) {
    const n = parseInt(String(matchId), 10);
    return Number.isNaN(n) ? null : n;
}
function buildDefaultConversation(matchId) {
    return {
        matchId,
        state: STATE.INTRODUCTORY,
        consentScore: 0.50,
        messageCounts: {},
        initiators:new Set(),
        alternatingCount: 0,
        lastSenderId:null,
        unansweredCount: 0,
        repeatRequestCount: 0,
        resistanceCount: 0,
        resistanceWindow: [],
        cooldownUntil: null,
        cooldownSenderId: null,
        totalMessages: 0,
        boundarySetByUserId: null,
        lastMessageAtByUser: {},
        lastRequestStemByUser: {}
    };
}
function getConversation(matchId) {
    const id = normalizeMatchId(matchId);
    if (id == null) {
        throw new Error(`Invalid matchId: ${matchId}`);
    }
    if (!store.has(id)) {
        store.set(id, buildDefaultConversation(id));
    }
    return store.get(id);
}
function replaceConversation(matchId, conv) {
    const id = normalizeMatchId(matchId);
    if (id == null) {
        throw new Error(`Invalid matchId: ${matchId}`);
    }
    store.set(id, { ...conv, matchId: id });
}
function saveConversation(matchId, updates) {
    const id = normalizeMatchId(matchId);
    if (id == null) {
        throw new Error(`Invalid matchId: ${matchId}`);
    }
    const current = getConversation(id);
    store.set(id, { ...current, ...updates });
}
function isOnCooldown(matchId, senderId) {
    const id = normalizeMatchId(matchId);
    if (id == null) return false;
    const conv = getConversation(id);
    if (!conv.cooldownUntil) return false;
    if (parseInt(String(conv.cooldownSenderId), 10) !== parseInt(String(senderId), 10)) return false;
    return new Date() < new Date(conv.cooldownUntil);
}
function applyCooldown(matchId, senderId, minutes = 2) {
    const id = normalizeMatchId(matchId);
    if (id == null) return;
    const now = Date.now();
    const addMs = minutes * 60 * 1000;
    const conv = getConversation(id);
    const sid = parseInt(String(senderId), 10);
    const existingSid = conv.cooldownSenderId != null ? parseInt(String(conv.cooldownSenderId), 10) : null;
    if (conv.cooldownUntil && existingSid === sid) {
        const existingEnd = new Date(conv.cooldownUntil).getTime();
        if (existingEnd > now + 500) {
            return;
        }
    }
    const until = new Date(now + addMs);
    saveConversation(id, {
        ...conv,
        cooldownUntil: until.toISOString(),
        cooldownSenderId: sid
    });
}
function clearCooldown(matchId) {
    const id = normalizeMatchId(matchId);
    if (id == null) return;
    const conv = getConversation(id);
    saveConversation(id, { ...conv, cooldownUntil: null, cooldownSenderId: null });
}
module.exports = {
    STATE,
    buildDefaultConversation,
    normalizeMatchId,
    getConversation,
    replaceConversation,
    saveConversation,
    isOnCooldown,
    applyCooldown,
    clearCooldown
};