import { useState, useEffect } from "react";

const CheckoutForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "",
    streetAddress1: "",
    streetAddress2: "",
    city: "",
    station: "",
    phone: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    streetAddress1: "",
    streetAddress2: "",
    station: "",
    phone: "",
    pincode: "",
  });

  // useEffect(() => {
  //   // Retrieve saved data from local storage
  //   const savedData = JSON.parse(sessionStorage.getItem('checkoutFormDetails'));
  //   if (savedData) {
  //     setFormData(savedData);
  //   } else {
  //     // Set default values if no saved data
  //     sessionStorage.setItem('checkoutFormDetails', JSON.stringify(formData));
  //   }
  // }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = sessionStorage.getItem("id");
      const apiUrl = import.meta.env.VITE_API_URL;
      // Assume userId is stored in localStorage
      if (!userId) return;

      try {
        const response = await fetch(`${apiUrl}/orders/form-details/${userId}`);
        const data = await response.json();

        if (data) {
          // Prefill the form if data is available
          setFormData(data);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    // Store data in local storage whenever formData changes
    sessionStorage.setItem("checkoutFormDetails", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Validation logic
    switch (name) {
      case "firstName":
      case "lastName":
        if (!/^[a-zA-Z]+$/.test(value)) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "Only alphabets are allowed.",
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
          }));
        }
        break;
      case "streetAddress1":
      case "streetAddress2":
        if (!/^(\w+\s+\w+).*$/.test(value)) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "At least two words are required.",
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
          }));
        }
        break;
      case "station":
        if (!/^[a-zA-Z]+$/.test(value)) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "Only alphabets are allowed.",
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
          }));
        }
        break;
      case "pincode":
        if (!/^\d{6}$/.test(value)) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "PIN Code must be 6 digits.",
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
          }));
        }
        break;
      case "phone":
        if (!/^\d{10}$/.test(value)) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "Phone number must be 10 digits.",
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
          }));
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full mt-5">
      <form className="bg-white border-solid border shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h3 className="font-palanquin font-semibold text-sky-950 text-2xl mb-8">
          Billing Details
        </h3>
        <div className="mb-4 flex">
          <div className="w-1/2 mr-2">
            <label
              className="block text-gray-500 text-base font-semibold mb-2"
              htmlFor="firstName"
            >
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              id="firstName"
              className="appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            {errors.firstName && (
              <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          <div className="w-1/2">
            <label
              className="block text-gray-500 text-base font-semibold mb-2"
              htmlFor="lastName"
            >
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              id="lastName"
              className="appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            {errors.lastName && (
              <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-500 text-base font-semibold mb-2"
            htmlFor="country"
          >
            Country <span className="text-red-600">*</span>
          </label>
          <select
            id="country"
            className="appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          >
            <option>Select</option>
            <option value="India">India</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-500 text-base font-semibold mb-2"
            htmlFor="streetAddress1"
          >
            Street Address <span className="text-red-600">*</span>
          </label>
          <textarea
            id="streetAddress1"
            className="appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline mb-2"
            placeholder="House No. and Street Name"
            name="streetAddress1"
            value={formData.streetAddress1}
            onChange={handleChange}
            required
          />
          {errors.streetAddress1 && (
            <p className="text-red-600 text-sm mt-1">{errors.streetAddress1}</p>
          )}
          <textarea
            className="appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Apartment, Landmark"
            name="streetAddress2"
            value={formData.streetAddress2}
            onChange={handleChange}
            required
          />
          {errors.streetAddress2 && (
            <p className="text-red-600 text-sm mt-1">{errors.streetAddress2}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-500 text-base font-semibold mb-2"
            htmlFor="city"
          >
            City <span className="text-red-600">*</span>
          </label>
          <select
            id="city"
            className="appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          >
            <option>Select</option>
            <option value="Mumbai">Mumbai</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-500 text-base font-semibold mb-2"
            htmlFor="station"
          >
            Station (Mumbai) <span className="text-red-600">*</span>
          </label>
          <input
            id="station"
            className="appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Nearest station"
            name="station"
            value={formData.station}
            onChange={handleChange}
            required
          />
          {errors.station && (
            <p className="text-red-600 text-sm mt-1">{errors.station}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-500 text-base font-semibold mb-2"
            htmlFor="pincode"
          >
            PIN Code <span className="text-red-600">*</span>
          </label>
          <input
            id="pincode"
            className="appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="PIN Code"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
          />
          {errors.pincode && (
            <p className="text-red-600 text-sm mt-1">{errors.pincode}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-500 text-base font-semibold mb-2"
            htmlFor="phone"
          >
            Phone Number <span className="text-red-600">*</span>
          </label>
          <input
            id="phone"
            className="appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
