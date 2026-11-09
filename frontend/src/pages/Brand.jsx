import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSearch, faTimes, faSort, faSortAmountDown, faSortAmountUp, faBookOpen, faArrowLeft, faListUl } from "@fortawesome/free-solid-svg-icons";
import { PLACEHOLDER_IMG } from "../utils/cloudinaryImage";
import PageViewer from "../components/PageViewer";
import ProductGridCard from "../components/ProductGridCard";
import { inr } from "../utils/format";

const normalize = (value) => (value == null ? "" : String(value)).trim().toLowerCase();

// Everything a shopper might type: printed name, item code and the range/section
// it sits under. Built once per product so filtering stays cheap while typing.
const searchIndex = (product) =>
  [product.name, product.code, product.section].map(normalize).join(" ");

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

// Compact grid card: 4:3 image, code, name and price on one baseline so a page
// of products reads as a list rather than a stack of tall blocks.
const RangeCard = ({ group, onViewPage }) => {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <h5 className="font-palanquin text-[13px] font-semibold leading-snug text-sky-950 line-clamp-2">
        {group.title}
      </h5>
      <div className="mt-1 flex flex-col">
        {group.rows.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-2 border-b border-dashed border-gray-200 py-1 last:border-b-0"
          >
            <span className="truncate font-montserrat text-[11px] text-slate-600">{r.label}</span>
            <span className="shrink-0 font-montserrat text-xs font-bold text-sky-900">{inr(r.price)}</span>
          </div>
        ))}
      </div>
      {group.page && onViewPage && (
        <button
          onClick={() => onViewPage(group.page)}
          title="View in catalogue"
          className="mt-2 self-start rounded-full bg-slate-100 px-2 py-0.5 font-montserrat text-[10px] text-slate-400 transition hover:bg-sky-950 hover:text-white"
        >
          Pg {group.page}
        </button>
      )}
    </div>
  );
};

const ProductList = ({ products, loading, onViewPage, companyName = "" }) => {
  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortOrder, setSortOrder] = useState("none");

  const maxPrice = useMemo(
    () => Math.max(1000, ...products.map((p) => Math.ceil(Number(p.price) || 0))),
    [products]
  );

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const tokens = useMemo(() => normalize(query).split(/\s+/).filter(Boolean), [query]);

  const indexed = useMemo(
    () => products.map((product) => ({ product, haystack: searchIndex(product) })),
    [products]
  );

  // Query is matched before the price filter so we can tell the shopper when
  // their search does have hits that the slider is currently hiding.
  const matched = useMemo(() => {
    if (tokens.length === 0) return products;
    return indexed
      .filter((entry) => tokens.every((token) => entry.haystack.includes(token)))
      .map((entry) => entry.product);
  }, [indexed, tokens, products]);

  const inPrice = useMemo(
    () =>
      matched.filter(
        (p) => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]
      ),
    [matched, priceRange]
  );

  const hiddenByPrice = matched.length - inPrice.length;

  const visible = useMemo(() => {
    if (sortOrder === "lowToHigh") return [...inPrice].sort((a, b) => Number(a.price) - Number(b.price));
    if (sortOrder === "highToLow") return [...inPrice].sort((a, b) => Number(b.price) - Number(a.price));
    return inPrice;
  }, [inPrice, sortOrder]);

  // Catalogue order is the house order, so sections are anchored to the page
  // they first appear on and stay put even when the list is re-sorted by price.
  const sectionPage = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const key = p.section || "Other";
      const page = p.catalogue_page ?? 9999;
      if (!map.has(key) || page < map.get(key)) map.set(key, page);
    }
    return map;
  }, [products]);

  const sections = useMemo(() => {
    const map = new Map();
    for (const p of visible) {
      const key = p.section || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
    return [...map.entries()].sort(
      (a, b) => (sectionPage.get(a[0]) ?? 9999) - (sectionPage.get(b[0]) ?? 9999)
    );
  }, [visible, sectionPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-sky-900" />
        <span className="ml-2 font-montserrat">Loading items...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faSearch}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search item, code or range..."
            aria-label="Search items by name, code or range"
            autoComplete="off"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-sky-700 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-sky-900"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
          )}
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

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-montserrat text-xs text-slate-500">
        <span>
          {tokens.length > 0
            ? `${visible.length} of ${products.length} items match “${query.trim()}”`
            : `${products.length} items`}
        </span>
        {hiddenByPrice > 0 && (
          <button
            onClick={() => setPriceRange([0, maxPrice])}
            className="font-semibold text-sky-800 underline underline-offset-2 hover:text-sky-950"
          >
            {hiddenByPrice} more outside the selected price — show all
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-gray-300 p-6 text-center font-montserrat text-slate-700">
          {tokens.length > 0 ? (
            <>
              No items match “{query.trim()}”.{" "}
              <button
                onClick={() => setQuery("")}
                className="font-semibold text-sky-800 underline underline-offset-2"
              >
                Clear search
              </button>
            </>
          ) : products.length === 0 ? (
            <>No items listed for this brand yet.</>
          ) : (
            <>
              No items in this price range.{" "}
              <button
                onClick={() => setPriceRange([0, maxPrice])}
                className="font-semibold text-sky-800 underline underline-offset-2"
              >
                Show all
              </button>
            </>
          )}
        </div>
      ) : (
        sections.map(([section, list]) => {
          const withImg = list.filter((p) => p.img_url);
          const rangeGroups = buildRangeGroups(list.filter((p) => !p.img_url));
          return (
            <div key={section} className="mb-7">
              <h4 className="font-palanquin font-bold text-base text-sky-900 mb-2.5 border-b border-gray-200 pb-1">
                {section} <span className="text-slate-400 text-sm font-normal">({list.length})</span>
              </h4>
              {rangeGroups.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
                  {rangeGroups.map((g) => (
                    <RangeCard key={`${g.title}|${g.page ?? ""}`} group={g} onViewPage={onViewPage} />
                  ))}
                </div>
              )}
              {withImg.length > 0 && (
                <div
                  className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 ${
                    rangeGroups.length > 0 ? "mt-2" : ""
                  }`}
                >
                  {withImg.map((p) => (
                    <ProductGridCard
                      key={p.id}
                      product={p}
                      onViewPage={onViewPage}
                      companyName={companyName}
                    />
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
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 mb-4 font-montserrat text-sm font-semibold text-sky-950 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm hover:bg-sky-950 hover:text-white hover:border-sky-950 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          Back to Catalogue
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <img
            src={brand.cover_url || PLACEHOLDER_IMG}
            alt={brand.name}
            className="w-16 h-16 rounded-lg object-contain bg-white border border-gray-200"
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
            ["products", "Product list", faListUl],
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
          <ProductList
            products={products}
            loading={false}
            onViewPage={openPageByNumber}
            companyName={brand.name}
          />
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
