// routes/profile.js
const express           = require("express");
const router            = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware    = require("../middleware/authMiddleware");

router.post("/save",        authMiddleware.protect, profileController.saveProfile);
router.post("/preferences", authMiddleware.protect, profileController.savePreferences);

module.exports = router;
