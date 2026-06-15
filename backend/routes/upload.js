const express = require("express");
const path = require("path");
const fs = require("fs");
const { put } = require("@vercel/blob");
const router = express.Router();
const checkUser = require("../middleware/auth");
const upload = require("../middleware/upload");

// POST /api/upload — accepts a single image (field name "image"),
// returns an absolute URL the client can use directly as a src.
router.post("/", checkUser, (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    try {
      // Production (Vercel): store in Vercel Blob — disk isn't writable there.
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(`uploads/${filename}`, req.file.buffer, {
          access: "public",
          contentType: req.file.mimetype,
        });
        return res.status(201).json({ url: blob.url });
      }

      // Local dev fallback: write to ./uploads and serve via express.static.
      const dir = path.join(__dirname, "..", "uploads");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, filename), req.file.buffer);
      const url = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
      return res.status(201).json({ url });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  });
});

module.exports = router;
