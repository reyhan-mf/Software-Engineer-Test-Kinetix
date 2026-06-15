require('dotenv').config();
const app = require('../app');
const connectDB = require('../db');

module.exports = async (req, res) => {
  await connectDB();
  // experimentalServices strips the /api routePrefix before forwarding to this
  // service, so we restore it so Express can match routes mounted at /api/*.
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
};
