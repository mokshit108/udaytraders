const pool = require('../config/db');

// Get all products and categories
const getAllProductsDetails = async (req, res) => {
  try {
    // Fetch products and categories
    const productsResult = await pool.query('SELECT * FROM products');
    const categoriesResult = await pool.query('SELECT * FROM categories');
    const companyResult = await pool.query('SELECT * FROM companies');

    // Send combined response
    res.json({
      products: productsResult.rows,
      categories: categoriesResult.rows,
      companies: companyResult.rows
    });
  } catch (err) {
    console.error('Error fetching products and categories:', err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllProductsDetails,
};