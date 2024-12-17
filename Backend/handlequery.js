const Hotel = require('./models/hotel');
const nlp = require('compromise');

// Function to extract data from the customer query using NLP
const extractRequirements = (query) => {
    const doc = nlp(query);

    // Extract location from topics (a general approach)
    const location = doc.topics().out('array')[0]; // First topic can be location

    // Extract price range (handle various currency formats like ₹, rupees, rps, INR, etc.)
    const priceRangeMatch = query.match(/(\d+(?:,\d{1,3}))\s(rps|inr|rupees|₹)\s*to\s*(\d+(?:,\d{1,3}))\s(rps|inr|rupees|₹)/i);
    let priceMin = null;
    let priceMax = null;

    if (priceRangeMatch) {
        priceMin = parseInt(priceRangeMatch[1].replace(',', ''));  // Remove commas from number
        priceMax = parseInt(priceRangeMatch[3].replace(',', ''));  // Remove commas from number
    }

    // If no match is found, we could also check for individual price (e.g., below ₹3000 or above ₹5000)
    if (!priceRangeMatch) {
        const singlePriceMatch = query.match(/(\d+(?:,\d{1,3}))\s(rps|inr|rupees|₹)/i);
        if (singlePriceMatch) {
            priceMin = parseInt(singlePriceMatch[1].replace(',', ''));
            priceMax = priceMin;  // Only one price provided, set both min and max as the same
        }
    }

    // Define a list of possible amenities to extract from the query
    const amenitiesList = ["gym", "pool", "breakfast", "parking", "spa", "wifi", "restaurant", "bar", "ac", "pets", "beach"];
    const foundAmenities = amenitiesList.filter(amenity => doc.has(amenity)); // Check each amenity with .has()

    return { location, priceMin, priceMax, amenities: foundAmenities };
};


// Function to handle the hotel query
const getHotels = async (req, res) => {
    const { query } = req.query;  // Extract customer query from query string

    if (!query) {
        return res.status(400).json({ error: 'No query provided' });
    }

    // Extract customer requirements from the query using NLP
    const { location, priceMin, priceMax, amenities } = extractRequirements(query);

    // Build the MongoDB search query
    let searchQuery = {};

    // Match location if available
    if (location) {
        searchQuery.location = { $regex: location, $options: 'i' };  // Case-insensitive regex match
    }

    // Match price range if available
    if (priceMin && priceMax) {
        searchQuery.price = { $gte: priceMin, $lte: priceMax };  // Match hotels with price between min and max
    }

    // Match amenities if available
    if (amenities.length > 0) {
        searchQuery.info = { $all: amenities };  // Match all amenities
    }

    try {
        // Query the MongoDB collection for matching hotels
        const hotels = await Hotel.find(searchQuery).limit(10);  // Limit to top 10 results

        if (hotels.length === 0) {
            return res.status(404).json({ message: 'No hotels found matching your criteria' });
        }

        // Return the found hotels as a JSON response
        res.status(200).json(hotels);
    } catch (err) {
        console.error('Error fetching hotels:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

    console.log(location, priceMin, priceMax, amenities);
};

module.exports = getHotels;