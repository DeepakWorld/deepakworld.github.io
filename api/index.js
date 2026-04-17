const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();

// 1. CORS Setup
app.use(cors({ 
    origin: ['https://deepakworld.github.io', 'https://deepakworld.web.app'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// FIXED: Root route (Merged the duplicates)
app.get('/', (req, res) => {
    res.status(200).json({
        status: "success",
        message: "PhonePe Integration Server is Live",
        endpoints: {
            initiatePayment: "/api/initiate-phonepe-payment"
        }
    });
});

const credentials = {
    client_id: "SU2604171512591907439682",
    client_secret: "11ba5d1c-10ef-4454-8c4b-d09e34e56707", // WARNING: Move this to Env Vars!
    client_version: 1
};

// 2. FIXED: Real PhonePe API Host
const PHONEPE_HOST = "https://api.phonepe.com/apis/hermes";
async function getAuthToken() {
    const data = new URLSearchParams({
        ...credentials,
        grant_type: "client_credentials"
    }).toString();

    // FIXED: Correct Auth URL (usually /v1/oauth/token or similar depending on your PhonePe contract)
    const response = await axios.post(`${PHONEPE_HOST}/v1/oauth/token`, data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    return response.data.access_token;
}

app.post('/api/initiate-phonepe-payment', async (req, res) => {
    try {
        const token = await getAuthToken();
        
        const payPayload = {
            merchantId: credentials.client_id,
            merchantOrderId: "ORD-" + Date.now(),
            amount: Math.floor(req.body.amount * 100), 
            redirectUrl: "https://deepakworld.github.io/customer/DIWS-Invoice-001.pdf",
            mode: "PAY_PAGE"
        };

        // 3. FIXED: Correct Payment URL
        const response = await axios.post(`${PHONEPE_HOST}/pg/v1/pay`, payPayload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
