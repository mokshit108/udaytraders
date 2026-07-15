import { useState, useEffect, useContext } from "react";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck, faFilter, faSort, faSortAmountDown, faSortAmountUp, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../context/CartContext";

const NewArrivals = () => {

  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState("none"); // 'none', 'lowToHigh', 'highToLow'
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      setLoading(true);

      const delay = 2000; // Minimum time in milliseconds for which the spinner should be shown
      const startTime = Date.now();

      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/productscategories`);

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        // Check if data is in the expected format
        if (Array.isArray(data.products)) {
          setProducts(data.products);
          setInStockOnly([...new Set(data.products.map((item) => item.stock))]);
        } else {
          console.error("Products data is not an array:", data.products);
          setErrorMessage("Error: Products data is invalid.");
        }

        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          console.error("Categories data is not an array:", data.categories);
          setErrorMessage("Error: Categories data is invalid.");
        }
        if (Array.isArray(data.companies)) {
          setCompanies(data.companies);
        } else {
          console.error("Compnaies data is not an array:", data.companies);
          setErrorMessage("Error: Companies data is invalid.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Error: Unable to fetch data. Please try again later.");
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, delay - elapsedTime);

        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      }
    };

    fetchProductsAndCategories();
  }, []);

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
  };

  const handleCompanyChange = (companyId) => {
    setSelectedCompany(companyId);
  };

  const handleCategoryChange = (categoryId) => {
    const index = selectedCategory.indexOf(categoryId);
    if (index === -1) {
      setSelectedCategory([...selectedCategory, categoryId]);
    } else {
      setSelectedCategory(selectedCategory.filter((id) => id !== categoryId));
    }
  };

  const handleInStockChange = () => {
    setInStockOnly(!inStockOnly);
  };

  const clearCompanyFilters = () => {
    setSelectedCompany("");
  };

  const clearCategoryFilters = () => {
    setSelectedCategory([]);
  };

  const clearAllFilters = () => {
    setSelectedCompany("");
    setSelectedCategory([]);
    setInStockOnly(false);
    setPriceRange([0, 10000]);
    setSortOrder("none");
  };

  const clearPriceRange = () => {
    setPriceRange([0, 10000]);
  };


  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Filter products based on criteria
  const filteredProducts = products.filter((item) => {
    return (
      item.price >= priceRange[0] &&
      item.price <= priceRange[1] &&
      (selectedCompany === "" || item.company_id === parseInt(selectedCompany)) &&
      (selectedCategory.length === 0 ||
        selectedCategory.includes(item.category_id)) &&
      (!inStockOnly || item.stock)
    );
  });

  // Sort products based on price
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "lowToHigh") {
      return a.price - b.price;
    } else if (sortOrder === "highToLow") {
      return b.price - a.price;
    }
    return 0; // No sorting
  });

  const sliderStyle = {
    width: "100%",
  };

  const defaultTrackStyle = [
    {
      backgroundColor: "#0c4a6e",
      height: "4px",
      borderRadius: "2px",
      borderColor: "white",
    },
  ];

  return (
    <>
      <section className="padding">
        <h3 className="max-md:text-3xl max-md:pt-14 text-4xl font-palanquin font-bold text-center pt-5 text-sky-900">
          New
          <span className="text-black"> Arrivals </span>
        </h3>

        {errorMessage && (
          <div className="text-red-600 text-center mt-4">{errorMessage}</div>
        )}

        {/* Mobile Filter Toggle Button */}
        <div className="md:hidden flex justify-center my-4">
          <button
            onClick={toggleFilters}
            className="flex items-center bg-sky-950 text-white px-4 py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="flex flex-wrap mt-4 relative">
          {/* Filters Section - Hidden by default on mobile */}
          <div className={`w-full md:w-[30%] md:block ${showFilters ? 'block' : 'hidden'} p-4 md:p-8 font-montserrat bg-white md:bg-transparent z-10 ${showFilters ? 'fixed md:static inset-0 overflow-y-auto pt-16' : ''}`}>
            {/* Close button for mobile filter overlay */}
            {showFilters && (
              <div className="md:hidden absolute top-4 right-4">
                <button
                  onClick={toggleFilters}
                  className="text-sky-950 p-2 rounded-full bg-gray-100"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            )}

            {/* Shop by Price */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold">Shop by Price</h4>
              <div className="border-t border-gray-300 my-3"></div>
              <div style={sliderStyle}>
                <Slider
                  range
                  min={0}
                  max={10000}
                  value={priceRange}
                  onChange={handlePriceChange}
                  railStyle={{
                    backgroundColor: "grey",
                    height: "4px",
                    borderRadius: "2px",
                    borderColor: "white",
                  }}
                  trackStyle={defaultTrackStyle}
                  handleStyle={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #0c4a6e",
                    backgroundColor: "#ffffff",
                  }}
                />
                <div className="flex justify-between mt-2 font-montserrat font-medium text-sky-950">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
                <div className="flex items-center mt-2">
                  <button
                    className="text-gray-700 mr-2 flex items-center text-sm"
                    onClick={clearPriceRange}
                  >
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="h-4 w-4 inline-block mr-1"
                    />
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Sort by Price Section */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold">Sort by Price</h4>
              <div className="border-t border-gray-300 my-3"></div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="sort-none"
                    name="sort-price"
                    checked={sortOrder === "none"}
                    onChange={() => handleSortChange("none")}
                    className="mr-2 h-5 w-5"
                  />
                  <label htmlFor="sort-none" className="flex items-center">
                    <FontAwesomeIcon icon={faSort} className="mr-2" />
                    No Sorting
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="sort-low-to-high"
                    name="sort-price"
                    checked={sortOrder === "lowToHigh"}
                    onChange={() => handleSortChange("lowToHigh")}
                    className="mr-2 h-5 w-5"
                  />
                  <label htmlFor="sort-low-to-high" className="flex items-center">
                    <FontAwesomeIcon icon={faSortAmountUp} className="mr-2" />
                    Price: Low to High
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="sort-high-to-low"
                    name="sort-price"
                    checked={sortOrder === "highToLow"}
                    onChange={() => handleSortChange("highToLow")}
                    className="mr-2 h-5 w-5"
                  />
                  <label htmlFor="sort-high-to-low" className="flex items-center">
                    <FontAwesomeIcon icon={faSortAmountDown} className="mr-2" />
                    Price: High to Low
                  </label>
                </div>
              </div>
            </div>

            {/* Shop by Category */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold">Shop by Category</h4>
              <div className="border-t border-gray-300 my-3"></div>
              <div className="mt-2 flex flex-wrap items-center">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center mb-2 mr-4 font-medium justify-center"
                  >
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      value={category.id}
                      checked={selectedCategory.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="mr-2 h-5 w-5 appearance-none rounded border-2 border-gray-300 checked:bg-sky-950 checked:border-transparent relative"
                    />
                    <label htmlFor={`category-${category.id}`}>
                      {category.name}
                    </label>
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="absolute top-0 left-0 mt-1 ml-1 text-white opacity-0 checked:opacity-100"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center mt-1">
                <button
                  className="text-gray-700 mr-2 text-sm"
                  onClick={clearCategoryFilters}
                >
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="h-4 w-4 inline-block mr-1"
                  />
                  Clear
                </button>
              </div>
            </div>

            {/* Shop by Company */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold">Shop by Company</h4>
              <div className="border-t border-gray-300 my-3"></div>
              <div className="flex flex-wrap mt-2">
                {companies.map((company, index) => (
                  <div
                    key={index}
                    className="flex items-center mb-2 mr-4 font-medium"
                  >
                    <input
                      type="radio"
                      id={`company-${index}`}
                      name="company"
                      value={company.id}
                      checked={selectedCompany === company.id}
                      onChange={() => handleCompanyChange(company.id)}
                      className="mr-2 h-5 w-5 appearance-none rounded border-2 border-gray-300 checked:bg-sky-950 checked:border-transparent relative"
                    />
                    <label htmlFor={`company-${index}`}>{company.name}</label>
                  </div>
                ))}
              </div>
              <div className="flex items-center mt-1">
                <button
                  className="text-gray-700 mr-2 text-sm"
                  onClick={clearCompanyFilters}
                >
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="h-4 w-4 inline-block mr-1"
                  />
                  Clear
                </button>
              </div>
            </div>

            {/* In Stock Only */}
            <div className="flex items-center mb-8">
              <input
                type="checkbox"
                id="inStockOnly"
                checked={inStockOnly}
                onChange={handleInStockChange}
                className="mr-2 h-5 w-5"
              />
              <label htmlFor="inStockOnly">In Stock Only</label>
            </div>

            {/* Clear All Filters Button */}
            {(selectedCompany !== "" ||
              selectedCategory.length > 0 ||
              inStockOnly ||
              sortOrder !== "none" ||
              priceRange[0] !== 0 ||
              priceRange[1] !== 10000) && (
              <div
                onClick={clearAllFilters}
                className="px-4 py-2 bg-sky-950 hover:bg-sky-700 text-white rounded-md cursor-pointer flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4 mr-1" />
                Clear All Filters
              </div>
            )}

            {/* Apply button for mobile */}
            {showFilters && (
              <div className="md:hidden mt-4">
                <button
                  onClick={toggleFilters}
                  className="w-full py-3 bg-sky-700 text-white rounded-md font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            )}
          </div>

          {/* Products Grid Section */}
          <div className="md:h-fit md:w-2/3 w-full grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 font-montserrat mx-auto">
            {loading ? (
              <div className="flex justify-center items-center h-40 md:h-screen w-full col-span-2 md:col-span-3 md:-mt-36">
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className="text-4xl text-sky-900"
                />
                <span className="ml-2">Loading Products...</span>
              </div>
            ) : sortedProducts.length > 0 ? (
              sortedProducts.map((product, index) => {
                const isLongName = product.name.length > 20;

                return (
                  <div key={index} className="border border-gray-200 flex flex-col bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden group">
                    {/* Product image */}
                    <div className="w-full aspect-square relative bg-gray-50 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.img_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product details */}
                    <div className="p-3 sm:p-4 flex flex-col flex-grow bg-white">
                      <h5 className={`${isLongName ? "text-xs sm:text-sm" : "text-sm sm:text-base"} font-semibold line-clamp-2 min-h-[2.5em] text-slate-800`}>
                        {product.name}
                      </h5>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-slate-500 text-xs sm:text-sm font-medium">{product.company}</p>
                        <p className="text-sky-900 font-bold text-sm sm:text-base">
                          ₹{product.price}
                        </p>
                      </div>
                      <div className="mt-auto pt-3">
                        {!product.stock ? (
                          <p className="text-red-500 font-semibold text-xs sm:text-sm text-center py-2">
                            Restocking soon
                          </p>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full bg-sky-700 text-white py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-sky-800 active:scale-95 transition-all shadow-sm"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="border border-gray-300 p-4 flex justify-center items-center col-span-2 md:col-span-3 rounded-md">
                <div className="font-montserrat text-xl md:text-2xl font-semibold text-gray-700 text-center">
                  No products match the selected filters.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default NewArrivals;