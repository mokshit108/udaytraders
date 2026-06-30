import { useRef, useEffect, useState } from "react";
import PopularProductCard from "../components/PopularProductCard";

const PopularProducts = () => {
  const containerRef = useRef(null);
  const [scrollable, setScrollable] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/products/popular`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data.rows)) {
          setProducts(data.rows);
        } else {
          console.error("Unexpected response format:", data);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching popular products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(1);
      } else if (window.innerWidth < 768) {
        setCardsToShow(2);
      } else if (window.innerWidth <= 1024) {
        setCardsToShow(3);
      } else {
        setCardsToShow(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    updateScrollability();
  }, [products, cardsToShow]);

  const updateScrollability = () => {
    if (containerRef.current) {
      const canScroll = products.length > cardsToShow;
      setScrollable(canScroll);
      if (!canScroll && currentIndex !== 0) {
        setCurrentIndex(0);
      }
    }
  };

  const scrollLeft = () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(newIndex);
  };

  const scrollRight = () => {
    const newIndex = Math.min(currentIndex + 1, products.length - cardsToShow);
    setCurrentIndex(newIndex);
  };

  return (
    <section id="products" className="max-container w-full">
      <div className="flex flex-col justify-start gap-2">
        <h2 className="font-palanquin text-2.5xl md:text-3.5xl lg:text-3xl xl:text-4xl font-bold text-start max-md:mx-3 lg:p-2">
          Our <span className="text-sky-700"> Popular </span> Products
        </h2>
        <p className="md:text-xl text-start font-montserrat font-medium text-gray-500 text-md w-full content-fit leading-7 max-md:mx-3 lg:p-2">
          We believe in offering the best products that are driven by innovation
          and exceptional design.
        </p>
      </div>
      <div className="mt-8 relative">
        <div
          ref={containerRef}
          className="flex space-x-4 pb-4 overflow-x-auto"
          style={{
            display: "flex",
            justifyContent: cardsToShow === 1 ? "center" : "flex-start",
            scrollSnapType: cardsToShow === 1 ? "x mandatory" : "none",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {products
            .slice(currentIndex, currentIndex + cardsToShow)
            .map((product) => (
              <div
                key={product.id}
                style={{
                  scrollSnapAlign: cardsToShow === 1 ? "center" : "start",
                }}
              >
                <PopularProductCard
                  img_url={product.img_url}
                  name={product.name}
                  price={product.price}
                  product={product}
                  stock={product.stock}
                />
              </div>
            ))}
        </div>

        {scrollable && (
          <div className="flex justify-center items-center space-x-6 mt-6">
            <button
              onClick={scrollLeft}
              disabled={currentIndex === 0}
              className={`
                max-md:w-9 max-md:h-9
                group relative w-12 h-12
                border-2 border-sky-950
                flex items-center justify-center
                transition-all duration-300 ease-in-out
                ${
                  currentIndex === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-sky-950"
                }
              `}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`
                  max-md:w-6 max-md:h-6
                  w-8 h-8
                  ${
                    currentIndex === 0
                      ? "text-gray-400"
                      : "text-sky-950 group-hover:text-white"
                  }
                `}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            <span className="text-gray-700 text-lg font-semibold">
              {currentIndex + 1}/{Math.ceil(products.length / cardsToShow)}
            </span>

            <button
              onClick={scrollRight}
              disabled={currentIndex === products.length - cardsToShow}
              className={`
                max-md:w-9 max-md:h-9
                group relative w-12 h-12
                border-2 border-sky-950
                flex items-center justify-center
                transition-all duration-300 ease-in-out
                ${
                  currentIndex === products.length - cardsToShow
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-sky-950"
                }
              `}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`
                  max-md:w-6 max-md:h-6
                  w-8 h-8
                  ${
                    currentIndex === products.length - cardsToShow
                      ? "text-gray-400"
                      : "text-sky-950 group-hover:text-white"
                  }
                `}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularProducts;
