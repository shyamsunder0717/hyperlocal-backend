const workflowService = require('../services/workflow.service');

exports.verifyWebhook = (req, res) => {
    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

exports.receiveMessage = (req, res) => {
    // Return 200 OK immediately to WhatsApp
    res.sendStatus(200);

    const { body } = req;

    if (body.object) {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
            const message = body.entry[0].changes[0].value.messages[0];
            const senderPhone = message.from;

            if (message.type === 'interactive' && message.interactive.list_reply) {
                const selectedVendorId = message.interactive.list_reply.id;
                console.log(`User ${senderPhone} selected vendor: ${selectedVendorId}`);
                
                workflowService.handleInteractiveSelection(senderPhone, selectedVendorId).catch(err => {
                    console.error('Error handling interactive selection:', err);
                });
            } else if (message.type === 'text' && message.text) {
                const text = message.text.body;
                console.log(`Received text from ${senderPhone}: ${text}`);

                // Process the workflow asynchronously so WhatsApp response isn't blocked
                workflowService.handleIncomingMessage(senderPhone, text).catch(err => {
                    console.error('Error in background message workflow:', err);
                });
            }
        }
    }
};
