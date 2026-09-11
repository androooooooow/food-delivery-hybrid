const express = require('express');
const router = express.Router();
const pool = require('../config/pg');
const OrderCache = require('../models/Order');

// Activity 2: Place Order (POST /api/orders)
router.post('/', async (req, res) => {
  const customerName = req.body.customerName || req.body.customer_name;
  const restaurantId = req.body.restaurantId || req.body.restaurant_id;
  const totalAmount = req.body.totalAmount || req.body.total_amount || 0;
  const items = req.body.items || [];

  try {
    const orderRes = await pool.query(
      'INSERT INTO orders (customer_name, restaurant_id, total_amount, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [customerName, restaurantId, totalAmount, 'PENDING']
    );
    const newOrder = orderRes.rows[0];

    for (let item of items) {
      const menuItemId = item.menuItemId || item.menu_item_id;
      const quantity = item.quantity;
      const price = item.price || 0;

      await pool.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [newOrder.id, menuItemId, quantity, price]
      );
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const orderId = Number(req.params.id);


    let order = await OrderCache.findOne({ orderId }, { _id: 0, '__v': 0 });


    if (!order) {
      const sqlRes = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      
      if (sqlRes.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      order = sqlRes.rows[0];
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;