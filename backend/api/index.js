// Vercel serverless entry point. All routes are rewritten here via vercel.json;
// Express still sees the original URL (e.g. /api/posts/123) and routes normally.
require('dotenv').config();
const app = require('../app');
const connectDB = require('../db');

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
