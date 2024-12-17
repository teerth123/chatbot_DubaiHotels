const mongoose = require('mongoose');

// Define the Hotel Schema
const hotelSchema = new mongoose.Schema({
    hotel_name: { type: String, required: true },
    location: { type: String, required: true },
    landmark: { type: String },
    ratings: { type: String },
    info: [String],  // List of amenities (e.g., 'gym', 'pool')
    price: { type: String },
    tag: { type: String },
    accessibility: { type: String },
    occupancy_details: { type: String },
    description: { type: String }
});

// Create and export the Hotel model
const Hotel = mongoose.model('Hotel', hotelSchema);
module.exports = Hotel;