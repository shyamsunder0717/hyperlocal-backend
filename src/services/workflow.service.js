const openaiService = require('./openai.service');
const whatsappService = require('./whatsapp.service');
const Vendor = require('../models/Vendor');

class WorkflowService {
    async handleIncomingMessage(userPhone, text) {
        console.log(`Processing workflow for ${userPhone}. Message: "${text}"`);
        
        // 1. Send the text to OpenAI to get structured intent
        const extractedData = await openaiService.extractIntent(text);
        console.log('Extracted Data:', extractedData);

        const { intent, budget, location, attributes } = extractedData;

        // 2. Route behavior based on Intent
        switch (intent) {
            case 'GREETING':
                await this.handleGreeting(userPhone);
                break;
            case 'FIND_ROOM':
                await this.handleFindVendor(userPhone, 'PG', budget, location);
                break;
            case 'FIND_FOOD':
                await this.handleFindVendor(userPhone, 'FOOD', budget, location);
                break;
            case 'UNKNOWN':
            default:
                await whatsappService.sendText(
                    userPhone, 
                    "I didn't quite catch that. I can help you find a PG room or a Tiffin delivery. Try saying, 'I need a room under 500 near the bus stand.'"
                );
                break;
        }
    }

    async handleGreeting(userPhone) {
        const text = "Welcome to your Super-Concierge! 🏠🍲\n\nAre you new to the city? I can help you:\n1. Find verified PGs/Rooms\n2. Order monthly Tiffin services\n3. Find reliable Auto transport\n\nJust tell me what you need! (e.g., 'Find me a room under ₹3000')";
        await whatsappService.sendText(userPhone, text);
    }

    async handleFindVendor(userPhone, vendorType, budget, locationName) {
        // Build the MongoDB Query
        let query = { type: vendorType, isActive: true };
        
        // If OpenAI successfully extracted a budget constraint, apply it
        if (budget) {
            query['pricing.basePrice'] = { $lte: budget };
        }

        // Note: For actual location matching, we'd geocode `locationName` to coords
        // and use $near sphere. For MVP Phase 2, we just do a text or basic query.
        
        try {
            // Find Top 3 options
            const vendors = await Vendor.find(query).limit(3).lean();

            if (vendors.length === 0) {
                await whatsappService.sendText(userPhone, `Sorry, I couldn't find any ${vendorType === 'PG' ? 'rooms' : 'services'} matching that request right now.`);
                return;
            }

            // Build dynamic WhatsApp Interactive List
            const sections = [{
                title: `Top ${vendors.length} Options`,
                rows: vendors.map(v => ({
                    id: v._id.toString(),
                    title: v.businessName,
                    description: `₹${v.pricing.basePrice} - Rating: ${v.rating} ⭐`
                }))
            }];

            await whatsappService.sendInteractiveList(
                userPhone, 
                `Here are the best options I found for you:`, 
                `View ${vendorType === 'PG' ? 'Rooms' : 'Options'}`,
                sections
            );

        } catch (error) {
            console.error('Database query error:', error);
            await whatsappService.sendText(userPhone, "Sorry, I hit a snag while searching the database. Please try again in a moment!");
        }
    }

    async handleInteractiveSelection(userPhone, vendorId) {
        try {
            const vendor = await Vendor.findById(vendorId);
            if (!vendor) {
                await whatsappService.sendText(userPhone, "Sorry, this option is no longer available.");
                return;
            }

            // Find or Create User
            const User = require('../models/User');
            let user = await User.findOne({ phoneNumber: userPhone });
            if (!user) {
                user = await User.create({ phoneNumber: userPhone });
            }

            // Create Booking Document
            const Booking = require('../models/Booking');
            const booking = await Booking.create({
                userId: user._id,
                vendorId: vendor._id,
                type: vendor.type === 'PG' ? 'SUBSCRIPTION' : 'ONE_TIME',
                amount: vendor.pricing.basePrice,
                status: 'PENDING'
            });

            // Generate Payment Link
            const paymentService = require('./payment.service');
            const paymentLink = await paymentService.createPaymentLink(
                vendor.pricing.basePrice, 
                userPhone.replace(/\D/g, ''), // Normalize phone format
                booking._id
            );

            // Send Link to WhatsApp User
            const checkoutMessage = `You selected *${vendor.businessName}*.\n\nPrice: ₹${vendor.pricing.basePrice}\n\nPlease complete your booking securely via UPI/Cards:\n👉 ${paymentLink}\n\nThis exact link expires in 15 minutes. Once paid, I'll send you the owner's direct contact details! 🚀`;
            await whatsappService.sendText(userPhone, checkoutMessage);

        } catch (error) {
            console.error('Error handling interactive selection:', error);
            await whatsappService.sendText(userPhone, "Sorry, I encountered an error creating your booking. Please try again!");
        }
    }
}

module.exports = new WorkflowService();
