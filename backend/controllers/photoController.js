// photoController.js
// POST /profile/photo — upload a profile photo
// Uses multer for file handling, stores in backend/uploads/

const pool   = require("../config/db");
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename:    (req, file, cb) => {
        const ext      = path.extname(file.originalname);
        const filename = `user_${req.user.id}_${Date.now()}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, and WebP images are allowed."), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

exports.uploadMiddleware = upload.single("photo");

// ─── POST /profile/photo ───────────────────────────────────────────────────
exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided." });
        }

        const userId   = req.user.id;
        const photoUrl = `/uploads/${req.file.filename}`;

        // Set all existing photos to not primary
        await pool.query(
            `UPDATE photo SET is_primary = false WHERE user_id = $1`,
            [userId]
        );

        // Insert new photo as primary
        await pool.query(
            `INSERT INTO photo (user_id, photo_url, is_primary, uploaded_at)
             VALUES ($1, $2, true, NOW())`,
            [userId, photoUrl]
        );

        // Update profile_photo_url on users table for quick access
        await pool.query(
            `UPDATE users SET profile_photo_url = $1 WHERE user_id = $2`,
            [photoUrl, userId]
        );

        res.status(201).json({
            message:   "Photo uploaded successfully.",
            photo_url: photoUrl
        });
    } catch (err) {
        console.error("uploadPhoto error:", err.message);
        res.status(500).json({ error: "Failed to upload photo." });
    }
};