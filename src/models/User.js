const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        default: ''
    },
    language: {
        type: String,
        enum: ['en', 'hi'],
        default: 'en'
    },
    city: {
        type: String,
        default: ''
    },
    preferences: {
        dietary: {
            type: String, // 'veg', 'non-veg'
            default: 'veg'
        },
        budget: {
            type: String, // 'low', 'medium', 'high'
            default: 'medium'
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
