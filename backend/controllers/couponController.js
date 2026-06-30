const pool = require('../config/db');

// Validate Coupon
const validateCoupon = async (req, res) => {
  const { code } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM coupons WHERE code = $1 AND expiration_date > CURRENT_DATE',
      [code]
    );

    if (result.rows.length > 0) {
      const coupon = result.rows[0];
      res.json({
        valid: true,
        discount_percentage: coupon.discount,
      });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    console.error('Error validating coupon:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  validateCoupon,
};
