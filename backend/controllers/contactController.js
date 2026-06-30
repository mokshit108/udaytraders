const pool = require('../config/db');

// Handle contact form submission
const submitContactForm = async (req, res) => {
  const { userId, name, email, query } = req.body;
  // Validate input
  if (!name || !email || !query) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Insert contact form data into the database
    const result = await pool.query(
      'INSERT INTO contact_messages (user_id, name, email, query,created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [userId, name, email, query]
    );

    res.status(200).json({ message: 'Contact form submitted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error in submitContactForm:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitContactForm,
};
