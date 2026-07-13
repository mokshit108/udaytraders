import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import LoginSignupToggle from "./LoginSignupToggle";
import FormField from "./FormField";

const LoginCard = () => {
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
    specialCode: "",
  });
  const [googleSignupToken, setGoogleSignupToken] = useState(null);
  const [showGoogleCodeInput, setShowGoogleCodeInput] = useState(false);
  const [googleSpecialCode, setGoogleSpecialCode] = useState("");
  const [googlePhoneNumber, setGooglePhoneNumber] = useState("");
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

  const handleGoogleSignup = (response) => {
    // Store token and ask for special code instead of calling backend immediately
    setGoogleSignupToken(response.credential);
    setShowGoogleCodeInput(true);
  };

  const submitGoogleSignupWithCode = async () => {
    if (!googleSpecialCode) {
      setErrorMessage("Please enter the special code.");
      return;
    }
    if (!/^\d{10}$/.test(googlePhoneNumber)) {
      setErrorMessage("Phone number must be exactly 10 digits.");
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const backendResponse = await fetch(`${apiUrl}/users/google-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: googleSignupToken,
          specialCode: googleSpecialCode,
          phoneNumber: googlePhoneNumber,
        }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.error || "Google signup failed");
      }

      const result = await backendResponse.json();

      sessionStorage.setItem("token", result.accessToken);
      sessionStorage.setItem("username", result.user.username);
      sessionStorage.setItem("id", result.user.id.toString());
      sessionStorage.setItem("roleid", result.user.role_id.toString());

      if (!result.user.phone) {
        setSuccessMessage("Google signup successful. Please register your mobile number.");
        setTimeout(() => navigate("/register-phone-number"), 3000);
      } else {
        setSuccessMessage("Google signup successful");
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isLogin) {
      setLoginFormData({
        ...loginFormData,
        [name]: value,
      });
    } else {
      setSignupFormData({
        ...signupFormData,
        [name]: value,
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
          specialCode: "",
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

  const handleGoogleLoginSuccess = async (response) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const backendResponse = await fetch(`${apiUrl}/users/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });
  
      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.error || "Google login failed");
      }
  
      const result = await backendResponse.json();
  
      // Store user data in session
      sessionStorage.setItem("token", result.accessToken);
      sessionStorage.setItem("username", result.user.username);
      sessionStorage.setItem("id", result.user.id.toString());
      sessionStorage.setItem("roleid", result.user.role_id.toString());
  
      setSuccessMessage("Google login successful");
      setTimeout(() => navigate("/"), 3000); // Redirect to home page
  
    } catch (error) {
      setErrorMessage(error.message);
      if (error.message.includes("Please sign up first")) {
        // Optionally switch to signup view
        setIsLogin(false);
      }
    }
  };

  const handleGoogleLoginError = () => {
    setErrorMessage("Google login failed. Please try again.");
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

            <LoginSignupToggle isLogin={isLogin} setIsLogin={setIsLogin} />

            <form
              onSubmit={handleSubmit}
              className="py-4 block text-lg text-sky-950 font-palanquin font-semibold text-md"
            >
              {!isLogin && (
                <>
                  <FormField
                    label="Username"
                    name="username"
                    value={signupFormData.username}
                    onChange={handleChange}
                    placeholder="Enter Username"
                    validationError={validationErrors.username}
                    renderValidationIcon={renderValidationIcon}
                    required
                  />
                  <FormField
                    label="Phone Number"
                    name="phoneNumber"
                    type="tel"
                    value={signupFormData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter Phone Number"
                    validationError={validationErrors.phoneNumber}
                    renderValidationIcon={renderValidationIcon}
                    required
                  />
                  <FormField
                    label="Special Code"
                    name="specialCode"
                    type="text"
                    value={signupFormData.specialCode}
                    onChange={handleChange}
                    placeholder="Enter Admin Special Code"
                    validationError={validationErrors.specialCode}
                    renderValidationIcon={renderValidationIcon}
                    required
                  />
                </>
              )}

              <FormField
                label="Email"
                name="email"
                type="email"
                value={isLogin ? loginFormData.email : signupFormData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                validationError={validationErrors.email}
                renderValidationIcon={renderValidationIcon}
                required
              />

              <FormField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={
                  isLogin ? loginFormData.password : signupFormData.password
                }
                onChange={handleChange}
                placeholder="Enter Password"
                validationError={validationErrors.password}
                renderValidationIcon={renderValidationIcon}
                required
                additionalContent={
                  // Pass the eye icon here
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="cursor-pointer text-sky-950 text-lg ml-2 mr-1"
                    onClick={togglePasswordVisibility}
                  />
                }
              />

              {isLogin && (
                <div className="mb-4 flex items-center">
                  <div className="text-base">
                    <a
                      href="/forgot-password"
                      className="text-sky-800 hover:underline"
                    >
                      Forgot Password?
                    </a>
                  </div>
                </div>
              )}



              <button
                type="submit"
                className="w-full bg-sky-700 text-white py-2 px-4 rounded hover:bg-sky-800 focus:outline-none focus:bg-sky-800"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </button>


              {!isLogin ? (
                <div className="m-4">
                  {!showGoogleCodeInput ? (
                    <GoogleLogin
                      text="signup_with"
                      onSuccess={handleGoogleSignup}
                      onError={() => setErrorMessage("Google signup failed. Please try again.")}
                      useOneTap
                    />
                  ) : (
                    <div className="flex flex-col gap-2 p-4 border border-gray-300 rounded">
                      <p className="text-sm font-semibold text-center mb-2">Google Account Selected</p>
                      <input
                        type="tel"
                        placeholder="Enter Phone Number"
                        className="w-full px-4 py-2 border rounded"
                        value={googlePhoneNumber}
                        onChange={(e) => setGooglePhoneNumber(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Enter Special Code"
                        className="w-full px-4 py-2 border rounded"
                        value={googleSpecialCode}
                        onChange={(e) => setGoogleSpecialCode(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={submitGoogleSignupWithCode}
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-2"
                      >
                        Complete Google Signup
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowGoogleCodeInput(false);
                          setGoogleSignupToken(null);
                        }}
                        className="w-full text-red-600 underline text-sm mt-2"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="m-4">
                  <GoogleLogin
                    text="signin_with"
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    useOneTap
                  />
                </div>
              )}

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

export default LoginCard;
