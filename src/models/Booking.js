const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    type: {
        type: String,
        enum: ['ONE_TIME', 'SUBSCRIPTION'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'CANCELLED'],
        default: 'PENDING'
    },
    paymentStatus: {
        type: String,
        enum: ['UNPAID', 'PAID', 'FAILED'],
        default: 'UNPAID'
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    amount: {
        type: Number,
        required: true
    },
    // Useful for grouping multiple services into a move-in kit
    bundleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bundle'
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
