const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require("cors");

// Middleware to parse JSON
app.use(express.json());

app.use(cors());

// Import Routes
const matchRoutes = require("./routes/match");
app.use("/matches", matchRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});

app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});