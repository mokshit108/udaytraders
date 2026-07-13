import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa'; // Import FontAwesome icons

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, otp: false, newPassword: false });
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateOtp = (otp) => /^\d{6}$/.test(otp);
  const validatePassword = (password) => password.length >= 8;

  const validateField = () => {
    const errors = {};
    if (!email) {
      errors.email = "Email is required.";
    } else if (!validateEmail(email)) {
      errors.email = "Invalid email address.";
    }

    if (!otp) {
      errors.otp = "OTP is required.";
    } else if (!validateOtp(otp)) {
      errors.otp = "OTP must be a 6-digit number.";
    }

    if (!newPassword) {
      errors.newPassword = "New password is required.";
    } else if (!validatePassword(newPassword)) {
      errors.newPassword = "Password must be at least 8 characters long.";
    }

    setValidationErrors(errors);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "otp") setOtp(value);
    if (name === "newPassword") setNewPassword(value);

    if (touched[name]) {
      validateField();
    }
  };

  const handleFieldBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField();
  };

  const handleVerifyOtpAndResetPassword = async () => {
    validateField();

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/otp/verifyotpresetpassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (response.ok) {
        setSuccessMessage("Password has been reset successfully.");
        setErrorMessage("");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to reset password.");
        setSuccessMessage("");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
      setSuccessMessage("");
    }
  };

  return (
    <div className="max-md:mx-10 flex flex-col justify-center items-center min-h-screen bg-white shadow-3xl shadow-slate-200">
      <div className="max-w-md w-full bg-white border border-gray-300 shadow-lg rounded-lg p-6 mt-16">
       
        {successMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 max-w-md">
            <FaCheckCircle className="mr-3 text-2xl text-green-500" />
            <p className="flex-1 font-semibold">{successMessage}</p>
            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="ml-4 text-green-600 hover:text-green-800 focus:outline-none"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        )}
        {errorMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 max-w-md">
            <FaTimesCircle className="mr-3 text-2xl text-red-500" />
            <p className="flex-1 font-semibold">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="ml-4 text-red-600 hover:text-red-800 focus:outline-none"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        )}
        <h2 className="max-sm:text-lg text-2xl font-semibold font-montserrat text-sky-950 mb-4">Reset Password</h2>

        <div className="relative mb-4">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            className={`block w-full border-b text-base leading-6 pl-1 py-1.5 ${validationErrors.email ? 'border-red-500' : 'border-sky-800'} text-sky-950 font-medium font-montserrat placeholder:pl-0 placeholder:text-gray-300 placeholder:font-montserrat placeholder:text-lg focus:outline-none ${validationErrors.email ? 'focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'focus:border-sky-800 focus:ring-1 focus:ring-sky-800'}`}
          />
          {validationErrors.email && touched.email && (
            <FaTimesCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />
          )}
          {!validationErrors.email && touched.email && (
            <FaCheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />
          )}
        </div>
        {validationErrors.email && touched.email && (
          <p className="text-red-500 text-sm mb-4">{validationErrors.email}</p>
        )}

        <div className="relative mb-4">
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={otp}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            className={`block w-full border-b text-base leading-6 pl-1 py-1.5 ${validationErrors.otp ? 'border-red-500' : 'border-sky-800'} text-sky-950 font-medium font-montserrat placeholder:pl-0 placeholder:text-gray-300 placeholder:font-montserrat placeholder:text-lg focus:outline-none ${validationErrors.otp ? 'focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'focus:border-sky-800 focus:ring-1 focus:ring-sky-800'}`}
          />
          {validationErrors.otp && touched.otp && (
            <FaTimesCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />
          )}
          {!validationErrors.otp && touched.otp && (
            <FaCheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />
          )}
        </div>
        {validationErrors.otp && touched.otp && (
          <p className="text-red-500 text-sm mb-4">{validationErrors.otp}</p>
        )}

        <div className="relative mb-4">
          <input
            type="password"
            name="newPassword"
            placeholder="Enter new password"
            value={newPassword}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            className={`block w-full border-b text-base leading-6 pl-1 py-1.5 ${validationErrors.newPassword ? 'border-red-500' : 'border-sky-800'} text-sky-950 font-medium font-montserrat placeholder:pl-0 placeholder:text-gray-300 placeholder:font-montserrat placeholder:text-lg focus:outline-none ${validationErrors.newPassword ? 'focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'focus:border-sky-800 focus:ring-1 focus:ring-sky-800'}`}
          />
          {validationErrors.newPassword && touched.newPassword && (
            <FaTimesCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />
          )}
          {!validationErrors.newPassword && touched.newPassword && (
            <FaCheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />
          )}
        </div>
        {validationErrors.newPassword && touched.newPassword && (
          <p className="text-red-500 text-sm mb-4">{validationErrors.newPassword}</p>
        )}

        <button
          onClick={handleVerifyOtpAndResetPassword}
          className="w-full bg-sky-700 text-white py-2 px-4 rounded hover:bg-sky-800 focus:outline-none focus:bg-sky-800"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
