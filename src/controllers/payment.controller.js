const crypto = require('crypto');
const Booking = require('../models/Booking');
const whatsappService = require('../services/whatsapp.service');

exports.razorpayWebhook = async (req, res) => {
    // 1. Immediately return 200 OK so Razorpay doesn't retry
    res.sendStatus(200);

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'MOCK_SECRET';
    const razorpaySignature = req.headers['x-razorpay-signature'];

    // 2. Verify webhook origin cryptographically
    const bodyString = JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', secret).update(bodyString).digest('hex');

    if (expectedSignature !== razorpaySignature && process.env.RAZORPAY_WEBHOOK_SECRET) {
        console.error('CRITICAL: Invalid Razorpay Webhook Signature');
        return; // Ignore the request
    }

    // 3. Process the event payload
    try {
        const event = req.body.event;

        if (event === 'payment_link.paid') {
            const paymentPayload = req.body.payload.payment_link.entity;
            const bookingId = paymentPayload.reference_id;
            
            // 4. Update the Database Document
            const booking = await Booking.findById(bookingId).populate('vendorId').populate('userId');
            
            if (!booking) {
                console.error(`Booking not found for payment reference: ${bookingId}`);
                return;
            }

            booking.paymentStatus = 'PAID';
            booking.status = 'CONFIRMED';
            await booking.save();

            // 5. Instantly send WhatsApp Confirmation
            const userPhone = booking.userId.phoneNumber;
            const vendorName = booking.vendorId.businessName;
            const vendorContact = booking.vendorId.ownerPhone;
            
            const message = `🎉 *Payment Confirmed!* 🎉\n\nYour booking with *${vendorName}* is secured.\n\n📞 Vendor Contact: ${vendorContact}\n\nOur concierge agent will reach out shortly. Welcome to the city!`;
            
            await whatsappService.sendText(userPhone, message);
            console.log(`Payment confirmed and user ${userPhone} notified successfully.`);
        }
    } catch (error) {
        console.error('Error processing Razorpay Webhook payload:', error);
    }
};
