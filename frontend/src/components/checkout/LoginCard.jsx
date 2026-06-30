import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import FormField from '../../pages/FormField';

const LoginCard = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    let errors = {};

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    // Password validation
    if (formData.password && !/(?=.*[a-zA-Z])(?=.*\d).{8,}/.test(formData.password)) {
      errors.password = 'Password must be at least 8 characters long and contain at least one letter and one number.';
    }

    setValidationErrors(errors);
  };

  const toggleLoginForm = () => {
    setShowLoginForm(!showLoginForm);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderValidationIcon = (fieldName) => {
    if (!formData[fieldName]) return null;
    
    const isValid = !validationErrors[fieldName];
    return (
      <FontAwesomeIcon
        icon={isValid ? faCheckCircle : faTimesCircle}
        className={`${isValid ? 'text-green-500' : 'text-red-500'} mr-2 ml-2`}
      />
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (Object.keys(validationErrors).length > 0) {
      setErrorMessage('Please fix the validation errors before submitting.');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error in network response");
      }

      const result = await response.json();

      sessionStorage.setItem('token', result.accessToken);
      sessionStorage.setItem('username', result.user.username);
      sessionStorage.setItem('id', result.user.id.toString());

      setSuccessMessage('Login successful');
      setErrorMessage('');

      setFormData({
        email: '',
        password: ''
      });

      setTimeout(() => {
        setSuccessMessage('');
        navigate('/checkout');
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      setSuccessMessage("");
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const backendResponse = await fetch(`${apiUrl}/users/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.error || 'Google login failed');
      }

      const result = await backendResponse.json();

      sessionStorage.setItem('token', result.accessToken);
      sessionStorage.setItem('username', result.user.username);
      sessionStorage.setItem('id', result.user.id.toString());

      if (!result.user.phone) {
        setSuccessMessage('Google login successful. Please register your mobile number.');
        setTimeout(() => navigate('/register-phone-number'), 2000);
      } else {
        setSuccessMessage('Google login successful');
        setTimeout(() => {
          navigate('/checkout');
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setErrorMessage(error.message);
      console.error('Google login error:', error);
    }
  };

  const handleGoogleLoginError = () => {
    setErrorMessage('Google login failed. Please try again.');
  };

  return (
    <div className={`w-full p-6 bg-white border border-solid shadow-md rounded-md overflow-hidden ${showLoginForm ? "h-fit" : "h-20"} transition-all duration-1000`}>
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>{successMessage}</p>
        </div>
      )}
      <p className="text-start text-base text-gray-500">
        Returning customer?{' '}
        <button onClick={toggleLoginForm} className="text-black hover:text-sky-500 hover:underline">
          Click here to login
        </button>
      </p>
      {showLoginForm && (
        <div className="space-y-6">
          <p className="text-start text-sm text-gray-600 mt-5 font-montserrat font-medium">
            If you have shopped with us before, please enter your login details below. If you are a new customer, please proceed to SignUp.
          </p>
          <form className="mt-4" onSubmit={handleLogin}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                validationError={validationErrors.email}
                renderValidationIcon={renderValidationIcon}
                required
              />
              
              <FormField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                validationError={validationErrors.password}
                renderValidationIcon={renderValidationIcon}
                required
                additionalContent={
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="cursor-pointer text-sky-950 text-lg ml-2 mr-1"
                    onClick={togglePasswordVisibility}
                  />
                }
              />

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-sky-950 text-white rounded-md hover:bg-sky-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={Object.keys(validationErrors).length > 0}
                >
                  Login
                </button>
              </div>
            </div>
          </form>

          {/* Google Sign-In Button */}
          <div className="flex justify-center mt-6">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              useOneTap
              width="300"
            />
          </div>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default LoginCard;