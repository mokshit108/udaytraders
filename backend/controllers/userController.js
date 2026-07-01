const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const { User } = require('../models');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // Backend code (server.js)
// const XLSX = require('xlsx');
// const multer = require('multer');


// // Multer configuration with improved security
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//     files: 1
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedMimes = [
//       'application/vnd.ms-excel',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       'text/csv'
//     ];
//     if (allowedMimes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Only Excel (.xls, .xlsx) or CSV files are allowed.'));
//     }
//   }
// }).single('file');

// // Validation functions
// const validateUserData = (userData) => {
//   const errors = [];
  
//   if (!userData.username?.trim()) errors.push('Username is required');
//   if (!userData.email?.trim()) errors.push('Email is required');
//   if (!userData.phone?.trim()) errors.push('Phone name is required');
  
//   // Email format validation
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(userData.email)) {
//     errors.push('Invalid email format');
//   }

//   // Username validation
//   if (userData.username && userData.username.length < 3) {
//     errors.push('Username must be at least 3 characters long');
//   }

//   return errors;
// };

// // Import users from Excel
// // Import users from Excel
// const importExcelUsers = async (req, res) => {
//   let client;
  
//   try {
//     await new Promise((resolve, reject) => {
//       upload(req, res, (err) => {
//         if (err) reject(err);
//         else resolve();
//       });
//     });

//     if (!req.file) {
//       return res.status(400).json({ 
//         status: 'error',
//         message: 'No file uploaded' 
//       });
//     }

//     // Read and validate Excel file
//     const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
//     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//     const data = XLSX.utils.sheet_to_json(worksheet);

//     if (data.length === 0) {
//       return res.status(400).json({ 
//         status: 'error',
//         message: 'Excel file is empty' 
//       });
//     }

//     // Validate required columns
//     const requiredColumns = ['username', 'email', 'phone'];
//     const firstRow = data[0];
//     const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
//     if (missingColumns.length > 0) {
//       return res.status(400).json({
//         status: 'error',
//         message: `Missing required columns: ${missingColumns.join(', ')}`
//       });
//     }

//     client = await pool.connect();
//     await client.query('BEGIN');

//     const results = [];
//     const errors = [];

//     // Process each row
//     for (const [index, row] of data.entries()) {
//       try {
//         // Validate row data
//         const validationErrors = validateUserData(row);
//         if (validationErrors.length > 0) {
//           throw new Error(validationErrors.join(', '));
//         }

//         // Check for existing user
//         const existingUser = await client.query(
//           'SELECT id FROM users WHERE email = $1',
//           [row.email.toLowerCase()]
//         );

//         if (existingUser.rows.length > 0) {
//           throw new Error(`User already exists with email: ${row.email}`);
//         }

//         // Get role_id (assuming default role is 2 for regular users)
//         const roleId = row.role_id || 2;

//         // Generate default password
//         const defaultPassword = Math.random().toString(36).slice(-8);
//         const hashedPassword = await bcrypt.hash(defaultPassword, 10);

//         // Insert user
//         const insertUserQuery = `
//           INSERT INTO users (
//             username,
//             email,
//             phone,
//             password,
//             role_id,
//             created_at
//           ) VALUES ($1, $2, $3, $4, $5, NOW())
//           RETURNING id, username, email, phone, role_id
//         `;

//         const newUser = await client.query(insertUserQuery, [
//           row.username.trim(),
//           row.email.toLowerCase().trim(),
//           row.phone?.trim() || null,
//           hashedPassword,
//           roleId
//         ]);

//         // Add the created user to results array
//         results.push({
//           ...newUser.rows[0],
//           defaultPassword // Include the default password in the response
//         });

//       } catch (error) {
//         errors.push({
//           row: index + 1,
//           email: row.email || 'N/A',
//           error: error.message
//         });
//       }
//     }

//     // Handle results
//     if (errors.length === data.length) {
//       // If all rows failed, rollback and return error
//       await client.query('ROLLBACK');
//       return res.status(400).json({
//         status: 'error',
//         message: 'No users could be imported',
//         errors,
//         successCount: 0
//       });
//     }

//     if (errors.length > 0) {
//       // If some rows succeeded, commit those and return partial success
//       await client.query('COMMIT');
//       return res.status(207).json({
//         status: 'partial_success',
//         message: 'Some users were imported with errors',
//         errors,
//         successCount: results.length,
//         users: results
//       });
//     }

//     // All successful
//     await client.query('COMMIT');
//     return res.status(200).json({
//       status: 'success',
//       message: 'All users imported successfully',
//       successCount: results.length,
//       users: results
//     });

//   } catch (error) {
//     if (client) await client.query('ROLLBACK');
//     console.error('Error in importExcelUsers:', error);
//     return res.status(500).json({ 
//       status: 'error',
//       message: 'Server error while importing users',
//       error: error.message 
//     });
//   } finally {
//     if (client) client.release();
//   }
// };

const registerUser = async (req, res) => {
  const { username, email, phoneNumber, password, specialCode } = req.body;
  let role_id = 2; // customer

  const SPECIAL_CODE = process.env.SPECIAL_CODE || "UDAY04";
  if (specialCode !== SPECIAL_CODE) {
    return res.status(403).json({ error: "Invalid special code for registration." });
  }

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Regular user registration
    const newUser = await pool.query(
      "INSERT INTO users (username, email, phone, password, role_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
      [username, email, phoneNumber, hashedPassword, role_id]
    );

    const accessToken = jwt.sign(
      { id: newUser.rows[0].id, username: newUser.rows[0].username, role_id: newUser.rows[0].role_id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    req.session.accessToken = accessToken;

    return res.status(201).json({ accessToken, user: newUser.rows[0] });
  } catch (err) {
    console.error("Error in registerUser:", err.message);
    res.status(400).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.rows[0].google_id && !user.rows[0].password) {
      return res.status(400).json({ 
        error: "This email was registered using Google. Please use 'Sign in with Google' button." 
      });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const accessToken = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username, role_id: user.rows[0].role_id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    req.session.accessToken = accessToken;

    res.json({ accessToken, user: user.rows[0] });
  } catch (err) {
    console.error("Error in loginUser:", err.message);
    res.status(400).json({ error: err.message });
  }
};

const handleGoogleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email } = payload;

    // Check if user exists in database
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1", 
      [email]
    );

    // If user doesn't exist, return error asking to signup
    if (userResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'User not registered. Please sign up first.' 
      });
    }

    // User exists, proceed with login
    const user = userResult.rows[0];
    
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role_id: user.role_id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ accessToken, user });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
};

const registerPhoneNumber = async (req, res) => {
  const { phoneNumber, id } = req.body;
  const userId = id; // Assuming the user ID is stored in the request body

  try {
    // Fetch the user by userId using the pool.query method
    const userQuery = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's phone number
    const updateQuery = await pool.query(
      "UPDATE users SET phone = $1 WHERE id = $2 RETURNING *",
      [phoneNumber, userId]
    );

    res.status(200).json({ message: "Phone number registered successfully!", user: updateQuery.rows[0] });
  } catch (error) {
    console.error("Error updating phone number:", error);
    res.status(500).json({ error: "Failed to register phone number" });
  }
};

const handleGoogleSignup = async (req, res) => {
  const { token, specialCode, phoneNumber } = req.body;
  let role_id = 2; // customer

  const SPECIAL_CODE = process.env.SPECIAL_CODE || "UDAY04";
  if (specialCode !== SPECIAL_CODE) {
    return res.status(403).json({ error: "Invalid special code for registration." });
  }

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Check if user already exists
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR google_id = $2",
      [email, googleId]
    );

    if (userResult.rows.length > 0) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Begin transaction
    const dbClient = await pool.connect();
    try {
      await dbClient.query('BEGIN');

      // Insert new user
      const insertUserQuery = `
        INSERT INTO users (google_id, email, username, phone, role_id, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *;
      `;
      const newUser = await dbClient.query(insertUserQuery, [
        googleId,
        email,
        name,
        phoneNumber || null,
        role_id
      ]);



      await dbClient.query('COMMIT');

      // Generate JWT token
      const accessToken = jwt.sign(
        { 
          id: newUser.rows[0].id, 
          username: newUser.rows[0].username, 
          role_id: newUser.rows[0].role_id 
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );

      res.status(201).json({ 
        accessToken, 
        user: newUser.rows[0],
        message: "Google signup successful" 
      });
    } catch (err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
  } catch (error) {
    console.error('Google signup error:', error.message);
    res.status(500).json({ error: 'Failed to sign up with Google' });
  }
}

module.exports = {
  registerUser,
  loginUser,
  handleGoogleLogin,
  handleGoogleSignup,
  registerPhoneNumber
};