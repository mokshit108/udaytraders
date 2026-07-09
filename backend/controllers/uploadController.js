// controllers/uploadController.js
// Receives a file buffer from multer and streams it to Cloudinary.
// Returns the secure Cloudinary URL back to the client.
const cloudinary = require("../utils/cloudinary");
const { Readable } = require("stream");

/**
 * uploadImage
 * POST /upload/image
 * multipart/form-data field name: "image"
 *
 * Response: { url: "https://res.cloudinary.com/..." }
 */
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided." });
  }

  // Stream the buffer directly to Cloudinary using the unsigned upload preset
  const uploadStream = cloudinary.uploader.unsigned_upload_stream(
    "udaytraders_preset",
    {
      resource_type: "image",
    },
    (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        return res.status(500).json({ error: `Cloudinary error: ${error.message || JSON.stringify(error)}` });
      }
      // Return the secure CDN URL
      return res.status(200).json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  );

  // Pipe the file buffer into the Cloudinary upload stream
  const bufferStream = new Readable();
  bufferStream.push(req.file.buffer);
  bufferStream.push(null);
  bufferStream.pipe(uploadStream);
};

module.exports = { uploadImage };
