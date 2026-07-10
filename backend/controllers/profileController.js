// controllers/profileController.js

const pool = require("../config/db");

const getUserProfile = async (req, res) => {
  try {
    // Get the user ID from the request (extracted from the JWT token)
    const { userId } = req.query; // Extract userId from query parameters  // Extract userId from request body
    // Query the database to get user details
    const user = await pool.query(
      "SELECT id, username, email, phone, role_id FROM users WHERE id = $1",
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    // Send user details as the response
    res.json({ user: user.rows[0] });
  } catch (err) {
    console.error("Error in getUserProfile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch user orders — includes product image/name, company, quantities, prices
    // final_amount is the total for the whole order (sum across all order_items)
    const ordersResult = await pool.query(
      `SELECT o.id          AS order_id,
              o.order_code  AS o_code,
              o.created_at,
              o.shipping_date,
              o.delivery_date,
              s.status      AS status,
              p.id          AS product_id,
              p.img_url     AS product_image,
              p.name        AS product_name,
              c.name        AS company_name,
              oi.quantity,
              oi.price,
              SUM(oi.price * oi.quantity)
                OVER (PARTITION BY o.id) AS final_amount
       FROM   orders o
       JOIN   order_items  oi ON o.id         = oi.order_id
       JOIN   products     p  ON oi.product_id = p.id
       JOIN   companies    c  ON p.company_id  = c.id
       JOIN   order_status s  ON o.status_id   = s.id
       WHERE  o.user_id = $1
       ORDER  BY o.created_at DESC`,
      [userId]
    );

    // Send user orders as the response
    res.json({ orders: ordersResult.rows });
  } catch (err) {
    console.error("Error in getUserOrders:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = {
  getUserProfile,
  getUserOrders,
};
