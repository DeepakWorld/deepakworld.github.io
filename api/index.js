const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ 
    origin: 'https://github.io',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const credentials = {
    client_id: "SU2604171512591907439682",
    client_secret: "11ba5d1c-10ef-4454-8c4b-d09e34e56707",
    client_version: 1
};

// 1. FIXED: Correct OAuth URL
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
            merchantId: credentials.client_id, // Usually the same as client_id
            merchantOrderId: "ORD-" + Date.now(),
            amount: Math.floor(req.body.amount * 100), 
            redirectUrl: "https://github.io/customer/DIWS-Invoice-001.pdf",
            mode: "PAY_PAGE"
        };

        // 2. FIXED: Correct Production Payment URL
        const response = await axios.post('https://phonepe.com', payPayload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // 3. FIXED: Proper data path for the redirect URL
        const redirectUrl = response.data.data?.instrumentResponse?.redirectInfo?.url || response.data.data?.redirectUrl;
        
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
