import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    query: '',
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    query: false,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent pasting links in query field
    if (name === 'query') {
      // Block common link patterns
      const linkPatterns = [
        /https?:\/\//i,
        /www\./i,
        /\.(com|org|net|edu|gov)\b/i,
        /\[url\]/i,
        /<a\s+href=/i
      ];

      const hasLink = linkPatterns.some(pattern => pattern.test(value));

      if (hasLink) {
        setValidationErrors(prev => ({
          ...prev,
          query: 'Links are not allowed in the query field.'
        }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (e) => {
    setTouched(prev => ({
      ...prev,
      [e.target.name]: true,
    }));
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const errors = {};

    // Name validation: more comprehensive
    if (!/^[a-zA-Z\s]{2,50}$/.test(formData.name)) {
      errors.name = 'Name must be 2-50 characters long, using only alphabets and spaces';
    }

    // Email validation: more robust
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Query validation: more comprehensive
    if (formData.query.trim().length < 10) {
      errors.query = 'Query must be at least 10 characters long';
    }

    setValidationErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Comprehensive validation before submission
    if (Object.keys(validationErrors).length > 0) {
      setErrorMessage('Please correct the errors in the form.');
      return;
    }

    // Check if user is logged in
    const token = sessionStorage.getItem('token');
    if (!token) {
      setErrorMessage('You must be logged in to submit the contact form.');
      return;
    }

    try {
      const userId = sessionStorage.getItem('id');
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${apiUrl}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, ...formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit contact form');
      }

      const result = await response.json();
      setSuccessMessage(result.message);

      // Clear form
      setFormData({
        name: '',
        email: '',
        query: '',
      });

      setTouched({
        name: false,
        email: false,
        query: false,
      });

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error(error);
      setErrorMessage('Error: Unable to submit the contact form. Please try again later.');
    }
  };

  const renderValidationIcon = (field) => {
    if (!formData[field]) return null;
    return validationErrors[field] ? (
      <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 ml-2" />
    ) : (
      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 ml-2" />
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="py-4 px-4 block max-md:text-lg text-xl text-sky-950 font-palanquin font-semibold text-md space-y-6 mt-5">
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
        <div className="sm:col-span-3">
          <label htmlFor="Name" className="block">
            Name <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 flex items-center">
            <input
              type="text"
              name="name"
              id="Name"
              autoComplete="given-name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`block text-base leading-6 pl-2 w-full border-b py-2 text-sky-950 font-medium font-montserrat placeholder:pl-0 placeholder:text-gray-300 placeholder:font-montserrat placeholder:text-lg focus:outline-none ${touched.name && validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-sky-800 focus:border-sky-800 focus:ring-1 focus:ring-sky-800'}`}
              placeholder="Enter Name"
            />
            {renderValidationIcon('name')}
          </div>
          {touched.name && validationErrors.name && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
          )}
        </div>
        <div className="sm:col-span-3">
          <label htmlFor="Email" className="block">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 flex items-center">
            <input
              type="email"
              name="email"
              id="Email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`block w-full border-b text-base leading-6 pl-2 py-1.5 text-sky-950 font-medium font-montserrat placeholder:pl-0 placeholder:text-gray-300 placeholder:font-montserrat placeholder:text-lg focus:outline-none ${touched.email && validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-sky-800 focus:border-sky-800 focus:ring-1 focus:ring-sky-800'}`}
              placeholder="Enter Email"
            />
            {renderValidationIcon('email')}
          </div>
          {touched.email && validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>
        <div className="sm:col-span-3">
          <label htmlFor="query" className="block">
            What can we help with? <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 flex items-center">
            <textarea
              name="query"
              id="query"
              autoComplete="given-name"
              value={formData.query}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`block w-full h-20 border-b text-base leading-6 pl-2 py-1.5 text-sky-950 font-medium font-montserrat placeholder:pl-0 placeholder:text-gray-300 placeholder:font-montserrat placeholder:text-lg focus:outline-none ${touched.query && validationErrors.query ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-sky-800 focus:border-sky-800 focus:ring-1 focus:ring-sky-800'}`}
              placeholder="Enter Your Query"
            />
            {renderValidationIcon('query')}
          </div>
          {touched.query && validationErrors.query && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.query}</p>
          )}
        </div>
        <div className="sm:col-span-3 mt-4">
          <button
            type="submit"
            className="w-full bg-sky-950 hover:bg-sky-700 text-white font-semibold py-2 px-4 border border-sky-800 rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-900 transition-colors duration-300 ease-in-out"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
