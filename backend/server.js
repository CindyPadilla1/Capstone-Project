// server.js
// Main Express server — wires all routes and Socket.io
// Feature 3 requires wrapping Express in http.createServer so Socket.io
// can share the same port as the REST API.

require("dotenv").config(); // must be first — loads process.env before any imports
require("./config/db");     // initializes the DB connection pool

const express    = require("express");
const http       = require("http");   // Node built-in — no install needed
const cors       = require("cors");

const app    = express();
const server = http.createServer(app); // Socket.io attaches to this, not app
const PORT   = process.env.PORT || 4000;

// ── Feature 3: Socket.io real-time messaging ──────────────────────────────
// Must be initialized BEFORE app.listen — uses the http server, not Express
const initSocketServer = require("./realtime/socketServer");
initSocketServer(server);

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Request logger ────────────────────────────────────────────────────────
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// ── REST Routes ───────────────────────────────────────────────────────────
const matchRoutes   = require("./routes/match");
const authRoutes    = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const messageRoutes = require("./routes/messages");

app.use("/matches",  matchRoutes);
app.use("/auth",     authRoutes);
app.use("/profile",  profileRoutes);
app.use("/messages", messageRoutes);

// ── Health check ──────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Start server ──────────────────────────────────────────────────────────
// server.listen (not app.listen) — required for Socket.io to work
server.listen(PORT, () => {
    console.log(`✅ Aura backend running on port ${PORT}`);
    console.log(`✅ Socket.io initialized on the same port`);
});