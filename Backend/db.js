const mongoose = require('mongoose');

// MongoDB URI (use environment variables for sensitive data)
const DB_URI = 'mongodb+srv://arthteerth93:WaveCreativeEcho@cluster0.i22535d.mongodb.net';

// Connect to MongoDB
const db = () => {
    mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((err) => {
            console.error('Error connecting to MongoDB:', err);
        });
};

module.exports = db;