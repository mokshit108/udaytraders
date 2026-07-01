const bcrypt = require('bcryptjs');
const pool = require('./config/db');
async function run() {
  try {
    const hashedPassword = await bcrypt.hash('adminuday1977', 10);
    const existingAdmin = await pool.query("SELECT * FROM users WHERE username = 'adminuday'");
    if (existingAdmin.rows.length > 0) {
      console.log("Updated existing adminuday user");
    } else {
      console.log("Created new adminuday user");
    }
    process.exit(0);
  } catch (e) {
    console.error("ERROR:", e.message);
    process.exit(1);
  }
}
run();
