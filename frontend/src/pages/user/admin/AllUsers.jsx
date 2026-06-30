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
import AddUserModal from "./modal/AddUserModal"; // Import the modal component
import { useCart } from "../../../context/CartContext";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roles, setRoles] = useState([]);
  // const [importing, setImporting] = useState(false);
  // const [importError, setImportError] = useState(null);
  // const [importInfo, setImportInfo] = useState(null);
  // const fileInputRef = useRef(null);

  const { downloadData, importExcelData } = useCart();

  const tableName = "User"; // Set the table name

  // const databasetableName = "users";
 
  // // Function to show alert
  // const showAlert = (type, message) => {
  //   setAlertInfo({ type, message });
  //   // Auto hide alert after 5 seconds
  //   setTimeout(() => setAlertInfo(null), 5000);
  // };

  // const handleImportClick = () => {
  //   setImportError(null);
  //   setImportInfo({
  //     type: 'info',
  //     message: 'Please upload an Excel file (.xlsx, .xls) or CSV file with the following columns: username, email, role'
  //   });
  //   fileInputRef.current?.click();
  // };

  // const handleFileChange = async (event) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;
  
  //   try {
  //     setImporting(true);
  //     setImportError(null);
  //     setImportInfo({
  //       type: 'info',
  //       message: `Processing file: ${file.name}`
  //     });
  
  //     const result = await importExcelData(
  //       file,
  //       databasetableName,
  //       (result) => {
  //         fetchUsers();
  //         setImportInfo({
  //           type: 'success',
  //           message: `Successfully imported ${result.successCount} users`
  //         });
  //       },
  //       (error) => {
  //         setImportError({
  //           type: 'error',
  //           message: error
  //         });
  //       }
  //     );
  
  //     // Display partial success message if some users were imported
  //     if (result.successCount > 0 && result.errors?.length > 0) {
  //       setImportInfo({
  //         type: 'warning',
  //         message: `Imported ${result.successCount} users with ${result.errors.length} errors`
  //       });
  //     }
  
  //   } catch (error) {
  //     setImportError({
  //       type: 'error',
  //       message: error.message
  //     });
  //   } finally {
  //     setImporting(false);
  //     if (fileInputRef.current) {
  //       fileInputRef.current.value = '';
  //     }
  //   }
  // };

  const userId = sessionStorage.getItem("id");

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/admin/all-users`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/admin/all-roles`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setRoles(data.roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setError(error.message);
    }
  };

  const handleDownloadExcel = () => {
    downloadData(users, 'AllUsers');
  };

  const handleEditUser = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const userToUpdate = users.find((user) => user.id === id);
      const response = await fetch(
        `${apiUrl}/profile/admin/crud/${tableName}/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...userToUpdate,
            role_name: userToUpdate.role_name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? updatedUser : user))
      );
      setEditingUserId(null);
      fetchUsers();
    } catch (error) {
      console.error("Error editing user:", error);
      setError(error.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${apiUrl}/profile/admin/crud/${tableName}/${userToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userToDelete.id)
      );
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(error.message);
    }
  };

  const handleEditClick = (id) => {
    setEditingUserId(id);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleUserAdded = () => {
    fetchUsers();
    closeModal();
  };

  return (
    <div className="p-4 max-md:padding-t">
      <h2 className="text-2xl lg:text-3xl font-palanquin font-bold mb-6 text-sky-950">
        All Users
      </h2>

      {/* Add New User Button */}
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

        {/* <button
          onClick={handleImportClick}
          className="bg-blue-600 text-white px-3 py-2 rounded inline-flex items-center gap-2"
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
        /> */}

         {/* Info Message */}
      {/* {importInfo && (
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
      )} */}

      {/* Error Message */}
      {/* {importError && (
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
      )} */}

      {loading ? (
        <div className="flex justify-center items-center h-screen w-full">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-4xl text-sky-900"
          />
          <span className="ml-2">Loading users...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : Array.isArray(users) && users.length > 0 ? (
        <div className="space-y-4 justify-center">
          {/* Responsive Table for MD and larger screens */}
          <div className="hidden md:flex justify-between bg-sky-100 p-4 rounded-lg shadow-md mb-4">
            <div className="text-center font-bold text-lg text-sky-700 w-1/4">
              Name
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/3">
              Email
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/4">
              Role
            </div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/5">
              Actions
            </div>
          </div>

          {/* User Entries */}
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white shadow border border-gray-200 rounded-lg font-medium text-lg p-4 flex flex-col space-y-4 md:space-y-0 md:flex-row items-start md:items-center justify-between"
            >
              {/* For Mobile View - Card Format */}
              <div className="flex flex-col space-y-2 md:hidden">
                <div>
                  <span className="text-gray-600 font-semibold">Name: </span>
                  {editingUserId === user.id ? (
                    <input
                      type="text"
                      value={user.username}
                      onChange={(e) =>
                        setUsers((prev) =>
                          prev.map((u) =>
                            u.id === user.id
                              ? { ...u, username: e.target.value }
                              : u
                          )
                        )
                      }
                      className="p-2 border border-gray-300 rounded w-full"
                    />
                  ) : (
                    <span className="text-gray-800">{user.username}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Email: </span>
                  {editingUserId === user.id ? (
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) =>
                        setUsers((prev) =>
                          prev.map((u) =>
                            u.id === user.id
                              ? { ...u, email: e.target.value }
                              : u
                          )
                        )
                      }
                      className="p-2 border border-gray-300 rounded w-full"
                    />
                  ) : (
                    <span className="text-gray-800">{user.email}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Role: </span>
                  {editingUserId === user.id ? (
                    <select
                      value={user.role_name}
                      onChange={(e) => {
                        const selectedRole = e.target.value;
                        setUsers((prev) =>
                          prev.map((u) =>
                            u.id === user.id
                              ? { ...u, role_name: selectedRole }
                              : u
                          )
                        );
                      }}
                      className="p-2 border border-gray-300 rounded w-full"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-800">{user.role_name}</span>
                  )}
                </div>
              </div>

              {/* For larger screens */}
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center text-center md:w-1/4">
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    value={user.username}
                    onChange={(e) =>
                      setUsers((prev) =>
                        prev.map((u) =>
                          u.id === user.id
                            ? { ...u, username: e.target.value }
                            : u
                        )
                      )
                    }
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                ) : (
                  <div className="text-center text-gray-800">
                    {user.username}
                  </div>
                )}
              </div>
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center md:w-1/2 lg:w-1/3">
                {editingUserId === user.id ? (
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) =>
                      setUsers((prev) =>
                        prev.map((u) =>
                          u.id === user.id ? { ...u, email: e.target.value } : u
                        )
                      )
                    }
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                ) : (
                  <div className="text-center text-gray-800">{user.email}</div>
                )}
              </div>
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center md:w-1/5 lg:w-1/4">
                {editingUserId === user.id ? (
                  <select
                    value={user.role_name}
                    onChange={(e) => {
                      const selectedRole = e.target.value;
                      setUsers((prev) =>
                        prev.map((u) =>
                          u.id === user.id
                            ? { ...u, role_name: selectedRole }
                            : u
                        )
                      );
                    }}
                    className="p-2 border border-gray-300 rounded w-full"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-center text-gray-800">
                    {user.role_name}
                  </div>
                )}
              </div>

              {/* Actions for both mobile and larger screens */}
              <div className="flex justify-center md:w-1/6 lg:w-1/5 text-center space-x-2 mt-4 md:mt-0">
                {editingUserId === user.id ? (
                  <>
                    <button
                      className="text-green-500 mr-2"
                      onClick={() => handleEditUser(user.id)}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => setEditingUserId(null)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </>
                ) : (
                  user.id != userId && (
                    <>
                      <button
                        className="text-sky-700"
                        onClick={() => handleEditClick(user.id)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="text-red-500 ml-4"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </>
                  )
                )}
              </div>
            </div>
          ))}

          {/* Add User Modal */}
          <AddUserModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onUserAdded={handleUserAdded}
          />

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                <p className="text-gray-700">
                  Are you sure you want to delete {userToDelete.username}?
                </p>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
                    onClick={handleDeleteUser}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition duration-200"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center font-bold text-gray-700">
          No users available.
        </div>
      )}
    </div>
  );
};

export default AllUsers;
