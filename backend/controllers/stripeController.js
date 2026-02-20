const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @desc    Create Stripe payment intent (optional - for online payments)
 * @route   POST /api/orders/create-payment-intent
 * @access  Private
 */
const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('sk_test_your')) {
      return res.status(503).json({
        success: false,
        message: 'Stripe not configured. Add STRIPE_SECRET_KEY to .env',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: 'usd',
      metadata: { orderId: orderId || '' },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentIntent };
