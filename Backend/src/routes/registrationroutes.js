// =============================================
// src/routes/registration.routes.js  —  Routes
// =============================================
// Kaunsa URL kaunse controller ko call karega — yahan decide hota hai.
// Route sirf "traffic police" hai — actual kaam controller karta hai.

const express    = require("express");
const router     = express.Router();
const {
  createRegistration,
  getAllRegistrations
} = require("../controllers/registrationController");

// POST /api/preregister
router.post("/preregister", createRegistration);

// GET /api/registrations
router.get("/registrations", getAllRegistrations);

module.exports = router;