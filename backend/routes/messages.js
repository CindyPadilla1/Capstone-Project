// routes/messages.js
const express           = require("express");
const router            = express.Router();
const messageController = require("../controllers/messageController");
const { protect }       = require("../middleware/authMiddleware");

router.post("/send",         protect, messageController.sendMessage);
router.post("/date-request", protect, messageController.sendDateRequest);
router.get("/:matchId",      protect, messageController.getMessages);

module.exports = router;