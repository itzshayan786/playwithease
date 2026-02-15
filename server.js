require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet'); // Security headers
const verifyToken = require('./middleware/authMiddleware');
const storeController = require('./controllers/storeController');

const app = express();

// --- Middleware ---
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL })); // Only allow PlayWithEase Frontend
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected to PlayWithEase Cluster'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// --- API Routes ---

// Public: Get all games
app.get('/api/games', async (req, res) => {
  const Product = require('./models/Product');
  const games = await Product.find({ isActive: true });
  res.json(games);
});

// Protected: Buy a game
app.post('/api/checkout', verifyToken, storeController.createCheckoutSession);

// Protected: Confirm purchase & Get Key
app.post('/api/confirm-order', verifyToken, storeController.confirmOrder);

// Protected: User Order History
app.get('/api/my-orders', verifyToken, async (req, res) => {
  const Order = require('./models/Order');
  const orders = await Order.find({ userId: req.user.uid }).sort({ createdAt: -1 });
  res.json(orders);
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 PlayWithEase Backend running on port ${PORT}`));
