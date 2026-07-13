import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faTimes } from "@fortawesome/free-solid-svg-icons";

const RegisterPhoneNumber = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handlePhoneNumberSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number (exactly 10 digits)
    if (!/^\d{10}$/.test(phoneNumber)) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    const token = sessionStorage.getItem("token");
    const id = sessionStorage.getItem("id");
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${apiUrl}/users/register-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber, id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register phone number");
      }

      setSuccessMessage("Phone number registered successfully!");
      setErrorMessage("");
      setTimeout(() => navigate("/"), 3000); // Redirect to home page after 3 seconds
    } catch (error) {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(""), 3000);
      setSuccessMessage("");
    }
  };

  return (
    <>

    <div className="flex items-center justify-center min-h-screen padding-topbottom">
      <div className="w-full max-w-md p-6 bg-white border border-gray-300 shadow-md rounded-lg">
      {successMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 max-w-md">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-3 text-2xl text-green-500" />
          <p className="flex-1 font-semibold">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="ml-4 text-green-600 hover:text-green-800 focus:outline-none"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 max-w-md">
          <FontAwesomeIcon icon={faTimesCircle} className="mr-3 text-2xl text-red-500" />
          <p className="flex-1 font-semibold">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="ml-4 text-red-600 hover:text-red-800 focus:outline-none"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>
      )}
        <h2 className="text-2xl font-palanquin font-bold text-center text-sky-700 mb-4">
          Complete Your Details
        </h2>
        <p className="text-gray-600 font-montserrat text-start mb-4">
          Enter your mobile number to proceed.
        </p>
       

        <form onSubmit={handlePhoneNumberSubmit} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-lg font-medium text-gray-700">
             Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Enter Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded shadow-sm focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          <button
            type="submit"
             className="w-full bg-sky-700 text-white py-2 px-4 rounded hover:bg-sky-800 focus:outline-none focus:bg-sky-800"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default RegisterPhoneNumber;
