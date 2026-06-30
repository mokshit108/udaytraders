import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faCheckCircle, faTimesCircle, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [signupFormData, setSignupFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false); // State for loading
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    validateForm(); // Validate form on input change
  }, [signupFormData]);

  const validateForm = () => {
    let errors = {};

    // Username validation
    if (signupFormData.username && !/^[a-zA-Z][a-zA-Z0-9]*$/.test(signupFormData.username)) {
      errors.username = "Username must start with a letter and can only contain letters and numbers.";
    }

    // Phone number validation
    if (signupFormData.phoneNumber && !/^\d{10}$/.test(signupFormData.phoneNumber)) {
      errors.phoneNumber = "Phone number must be exactly 10 digits.";
    }

    // Email validation
    if (signupFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupFormData.email)) {
      errors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (signupFormData.password && !/(?=.*[a-zA-Z])(?=.*\d).{8,}/.test(signupFormData.password)) {
      errors.password = "Password must be at least 8 characters long and contain at least one letter and one number.";
    }

    setValidationErrors(errors);
  };

  const handleChange = (e) => {
    setSignupFormData({
      ...signupFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(validationErrors).length > 0) {
      return; // Prevent form submission if there are validation errors
    }
    setLoading(true); // Set loading state to true

    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${apiUrl}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error in network response");
      }

      setSuccessMessage("User registered successfully");
      setTimeout(() => {
        setSuccessMessage("");
        onUserAdded();
      }, 3000);
      
      // Reset the form after successful registration
      setSignupFormData({
        username: "",
        email: "",
        phoneNumber: "",
        password: "",
      });
      setErrorMessage(""); // Clear any previous error message
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message); // Set error message
      setTimeout(() => {
        setErrorMessage("");
      }, 4000);
      setSuccessMessage(""); // Clear any previous success message
    } finally {
      setLoading(false);
    }
  };

  const renderValidationIcon = (field) => {
    if (validationErrors[field]) {
      return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 ml-2" />;
    } else if (signupFormData[field] !== "" && !validationErrors[field]) {
      return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 ml-2" />;
    }
    return null;
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-gray-800 bg-opacity-50 absolute inset-0" onClick={onClose} />
        <div className="bg-white p-8 rounded-lg shadow-lg relative z-10  w-5/6 md:w-1/2 mx-auto">
          <FontAwesomeIcon
            icon={faXmark}
            className="absolute top-4 right-4 cursor-pointer"
            onClick={onClose}
          />
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <FontAwesomeIcon icon={faSpinner} spin className="text-sky-700 text-4xl" />
            </div>
          ) : (
            <>
              {successMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                  <p>{successMessage}</p>
                </div>
              )}
              {errorMessage && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                  <p>{errorMessage}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="py-4">
                <div className="mb-4">
                  <label htmlFor="username" className="block">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 flex items-center">
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={signupFormData.username}
                      onChange={handleChange}
                      className={`block w-full border-b text-base leading-6 pl-1 py-1.5 ${
                        validationErrors.username ? "border-red-500" : "border-sky-800"
                      } text-sky-950 font-medium placeholder:pl-0 placeholder:text-gray-300 focus:outline-none ${
                        validationErrors.username ? "focus:border-red-500" : "focus:border-sky-800"
                      }`}
                      placeholder="Enter Username"
                      required
                    />
                    {renderValidationIcon("username")}
                  </div>
                  {validationErrors.username && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="phoneNumber" className="block">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 flex items-center">
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={signupFormData.phoneNumber}
                      onChange={handleChange}
                      className={`block w-full border-b text-base leading-6 pl-1 py-1.5 ${
                        validationErrors.phoneNumber ? "border-red-500" : "border-sky-800"
                      } text-sky-950 font-medium placeholder:pl-0 placeholder:text-gray-300 focus:outline-none ${
                        validationErrors.phoneNumber ? "focus:border-red-500" : "focus:border-sky-800"
                      }`}
                      placeholder="Enter Phone Number"
                      required
                    />
                    {renderValidationIcon("phoneNumber")}
                  </div>
                  {validationErrors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 flex items-center">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={signupFormData.email}
                      onChange={handleChange}
                      className={`block w-full border-b text-base leading-6 pl-1 py-1.5 ${
                        validationErrors.email ? "border-red-500" : "border-sky-800"
                      } text-sky-950 font-medium placeholder:pl-0 placeholder:text-gray-300 focus:outline-none ${
                        validationErrors.email ? "focus:border-red-500" : "focus:border-sky-800"
                      }`}
                      placeholder="Enter Email"
                      required
                    />
                    {renderValidationIcon("email")}
                  </div>
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="block">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      value={signupFormData.password}
                      onChange={handleChange}
                      className={`block w-full border-b text-base leading-6 pl-1 py-1.5 ${
                        validationErrors.password ? "border-red-500" : "border-sky-800"
                      } text-sky-950 font-medium placeholder:pl-0 placeholder:text-gray-300 focus:outline-none ${
                        validationErrors.password ? "focus:border-red-500" : "focus:border-sky-800"
                      }`}
                      placeholder="Enter Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="ml-2 focus:outline-none"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                    {renderValidationIcon("password")}
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full bg-sky-600 text-white py-2 rounded mt-4 hover:bg-sky-700 transition duration-300 ease-in-out"
                >
                  Add User
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    )
  );
};

export default AddUserModal;
