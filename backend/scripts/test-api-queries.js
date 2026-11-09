require("dotenv").config();
const { sequelize } = require("../models/index");

(async () => {
  const brandsRes = await sequelize.query(
    `SELECT c.id, c.name, c.slug, c.part, c.cover_url, c.sort_order,
            COUNT(p.id)::int AS product_count
       FROM companies c
       LEFT JOIN products p ON p.company_id = c.id AND p.source = 'catalogue'
       WHERE c.part = :part
       GROUP BY c.id
       ORDER BY c.part, c.sort_order, c.name`,
    { replacements: { part: "A" } }
  );
  console.log("getBrands(part=A):", brandsRes[0].length, "brands, first:", brandsRes[0][0]?.name, brandsRes[0][0]?.product_count);

  const allRes = await sequelize.query(
    `SELECT id, company_id, name, price, stock, img_url, code, section, catalogue_page
       FROM products
      WHERE source = 'catalogue' AND (name ILIKE :q OR code ILIKE :q)
      ORDER BY price ASC, id
      LIMIT :limit OFFSET :offset`,
    { replacements: { q: "%cock%", limit: 5, offset: 0 } }
  );
  console.log("all-products search 'cock':", allRes[0].length, "rows, cheapest:", allRes[0][0]?.name, allRes[0][0]?.price);

  const brandRes = await sequelize.query(`SELECT id FROM companies WHERE slug = :slug LIMIT 1`, {
    replacements: { slug: "seiko" },
  });
  const pagesRes = await sequelize.query(
    `SELECT id, page_no FROM catalogue_pages WHERE company_id = :id ORDER BY page_no NULLS LAST`,
    { replacements: { id: brandRes[0][0].id } }
  );
  console.log("seiko pages:", pagesRes[0].map((p) => p.page_no).join(","));

  await sequelize.close();
  process.exit(0);
})();
