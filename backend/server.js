require("dotenv").config();
require("./config/db");

const express    = require("express");
const cors       = require("cors");
const http       = require("http");
const { Server } = require("socket.io");
const path       = require("path");

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 4000;

// ─── Socket.io ────────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin:      "http://localhost:5173",
        methods:     ["GET", "POST"],
        credentials: true
    }
});

app.set("io", io); // makes io available in controllers via req.app.get("io")

const initSocket = require("./realtime/socketServer");
initSocket(io);

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
    origin:      "http://localhost:5173",
    credentials: true
}));

// Serve uploaded profile photos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

// ─── Routes ───────────────────────────────────────────────────────────────
const matchRoutes   = require("./routes/match");
const authRoutes    = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const messageRoutes = require("./routes/messages");
const dateRoutes    = require("./routes/dates");

app.use("/matches",  matchRoutes);
app.use("/auth",     authRoutes);
app.use("/profile",  profileRoutes);
app.use("/messages", messageRoutes);
app.use("/dates",    dateRoutes);

// ─── Start ────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});