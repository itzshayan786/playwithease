const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true }, // e.g., 'elden-ring-steam-global'
  supplierId: { type: String },         // ID on Kinguin/CodesWholesale
  platform: { type: String, enum: ['Steam', 'Xbox', 'PSN', 'Origin'] },
  region: { type: String, default: 'Global' },
  price: { type: Number, required: true }, // Your selling price
  costPrice: { type: Number },             // What you pay the supplier
  stock: { type: Number, default: 0 },
  imageUrl: String,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Product', productSchema);