require('dotenv').config();
const app = require('./app');
const connectDB = require('./db');

const PORT = process.env.PORT || 5000;

// Start listening immediately so the server always responds (with proper CORS
// headers and JSON errors) instead of hard-crashing the function when the DB is
// unreachable. The DB connects in the background; mongoose buffers queries until
// the connection is ready.
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

connectDB()
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err.message));
