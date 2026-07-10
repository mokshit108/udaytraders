const pool = require('../config/db');

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const generateOrderCode = () => {
  return Math.random().toString().slice(2, 14); // Generates a 12-digit numeric string
};

const createOrder = async (req, res) => {
  const { orderDetails, userId } = req.body;

  try {
    // Start a transaction
    await pool.query('BEGIN');

    const currentDate = new Date();
    const shippingDate = addDays(currentDate, 4);
    const deliveryDate = addDays(currentDate, 4);

    // Generate order code
    const orderCode = generateOrderCode();

    // Insert into orders table (no address required)
    const orderResult = await pool.query(
      `INSERT INTO orders
      (user_id, address_id, status_id, created_at, shipping_date, delivery_date, order_code)
      VALUES ($1, $2, $3, NOW(), $4, $5, $6) RETURNING id, order_code`,
      [userId, null, 1, shippingDate, deliveryDate, orderCode]
    );

    const orderId = orderResult.rows[0].id;

    // Insert into order_items table
    for (const item of orderDetails.cartItems) {
      if (item.id && item.quantity && item.price) {
        await pool.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [orderId, item.id, item.quantity, item.price]
        );
      } else {
        console.error('Missing product ID, quantity, or price:', item);
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    return res.json({
      order_id: orderId,
      message: 'Order created successfully'
    });
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK');
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Error creating order' });
  }
};


const getUserDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const userDetails = await pool.query(
      `SELECT
        first_name AS "firstName", last_name AS "lastName", country,
        street_address1 AS "streetAddress1", street_address2 AS "streetAddress2",
        city, station, phone, pincode
      FROM addresses
      WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (userDetails.rows.length === 0) {
      return res.status(200).json(null); // Send null if no address is found
    }

    return res.status(200).json(userDetails.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createOrder, getUserDetails };
