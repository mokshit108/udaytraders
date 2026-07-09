// routes/upload.js
const express = require("express");
const upload = require("../middlewares/upload");
const { uploadImage } = require("../controllers/uploadController");

const router = express.Router();

/**
 * POST /upload/image
 * Field name: "image"  (multipart/form-data)
 *
 * Returns: { url: "https://res.cloudinary.com/...", public_id: "..." }
 */
router.post("/image", upload.single("image"), (req, res, next) => {
  // Handle multer errors (file type / size)
  next();
}, uploadImage);

// Multer error handler
router.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large. Maximum size is 5 MB." });
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
