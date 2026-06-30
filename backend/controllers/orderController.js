const pool = require('../config/db');
const Razorpay = require('razorpay');

// Your Razorpay credentials
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const generateOrderCode = () => {
  return Math.random().toString().slice(2, 14); // Generates a 12-digit numeric string
};

const createOrder = async (req, res) => {
  const { checkoutFormDetails, orderDetails, userId } = req.body;

  // Validation

  try {

    // Start a transaction
    await pool.query('BEGIN');

    // Check if the address already exists
    const existingAddressResult = await pool.query(
      `SELECT id FROM addresses WHERE user_id = $1`,
      [userId]
    );

    let addressId;

    if (existingAddressResult.rows.length > 0) {
      addressId = existingAddressResult.rows[0].id;
    } else {
      // Insert new address
      const addressResult = await pool.query(
        `INSERT INTO addresses (
          user_id, first_name, last_name, country,
          street_address1, street_address2, city,
          station, phone, pincode, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING id`,
        [
          userId,
          checkoutFormDetails.firstName,
          checkoutFormDetails.lastName,
          checkoutFormDetails.country,
          checkoutFormDetails.streetAddress1,
          checkoutFormDetails.streetAddress2,
          checkoutFormDetails.city,
          checkoutFormDetails.station,
          checkoutFormDetails.phone,
          checkoutFormDetails.pincode
        ]
      );
      addressId = addressResult.rows[0].id;
    }

    const currentDate = new Date();
    const shippingDate = addDays(currentDate, 4); // Shipping date is 2 days from now
    const deliveryDate = addDays(currentDate, 4); // Delivery date is 4 days from now

    // Generate order code
    const orderCode = generateOrderCode();

    // Insert into orders table
    const orderResult = await pool.query(
      `INSERT INTO orders
      (user_id, address_id, status_id, created_at, shipping_date, delivery_date, order_code)
      VALUES ($1, $2, $3, NOW(), $4, $5, $6) RETURNING id, order_code`,
      [userId, addressId, 1, shippingDate, deliveryDate, orderCode] // Assuming 1 is the initial status_id
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

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: orderDetails.finalAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: `order_${orderId}`,
      payment_capture: 1, // Auto capture
    });

    // Commit transaction
    await pool.query('COMMIT');

    return res.json({
      order_id: razorpayOrder.id,
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
