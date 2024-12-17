const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());


// Import DB connection and query handling logic
const db = require('./db');
const getHotels = require('./handlequery');

// Initialize MongoDB connection
db();

// Define the GET route for querying hotels
app.get('/gethotels', getHotels);

// Start the Express server
app.listen(3000, () => console.log('Server running on port 3000'));

// http://localhost:3000/gethotels?query=Find%20me%20a%20hotel%20in%20Goa%20with%20a%20pool%20under%20₹6000