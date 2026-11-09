// scripts/seed.js
// Seeds companies (brands), catalogue_pages and products from the scraped
// catalogue in scripts/data (products.json), using URLs from scripts/upload-map.json.
//
// - one transaction, rolled back if any per-brand count check fails
// - idempotent: safe to run repeatedly (upserts on the
//   (company_id, COALESCE(code,''), name, price) unique index)
// - products get stock=10, is_popular=0, source='catalogue'
// - batched multi-row inserts (remote DB round-trips are slow)
//
// Run from backend/:  node scripts/seed.js
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const SOURCE_DIR = path.resolve(__dirname, "data");
const MAP_FILE = path.resolve(__dirname, "upload-map.json");
const STOCK_FOR_CATALOGUE = 10;
const CHUNK_SIZE = 50;

const slugify = (text, limit = 70) =>
  String(text || "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .slice(0, limit)
    .replace(/-+$/, "");

const mapUrl = (map, relPath) => {
  if (!relPath) return null;
  const key = relPath.split(path.sep).join("/");
  return map[key] ? map[key].url : null;
};

const loadMap = () => {
  if (!fs.existsSync(MAP_FILE)) {
    console.error(`upload-map.json not found at ${MAP_FILE}. Run scripts/upload-images.js first.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(MAP_FILE, "utf-8"));
};

const loadRows = () => {
  const rows = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, "products.json"), "utf-8"));
  const seen = new Set();
  const deduped = [];
  for (const row of rows) {
    const key = [row.part, row.brand, row.code, row.name, row.price].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }
  return { rows: deduped, dropped: rows.length - deduped.length };
};

const seed = async () => {
  const map = loadMap();
  const { rows, dropped } = loadRows();
  if (dropped > 0) console.log(`Dropping ${dropped} exact duplicate rows found in products.json`);

  const brandsInOrder = [];
  const brandByKey = new Map();
  for (const row of rows) {
    const key = `${row.part}|${row.brand}`;
    if (!brandByKey.has(key)) {
      brandByKey.set(key, { part: row.part, name: row.brand, slug: slugify(row.brand) });
      brandsInOrder.push(brandByKey.get(key));
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let sortOrder = 0;
    for (const brand of brandsInOrder) {
      const coverKey = `catalogue/part-${brand.part.toLowerCase()}/${brand.slug}/${brand.slug}_cover.webp`;
      const coverUrl = map[coverKey] ? map[coverKey].url : null;

      const found = await client.query(
        `SELECT id FROM companies WHERE lower(name) = lower($1) LIMIT 1`,
        [brand.name]
      );

      if (found.rows.length > 0) {
        brand.id = found.rows[0].id;
        await client.query(
          `UPDATE companies
             SET slug = COALESCE(slug, $2),
                 part = COALESCE(part, $3),
                 cover_url = COALESCE(cover_url, $4),
                 sort_order = $5
           WHERE id = $1`,
          [brand.id, brand.slug, brand.part, coverUrl, sortOrder]
        );
      } else {
        const inserted = await client.query(
          `INSERT INTO companies (name, slug, part, cover_url, sort_order)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [brand.name, brand.slug, brand.part, coverUrl, sortOrder]
        );
        brand.id = inserted.rows[0].id;
      }
      sortOrder++;
    }

    for (const brand of brandsInOrder) {
      const catDir = path.join(SOURCE_DIR, "catalogue", `part-${brand.part.toLowerCase()}`, brand.slug);
      if (!fs.existsSync(catDir)) continue;

      await client.query(`DELETE FROM catalogue_pages WHERE company_id = $1`, [brand.id]);

      const files = fs.readdirSync(catDir).filter((f) => f.endsWith(".webp"));
      const pageRows = [];
      for (const file of files) {
        let pageNo = null;
        const numbered = file.match(new RegExp(`^${brand.slug}_page-(\\d+)\\.webp$`));
        if (numbered) pageNo = parseInt(numbered[1], 10);
        else if (file === `${brand.slug}_cover-page.webp`) pageNo = 1;
        else continue;

        const entry = map[`catalogue/part-${brand.part.toLowerCase()}/${brand.slug}/${file}`];
        if (!entry) {
          throw new Error(`catalogue page missing from upload-map.json: ${file} (run upload-images.js)`);
        }
        pageRows.push({ pageNo, url: entry.url, publicId: entry.public_id });
      }

      for (let i = 0; i < pageRows.length; i += CHUNK_SIZE) {
        const chunk = pageRows.slice(i, i + CHUNK_SIZE);
        await client.query(
          `INSERT INTO catalogue_pages (company_id, page_no, image_url, public_id)
           VALUES ${chunk.map((_, idx) => `($${idx * 4 + 1}, $${idx * 4 + 2}, $${idx * 4 + 3}, $${idx * 4 + 4})`).join(", ")}`,
          chunk.flatMap((p) => [brand.id, p.pageNo, p.url, p.publicId])
        );
      }
    }

    const productValues = rows.map((row) => ({
      companyId: brandByKey.get(`${row.part}|${row.brand}`).id,
      name: row.name,
      price: row.price,
      imgUrl: mapUrl(map, row.image_file),
      code: row.code || "",
      section: row.section || null,
      cataloguePage: row.catalogue_page ? parseInt(row.catalogue_page, 10) : null,
    }));

    for (let i = 0; i < productValues.length; i += CHUNK_SIZE) {
      const chunk = productValues.slice(i, i + CHUNK_SIZE);
      const tuples = [];
      const params = [];
      chunk.forEach((p, idx) => {
        const b = idx * 8;
        tuples.push(
          `($${b + 1}, $${b + 2}, $${b + 3}, 0, $${b + 4}, $${b + 5}, NULLIF($${b + 6}, ''), $${b + 7}, $${b + 8}, 'catalogue')`
        );
        params.push(p.name, p.price, STOCK_FOR_CATALOGUE, p.companyId, p.imgUrl, p.code, p.section, p.cataloguePage);
      });
      await client.query(
        `INSERT INTO products
             (name, price, stock, is_popular, company_id, img_url, code, section, catalogue_page, source)
         VALUES ${tuples.join(", ")}
         ON CONFLICT (company_id, (COALESCE(code, '')), name, price)
         DO UPDATE SET
             price = EXCLUDED.price,
             img_url = EXCLUDED.img_url,
             section = EXCLUDED.section,
             catalogue_page = EXCLUDED.catalogue_page,
             source = 'catalogue'`,
        params
      );
      console.log(`products: ${Math.min(i + CHUNK_SIZE, productValues.length)}/${productValues.length}`);
    }

    const expected = new Map();
    for (const row of rows) {
      const key = `${row.part}|${row.brand}`;
      expected.set(key, (expected.get(key) || 0) + 1);
    }

    const pagesRes = await client.query(
      `SELECT company_id, COUNT(*)::int AS n FROM catalogue_pages GROUP BY company_id`
    );
    const pagesCount = new Map(pagesRes.rows.map((r) => [r.company_id, r.n]));

    let allOk = true;
    console.log("\nPer-brand verification (expected vs actual products / catalogue pages):");
    for (const brand of brandsInOrder) {
      const actualRes = await client.query(
        `SELECT COUNT(*)::int AS n FROM products WHERE company_id = $1 AND source = 'catalogue'`,
        [brand.id]
      );
      const actual = actualRes.rows[0].n;
      const want = expected.get(`${brand.part}|${brand.name}`);
      const pages = pagesCount.get(brand.id) || 0;
      const ok = actual === want;
      if (!ok) allOk = false;
      console.log(
        `  Part ${brand.part}  ${brand.name.padEnd(30)} ${String(actual).padStart(4)}/${want}${ok ? "" : " MISMATCH"}  pages: ${pages}`
      );
    }

    if (!allOk) throw new Error("Per-brand product counts do not match products.json — rolling back");

    await client.query("COMMIT");
    console.log(`\nSeed committed: ${rows.length} products, ${brandsInOrder.length} brands.`);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Seed FAILED, transaction rolled back:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
  }
};

seed();
