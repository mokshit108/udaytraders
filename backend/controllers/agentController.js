const pool = require("../config/db");
const { AgentTransaction, Order } = require("../models");

const getAgentIdByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid user ID is required" });
    }

    // Query to fetch the agent ID using the user ID
    const query = `
      SELECT id
      FROM agents
      WHERE user_id = $1
    `;

    // Pass the userId as an array to the query
    const result = await pool.query(query, [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Agent not found for this user" });
    }
    // Return the agent ID
    const agent = result.rows[0];
    res.json({ agent });
  } catch (err) {
    console.error("Error fetching agent by user ID:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
// Fetch all agents
const getAllAgents = async (req, res) => {
  try {
    const agents = await pool.query("SELECT id, name FROM agents");
    res.json({ agents: agents.rows });
  } catch (err) {
    console.error("Error fetching agents:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch orders by agentId
const getOrdersByAgentId = async (req, res) => {
  try {
    const { agentId } = req.params;

    // Validate agentId
    if (!agentId || isNaN(agentId)) {
      return res.status(400).json({ error: "Valid Agent ID is required" });
    }

    // Fetch orders assigned to the agent using agentId
    const query = `
      SELECT
        o.id AS order_id,
        o.order_code AS o_code,
        o.created_at,
        o.shipping_date,
        o.delivery_date,
        s.status AS status,
        p.img_url AS product_image,
        p.name AS product_name,
        c.name AS company_name,
        u.username AS user,
        pay.final_amount,
        pay.discount_percentage,
        oi.quantity,
        oi.price
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN companies c ON p.company_id = c.id
      JOIN users u ON o.user_id = u.id
      JOIN order_status s ON o.status_id = s.id
      JOIN payments pay ON o.id = pay.o_id
      JOIN agent_transactions at ON o.id = at.order_id
      WHERE at.agent_id = $1
      ORDER BY o.created_at DESC;
    `;

    // Use parseInt to ensure agentId is passed as a number
    const result = await pool.query(query, [parseInt(agentId, 10)]);

    // Check if there are any orders for the agent
    if (result.rowCount == 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this agent" });
    }

    // Return orders for the agent
    const orders = result.rows;
    res.json({ orders });
  } catch (err) {
    console.error("Error fetching orders by agentId:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const assignAgentToOrder = async (req, res) => {
  try {
    const { orderId, agentId } = req.body;

    // Check if orderId and agentId are provided
    if (!orderId || !agentId) {
      return res
        .status(400)
        .json({ error: "Order ID and Agent ID are required" });
    }

    // Fetch user_id based on orderId
    const userQuery = await pool.query(
      "SELECT user_id FROM orders WHERE id = $1",
      [orderId]
    );

    if (userQuery.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const userId = userQuery.rows[0].user_id;

    // Fetch station from address table using user_id
    const stationQuery = await pool.query(
      "SELECT station FROM addresses WHERE user_id = $1",
      [userId]
    );

    if (stationQuery.rowCount === 0) {
      return res.status(404).json({ error: "Address for the user not found" });
    }

    const station = stationQuery.rows[0].station;

    // Step 1: Check if there is an agent already assigned to this order
    const currentTransactionQuery = await pool.query(
      "SELECT agent_id FROM agent_transactions WHERE user_id = $1 AND order_id = $2",
      [userId, orderId]
    );

    // If there's an agent assigned to the order, we'll need to handle their availability
    let previousAgentId = null;
    if (currentTransactionQuery.rowCount > 0) {
      previousAgentId = currentTransactionQuery.rows[0].agent_id;
    }

    // Step 2: If there was a previous agent, update their availability to true (if they are not assigned to other orders)
    if (previousAgentId) {
      const otherOrdersQuery = await pool.query(
        "SELECT id FROM agent_transactions WHERE agent_id = $1 AND order_id != $2",
        [previousAgentId, orderId]
      );

      if (otherOrdersQuery.rowCount === 0) {
        // If the previous agent is no longer assigned to any other orders, set availability to true
        await pool.query(
          "UPDATE agents SET availability = true, updated_at = $1 WHERE id = $2",
          [new Date(), previousAgentId]
        );
      }
    }

    // Step 3: Now assign the new agent to the order
    if (currentTransactionQuery.rowCount > 0) {
      // If there's already an agent assigned, update the agent_id
      await pool.query(
        "UPDATE agent_transactions SET updated_at = $1, agent_id = $2 WHERE user_id = $3 AND order_id = $4",
        [new Date(), agentId, userId, orderId]
      );

      // Update the orders table with the new agent_id
      await pool.query("UPDATE orders SET agent_id = $1 WHERE id = $2", [
        agentId,
        orderId,
      ]);

      return res.json({ message: "Agent updated successfully" });
    } else {
      // If no agent was assigned, create a new record for the agent transaction
      await AgentTransaction.create({
        agent_id: agentId,
        user_id: userId,
        order_id: orderId,
        region: station,
        created_at: new Date(), // Set created_at on creation
        updated_at: new Date(), // Set updated_at on creation
      });

      // Update the orders table with the new agent_id
      await pool.query("UPDATE orders SET agent_id = $1 WHERE id = $2", [
        agentId,
        orderId,
      ]);

      await pool.query(
        "UPDATE agents SET availability = false, updated_at = $1 WHERE id = $2",
        [new Date(), agentId]
      );

      res.json({ message: "Agent assigned successfully" });
    }
  } catch (err) {
    console.error("Error assigning agent to order:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const checkOrderCode = async (orderCode) => {
  try {
    // Check if order code exists
    const order = await Order.findOne({
      where: {
        order_code: orderCode,
      },
      attributes: ["id"], // Only return the order id for validation
    });

    if (order) {
      return { valid: true, orderId: order.id }; // Order exists
    } else {
      return { valid: false, message: "Invalid order code." }; // Order not found
    }
  } catch (error) {
    console.error("Error checking order code:", error);
    return { valid: false, message: "An error occurred." };
  }
};

const verifyOrderCode = async (req, res) => {
  const { orderCode } = req.body;

  const result = await checkOrderCode(orderCode);

  if (result.valid) {
    res.json({
      success: true,
      message: "Verification successful.",
      orderId: result.orderId,
    });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
};

module.exports = {
  getAgentIdByUserId,
  getAllAgents,
  getOrdersByAgentId,
  assignAgentToOrder,
  verifyOrderCode,
};
