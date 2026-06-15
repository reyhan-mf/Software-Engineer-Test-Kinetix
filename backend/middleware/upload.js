const multer = require("multer");

// Keep the file in memory so the route can hand the buffer to Vercel Blob
// (production) or write it to disk (local dev). Vercel's filesystem is
// read-only, so multer.diskStorage can't be used there.
const fileFilter = (req, file, cb) => {
  const ok = /^image\/(jpeg|jpg|png|gif|webp)$/.test(file.mimetype);
  cb(ok ? null : new Error("Only image files are allowed"), ok);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;
