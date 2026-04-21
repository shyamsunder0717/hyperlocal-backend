const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Razorpay will hit this endpoint when a payment status changes
router.post('/webhook', paymentController.razorpayWebhook);

module.exports = router;
