const Razorpay = require('razorpay');

class PaymentService {
    constructor() {
        if (process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET) {
            this.instance = new Razorpay({
                key_id: process.env.RAZORPAY_KEY,
                key_secret: process.env.RAZORPAY_SECRET
            });
        }
    }

    /**
     * Creates a payment link via Razorpay
     * @param {number} amount - Amount in INR
     * @param {string} customerPhone - Phone number without +, e.g. 919876543210
     * @param {string} referenceId - The Booking ID inside MongoDB
     */
    async createPaymentLink(amount, customerPhone, referenceId) {
        if (!this.instance) {
            console.warn('[MOCK RAZORPAY] Generating mock payment link for Booking ID:', referenceId);
            return `https://mock.razorpay.com/pay/${referenceId}`;
        }

        try {
            const expireBy = Math.floor(Date.now() / 1000) + (15 * 60); // 15 Minute Expiry
            
            const response = await this.instance.paymentLink.create({
                amount: amount * 100, // Razorpay takes amounts in paisa
                currency: "INR",
                accept_partial: false,
                expire_by: expireBy,
                reference_id: referenceId.toString(),
                description: "Super-App Booking Fee",
                customer: {
                    contact: customerPhone
                },
                notify: {
                    sms: true, // Razorpay will also SMS the user directly
                },
                reminder_enable: true,
                notes: {
                    booking_id: referenceId.toString()
                }
            });

            return response.short_url;
        } catch (error) {
            console.error('Error creating Razorpay Standard Link:', error);
            throw new Error('Payment Generation Failed');
        }
    }
}

module.exports = new PaymentService();
