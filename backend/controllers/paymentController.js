const crypto = require('crypto');
const Razorpay = require('razorpay');

// Your Razorpay credentials
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const verifyPayment = async (req, res) => {
  const { paymentId, orderId, signature } = req.body;

  try {
    // Fetch payment details from Razorpay
    const paymentDetails = await razorpayInstance.payments.fetch(paymentId);

    // Check if paymentDetails contains required information
    if (!paymentDetails || !paymentDetails.order_id) {
      return res.status(400).json({ message: 'Payment verification failed: Missing payment details.' });
    }

    // Verify signature
    const generatedSignature = crypto.createHmac('sha256', razorpayInstance.key_secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature === signature) {
      res.status(200).json({ message: 'Payment verified and order created successfully.' });
    } else {
      res.status(400).json({ message: 'Payment verification failed: Signature mismatch.' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error.message);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

module.exports = { verifyPayment };
