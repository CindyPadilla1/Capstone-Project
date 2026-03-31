// routes/match.js
const express         = require("express");
const router          = express.Router();
const matchController = require("../controllers/matchController");
const { protect }     = require("../middleware/authMiddleware");

// NOTE: /:userId/mutual MUST be before /:userId or express will match wrong route
router.get("/all",             protect, matchController.getAllCandidates);
router.get("/:userId/mutual",  protect, matchController.getMutualMatches);
router.get("/:userId",         protect, matchController.getMatches);
router.post("/:userId/like",   protect, matchController.likeUser);

module.exports = router;