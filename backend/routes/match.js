// routes/match.js
const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");

router.get("/all",             matchController.getAllCandidates);
router.get("/:userId",         matchController.getMatches);
router.post("/:userId/like",   matchController.likeUser);

module.exports = router;