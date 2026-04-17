const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();

// 1. CORS Setup - Add both your frontend domains
app.use(cors({ 
    origin: ['https://deepakworld.github.io', 'https://deepakworld.web.app'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const credentials = {
    client_id: "SU2604171512591907439682",
    client_secret: "11ba5d1c-10ef-4454-8c4b-d09e34e56707",
    client_version: 1
};

// 2. FIXED: Correct Production OAuth Endpoint
async function getAuthToken() {
    const data = new URLSearchParams({
        ...credentials,
        grant_type: "client_credentials"
    }).toString();

    const response = await axios.post('https://phonepe.com', data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    return response.data.access_token;
}

app.post('/api/initiate-phonepe-payment', async (req, res) => {
    try {
        const token = await getAuthToken();
        
        const payPayload = {
            merchantId: credentials.client_id, // Production Merchant ID
            merchantOrderId: "ORD-" + Date.now(),
            amount: Math.floor(req.body.amount * 100), 
            redirectUrl: "https://deepakworld.github.io/customer/DIWS-Invoice-001.pdf",
            mode: "PAY_PAGE"
        };

        // 3. FIXED: Correct Production Payment Endpoint
        const response = await axios.post('https://phonepe.com', payPayload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // 4. FIXED: Correct response parsing for production
        const redirectUrl = response.data.data?.instrumentResponse?.redirectInfo?.url || response.data.data?.redirectUrl;
        
        if (!redirectUrl) throw new Error("PhonePe did not return a redirect URL");

        res.json({ success: true, tokenUrl: redirectUrl });

    } catch (err) {
        console.error("Error Detail:", err.response ? err.response.data : err.message);
        res.status(500).json({ 
            success: false, 
            message: err.response?.data?.message || err.message 
        });
    }
});

module.exports = app;
