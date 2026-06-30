const { sequelize } = require('../models/index'); 

// Save payment details
exports.savePayment = async (req, res) => {
  const { paymentId, method, userId, total_amount, final_amount, discountPercentage, orderId } = req.body;

  // Calculate the discount amount based on the discount percentage
  const discount_amount = total_amount * (discountPercentage / 100);

  try {
    // 1. Extract the most recent order ID
    const recentOrder = await sequelize.query(
      `SELECT id FROM orders 
       WHERE user_id = :userId 
       ORDER BY created_at DESC 
       LIMIT 1`,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Check if any order was found
    if (recentOrder.length === 0) {
      return res.status(404).json({ error: "No recent orders found for this user." });
    }

    const recentOrderId = recentOrder[0].id; // Get the most recent order ID

    // 2. Define the raw SQL query to match the new Payment model
    const query = `
      INSERT INTO payments (
        user_id, 
        order_id, 
        o_id,
        final_amount,
        total_amount,
        discount_amount,
        discount_percentage, 
        method, 
        transaction_id, 
        status, 
        created_at
      )
      VALUES (
        :userId, 
        :orderId, 
        :o_id, 
        :final_amount,
        :total_amount,
        :discount_amount,
        :discountPercentage,
        :method, 
        :paymentId, 
        'completed', 
        NOW()
      )
    `;

    // Define the query parameters
    const replacements = {
      userId,
      orderId, // Use the recent order ID here
      o_id: recentOrderId,    // Adjust if needed
      total_amount,
      final_amount,
      discount_amount,
      discountPercentage,
      method,
      paymentId
    };

    // 3. Execute the raw SQL query
    await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.INSERT
    });

    res.status(200).json({ message: "Payment details saved successfully" });
  } catch (error) {
    console.error("Error saving payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
