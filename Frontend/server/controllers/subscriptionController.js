const db = require('../config/db');

/**
 * CONTROLLER: getSubscriptions
 * This fires exactly when the React App makes a GET request to /api/subscriptions
 * It asks the MySQL database for all rows, and sends them back to React as JSON.
 */
exports.getSubscriptions = async (req, res) => {
  try {
    // 1. Ask the database for everything in our table
    const [rows] = await db.query('SELECT * FROM subscriptions ORDER BY created_at DESC');
    
    // 2. Send the data back to the frontend with a 200 (SUCCESS) HTTP status code!
    res.status(200).json(rows);
  } catch (error) {
    // If the database crashes, we send a 500 (SERVER ERROR) code back so React knows!
    console.error(error);
    res.status(500).json({ message: "Server Error loading subscriptions" });
  }
};

/**
 * CONTROLLER: addSubscription
 * This fires when the React "Add Subscription" form submits.
 * It grabs the data from the form (req.body), forces it into the MySQL database,
 * and then replies to React to confirm it successfully saved.
 */
exports.addSubscription = async (req, res) => {
  try {
    // 1. Extract the data that React sent over inside the 'body' of the request
    const { name, price, billing_cycle, category, next_payment_date } = req.body;

    // 2. Safely insert it right into the database using parameterized queries (?)
    // Parameterized queries stop hackers from doing SQL Injections!
    const query = `
      INSERT INTO subscriptions (name, price, billing_cycle, category, next_payment_date) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [name, price, billing_cycle, category, next_payment_date]);

    // 3. Tell React it was fully successful
    res.status(201).json({ 
      id: result.insertId, // Give React the brand new DB ID
      message: "Subscription added successfully!" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add subscription" });
  }
};

/**
 * CONTROLLER: deleteSubscription
 * This fires when someone clicks the red "Cancel Subscription" button on the UI.
 * It finds the specific ID in the database and removes the whole row permanently.
 */
exports.deleteSubscription = async (req, res) => {
  try {
    // Grabs the ID right out of the URL (e.g. /api/subscriptions/5)
    const { id } = req.params; 

    // Delete it explicitly
    await db.query('DELETE FROM subscriptions WHERE id = ?', [id]);

    res.status(200).json({ message: "Subscription deleted permanently." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete subscription" });
  }
};
