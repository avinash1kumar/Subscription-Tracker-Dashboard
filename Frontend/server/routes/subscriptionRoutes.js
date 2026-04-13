const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

/**
 * EXPRESS ROUTER
 * This file acts like a giant traffic cop. 
 * When React makes an HTTP request to the server, this router looks at the URL
 * and directs the request to the exact correct Controller function!
 */

// 1. If React points to /api/subscriptions with a GET request, go fetch all data!
router.get('/', subscriptionController.getSubscriptions);

// 2. If React points to /api/subscriptions with a POST request, go save new data!
router.post('/', subscriptionController.addSubscription);

// 3. If React points to /api/subscriptions/123 with a DELETE request, go delete ID 123!
router.delete('/:id', subscriptionController.deleteSubscription);

module.exports = router;
