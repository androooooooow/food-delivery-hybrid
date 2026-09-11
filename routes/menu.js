const express = require('express');
const router = express.Router();
const MenuCache = require('../models/Restaurant');


router.get('/:restaurantId', async (req, res) => {
  try {
    const restaurantId = Number(req.params.restaurantId);

    const menu = await MenuCache.findOne(
      { restaurantId },
      { _id: 0, '__v': 0, 'items._id': 0 }
    );

    if (!menu) {
      return res.status(404).json({ message: 'Menu not found in cache' });
    }

    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
