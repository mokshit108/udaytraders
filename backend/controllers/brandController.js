// controllers/brandController.js
// Public catalogue endpoints + admin-only catalogue management.
const fs = require("fs");
const path = require("path");
const { sequelize } = require("../models/index");
const cloudinary = require("../utils/cloudinary");
const { Readable } = require("stream");

const transform = (url, width = 600) =>
  url && url.includes("/upload/") ? url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`) : url;

const publicBrandFields = `id, name, slug, part, cover_url, sort_order`;

const getBrands = async (req, res) => {
  try {
    const { part } = req.query;
    const where = part ? `WHERE c.part = :part` : "";
    const result = await sequelize.query(
      `SELECT c.id, c.name, c.slug, c.part, c.cover_url, c.sort_order,
              COUNT(p.id)::int AS product_count
         FROM companies c
         LEFT JOIN products p ON p.company_id = c.id AND p.source = 'catalogue'
         ${where}
         GROUP BY c.id
         ORDER BY c.part, c.sort_order, c.name`,
      { replacements: part ? { part } : {} }
    );
    const brands = result[0].map((b) => ({ ...b, cover_url: transform(b.cover_url, 400) }));
    res.json({ brands });
  } catch (err) {
    console.error("Error fetching brands:", err.message);
    res.status(500).send("Server error");
  }
};

const getBrand = async (req, res) => {
  try {
    const { slug } = req.params;
    const brandRes = await sequelize.query(
      `SELECT ${publicBrandFields} FROM companies WHERE slug = :slug LIMIT 1`,
      { replacements: { slug } }
    );
    if (brandRes[0].length === 0) return res.status(404).json({ error: "Brand not found" });

    const brand = brandRes[0][0];
    const pagesRes = await sequelize.query(
      `SELECT id, page_no, image_url, public_id
         FROM catalogue_pages
        WHERE company_id = :id
        ORDER BY page_no NULLS LAST`,
      { replacements: { id: brand.id } }
    );
    const pages = pagesRes[0].map((p) => ({
      ...p,
      image_url: transform(p.image_url, 600),
      full_url: p.image_url.includes("/upload/")
        ? p.image_url.replace("/upload/", "/upload/f_auto,q_auto/")
        : p.image_url,
    }));
    res.json({ brand, pages });
  } catch (err) {
    console.error("Error fetching brand:", err.message);
    res.status(500).send("Server error");
  }
};

const getBrandProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const { section, q, minPrice, maxPrice } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(500, parseInt(req.query.limit, 10) || 50);
    const offset = (page - 1) * limit;
    const orderBy =
      { price_asc: "price ASC, id", price_desc: "price DESC, id" }[req.query.sort] ||
      "catalogue_page NULLS LAST, id";

    const replacements = { limit, offset };
    const conditions = [`source = 'catalogue'`];

    if (slug !== "all") {
      const brandRes = await sequelize.query(
        `SELECT id FROM companies WHERE slug = :slug LIMIT 1`,
        { replacements: { slug } }
      );
      if (brandRes[0].length === 0) return res.status(404).json({ error: "Brand not found" });
      conditions.push(`company_id = :companyId`);
      replacements.companyId = brandRes[0][0].id;
    }

    if (section) {
      conditions.push(`section = :section`);
      replacements.section = section;
    }
    if (q) {
      conditions.push(`(name ILIKE :q OR code ILIKE :q)`);
      replacements.q = `%${q}%`;
    }
    if (minPrice) {
      conditions.push(`price >= :minPrice`);
      replacements.minPrice = minPrice;
    }
    if (maxPrice) {
      conditions.push(`price <= :maxPrice`);
      replacements.maxPrice = maxPrice;
    }
    const where = `WHERE ${conditions.join(" AND ")}`;

    const countRes = await sequelize.query(
      `SELECT COUNT(*)::int AS total FROM products ${where}`,
      { replacements }
    );
    const productsRes = await sequelize.query(
      `SELECT id, company_id, name, price, stock, img_url, code, section, catalogue_page
         FROM products ${where}
        ORDER BY ${orderBy}
        LIMIT :limit OFFSET :offset`,
      { replacements }
    );

    const total = countRes[0][0].total;
    res.json({
      products: productsRes[0],
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    console.error("Error fetching brand products:", err.message);
    res.status(500).send("Server error");
  }
};

const findBrandBySlug = async (slug, transaction) => {
  const res = await sequelize.query(`SELECT id, slug FROM companies WHERE slug = :slug LIMIT 1`, {
    replacements: { slug },
    transaction,
  });
  return res[0][0] || null;
};

const addCataloguePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const brand = await findBrandBySlug(slug);
    if (!brand) return res.status(404).json({ error: "Brand not found" });
    if (!req.file) return res.status(400).json({ error: "No image file provided." });

    const pageNo = req.body.page_no ? parseInt(req.body.page_no, 10) : null;

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `uday-traders/catalogue/${slug}` },
        (err, r) => (err ? reject(err) : resolve(r))
      );
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(stream);
    });

    const inserted = await sequelize.query(
      `INSERT INTO catalogue_pages (company_id, page_no, image_url, public_id)
       VALUES (:companyId, :pageNo, :url, :publicId)
       RETURNING id, page_no, image_url, public_id`,
      {
        replacements: {
          companyId: brand.id,
          pageNo,
          url: result.secure_url,
          publicId: result.public_id,
        },
      }
    );
    res.status(201).json({ page: inserted[0][0] });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "A page with this number already exists for this brand." });
    }
    console.error("Error adding catalogue page:", err.message);
    res.status(500).send("Server error");
  }
};

const deleteCataloguePage = async (req, res) => {
  try {
    const { slug, pageId } = req.params;
    const brand = await findBrandBySlug(slug);
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    const found = await sequelize.query(
      `SELECT id, public_id FROM catalogue_pages WHERE id = :pageId AND company_id = :companyId`,
      { replacements: { pageId, companyId: brand.id } }
    );
    if (found[0].length === 0) return res.status(404).json({ error: "Page not found" });

    await sequelize.query(`DELETE FROM catalogue_pages WHERE id = :pageId`, {
      replacements: { pageId },
    });
    if (found[0][0].public_id) {
      await cloudinary.uploader.destroy(found[0][0].public_id).catch(() => {});
    }
    res.json({ message: "Page deleted" });
  } catch (err) {
    console.error("Error deleting catalogue page:", err.message);
    res.status(500).send("Server error");
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, name } = req.body;
    const sets = [];
    const replacements = { id };
    if (price !== undefined) {
      sets.push(`price = :price`);
      replacements.price = price;
    }
    if (name !== undefined) {
      sets.push(`name = :name`);
      replacements.name = name;
    }
    if (sets.length === 0) return res.status(400).json({ error: "Nothing to update" });

    const updated = await sequelize.query(
      `UPDATE products SET ${sets.join(", ")} WHERE id = :id RETURNING id, name, price`,
      { replacements }
    );
    if (updated[0].length === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ product: updated[0][0] });
  } catch (err) {
    console.error("Error updating product:", err.message);
    res.status(500).send("Server error");
  }
};

const updateProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: "No image file provided." });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "uday-traders/products" },
        (err, r) => (err ? reject(err) : resolve(r))
      );
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(stream);
    });

    const updated = await sequelize.query(
      `UPDATE products SET img_url = :url WHERE id = :id RETURNING id, name, price, img_url`,
      { replacements: { id, url: result.secure_url } }
    );
    if (updated[0].length === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ product: updated[0][0] });
  } catch (err) {
    console.error("Error updating product image:", err.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  getBrands,
  getBrand,
  getBrandProducts,
  addCataloguePage,
  deleteCataloguePage,
  updateProduct,
  updateProductImage,
};
