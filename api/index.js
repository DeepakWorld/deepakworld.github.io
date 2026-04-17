const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();

// Allow requests from your GitHub Pages frontend
app.use(cors({ origin: 'https://github.io' }));
app.use(express.json());

// Replace these with your actual credentials
const credentials = {
    client_id: "SU2604171512591907439682",
    client_secret: "11ba5d1c-10ef-4454-8c4b-d09e34e56707",
    merchant_id: "SU2604171512591907439682" // Usually same as client_id for many PhonePe setups
};

// Helper to get OAuth Token
async function getAuthToken() {
    const params = new URLSearchParams({
        client_id: credentials.client_id,
        client_secret: credentials.client_secret,
        client_version: "1",
        grant_type: "client_credentials"
    });

    const response = await axios.post('https://phonepe.com', params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    return response.data.access_token;
}

app.post('/api/initiate-phonepe-payment', async (req, res) => {
    try {
        const token = await getAuthToken();
        
        const payPayload = {
            merchantId: credentials.merchant_id,
            merchantOrderId: "ORD" + Date.now(),
            amount: Math.floor(req.body.amount * 100), // Convert to Paise
            redirectUrl: "https://github.io/customer/DIWS-Invoice-001.pdf",
            mode: "PAY_PAGE" // Standard checkout mode
        };

        // Note: Using the Production URL based on your successful curl
        const response = await axios.post('https://phonepe.com', payPayload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Send the redirect URL back to the frontend
        res.json({ 
            success: true, 
            tokenUrl: response.data.data.redirectUrl || response.data.data.instrumentResponse.redirectInfo.url 
        });

    } catch (err) {
        console.error("Payment Error:", err.response ? err.response.data : err.message);
        res.status(500).json({ 
            success: false, 
            message: err.response?.data?.message || "Internal Server Error" 
        });
    }
});

// Export for Vercel
module.exports = app;
