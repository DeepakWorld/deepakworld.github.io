const crypto = require('crypto');
const axios = require('axios');

// It is safer to use process.env, but hardcoding for your test:
const SALT_KEY = "11ba5d1c-10ef-4454-8c4b-d09e34e56707"; 
const SALT_INDEX = "1"; 
const MERCHANT_ID = "M23YWM4MOI3OO"; // Use your actual Merchant ID

export default async function handler(req, res) {
    // 1. Handle CORS (So your GitHub Pages site can call this)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const merchantTransactionId = "MT" + Date.now();
        
        // 2. Define the payload
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: "U" + Date.now(),
            amount: 100, // This is ₹1.00 (100 Paise)
            redirectUrl: "https://deepakworld.github.io/customer/DIWS-Invoice-001.pdf",
            redirectMode: "REDIRECT",
            callbackUrl: "https://phonepe-kohl.vercel.app/api/callback",
            mobileNumber: "9999999999",
            paymentInstrument: { type: "PAY_PAGE" }
        };

        // 3. Base64 encode
        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

        // 4. Create X-VERIFY checksum
        const stringToHash = base64Payload + "/pg/v1/pay" + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const xVerifyChecksum = sha256 + "###" + SALT_INDEX;

        // 5. Call PhonePe
        const response = await axios.post(
            "https://api.phonepe.com/apis/hermes/pg/v1/pay",
            { request: base64Payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': xVerifyChecksum,
                    'accept': 'application/json'
                }
            }
        );

        // 6. Return the response back to your frontend
        // Your frontend should redirect the user to: response.data.data.instrumentResponse.redirectInfo.url
        return res.status(200).json(response.data);

    } catch (err) {
        console.error("Error Detail:", err.response?.data || err.message);
        return res.status(500).json({ 
            success: false, 
            message: err.response?.data?.message || "Internal Server Error" 
        });
    }
}