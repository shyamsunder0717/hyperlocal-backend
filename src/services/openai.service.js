const { OpenAI } = require('openai');

class OpenAIService {
    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
        }
    }

    /**
     * Extracts structured intent from unstructured user message.
     * Uses GPT-4o-mini to keep costs low in production.
     */
    async extractIntent(userMessage) {
        if (!this.client) {
            console.warn('[MOCK OPENAI] Extracting basic intent via naive pattern matching. Set OPENAI_API_KEY for real functionality.');
            // Naive fallback for when no key is present during initial test
            return this._mockExtractIntent(userMessage);
        }

        try {
            const systemPrompt = `
You are a Hyperlocal Super-Concierge AI helping residents in Tier-2 Indian cities.
You manage vendors for PG/Rooms, Food (Tiffins), Transport, and Groceries.
Given the user's message, extract the key entities and output ONLY a raw JSON object.

Output JSON Format:
{
  "intent": "FIND_ROOM" | "FIND_FOOD" | "FIND_TRANSPORT" | "GREETING" | "UNKNOWN",
  "budget": Number or null,
  "location": String or null, // The neighborhood/stop mentioned
  "attributes": String or null // Any specific constraint (e.g., "veg", "single room")
}

Return raw JSON only, no markdown blocks.`;

            const completion = await this.client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.1,
            });

            let responseText = completion.choices[0].message.content.trim();
            // In case it comes back with markdown blocks despite the prompt
            if (responseText.startsWith('```json')) {
                 responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            }

            return JSON.parse(responseText);
        } catch (error) {
            console.error('Error extracting intent with OpenAI:', error.message);
            return { intent: "UNKNOWN", budget: null, location: null, attributes: null };
        }
    }

    _mockExtractIntent(message) {
        const text = message.toLowerCase();
        let intent = 'UNKNOWN';
        let budget = null;
        
        if (text.includes('pg') || text.includes('room') || text.includes('rent')) intent = 'FIND_ROOM';
        if (text.includes('food') || text.includes('tiffin') || text.includes('dhaba')) intent = 'FIND_FOOD';
        if (text.includes('hi') || text.includes('hello')) intent = 'GREETING';

        const budgetMatch = text.match(/\d+00/); // Naive catch for numbers like "500", "2000"
        if (budgetMatch) budget = parseInt(budgetMatch[0], 10);

        return { intent, budget, location: null, attributes: null };
    }
}

module.exports = new OpenAIService();
