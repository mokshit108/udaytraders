const express = require("express");
const upload = require("../middlewares/upload");
const authenticateToken = require("../middlewares/authMiddleware");
const {
  getBrands,
  getBrand,
  getBrandProducts,
  addCataloguePage,
  deleteCataloguePage,
  updateProduct,
  updateProductImage,
} = require("../controllers/brandController");

const router = express.Router();

// Public catalogue endpoints
router.get("/", getBrands);
router.get("/:slug", getBrand);
router.get("/:slug/products", getBrandProducts);

// Admin-only catalogue management
router.post("/:slug/pages", authenticateToken, upload.single("image"), addCataloguePage);
router.delete("/:slug/pages/:pageId", authenticateToken, deleteCataloguePage);
router.put("/products/:id", authenticateToken, updateProduct);
router.post("/products/:id/image", authenticateToken, upload.single("image"), updateProductImage);

module.exports = router;
