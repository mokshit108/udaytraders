import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa'; // Import FontAwesome icons

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (touched) {
      validateField(e.target.value);
    }
  };

  const handleEmailBlur = () => {
    setTouched(true);
    validateField(email);
  };

  const validateField = (value) => {
    const errors = {};
    if (!value) {
      errors.email = "Email is required.";
    } else if (!validateEmail(value)) {
      errors.email = "Invalid email address.";
    } else {
      errors.email = "";
    }
    setValidationErrors(errors);
  };

  const handleSendOtp = async () => {
    if (!touched) return;

    const errors = {};
    if (!email) {
      errors.email = "Email is required.";
    } else if (!validateEmail(email)) {
      errors.email = "Invalid email address.";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/otp/requestpasswordreset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccessMessage("OTP sent to your email.");
        setErrorMessage("");
        
        // Redirect to reset password after showing success message
        setTimeout(() => {
          navigate("/reset-password");
        }, 3000); // 3 seconds
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to send OTP.");
        setSuccessMessage("");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="max-md:mx-10 flex flex-col justify-center items-center min-h-screen bg-white shadow-3xl shadow-slate-200">
      <div className="max-w-md w-full bg-white border border-gray-300 shadow-lg rounded-lg p-6">
        <button
          onClick={() => navigate("/login")}
          className="text-sky-700 mb-4 flex items-center"
        >
          <FaArrowLeft className="mr-2 text-xl" />
          
        </button>
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
        <h2 className="max-sm:text-lg text-2xl font-semibold font-montserrat text-sky-950 mb-4">Forgot Password</h2>
        <div className="relative">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            className={`block w-full border-b text-base leading-6 pl-1 py-1.5 ${validationErrors.email ? 'border-red-500' : 'border-sky-800'} text-sky-950 font-medium font-montserrat placeholder:pl-0 placeholder:text-gray-300 placeholder:font-montserrat placeholder:text-lg focus:outline-none ${validationErrors.email ? 'focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'focus:border-sky-800 focus:ring-1 focus:ring-sky-800'}`}
          />
          {validationErrors.email && touched && (
            <FaTimesCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />
          )}
          {!validationErrors.email && touched && (
            <FaCheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />
          )}
        </div>
        {validationErrors.email && touched && (
          <p className="text-red-500 text-sm mt-2">{validationErrors.email}</p>
        )}
        <button
          onClick={handleSendOtp}
          className="w-full mt-5 font-palanquin font-semibold text-lg bg-sky-700 text-white py-2 px-4 rounded hover:bg-sky-800 focus:outline-none focus:bg-sky-800"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
