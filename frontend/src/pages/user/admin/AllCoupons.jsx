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
import { useEffect, useState, useRef } from "react";
import AddCouponModal from "./modal/AddCouponModal"; // Import the modal component
import { useCart } from "../../../context/CartContext";

const AllCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importInfo, setImportInfo] = useState(null);
  const fileInputRef = useRef(null);

  const { downloadData, importExcelData } = useCart();

  const tableName = "Coupon"; // Set the table name

  const databasetableName = "coupons";

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
          fetchCoupons();
          setImportInfo({
            type: 'success',
            message: `Successfully imported ${result.successCount} coupons code`
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
          message: `Imported ${result.successCount} coupons code with ${result.errors.length} errors`
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
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/admin/all-coupons`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setCoupons(data.coupons);
    } catch (error) {
      console.error("Error fetching all coupons:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    downloadData(coupons, 'AllCoupons');
  };

  const handleEditCoupon = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const couponToUpdate = coupons.find((coupon) => coupon.id === id);
      const response = await fetch(
        `${apiUrl}/profile/admin/crud/${tableName}/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(couponToUpdate),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const updatedCoupon = await response.json();
      setCoupons((prevCoupons) =>
        prevCoupons.map((coupon) => (coupon.id === id ? updatedCoupon : coupon))
      );
      setEditingCouponId(null);
      fetchCoupons();
    } catch (error) {
      console.error("Error editing coupon:", error);
      setError(error.message);
    }
  };

  const handleDeleteCoupon = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${apiUrl}/profile/admin/crud/${tableName}/${couponToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setCoupons((prevCoupons) =>
        prevCoupons.filter((coupon) => coupon.id !== couponToDelete.id)
      );
      setShowDeleteModal(false);
      setCouponToDelete(null);
    } catch (error) {
      console.error("Error deleting coupon:", error);
      setError(error.message);
    }
  };

  const handleEditClick = (id) => {
    setEditingCouponId(id);
  };

  const handleDeleteClick = (coupon) => {
    setCouponToDelete(coupon);
    setShowDeleteModal(true);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCouponAdded = () => {
    fetchCoupons();
    closeModal();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Ensure 2-digit day
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2-digit month (months are 0-based)
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="p-4 max-md:padding-t">
      <h2 className="text-2xl lg:text-3xl font-palanquin font-bold mb-6 text-sky-950">
        All Coupons
      </h2>

      {/* Add New Coupon Button */}
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
          <span className="ml-2">Loading coupons...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : Array.isArray(coupons) && coupons.length > 0 ? (
        <div className="space-y-4 justify-center">
          {/* Responsive Table for MD and larger screens */}
          <div className="hidden md:flex justify-between bg-sky-100 p-4 rounded-lg shadow-md mb-4">
            <div className="text-center font-bold text-lg text-sky-700 w-1/3">
              Code
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/4">
              Discount
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/4">
              Expiry Date
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/5">
              Actions
            </div>
          </div>

          {/* Coupon Entries */}
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white shadow border border-gray-200 rounded-lg font-medium text-lg p-4 flex flex-col space-y-4 md:space-y-0 md:flex-row items-start md:items-center justify-between"
            >
              {/* For Mobile View - Card Format */}
              <div className="flex flex-col space-y-2 md:hidden">
                <div>
                  <span className="text-gray-600 font-semibold">Code: </span>
                  {editingCouponId === coupon.id ? (
                    <input
                      type="text"
                      value={coupon.code}
                      onChange={(e) =>
                        setCoupons((prev) =>
                          prev.map((c) =>
                            c.id === coupon.id
                              ? { ...c, code: e.target.value }
                              : c
                          )
                        )
                      }
                      className="p-2 border border-gray-300 rounded w-full"
                    />
                  ) : (
                    <span className="text-gray-800">{coupon.code}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Discount: </span>
                  {editingCouponId === coupon.id ? (
                    <input
                      type="text"
                      value={coupon.discount}
                      onChange={(e) =>
                        setCoupons((prev) =>
                          prev.map((c) =>
                            c.id === coupon.id
                              ? { ...c, discount: e.target.value }
                              : c
                          )
                        )
                      }
                      className="p-2 border border-gray-300 rounded w-full"
                    />
                  ) : (
                    <span className="text-gray-800">{coupon.discount}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Expiry Date: </span>
                  {editingCouponId === coupon.id ? (
                    <input
                      type="date"
                      value={coupon.expiration_date}
                      onChange={(e) =>
                        setCoupons((prev) =>
                          prev.map((c) =>
                            c.id === coupon.id
                              ? { ...c,  expiration_date: e.target.value }
                              : c
                          )
                        )
                      }
                      className="p-2 border border-gray-300 rounded w-full"
                    />
                  ) : (
                    <span className="text-gray-800">{formatDate(coupon.expiration_date)}</span>
                  )}
                </div>
              </div>

              {/* For larger screens */}
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center text-center md:w-1/3 lg:1/3">
                {editingCouponId === coupon.id ? (
                  <input
                    type="text"
                    value={coupon.code}
                    onChange={(e) =>
                      setCoupons((prev) =>
                        prev.map((c) =>
                          c.id === coupon.id
                            ? { ...c, code: e.target.value }
                            : c
                        )
                      )
                    }
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                ) : (
                  <div className="text-center text-gray-800">
                    {coupon.code}
                  </div>
                )}
              </div>
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center md:w-1/4 lg:w-1/4">
                {editingCouponId === coupon.id ? (
                  <input
                    type="text"
                    value={coupon.discount}
                    onChange={(e) =>
                      setCoupons((prev) =>
                        prev.map((c) =>
                          c.id === coupon.id
                            ? { ...c, discount: e.target.value }
                            : c
                        )
                      )
                    }
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                ) : (
                  <div className="text-center text-gray-800">
                    {coupon.discount}
                  </div>
                )}
              </div>
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center md:w-1/4">
                {editingCouponId === coupon.id ? (
                  <input
                    type="date"
                    value={coupon.expiration_date}
                    onChange={(e) =>
                      setCoupons((prev) =>
                        prev.map((c) =>
                          c.id === coupon.id
                            ? { ...c,  expiration_date: e.target.value }
                            : c
                        )
                      )
                    }
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                ) : (
                  <div className="text-center text-gray-800">
                   {formatDate(coupon.expiration_date)}
                  </div>
                )}
              </div>

              <div className="flex justify-center md:w-1/5 text-center space-x-2 mt-4 md:mt-0">
                {editingCouponId === coupon.id ? (
                  <>
                    <button
                      onClick={() => handleEditCoupon(coupon.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500 transition"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                      onClick={() => setEditingCouponId(null)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 transition"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="text-sky-700"
                      onClick={() => handleEditClick(coupon.id)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="text-red-500 ml-4"
                      onClick={() => handleDeleteClick(coupon)}
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
        <div className="text-center text-gray-500">
          No coupons available.
        </div>
      )}

      {/* Add Coupon Modal */}
      {isModalOpen && (
        <AddCouponModal
        isOpen={isModalOpen}
        onClose={closeModal}
          onCouponAdded={handleCouponAdded}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="mb-4">
              Are you sure you want to delete this coupon?
            </h3>
            <div className="flex justify-end">
              <button
                onClick={handleDeleteCoupon}
                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
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

export default AllCoupons;
