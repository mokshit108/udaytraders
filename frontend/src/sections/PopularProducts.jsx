import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import PopularProductCard from "../components/PopularProductCard";

const MAX_HOME_PRODUCTS = 8;

const skeletons = [0, 1, 2, 3];

const PopularProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/products/popular`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const rows = Array.isArray(data) ? data : data.rows;
        if (!cancelled) {
          setProducts(Array.isArray(rows) ? rows : []);
        }
      } catch (error) {
        console.error("Error fetching popular products:", error);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing flagged as popular in the dashboard yet — keep the home page clean
  if (!loading && products.length === 0) return null;

  return (
    <section
      id="popular-products"
      className="max-container w-full px-4 sm:px-8 md:px-16 pt-10 md:pt-14 pb-14"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-palanquin text-2.5xl md:text-3xl xl:text-4xl font-bold text-sky-950">
            Our <span className="text-sky-700">Popular</span> Products
          </h2>
          <p className="mt-2 max-w-2xl font-montserrat text-sm md:text-base font-medium text-slate-500 leading-7">
            We believe in offering the best products that are driven by innovation
            and exceptional design.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-sky-950 px-4 py-2 font-montserrat text-sm font-semibold text-sky-950 transition-all hover:bg-sky-950 hover:text-white active:scale-95"
        >
          View all products
          <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
          {skeletons.map((item) => (
            <div
              key={item}
              className="h-72 rounded-xl bg-slate-100 animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
          {products.slice(0, MAX_HOME_PRODUCTS).map((product) => (
            <PopularProductCard
              key={product.id}
              img_url={product.img_url}
              name={product.name}
              price={product.price}
              product={product}
              stock={product.stock}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default PopularProducts;
