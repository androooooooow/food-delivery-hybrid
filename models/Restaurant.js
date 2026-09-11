const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number
}, { _id: false });

const menuCacheSchema = new mongoose.Schema({
  restaurantId: Number,
  restaurantName: String,
  items: [itemSchema]
}, { collection: 'menu_cache' });

module.exports = mongoose.model('MenuCache', menuCacheSchema);