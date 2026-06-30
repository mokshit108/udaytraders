import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTrash,
  faEdit,
  faPlus,
  faCheck,
  faTimes,
  faDownload,
  faUpload,
  faExclamationTriangle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useRef  } from "react";
import AddCategoryModal from "./modal/AddCategoryModal"; // Import the modal component
import { useExcel } from "../../../hooks/useExcel";

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importInfo, setImportInfo] = useState(null);
  const fileInputRef = useRef(null);

  const { downloadData, importExcelData } = useExcel();

  const tableName = "Category"; // Set the table name

  const databasetableName = "categories";

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
          fetchCategories();
          setImportInfo({
            type: 'success',
            message: `Successfully imported ${result.successCount} categories`
          });
        },
        (error) => {
          setImportError({
            type: 'error',
            message: error
          });
        }
      );
  
      // Display partial success message if some users were imported
      if (result.successCount > 0 && result.errors?.length > 0) {
        setImportInfo({
          type: 'warning',
          message: `Imported ${result.successCount} categories with ${result.errors.length} errors`
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

 // Set the table name



  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/admin/all-categories`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error("Error fetching all categories:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    downloadData(categories, 'AllCategories');
  };

  const handleEditCategory = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const categoryToUpdate = categories.find((category) => category.id === id);
      const response = await fetch(
        `${apiUrl}/profile/admin/crud/${tableName}/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryToUpdate),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const updatedCategory = await response.json();
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === id ? updatedCategory : category
        )
      );
      setEditingCategoryId(null);
      fetchCategories();
    } catch (error) {
      console.error("Error editing category:", error);
      setError(error.message);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${apiUrl}/profile/admin/crud/${tableName}/${categoryToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== categoryToDelete.id)
      );
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      setError(error.message);
    }
  };

  const handleEditClick = (id) => {
    setEditingCategoryId(id);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCategoryAdded = () => {
    fetchCategories();
    closeModal();
  };

  return (
    <div className="p-4 max-md:padding-t">
      <h2 className="text-2xl lg:text-3xl font-palanquin font-bold mb-6 text-sky-950">
        All Categories
      </h2>

      {/* Add New Category Button */}
      <button
        onClick={openModal}
        className="bg-sky-950 text-white px-2 py-2 rounded inline-flex items-center md:mb-4 gap-2"
      >
        <FontAwesomeIcon icon={faPlus} /> {/* Plus icon */}
        Add New
      </button>

      <button
          onClick={handleDownloadExcel}
          className="bg-green-600 text-white px-3 ml-3 py-2 rounded inline-flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faDownload} /> {/* Download icon */}
          Download Excel
      </button>

      <button
          onClick={handleImportClick}
          className="bg-blue-600 text-white px-3 ml-3 py-2 rounded inline-flex items-center gap-2"
          disabled={importing}
        >
          <FontAwesomeIcon icon={faUpload} spin={importing} />
          {importing ? 'Importing...' : 'Import Excel'}
        </button>



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
          <span className="ml-2">Loading categories...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : Array.isArray(categories) && categories.length > 0 ? (
        <div className="space-y-4 justify-center">
          {/* Responsive Table for MD and larger screens */}
          <div className="hidden md:flex justify-between bg-sky-100 p-4 rounded-lg shadow-md mb-4">
            <div className="text-center font-bold text-lg text-sky-700 w-1/2">
              Category Name
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/2">
              Category Description
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/6">
              Actions
            </div>
          </div>

          {/* Category Entries */}
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white shadow border border-gray-200 rounded-lg font-medium text-lg p-4 flex flex-col space-y-4 md:space-y-0 md:flex-row items-start md:items-center justify-between"
            >
              {/* For Mobile View - Card Format */}
              <div className="flex flex-col space-y-2 md:hidden">
                <div>
                  <span className="text-gray-600 font-semibold">Category: </span>
                  {editingCategoryId === category.id ? (
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((c) =>
                            c.id === category.id
                              ? { ...c, name: e.target.value }
                              : c
                          )
                        )
                      }
                      className="p-2 border border-gray-300 rounded w-full"
                    />
                  ) : (
                    <span className="text-gray-800">{category.name}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Category Description: </span>
                  {editingCategoryId === category.id ? (
                    <input
                      type="text"
                      value={category.description}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((c) =>
                            c.id === category.id
                              ? { ...c, description: e.target.value }
                              : c
                          )
                        )
                      }
                      className="p-2 border border-gray-300 rounded w-full"
                    />
                  ) : (
                    <span className="text-gray-800">{category.description}</span>
                  )}
                </div>
              </div>

              {/* For larger screens */}
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center md:w-1/2">
                {editingCategoryId === category.id ? (
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) =>
                      setCategories((prev) =>
                        prev.map((c) =>
                          c.id === category.id ? { ...c, name: e.target.value } : c
                        )
                      )
                    }
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                ) : (
                  <div className="text-center text-gray-800">{category.name}</div>
                )}
              </div>
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center md:w-1/2">
                {editingCategoryId === category.id ? (
                  <input
                    type="text"
                    value={category.description}
                    onChange={(e) =>
                      setCategories((prev) =>
                        prev.map((c) =>
                          c.id === category.id ? { ...c, description: e.target.value } : c
                        )
                      )
                    }
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                ) : (
                  <div className="text-center text-gray-800">{category.description}</div>
                )}
              </div>

              {/* Actions for both mobile and larger screens */}
              <div className="flex justify-center md:w-1/6 text-center space-x-2 mt-4 md:mt-0">
                {editingCategoryId === category.id ? (
                  <>
                    <button
                      className="text-green-500 mr-2"
                      onClick={() => handleEditCategory(category.id)}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => setEditingCategoryId(null)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="text-sky-700"
                      onClick={() => handleEditClick(category.id)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="text-red-500 ml-4"
                      onClick={() => handleDeleteClick(category)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}


        </div>
      ) : (
        <div className="text-gray-500 text-center">No categories found.</div>
      )}

      {/* Add Category Modal */}
      <AddCategoryModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onCategoryAdded={handleCategoryAdded}
          />

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                <p className="mb-4">
                  Are you sure you want to delete this category?
                </p>
                <div className="flex justify-end">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                    onClick={handleDeleteCategory}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-gray-300 px-4 py-2 rounded"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
    </div>
  );
};

export default AllCategories;
