// 1. Import our tools
require('dotenv').config(); // Loads secret passwords from the hidden .env file
const express = require('express'); // The actual framework
const cors = require('cors'); // The security shield

// 2. Import our custom routing map
const subscriptionRoutes = require('./routes/subscriptionRoutes');

// 3. Fire up the Express Engine!
const app = express();

// 4. Configure Middlewares (the translators)
// CORS allows your React app (running on localhost:5173) to legally talk to this server (running on 5000)
app.use(cors()); 

// This middleware tells our server how to read raw JSON format from React's POST requests
app.use(express.json());

// 5. Connect the Routes
// Tell the server: "Any URL that starts with /api/subscriptions should follow the map in subscriptionRoutes"
app.use('/api/subscriptions', subscriptionRoutes);

// 6. Start the Engine!
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend Server is actively running on http://localhost:${PORT}`);
});
