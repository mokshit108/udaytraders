import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTrash,
  faEdit,
  faPlus,
  faCheck,
  faTimes,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import AddUserModal from "./modal/AddUserModal";
import { useExcel } from "../../../hooks/useExcel";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roles, setRoles] = useState([]);

  const { downloadData } = useExcel();

  const tableName = "User";

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
      </div>

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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-bold mb-3 text-gray-900">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong className="text-gray-900">{userToDelete?.username}</strong>?
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
                    onClick={handleDeleteUser}
                  >
                    Delete
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
