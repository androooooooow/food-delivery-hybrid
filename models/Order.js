const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: Number,
  quantity: Number,
  price: Number
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: Number, required: true, unique: true },
  customerName: String,
  restaurantId: Number,
  totalAmount: Number,
  status: { type: String, default: 'PENDING' },
  items: [orderItemSchema],
  createdAt: { type: Date, default: Date.now }
}, { collection: 'order_cache' });

module.exports = mongoose.model('Order', orderSchema);