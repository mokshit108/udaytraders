import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const LoginSignupCard = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });
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

  const navigate = useNavigate();

  useEffect(() => {
    validateForm(); // Validate form on input change
  }, [isLogin ? loginFormData : signupFormData]);

  const validateForm = () => {
    let errors = {};

    const formData = isLogin ? loginFormData : signupFormData;

    // Username validation
    if (
      !isLogin &&
      formData.username &&
      !/^[a-zA-Z][a-zA-Z0-9]*$/.test(formData.username)
    ) {
      errors.username =
        "Username must start with a letter and can only contain letters and numbers.";
    }

    // Phone number validation
    if (
      !isLogin &&
      formData.phoneNumber &&
      !/^\d{10}$/.test(formData.phoneNumber)
    ) {
      errors.phoneNumber = "Phone number must be exactly 10 digits.";
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (
      formData.password &&
      !/(?=.*[a-zA-Z])(?=.*\d).{8,}/.test(formData.password)
    ) {
      errors.password =
        "Password must be at least 8 characters long and contain at least one letter and one number.";
    }

    setValidationErrors(errors);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleChange = (e) => {
    if (isLogin) {
      setLoginFormData({
        ...loginFormData,
        [e.target.name]: e.target.value,
      });
    } else {
      setSignupFormData({
        ...signupFormData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(validationErrors).length > 0) {
      return; // Prevent form submission if there are validation errors
    }
    setLoading(true); // Set loading state to true

    const delay = 2000; // Minimum time in milliseconds for which the spinner should be shown
    const startTime = Date.now();

    const apiUrl = import.meta.env.VITE_API_URL;
    const formData = isLogin ? loginFormData : signupFormData;
    const endpoint = isLogin
      ? `${apiUrl}/users/login`
      : `${apiUrl}/users/register`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error in network response");
      }

      const result = await response.json();

      if (isLogin) {
        setSuccessMessage("Login successful");
        sessionStorage.setItem("token", result.accessToken);
        sessionStorage.setItem("username", result.user.username);
        sessionStorage.setItem("id", result.user.id.toString());
        sessionStorage.setItem("roleid", result.user.role_id.toString());
        setTimeout(() => {
          setSuccessMessage("");
          navigate("/"); // Redirect to home page
        }, 3000);
      } else {
        setSuccessMessage("User registered successfully");
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);

        setIsLogin(true); // Switch to login section

        setSignupFormData({
          username: "",
          email: "",
          phoneNumber: "",
          password: "",
        });
      }

      setErrorMessage(""); // Clear any previous error message
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message); // Set error message
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      setSuccessMessage(""); // Clear any previous success message
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, delay - elapsedTime);

      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    }
  };

  const renderValidationIcon = (field) => {
    if (validationErrors[field]) {
      return (
        <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 ml-2" />
      );
    } else if (
      (isLogin ? loginFormData[field] : signupFormData[field]) !== "" &&
      !validationErrors[field]
    ) {
      return (
        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 ml-2" />
      );
    }
    return null;
  };

  return (
    <div className="padding">
      <div className="max-md:mt-20 max-sm:text-sm max-w-md mx-auto mt-10 p-8 bg-white border border-gray-300 shadow-3xl shadow-slate-200 rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-sky-700 text-4xl"
            />
          </div>
        ) : (
          <>
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
            <div className="flex justify-evenly mb-6 bg-sky-100">
              <button
                className={`px-4 py-2 ${
                  isLogin
                    ? " m-2 border w-[50%] bg-white text-black-500 font-semibold font-montserrat"
                    : " w-[50%] font-normal font-montserrat bg-sky-100"
                }`}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
              <button
                className={`px-4 py-2 ${
                  !isLogin
                    ? "m-2 border w-[50%] bg-white text-black font-semibold font-montserrat"
                    : "w-[50%] font-normal font-montserrat bg-sky-100"
                }`}
                onClick={() => setIsLogin(false)}
              >
                Create Account
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="py-4 block text-lg text-sky-950 font-palanquin font-semibold text-md"
            >
              {!isLogin && (
                <>
                  <div className="mb-4">
                    <label htmlFor="username" className="block">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2 flex items-center">
                      <input
                        type="text"
                        name="username"
                        id="username"
                        autoComplete="username"
                        value={signupFormData.username}
                        onChange={handleChange}
                        className={`block w-full border-b text-base leading-6 pl-1 py-1.5 ${
                          validationErrors.username
                            ? "border-red-500"
                            : "border-sky-800"
                        } text-sky-950 font-medium font-montserrat placeholder:pl-0 placeholder:text-gray-300 placeholder:font-montserrat placeholder:text-lg focus:outline-none ${
                          validationErrors.username
                            ? "focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "focus:border-sky-800 focus:ring-1 focus:ring-sky-800"
                        }`}
                        placeholder="Enter Username"
                        required
                      />
                      {renderValidationIcon("username")}
                    </div>
                    {validationErrors.username && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.username}
                      </p>
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
                        autoComplete="tel"
                        value={signupFormData.phoneNumber}
                        onChange={handleChange}
                        className={`block w-full border-b text-base leading-6 pl-1 py-1.5 ${
                          validationErrors.phoneNumber
                            ? "border-red-500"
                            : "border-sky-800"
                        } text-sky-950 font-medium font-montserrat placeholder:pl-0 placeholder:text-gray-300 placeholder:font-montserrat placeholder:text-lg focus:outline-none ${
                          validationErrors.phoneNumber
                            ? "focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "focus:border-sky-800 focus:ring-1 focus:ring-sky-800"
                        }`}
                        placeholder="Enter Phone Number"
                        required
                      />
                      {renderValidationIcon("phoneNumber")}
                    </div>
                    {validationErrors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.phoneNumber}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="mb-4">
                <label htmlFor="email" className="block">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 flex items-center">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    value={isLogin ? loginFormData.email : signupFormData.email}
                    onChange={handleChange}
                    className={`block w-full border-b text-base leading-6 pl-1 py-1.5 ${
                      validationErrors.email
                        ? "border-red-500"
                        : "border-sky-800"
                    } text-sky-950 font-medium font-montserrat placeholder:pl-0 placeholder:text-gray-300 placeholder:font-montserrat placeholder:text-lg focus:outline-none ${
                      validationErrors.email
                        ? "focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "focus:border-sky-800 focus:ring-1 focus:ring-sky-800"
                    }`}
                    placeholder="Enter Email"
                    required
                  />
                  {renderValidationIcon("email")}
                </div>
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.email}
                  </p>
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
                    autoComplete="current-password"
                    value={
                      isLogin ? loginFormData.password : signupFormData.password
                    }
                    onChange={handleChange}
                    className={`block w-full border-b text-base leading-6 pl-1 py-1.5 ${
                      validationErrors.password
                        ? "border-red-500"
                        : "border-sky-800"
                    } text-sky-950 font-medium font-montserrat placeholder:pl-0 placeholder:text-gray-300 placeholder:font-montserrat placeholder:text-lg focus:outline-none ${
                      validationErrors.password
                        ? "focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "focus:border-sky-800 focus:ring-1 focus:ring-sky-800"
                    }`}
                    placeholder="Enter Password"
                    required
                  />
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="cursor-pointer ml-2"
                    onClick={togglePasswordVisibility}
                  />
                  {renderValidationIcon("password")}
                </div>
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {isLogin && (
                <div className="mb-4 flex items-center">
                  {isLogin && (
                    <div className="text-base">
                      <a
                        href="/forgot-password"
                        className="text-sky-800 hover:underline"
                      >
                        Forgot Password?
                      </a>
                    </div>
                  )}
                </div>
              )}

             
              <button
                type="submit"
                className="w-full bg-sky-700 text-white py-2 px-4 rounded hover:bg-sky-800 focus:outline-none focus:bg-sky-800"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </button>

              <div className="text-center mt-4">
                {isLogin ? (
                  <p>
                    New here?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-sky-800 underline"
                    >
                      Create an account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-sky-800 underline"
                    >
                      Login
                    </button>
                  </p>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginSignupCard;
