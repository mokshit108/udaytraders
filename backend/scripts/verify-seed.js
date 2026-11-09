const pool = require("../config/db");
(async () => {
  const total = await pool.query(
    `SELECT COUNT(*)::int AS n FROM products WHERE source = 'catalogue'`
  );
  const dupes = await pool.query(
    `SELECT company_id, code, name, price, COUNT(*)::int AS n
       FROM products WHERE source = 'catalogue'
      GROUP BY company_id, code, name, price
      HAVING COUNT(*) > 1`
  );
  const pages = await pool.query(
    `SELECT COUNT(*)::int AS n, COUNT(DISTINCT (company_id, page_no))::int AS distinct_pairs FROM catalogue_pages`
  );
  const withImg = await pool.query(
    `SELECT COUNT(*)::int AS n FROM products WHERE source = 'catalogue' AND img_url IS NOT NULL`
  );
  console.log("catalogue products:", total.rows[0].n);
  console.log("duplicate rows:", dupes.rows.length);
  console.log("catalogue pages:", pages.rows[0].n, "| distinct (company,page):", pages.rows[0].distinct_pairs);
  console.log("products with image:", withImg.rows[0].n);
  await pool.end();
})();
