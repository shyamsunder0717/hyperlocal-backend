const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['PG', 'FOOD', 'TRANSPORT', 'GROCERY'],
        required: true
    },
    ownerPhone: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    pricing: {
        basePrice: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },
    attributes: {
        type: Map,
        of: String // Flexible dynamic attributes e.g., mealsPerDay, roomType
    },
    rating: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index for geo-spatial queries
vendorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Vendor', vendorSchema);
