const mongoose = require('mongoose');

const recentlyViewedSchema = new mongoose.Schema({
  customerId: { type: Number, required: true, unique: true },
  recentItems: [{ type: Number }]
}, { collection: 'recently_viewed' });

module.exports = mongoose.model('RecentlyViewed', recentlyViewedSchema);