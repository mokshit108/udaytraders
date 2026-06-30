import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [error, setError] = useState("");

  const tableName = "Category";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName || !categoryDescription) {
      setError("Both fields are required.");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/admin/crud/new/${tableName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryName,
          description: categoryDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setCategoryName("");
      setCategoryDescription("");
      onCategoryAdded(); // Call the handler to refresh the category list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error adding category:", error);
      setError("Failed to add category. Please try again.");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black opacity-50 absolute inset-0" onClick={onClose}></div>
          <div className="bg-white p-6 rounded shadow-lg z-10 relative w-full max-w-md">
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3 className="text-lg font-bold mb-4">Add New Category</h3>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="categoryName">
                  Category Name
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="categoryDescription">
                  Description
                </label>
                <input
                  type="text"
                  id="categoryDescription"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-sky-950 text-white px-4 py-2 rounded"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddCategoryModal;
