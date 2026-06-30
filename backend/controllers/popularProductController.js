// controllers/productController.js
const pool = require('../config/db'); // Import your database connection

// Fetch popular products based on the is_popular column
const getPopularProducts = async (req, res) => {
  const isPopular = 1;

  try {
    const query = `
      SELECT * FROM products
      WHERE is_popular = $1
    `;
    const values = [isPopular];
    const result = await pool.query(query, values);
    res.json(result);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getPopularProducts,
};
