import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTrash,
  faEdit,
  faPlus,
  faDownload,
  faUpload,
  faExclamationTriangle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useRef } from "react";
import AddProductModal from "./modal/AddProductModal"; // Import the modal component
import EditProductModal from "./modal/EditProductModal";
import { useExcel } from "../../../hooks/useExcel";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [category, setCategory] = useState([]);
  const [company, setCompany] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importInfo, setImportInfo] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const fileInputRef = useRef(null);

  const { downloadData, importExcelData } = useExcel();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const tableName = "Product"; // Set the table name

  const databasetableName = "products";

   // Function to show alert
   const showAlert = (type, message) => {
    setAlertInfo({ type, message });
    // Auto hide alert after 5 seconds
    setTimeout(() => setAlertInfo(null), 5000);
  };

  const handleImportClick = () => {
    setImportError(null);
    setImportInfo({
      type: 'info',
      message: 'Please upload an Excel file (.xlsx, .xls) or CSV file with the following columns: username, email, role'
    });
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    try {
      setImporting(true);
      setImportError(null);
      setImportInfo({
        type: 'info',
        message: `Processing file: ${file.name}`
      });
  
      const result = await importExcelData(
        file,
        databasetableName,
        (result) => {
          fetchProducts();
          setImportInfo({
            type: 'success',
            message: `Successfully imported ${result.successCount} products`
          });
        },
        (error) => {
          setImportError({
            type: 'error',
            message: error
          });
        }
      );

      console.log(result.errors,"my result")
  
      // Display partial success message if some users were imported
      if (result.successCount > 0 && result.errors?.length > 0) {
        setImportInfo({
          type: 'warning',
          message: `Imported ${result.successCount} products with ${result.errors.length} errors`
        });
      }
  
    } catch (error) {
      setImportError({
        type: 'error',
        message: error.message
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  useEffect(() => {
    fetchProducts();
    fetchCategory();
    fetchCompanies();
  }, []);

  const fetchProducts = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/admin/all-products`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching all products:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategory = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/admin/all-categories`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setCategory(data.categories);
    } catch (error) {
      console.error("Error fetching category:", error);
      setError(error.message);
    }
  };

  const fetchCompanies = async () => {
    // New function to fetch companies
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/admin/all-companies`); // Adjust the URL as needed

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setCompany(data.companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError(error.message);
    }
  };

  const handleDownloadExcel = () => {
    downloadData(products, 'AllProducts');
  };

  const handleProductUpdated = () => {
    setEditModalOpen(false);
    setProductToEdit(null);
    fetchProducts();
  };

  const handleDeleteProduct = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${apiUrl}/profile/admin/crud/${tableName}/${productToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productToDelete.id)
      );
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      setError(error.message);
    }
  };

  const handleEditClick = (product) => {
    setProductToEdit(product);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleProductAdded = () => {
    fetchProducts();
    closeModal();
  };

  // Pagination logic
  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-4 max-md:padding-t">
      <h2 className="text-2xl lg:text-3xl font-palanquin font-bold mb-6 text-sky-950">
        All Products
      </h2>

      {/* Add New Product Button */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={openModal}
          className="bg-sky-950 text-white px-4 py-2 rounded inline-flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add New
        </button>

        <button
          onClick={handleDownloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded inline-flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faDownload} />
          Download Excel
        </button>

        <button
          onClick={handleImportClick}
          className="bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center gap-2"
          disabled={importing}
        >
          <FontAwesomeIcon icon={faUpload} spin={importing} />
          {importing ? 'Importing...' : 'Import Excel'}
        </button>
      </div>



        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.xls,.csv"
          className="hidden"
        />

         {/* Info Message */}
      {importInfo && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
          importInfo.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-400'
            : 'bg-blue-100 text-blue-700 border border-blue-400'
        }`}>
          <FontAwesomeIcon 
            icon={importInfo.type === 'success' ? faCheck : faInfoCircle} 
            className="flex-shrink-0"
          />
          <span>{importInfo.message}</span>
          <button 
            onClick={() => setImportInfo(null)} 
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {importError && (
        <div className="mb-4 p-4 rounded-lg flex items-center gap-2 bg-red-100 text-red-700 border border-red-400">
          <FontAwesomeIcon icon={faExclamationTriangle} className="flex-shrink-0" />
          <span>{importError.message}</span>
          <button 
            onClick={() => setImportError(null)} 
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}



      {loading ? (
        <div className="flex justify-center items-center h-screen w-full">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-4xl text-sky-900"
          />
          <span className="ml-2">Loading products...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : Array.isArray(products) && products.length > 0 ? (
        <div className="space-y-4 justify-center">
          {/* Responsive Table for MD and larger screens */}
          <div className="hidden lg:flex justify-between bg-sky-100 p-4 rounded-lg shadow-md mb-4">
            <div className="text-center font-bold text-lg text-sky-700 w-1/5">
              Image
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/3">
              Name
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/5">
              Price
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/4">
              Category
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/4">
              Company
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/5">
              Stock
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/5">
              Popular
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/5">
              Actions
            </div>
          </div>

          {/* Product Entries */}
          {currentProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow border border-gray-200 rounded-lg font-medium text-lg p-4 flex flex-col space-y-4 md:space-y-0 md:flex-row items-start md:items-center justify-evenly"
            >
              {/* For Mobile View - Card Format */}
              <div className="flex flex-col space-y-2 lg:hidden">
                <div className="flex justify-center">
                  <img
                    src={product.img_url}
                    alt={product.name}
                    className="w-36 h-36 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Name: </span>
                  <span className="text-gray-800">{product.name}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Price: </span>
                  <span className="text-gray-800">₹{product.price}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Category:</span>
                  <span className="text-gray-800">
                    {product.category_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Company:</span>
                  <span className="text-gray-800">
                    {product.company_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Stock: </span>
                  <span className="text-gray-800">
                    {product.stock === 1 ? "Yes" : "No"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-600 font-semibold">Popular: </span>
                  <span className="text-gray-800">
                    {product.is_popular === 1 ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {/* For larger screens */}
              <div className="hidden lg:flex flex-col lg:flex-row lg:items-center justify-center text-center lg:w-1/6">
                <img
                  src={product.img_url}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>
              <div className="hidden lg:flex flex-col lg:flex-row lg:items-center justify-center text-center lg:w-1/3">
                <span className="text-gray-800">{product.name}</span>
              </div>

              <div className="hidden lg:flex flex-col md:flex-row lg:items-center justify-center text-center lg:w-1/5">
                <span className="text-gray-800">₹{product.price}</span>
              </div>

              <div className="hidden lg:flex flex-col md:flex-row lg:items-center justify-center text-center lg:w-1/4">
                <span className="text-gray-800">{product.category_name}</span>
              </div>

              <div className="hidden lg:flex flex-col lg:flex-row lg:items-center justify-center text-center lg:w-1/4">
                <span className="text-gray-800">{product.company_name}</span>
              </div>

              <div className="hidden lg:flex flex-col lg:flex-row lg:items-center justify-center text-center lg:w-1/5">
                <span className="text-gray-800">
                  {product.stock === 1 ? "Yes" : "No"}
                </span>
              </div>

              <div className="hidden lg:flex flex-col lg:flex-row lg:items-center justify-center text-center lg:w-1/5">
                <span className="text-gray-800">
                  {product.is_popular === 1 ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex justify-center lg:w-1/6 text-center space-x-2 mt-4 lg:mt-0">
                <button
                  className="text-sky-950 hover:text-blue-700"
                  onClick={() => handleEditClick(product)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteClick(product)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}

          <div className="pagination flex justify-start mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`mx-1 w-10 h-10 rounded-full flex items-center justify-center transition duration-300 hover:bg-sky-800 ${
                  currentPage === index + 1
                    ? "bg-sky-950 text-white"
                    : "bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-700">
          No products found. Click Add New to add a product.
        </div>
      )}

      <AddProductModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onProductAdded={handleProductAdded}
        categories={category} // Pass categories to modal
        companies={company} // Pass companies to modal
      />

      <EditProductModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setProductToEdit(null); }}
        onProductUpdated={handleProductUpdated}
        product={productToEdit}
        categories={category}
        companies={company}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full mx-auto">
            <h2 className="text-lg font-bold mb-3 text-gray-900">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900">{productToDelete?.name}</strong>?
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                className="w-full sm:w-auto bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-200 font-medium transition"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="w-full sm:w-auto bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 font-medium transition"
                onClick={handleDeleteProduct}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
