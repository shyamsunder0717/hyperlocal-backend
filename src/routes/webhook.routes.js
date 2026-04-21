const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Meta WhatsApp webhook verification endpoint
router.get('/whatsapp', webhookController.verifyWebhook);

// Meta WhatsApp incoming message endpoint
router.post('/whatsapp', webhookController.receiveMessage);

module.exports = router;
