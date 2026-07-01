const pool = require('./config/db');
async function check() {
  try {
    const res = await pool.query("SELECT * FROM users");
    console.log("Users:", res.rows);
    process.exit(0);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}
check();
