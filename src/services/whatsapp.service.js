const axios = require('axios');

class WhatsAppService {
    constructor() {
        this.token = process.env.WHATSAPP_TOKEN;
        this.phoneId = process.env.WHATSAPP_PHONE_ID;
        this.version = 'v18.0'; // Or whichever the latest supported Graph API version is
        this.baseUrl = `https://graph.facebook.com/${this.version}/${this.phoneId}/messages`;
    }

    async sendText(to, text) {
        if (!this.token || !this.phoneId) {
            console.log(`[MOCK WHATSAPP] To: ${to} | Text: ${text}`);
            return;
        }

        try {
            const response = await axios.post(
                this.baseUrl,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'text',
                    text: { preview_url: false, body: text }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error sending WhatsApp text message:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async sendInteractiveList(to, bodyText, buttonText, sections) {
        if (!this.token || !this.phoneId) {
            console.log(`[MOCK WHATSAPP LIST] To: ${to} | Sections:`, JSON.stringify(sections));
            return;
        }

        try {
            const response = await axios.post(
                this.baseUrl,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'interactive',
                    interactive: {
                        type: 'list',
                        body: { text: bodyText },
                        action: {
                            button: buttonText,
                            sections: sections
                        }
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error sending WhatsApp interactive list:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = new WhatsAppService();
