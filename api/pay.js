import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from '@phonepe-pg/pg-sdk-node';
import { v4 as uuidv4 } from 'uuid';

// Initialize PhonePe Client (Ideally move these to Vercel Env Variables)
const merchantId = process.env.PHONEPE_MERCHANT_ID;
const saltKey = process.env.PHONEPE_SALT_KEY;
const saltIndex = process.env.PHONEPE_SALT_INDEX || 1;
const env = Env.SANDBOX; // Change to Env.PRODUCTION for live

const client = StandardCheckoutClient.getInstance(merchantId, saltKey, saltIndex, env);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { amount, customerId } = req.body;
    const merchantTransactionId = uuidv4(); // Unique ID for every order

    const request = StandardCheckoutPayRequest.builder()
      .merchantTransactionId(merchantTransactionId)
      .amount(amount * 100) // PhonePe expects amount in paise (1 INR = 100 paise)
      .redirectUrl("https://web.app") // Where user goes after payment
      .callbackUrl("https://vercel.app") // Your webhook URL
      .build();

    const response = await client.pay(request);
    
    // Send the redirect URL back to your frontend
    res.status(200).json({ url: response.redirectUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
}
