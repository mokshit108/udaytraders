import React, { useState } from "react";

const AddCompanyModal = ({ isOpen, onClose, onCompanyAdded }) => {
  const [newCompanyName, setNewCompanyName] = useState("");

  const handleAddCompany = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const tableName = "Company";


    const response = await fetch(`${apiUrl}/profile/admin/crud/new/${tableName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newCompanyName }),
    });

    if (response.ok) {
      setNewCompanyName("");
      onCompanyAdded(); // Fetch companies again to update the list
    } else {
      console.error("Error adding company:", response.statusText);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">Add New Company</h3>
        <input
          type="text"
          value={newCompanyName}
          onChange={(e) => setNewCompanyName(e.target.value)}
          placeholder="Enter company name"
          className="p-2 border border-gray-300 rounded w-full mb-4"
        />
        <div className="flex justify-end">
          <button
            className="bg-sky-950 text-white px-4 py-2 rounded mr-2"
            onClick={handleAddCompany}
          >
            Add
          </button>
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCompanyModal;
