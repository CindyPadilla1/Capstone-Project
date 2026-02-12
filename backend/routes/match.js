const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");

// GET matches for a user
router.get("/:userId", matchController.getMatches);
router.get("/:userId", (req, res) => {
    res.send("Server is responding!");
});
module.exports = router;