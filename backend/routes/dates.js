// routes/dates.js
const express        = require("express");
const router         = express.Router();
const dateController = require("../controllers/dateController");
const { protect }    = require("../middleware/authMiddleware");

router.post("/request",                  protect, dateController.sendDateRequest);
router.post("/:scheduleId/respond",      protect, dateController.respondToDate);
router.get("/notifications/:userId",     protect, dateController.getNotifications);
router.post("/survey-check",             dateController.checkAndSendSurveys); // called by cron

module.exports = router;