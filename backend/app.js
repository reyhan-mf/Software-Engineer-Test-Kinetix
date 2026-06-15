const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comment');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Await DB connection on every request so cold-start requests don't race the
// background connectDB() call in server.js (safe: db.js returns cached conn).
app.use(async (req, res, next) => {
  try { await connectDB(); next(); }
  catch (err) { res.status(503).json({ message: 'Database unavailable' }); }
});

// experimentalServices strips the /api routePrefix before forwarding to this
// service. Restore it so routes mounted at /api/* continue to match.
app.use((req, _res, next) => {
  if (!req.path.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  next();
});
// Local-dev only: serve disk uploads. In production images live in Vercel Blob.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', commentRoutes);
app.use('/api', userRoutes);
app.use('/api/upload', uploadRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
