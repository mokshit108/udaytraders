// /controllers/otpController.js
const { setOtp, getOtp, deleteOtp } = require('../utils/otpStore');
const pool = require('../config/db');
const { sendEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');
// Request password reset and send OTP
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    // Generate OTP
    const OTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in an in-memory store
    setOtp(email, OTP);

    // Send OTP to user's email
    await sendEmail({ recipient_email: email, OTP });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Error in requestPasswordReset:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Verify OTP and reset password
const verifyOtpAndResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const storedOtp = getOtp(email);

    if (!storedOtp) {
      return res.status(400).json({ error: "No OTP request found for this email" });
    }

    const { otp: storedOtpValue, expiresAt } = storedOtp;

    // Check if OTP is expired
    if (new Date() > new Date(expiresAt)) {
      deleteOtp(email); // Clean up expired OTP
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Verify OTP
    if (storedOtpValue !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

     // Retrieve the current hashed password from the database
     const userResult = await pool.query("SELECT password FROM users WHERE email = $1", [email]);
     const currentHashedPassword = userResult.rows[0].password;
 
     // Compare the new password with the current password
     const isMatch = await bcrypt.compare(newPassword, currentHashedPassword);
     if (isMatch) {
       return res.status(400).json({ error: "New password cannot be the same as the old password." });
     }
     

    // Hash new password and update the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);

    // Clean up OTP after successful reset
    deleteOtp(email);

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Error in verifyOtpAndResetPassword:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { requestPasswordReset, verifyOtpAndResetPassword };
