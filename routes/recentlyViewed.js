const express = require('express');
const router = express.Router();
const RecentlyViewed = require('../models/RecentlyViewed');

// POST - Add item to recently viewed
router.post('/:customerId/viewed/:itemId', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const itemId = parseInt(req.params.itemId);

    // Remove if exists, then add to front (max 10 items)
    await RecentlyViewed.findOneAndUpdate(
      { customerId },
      {
        $pull: { recentItems: itemId },
        $setOnInsert: { customerId }
      },
      { upsert: true }
    );

    await RecentlyViewed.findOneAndUpdate(
      { customerId },
      {
        $push: {
          recentItems: {
            $each: [itemId],
            $position: 0,
            $slice: 10
          }
        }
      },
      { new: true, upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Retrieve recently viewed items
router.get('/:customerId', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const data = await RecentlyViewed.findOne({ customerId }, { _id: 0, '__v': 0 });
    res.json(data || { customerId, recentItems: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;