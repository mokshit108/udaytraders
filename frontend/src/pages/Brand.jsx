import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSearch, faTimes, faSort, faSortAmountDown, faSortAmountUp, faBookOpen, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../context/CartContext";
import { catalogueImg, PLACEHOLDER_IMG } from "../utils/cloudinaryImage";
import PageViewer from "../components/PageViewer";

const inr = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

// Groups imageless products into "Range" cards, e.g. "Bib Cock Conti" ->
// card title "Bib Cock" with a "Conti  ₹666" row. Only products that share
// the same title AND catalogue page are grouped; the rest stay single cards.
const buildRangeGroups = (products) => {
  const map = new Map();
  for (const p of products) {
    const name = (p.name || "").trim();
    const split = name.match(/^(.*)\s+(\S+)$/);
    const title = split ? split[1] : name;
    const label = split ? split[2] : "";
    const key = `${title}|${p.catalogue_page ?? ""}`;
    if (!map.has(key)) map.set(key, { title, page: p.catalogue_page, rows: [] });
    map.get(key).rows.push({ id: p.id, label: label || name, price: p.price, product: p });
  }
  const groups = [];
  for (const g of map.values()) {
    const seen = new Set();
    g.rows = g.rows.filter((r) => {
      const k = `${r.label}|${r.price}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    if (g.rows.length === 1) {
      // single item: show full name as title, price-only row
      g.rows[0].label = "";
      g.title = (g.rows[0].product.name || "").trim();
    }
    groups.push(g);
  }
  return groups.sort((a, b) => (a.page ?? 0) - (b.page ?? 0) || a.title.localeCompare(b.title));
};

const RangeCard = ({ group, onViewPage }) => {
  const { addToCart } = useCart();
  return (
    <div className="border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-xl p-4 flex flex-col">
      <h5 className="font-palanquin font-semibold text-sky-950 text-sm sm:text-base line-clamp-2 min-h-[2.5em]">
        {group.title}
      </h5>
      <div className="mt-2 flex flex-col flex-grow">
        {group.rows.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-2 border-b border-dashed border-gray-200 py-1.5 last:border-b-0"
          >
            <span className="text-xs sm:text-sm font-montserrat text-slate-700 truncate">{r.label}</span>
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="text-sm font-bold text-sky-900">{inr(r.price)}</span>
              <button
                onClick={() =>
                  addToCart({
                    id: r.product.id,
                    name: r.product.name,
                    price: r.product.price,
                    img_url: r.product.img_url,
                    stock: r.product.stock,
                  })
                }
                title={`Add ${r.product.name} to cart`}
                className="w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-sky-700 active:scale-90 transition-all"
              >
                <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
              </button>
            </span>
          </div>
        ))}
      </div>
      {group.page && onViewPage && (
        <button
          onClick={() => onViewPage(group.page)}
          title="View in catalogue"
          className="mt-3 self-start text-[10px] font-montserrat text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full hover:bg-sky-950 hover:text-white transition"
        >
          Pg {group.page}
        </button>
      )}
    </div>
  );
};

export const ProductCard = ({ product, onViewPage }) => {
  const { addToCart } = useCart();
  return (
    <div className="border border-gray-200 flex flex-col bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden group">
      <div className="w-full aspect-square relative bg-slate-50 flex items-center justify-center overflow-hidden">
        {product.catalogue_page && onViewPage && (
          <button
            onClick={() => onViewPage(product.catalogue_page)}
            title="View in catalogue"
            className="absolute top-2 left-2 z-10 bg-sky-950/80 text-white text-[10px] font-bold px-2 py-1 rounded-full hover:bg-sky-700 transition"
          >
            Pg {product.catalogue_page}
          </button>
        )}
        <img
          src={product.img_url ? catalogueImg(product.img_url, 600) : PLACEHOLDER_IMG}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
        />
      </div>
      <div className="p-3 flex flex-col flex-grow">
        {product.code && <p className="text-[10px] text-slate-400 font-montserrat">{product.code}</p>}
        <h5 className="text-sm font-semibold line-clamp-2 min-h-[2.5em] text-slate-800 font-montserrat">
          {product.name}
        </h5>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-slate-400 font-montserrat line-clamp-1">{product.section}</span>
          <p className="text-sky-900 font-bold text-sm">₹{product.price}</p>
        </div>
        <button
          onClick={() =>
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              img_url: product.img_url,
              stock: product.stock,
            })
          }
          className="mt-auto pt-3"
        >
          <span className="block w-full bg-sky-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-sky-800 active:scale-95 transition-all shadow-sm font-montserrat">
            Add to Cart
          </span>
        </button>
      </div>
    </div>
  );
};

const PriceList = ({ products, loading, onViewPage }) => {
  const [q, setQ] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortOrder, setSortOrder] = useState("none");

  const sections = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const key = p.section || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
    return map;
  }, [products]);

  const maxPrice = useMemo(
    () => Math.max(1000, ...products.map((p) => Math.ceil(p.price))),
    [products]
  );

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const filtered = products.filter(
    (p) =>
      p.price >= priceRange[0] &&
      p.price <= priceRange[1] &&
      (!q ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.code || "").toLowerCase().includes(q.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "lowToHigh") return a.price - b.price;
    if (sortOrder === "highToLow") return b.price - a.price;
    return 0;
  });

  const sortedSections = [...sections.keys()].sort((a, b) => {
    const fa = sorted.filter((p) => (p.section || "Other") === a);
    const fb = sorted.filter((p) => (p.section || "Other") === b);
    return (fa[0]?.catalogue_page ?? 9999) - (fb[0]?.catalogue_page ?? 9999);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-sky-900" />
        <span className="ml-2 font-montserrat">Loading price list...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-sky-700"
          />
        </div>
        <div className="flex items-center gap-2 font-montserrat text-sm">
          <Slider
            range
            min={0}
            max={maxPrice}
            value={priceRange}
            onChange={setPriceRange}
            railStyle={{ backgroundColor: "grey", height: "4px" }}
            trackStyle={[{ backgroundColor: "#0c4a6e", height: "4px" }]}
            handleStyle={[
              { width: 16, height: 16, border: "2px solid #0c4a6e", backgroundColor: "#fff" },
              { width: 16, height: 16, border: "2px solid #0c4a6e", backgroundColor: "#fff" },
            ]}
          />
          <span className="whitespace-nowrap text-sky-950 font-medium">
            ₹{priceRange[0]} – ₹{priceRange[1]}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          {[["none", faSort, ""], ["lowToHigh", faSortAmountUp, "Low to High"], ["highToLow", faSortAmountDown, "High to Low"]].map(
            ([value, icon, label]) => (
              <button
                key={value}
                onClick={() => setSortOrder(value)}
                className={`px-2 py-1.5 rounded-md font-montserrat text-xs transition ${
                  sortOrder === value ? "bg-sky-950 text-white" : "bg-white border border-gray-300 text-slate-600 hover:border-sky-700"
                }`}
                title={label || "No sorting"}
              >
                <FontAwesomeIcon icon={icon} />
                {label && <span className="ml-1 hidden md:inline">{label}</span>}
              </button>
            )
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="border border-gray-300 p-4 flex justify-center items-center rounded-md font-montserrat text-slate-700">
          No products match your search.
        </div>
      ) : (
        sortedSections.map((section) => {
          const list = sorted.filter((p) => (p.section || "Other") === section);
          if (list.length === 0) return null;
          const withImg = list.filter((p) => p.img_url);
          const rangeGroups = buildRangeGroups(list.filter((p) => !p.img_url));
          return (
            <div key={section} className="mb-8">
              <h4 className="font-palanquin font-bold text-lg text-sky-900 mb-3 border-b border-gray-200 pb-1">
                {section} <span className="text-slate-400 text-sm font-normal">({list.length})</span>
              </h4>
              {rangeGroups.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                  {rangeGroups.map((g) => (
                    <RangeCard key={`${g.title}|${g.page ?? ""}`} group={g} onViewPage={onViewPage} />
                  ))}
                </div>
              )}
              {withImg.length > 0 && (
                <div
                  className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 ${
                    rangeGroups.length > 0 ? "mt-4" : ""
                  }`}
                >
                  {withImg.map((p) => (
                    <ProductCard key={p.id} product={p} onViewPage={onViewPage} />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

const CataloguePages = ({ pages, onOpen }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
    {pages.map((page, idx) => (
      <button
        key={page.id}
        onClick={() => onOpen(idx)}
        className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-shadow text-left"
      >
        <div className="w-full aspect-[3/4] bg-slate-50 overflow-hidden">
          <img
            src={page.image_url}
            alt={`Catalogue page ${page.page_no}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <p className="p-2 text-center font-montserrat text-xs text-slate-600">
          {page.page_no ? `Page ${page.page_no}` : "Cover"}
        </p>
      </button>
    ))}
  </div>
);

const Brand = () => {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [pages, setPages] = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("pages");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewerIndex, setViewerIndex] = useState(null);

  useEffect(() => {
    const fetchBrand = async () => {
      setLoading(true);
      setError("");
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const [brandRes, productsRes] = await Promise.all([
          fetch(`${apiUrl}/brands/${slug}`),
          fetch(`${apiUrl}/brands/${slug}/products?limit=500`),
        ]);
        if (!brandRes.ok) throw new Error("Brand not found");
        const brandData = await brandRes.json();
        const productData = await productsRes.json();
        setBrand(brandData.brand);
        setPages(brandData.pages || []);
        setProducts(productData.products || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load this brand. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, [slug]);

  const openPageByNumber = (pageNo) => {
    const idx = pages.findIndex((p) => p.page_no === pageNo);
    if (idx >= 0) {
      setTab("pages");
      setViewerIndex(idx);
    }
  };

  if (loading) {
    return (
      <section className="pt-28 md:pt-32 pb-10 px-4 bg-slate-50 min-h-screen flex justify-center items-start">
        <div className="flex items-center h-40">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-sky-900" />
          <span className="ml-2 font-montserrat">Loading...</span>
        </div>
      </section>
    );
  }

  if (error || !brand) {
    return (
      <section className="pt-28 md:pt-32 pb-10 px-4 bg-slate-50 min-h-screen">
        <div className="text-red-600 text-center font-montserrat">{error || "Brand not found"}</div>
      </section>
    );
  }

  return (
    <section className="pt-28 md:pt-32 pb-10 px-4 sm:px-6 md:px-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={brand.cover_url || PLACEHOLDER_IMG}
            alt={brand.name}
            className="w-16 h-16 rounded-lg object-cover border border-gray-200 bg-white"
            onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
          />
          <div>
            <h2 className="font-palanquin font-bold text-2xl sm:text-3xl text-sky-950">{brand.name}</h2>
            <p className="font-montserrat text-sm text-slate-500">{products.length} items</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            ["pages", "Catalogue pages", faBookOpen],
            ["prices", "Price list", faSearch],
          ].map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 font-montserrat text-sm font-semibold transition border-b-2 -mb-px ${
                tab === key
                  ? "border-sky-700 text-sky-950"
                  : "border-transparent text-slate-500 hover:text-sky-900"
              }`}
            >
              <FontAwesomeIcon icon={icon} className="mr-1.5" />
              {label}
            </button>
          ))}
        </div>

        {tab === "pages" ? (
          pages.length > 0 ? (
            <CataloguePages pages={pages} onOpen={setViewerIndex} />
          ) : (
            <p className="font-montserrat text-slate-500 text-center py-10">
              No catalogue pages available for this brand yet.
            </p>
          )
        ) : (
          <PriceList products={products} loading={false} onViewPage={openPageByNumber} />
        )}
      </div>

      {viewerIndex !== null && pages[viewerIndex] && (
        <PageViewer
          pages={pages}
          index={viewerIndex}
          onNavigate={setViewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </section>
  );
};

export default Brand;
