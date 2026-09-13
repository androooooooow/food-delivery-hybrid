const express = require('express');
const router = express.Router();
const pool = require('../config/pg');
const OrderCache = require('../models/Order');

// GET /api/orders - Kunin ang lahat ng orders sa PostgreSQL (Pang-test sa Postman)
router.get('/', async (req, res) => {
  try {
    const sqlRes = await pool.query('SELECT * FROM orders ORDER BY id ASC');
    res.json(sqlRes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

    /*
    // Sync agad sa MongoDB Read Model pagka-create
    await OrderCache.findOneAndUpdate(
      { orderId: newOrder.id },
      {
        orderId: newOrder.id,
        customerName: newOrder.customer_name,
        restaurantId: newOrder.restaurant_id,
        totalAmount: newOrder.total_amount,
        status: newOrder.status
      },
      { upsert: true, new: true }
    );
    */

//Laboratory Challenge 2 – Failure Simulation ===================================================================================

    let mongoSyncSuccessful = true;

    // failure simulation 
    try {
      throw new Error('Simulated MongoDB synchronization failure'); 
    } catch (syncError) {
      mongoSyncSuccessful = false;

      console.log('NoSQL synchronization failed.');
      console.log('SQL remains the source of truth.');
      console.log('Reason:', syncError.message);
    }

      // return success because SQL saved the order
      res.status(201).json({
        message: 'Order created in SQL, but MongoDB synchronization failed',
        sqlSaved: true,
        mongoSyncSuccessful,
        order: newOrder
      });
      
//===============================================================================================================================

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Activity 3/4: Track Order (GET /api/orders/:id)
router.get('/:id', async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    // 1. Unang maghanap sa MongoDB cache
    let order = await OrderCache.findOne({ orderId }, { _id: 0, '__v': 0 });

    // 2. Kung wala pa sa Mongo cache, mag-fallback sa PostgreSQL
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

// Activity 5 & 6: Update Order Status with Simulated 5-Second Delay
router.put('/:id/status', async (req, res) => {
  const orderId = Number(req.params.id);
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    // Step 1: Update SQL immediately (Source of Truth)
    const sqlRes = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    if (sqlRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found in SQL database' });
    }

    const updatedOrder = sqlRes.rows[0];

    // Step 2: Simulate 5-Second Delay before syncing to MongoDB (Activity 6)
    setTimeout(async () => {
      try {
        await OrderCache.findOneAndUpdate(
          { orderId },
          { 
            orderId: updatedOrder.id,
            customerName: updatedOrder.customer_name,
            restaurantId: updatedOrder.restaurant_id,
            totalAmount: updatedOrder.total_amount,
            status: updatedOrder.status
          },
          { new: true, upsert: true }
        );
        console.log(`⏱️ [5s Delay Complete] MongoDB cache updated for Order ${orderId}`);
      } catch (syncErr) {
        console.error('MongoDB Sync Error:', syncErr.message);
      }
    }, 5000);

    // Immediate response to user
    res.json({
      message: 'SQL status updated. Syncing to MongoDB cache in 5 seconds...',
      order: updatedOrder
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;