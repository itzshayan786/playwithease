const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/Product');
const Order = require('../models/Order');
const supplierService = require('../services/supplierService');

// 1. Create a Checkout Session
exports.createCheckoutSession = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.uid; // From Auth Middleware

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Create a pending order in DB
    const newOrder = await Order.create({
      userId,
      items: [{ productId: product._id, title: product.title, priceAtPurchase: product.price }],
      totalAmount: product.price,
      paymentStatus: 'pending'
    });

    // Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: product.title, images: [product.imageUrl] },
          unit_amount: Math.round(product.price * 100), // Stripe uses cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: { orderId: newOrder._id.toString() } // Link Stripe to our DB Order
    });

    res.json({ url: session.url });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Webhook / Confirmation (Called after success)
exports.confirmOrder = async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      const orderId = session.metadata.orderId;
      const order = await Order.findById(orderId).populate('items.productId');

      if (order.paymentStatus === 'paid') return res.json({ message: 'Already processed' });

      // PAYMENTS SECURED. NOW WE FETCH THE KEY.
      // This is "Just-In-Time" delivery.
      const supplierId = order.items[0].productId.supplierId;
      const gameKey = await supplierService.purchaseKey(supplierId);

      // Update Order
      order.items[0].deliveredKeys = [gameKey];
      order.paymentStatus = 'paid';
      await order.save();

      return res.json({ success: true, keys: [gameKey] });
    }
  } catch (error) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
};