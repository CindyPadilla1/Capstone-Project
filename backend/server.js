require("dotenv").config(); // ← must be first before anything reads process.env
require("./config/db");    // initializes the DB connection

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Logger — placed BEFORE routes so every request is logged
app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

// Routes
const matchRoutes   = require("./routes/match");
const authRoutes    = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const messageRoutes = require("./routes/messages");

app.use("/matches",  matchRoutes);
app.use("/auth",     authRoutes);
app.use("/profile",  profileRoutes);
app.use("/messages", messageRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});