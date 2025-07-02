const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const gemini_api_key = 'AIzaSyBhrbRZDsd923DlMAhZJ9KDF-nFu8Ic6C8';
const gemini_url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${gemini_api_key}`;

const conversationHistory = {};

const client = new Client({
    authStrategy: new LocalAuth()
})

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true })
});

client.on('message', async (msg) => {
    const userId = msg.from;
    if (!conversationHistory[userId]) {
        conversationHistory[userId] = [
            {
                role: 'user',
                text: 'Você vai fazer o papel de Eduardo Neri e sempre ser descontraído nas conversas.'
            }
        ];
    }
    conversationHistory[userId].push({
        role: 'user',
        text: msg.body
    });

    const payload = {
        contents: conversationHistory[userId].map(item => ({
            role: item.role,
            parts: [{
                text: item.text
            }]
        }))
    };

    const response = await axios.post(gemini_url, payload)

    const candidates = response.data.candidates;
    const modelResponse = candidates?.[0]?.content?.parts?.[0]?.text || "Desculpa, agora estou extremamente ocupado.";


    conversationHistory[userId].push({
        role: 'model',
        text: modelResponse
    });
    msg.reply((modelResponse))
});

client.initialize();