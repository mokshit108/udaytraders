import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const AddProductModal = ({ isOpen, onClose, onProductAdded, categories, companies }) => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState();
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productStock, setProductStock] = useState(false); // boolean for stock status
  const [productCompany, setProductCompany] = useState("");
  const [productIsPopular, setProductIsPopular] = useState(false); // boolean for is_popular
  const [error, setError] = useState("");

  const tableName = "Product"; // Assuming you have a product endpoint

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !productName ||
      !productPrice ||
      !productCategory ||
      !productImageUrl ||
      !productCompany
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${apiUrl}/profile/admin/crud/new/${tableName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: productName,
            price: productPrice,
            category_name: productCategory,
            img_url: productImageUrl,
            stock: productStock ? 1 : 0, // Convert to 1 or 0
            company_name: productCompany,
            is_popular: productIsPopular ? 1 : 0, // Convert to 1 or 0
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Clear form fields
      setProductName("");
      setProductPrice("");
      setProductCategory("");
      setProductImageUrl("");
      setProductStock(false);
      setProductCompany("");
      setProductIsPopular(false);
      onProductAdded(); // Call handler to refresh product list
      onClose(); // Close modal after submission
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product. Please try again.");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 mt-16">
          <div
            className="bg-black opacity-50 absolute inset-0"
            onClick={onClose}
          ></div>
          <div className="bg-white p-6 rounded shadow-lg z-10 relative w-full max-w-md max-h-[90vh] overflow-hidden">
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3 className="text-lg font-bold mb-4">Add New Product</h3>
            {error && <p className="text-red-500">{error}</p>}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto max-h-[80vh]"
            >
              {/* Image URL */}
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="productImageUrl"
                >
                  Image URL
                </label>
                <input
                  type="text"
                  id="productImageUrl"
                  value={productImageUrl}
                  onChange={(e) => setProductImageUrl(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  required
                />
              </div>

              {/* Product Name */}
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="productName"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  required
                />
              </div>

              {/* Price */}
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="productPrice"
                >
                  Price
                </label>
                <input
                  type="number"
                  id="productPrice"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="productCategory"
                >
                  Category
                </label>
                <select
                  id="productCategory"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company */}
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="productCompany"
                >
                  Company
                </label>
                <select
                  id="productCompany"
                  value={productCompany}
                  onChange={(e) => setProductCompany(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  required
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.name}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div className="mb-4">
                <label className="inline-flex items-center text-gray-700 mb-1">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={productStock}
                    onChange={(e) => setProductStock(e.target.checked)}
                  />
                  <span className="ml-2">In Stock</span>
                </label>
              </div>

              {/* Is Popular */}
              <div className="mb-4">
                <label className="inline-flex items-center text-gray-700 mb-1">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={productIsPopular}
                    onChange={(e) => setProductIsPopular(e.target.checked)}
                  />
                  <span className="ml-2">Is Popular</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-sky-950 text-white px-4 py-2 rounded"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProductModal;
