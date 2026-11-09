// scripts/add-columns.js
// Idempotent schema migration for the catalogue import.
// Safe to run repeatedly. Rollback with: node scripts/add-columns.js --rollback
//
// NOTE: sequelize.sync() cannot add columns to existing tables, so this script
// does it with ALTER TABLE ... ADD COLUMN IF NOT EXISTS and matching indexes.
const { sequelize } = require("../models/index");

const UP_STATEMENTS = [
  `ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug VARCHAR(255)`,
  `ALTER TABLE companies ADD COLUMN IF NOT EXISTS part CHAR(1)`,
  `ALTER TABLE companies ADD COLUMN IF NOT EXISTS cover_url TEXT`,
  `ALTER TABLE companies ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS code VARCHAR(100)`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS section VARCHAR(255)`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_label VARCHAR(255)`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS catalogue_page INTEGER`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS source VARCHAR(50)`,
  `CREATE TABLE IF NOT EXISTS catalogue_pages (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      page_no INTEGER,
      image_url TEXT NOT NULL,
      public_id VARCHAR(255)
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS companies_slug_unique ON companies (slug)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS catalogue_pages_company_page_unique ON catalogue_pages (company_id, page_no)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS products_catalogue_unique
      ON products (company_id, COALESCE(code, ''), name, price)`,
  `CREATE INDEX IF NOT EXISTS products_company_id_idx ON products (company_id)`,
  `CREATE INDEX IF NOT EXISTS products_code_idx ON products (code)`,
  `CREATE INDEX IF NOT EXISTS products_source_idx ON products (source)`,
  `CREATE INDEX IF NOT EXISTS catalogue_pages_company_id_idx ON catalogue_pages (company_id)`,
];

const TRGM_STATEMENTS = [
  `CREATE EXTENSION IF NOT EXISTS pg_trgm`,
  `CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON products USING gin (name gin_trgm_ops)`,
  `CREATE INDEX IF NOT EXISTS products_code_trgm_idx ON products USING gin (code gin_trgm_ops)`,
];

const DOWN_STATEMENTS = [
  `DROP INDEX IF EXISTS products_name_trgm_idx`,
  `DROP INDEX IF EXISTS products_code_trgm_idx`,
  `DROP EXTENSION IF EXISTS pg_trgm`,
  `DROP INDEX IF EXISTS products_source_idx`,
  `DROP INDEX IF EXISTS products_code_idx`,
  `DROP INDEX IF EXISTS products_company_id_idx`,
  `DROP INDEX IF EXISTS products_catalogue_unique`,
  `DROP INDEX IF EXISTS catalogue_pages_company_id_idx`,
  `DROP INDEX IF EXISTS catalogue_pages_company_page_unique`,
  `DROP INDEX IF EXISTS companies_slug_unique`,
  `DROP TABLE IF EXISTS catalogue_pages`,
  `ALTER TABLE products DROP COLUMN IF EXISTS source`,
  `ALTER TABLE products DROP COLUMN IF EXISTS catalogue_page`,
  `ALTER TABLE products DROP COLUMN IF EXISTS variant_label`,
  `ALTER TABLE products DROP COLUMN IF EXISTS section`,
  `ALTER TABLE products DROP COLUMN IF EXISTS code`,
  `ALTER TABLE companies DROP COLUMN IF EXISTS sort_order`,
  `ALTER TABLE companies DROP COLUMN IF EXISTS cover_url`,
  `ALTER TABLE companies DROP COLUMN IF EXISTS part`,
  `ALTER TABLE companies DROP COLUMN IF EXISTS slug`,
];

const run = async () => {
  const rollback = process.argv.includes("--rollback");
  const statements = rollback ? DOWN_STATEMENTS : UP_STATEMENTS;

  try {
    await sequelize.authenticate();
    for (const sql of statements) {
      await sequelize.query(sql);
      console.log(`OK: ${sql.split("\n")[0].slice(0, 90)}`);
    }

    if (!rollback) {
      try {
        for (const sql of TRGM_STATEMENTS) {
          await sequelize.query(sql);
          console.log(`OK: ${sql.split("\n")[0].slice(0, 90)}`);
        }
      } catch (err) {
        console.warn(`WARN: trigram indexes skipped (${err.message})`);
      }
    }

    console.log(rollback ? "Rollback complete." : "Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
};

run();
