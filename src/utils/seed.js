require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');

const mockVendors = [
    // PGs / Rooms
    {
        businessName: "Sunrise PG for Boys",
        type: "PG",
        ownerPhone: "+919876543210",
        location: { type: "Point", coordinates: [75.83, 25.18], address: "Landmark City, Kota" },
        pricing: { basePrice: 4500, currency: "INR" },
        attributes: { roomType: "Double Sharing", ac: "No", wifi: "Yes" },
        rating: 4.2
    },
    {
        businessName: "Elite Girls Hostel",
        type: "PG",
        ownerPhone: "+919876543211",
        location: { type: "Point", coordinates: [75.84, 25.17], address: "Talwandi, Kota" },
        pricing: { basePrice: 6000, currency: "INR" },
        attributes: { roomType: "Single", ac: "Yes", wifi: "Yes" },
        rating: 4.8
    },
    {
        businessName: "Budget Stay Rooms",
        type: "PG",
        ownerPhone: "+919876543212",
        location: { type: "Point", coordinates: [75.81, 25.16], address: "Station Road, Kota" },
        pricing: { basePrice: 2000, currency: "INR" },
        attributes: { roomType: "Triple Sharing", ac: "No", wifi: "No" },
        rating: 3.5
    },

    // Food / Tiffins
    {
        businessName: "Maa Ki Rasoi Tiffin",
        type: "FOOD",
        ownerPhone: "+919876543213",
        location: { type: "Point", coordinates: [75.835, 25.185], address: "Kunhadi, Kota" },
        pricing: { basePrice: 2200, currency: "INR" },
        attributes: { mealsPerDay: "2", type: "Pure Veg" },
        rating: 4.5
    },
    {
        businessName: "Student Express Dhaba",
        type: "FOOD",
        ownerPhone: "+919876543214",
        location: { type: "Point", coordinates: [75.82, 25.19], address: "Nayapura, Kota" },
        pricing: { basePrice: 60, currency: "INR" }, // Per Thali
        attributes: { mealsPerDay: "1", type: "Veg/Non-Veg" },
        rating: 4.0
    },

    // Transport
    {
        businessName: "Raju Auto Service",
        type: "TRANSPORT",
        ownerPhone: "+919876543215",
        location: { type: "Point", coordinates: [75.815, 25.18], address: "Bus Stand, Kota" },
        pricing: { basePrice: 150, currency: "INR" }, // Base dropoff
        attributes: { vehicleType: "Auto Rickshaw" },
        rating: 4.7
    },

    // Groceries
    {
        businessName: "Gupta Kirana Store (Starter Kits)",
        type: "GROCERY",
        ownerPhone: "+919876543216",
        location: { type: "Point", coordinates: [75.83, 25.18], address: "Landmark City, Kota" },
        pricing: { basePrice: 499, currency: "INR" }, // Move-in Kit
        attributes: { kitContains: "Bucket, Mug, Soap, Surf, Maggi, Biscuits" },
        rating: 4.6
    }
];

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // Fallback to localhost if MONGO_URI isn't set yet during dev
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hyperlocal_db';
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        console.log('Clearing existing vendors...');
        await Vendor.deleteMany();

        console.log('Inserting mock data...');
        await Vendor.insertMany(mockVendors);
        
        console.log('Database seeded successfully with Mock Vendors!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
