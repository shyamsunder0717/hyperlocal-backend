const express = require('express');
const cors = require('cors');

const webhookRoutes = require('./routes/webhook.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/webhook', webhookRoutes);
app.use('/api/v1/payments', paymentRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

module.exports = app;
