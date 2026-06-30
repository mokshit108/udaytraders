const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
PGPASSWORD = decodeURIComponent(PGPASSWORD);

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER, // Corrected from 'username' to 'user'
  password: PGPASSWORD,
  port: 5432,
  options: `project=${ENDPOINT_ID}`,
  ssl: {
    rejectUnauthorized: false,
  },
  // user: process.env.DB_USER,
  // host: process.env.DB_HOST,
  // database: process.env.DB_NAME,
  // password: process.env.DB_PASSWORD,
  // port: process.env.DB_PORT,
});

module.exports = pool;