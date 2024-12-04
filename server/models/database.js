const mongoose = require('mongoose');

// Log the connection URI for debugging
console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI);

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // Optional timeout setting
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Connection error:', err.message);
    process.exit(1); // Exit process if the connection fails
  });

const db = mongoose.connection;

// Log any connection errors
db.on('error', console.error.bind(console, 'Connection error:'));

// Confirm successful connection
db.once('open', () => {
  console.log('MongoDB connection is open');
});

// Models
require('./Category'); // Include your Category model
require('./Recipe');   // Include your Recipe model
