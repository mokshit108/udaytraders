const pool = require("../config/db");
const { User, Product, Role, Category, Company } = require("../models");

const getAllOrders = async (req, res) => {
  try {
    const { status } = req.params;

    // Base query — returns one row per order_item so admin sees every product
    // final_amount is the total for the entire order (window sum)
    let query = `
      SELECT o.id          AS order_id,
             o.order_code  AS o_code,
             o.created_at,
             o.shipping_date,
             o.delivery_date,
             s.status      AS status,
             p.id          AS product_id,
             p.img_url     AS product_image,
             p.name        AS product_name,
             c.name        AS company_name,
             u.username    AS user,
             u.email       AS user_email,
             u.role_id     AS user_role_id,
             r.name        AS user_role,
             oi.quantity,
             oi.price,
             SUM(oi.price * oi.quantity)
               OVER (PARTITION BY o.id) AS final_amount
      FROM   orders o
      JOIN   order_items  oi ON o.id          = oi.order_id
      JOIN   products     p  ON oi.product_id = p.id
      JOIN   companies    c  ON p.company_id  = c.id
      JOIN   users        u  ON o.user_id     = u.id
      JOIN   roles        r  ON u.role_id     = r.id
      JOIN   order_status s  ON o.status_id   = s.id
    `;

    // Optional status filter
    if (status) {
      query += ` WHERE s.status = $1`;
    }

    query += ` ORDER BY o.created_at DESC`;

    const ordersResult = await pool.query(query, status ? [status] : []);

    res.json({ orders: ordersResult.rows });
  } catch (err) {
    console.error("Error in getAllOrders:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  try {
    // Check if the status is valid
    const validStatuses = [
      "Pending",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Returned",
      "Refunded",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Update the order status in the database
    const result = await pool.query(
      `UPDATE orders
         SET status_id = (SELECT id FROM order_status WHERE status = $1)
         WHERE id = $2`,
      [status, orderId]
    );

    // Check if the order was updated
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Return a success response
    res.json({ message: "Order status updated successfully" });
  } catch (err) {
    console.error("Error in updateOrderStatus:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const updateShippingDate = async (req, res) => {
  const { orderId, shippingDate } = req.body;

  try {
    // Update the shipping date in the database
    const result = await pool.query(
      `UPDATE orders
       SET shipping_date = $1
       WHERE id = $2`,
      [shippingDate, orderId]
    );

    // Check if the order was updated
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Return a success response
    res.json({ message: "Shipping date updated successfully" });
  } catch (err) {
    console.error("Error in updateShippingDate:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const updateDeliveryDate = async (req, res) => {
  const { orderId, deliveryDate } = req.body;

  try {
    // Update the delivery date in the database
    const result = await pool.query(
      `UPDATE orders
       SET delivery_date = $1
       WHERE id = $2`,
      [deliveryDate, orderId]
    );

    // Check if the order was updated
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Return a success response
    res.json({ message: "Delivery date updated successfully" });
  } catch (err) {
    console.error("Error in updateDeliveryDate:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: [
        "id",
        "name",
        "description",
        "price",
        "stock",
        "category_id",
        "img_url",
        "company_id",
        "is_popular"
      ],
      include: [
        {
          model: Category, // Include the Category model
          attributes: ["name"], // Fetch only the 'name' field from the Category model
        },
        {
          model: Company, // Include the Company model
          attributes: ["name"], // Fetch only the 'name' field from the Company model
        },
      ],
    });

    // Map through the products to create a new array with the category name included
    const productsWithCategoryCompanyName = products.map((product) => {
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        img_url: product.img_url,
        company_id: product.company_id,
        company_name: product.Company ? product.Company.name : null,
        category_id: product.category_id,
        category_name: product.Category ? product.Category.name : null,
        is_popular: product.is_popular // Add category name to product
      };
    });

    res.json({ products: productsWithCategoryCompanyName }); // Return the modified products array
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Unable to fetch products" });
  }
};

// Fetch all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "phone", "created_at"], // Specify the fields to fetch from User
      include: [
        {
          model: Role, // Include the Role model
          attributes: ["name"], // Fetch only the 'name' field from the Role model
        },
      ],
    });

    // Map through the users to create a new array with the role name included
    const usersWithRoleName = users.map((user) => {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
        role_name: user.Role ? user.Role.name : null, // Add role name to user
      };
    });

    res.json({ users: usersWithRoleName }); // Return the modified users array
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Unable to fetch users" });
  }
};


const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({ categories });
  } catch (err) {
    console.error("Error in getAllCategories:", err.message);
    res.status(500).json({ error: "Unable to fetch categories" });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll();
    res.json({ coupons });
  } catch (err) {
    console.error("Error in getAllCoupons:", err.message);
    res.status(500).json({ error: "Unable to fetch coupons" });
  }
};


const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll(); // Assuming Role is a Sequelize model
    res.json({ roles });
  } catch (err) {
    console.error("Error in getAllRoles:", err.message);
    res.status(500).json({ error: "Unable to fetch roles" });
  }
};

const getAllCompany = async (req, res) => {
  try {
    const companies = await Company.findAll();
    res.json({ companies });
  } catch (err) {
    console.error("Error in getAllCompany:", err.message);
    res.status(500).json({ error: "Unable to fetch companies" });
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
  updateShippingDate,
  updateDeliveryDate,
  getAllProducts,
  getAllUsers,
  getAllCategories,
  getAllCoupons,

  getAllRoles,
  getAllCompany
};
