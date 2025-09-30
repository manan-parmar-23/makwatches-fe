import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  ChevronUpIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

type PriceRange = {
  min: number;
  max: number;
};

type WatchFilters = {
  brands: string[];
  gender?: string;
  dialColor?: string;
  dialShape?: string;
  dialType?: string;
  strapColor?: string;
  strapMaterial?: string;
  style?: string;
  dialThickness?: string;
};

type FilterSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filters: {
    priceRange?: PriceRange;
    sortBy?: string;
    inStock?: boolean;
    watchFilters?: WatchFilters;
  }) => void;
  availableFilters: {
    sortOptions: { value: string; label: string }[];
    brands?: string[];
    genders?: string[];
    dialColors?: string[];
    dialShapes?: string[];
    dialTypes?: string[];
    strapColors?: string[];
    strapMaterials?: string[];
    styles?: string[];
    dialThicknesses?: string[];
  };
  currentFilters: {
    priceRange: PriceRange;
    sortBy: string;
    inStock: boolean;
    watchFilters?: {
      brands: string[];
      gender?: string;
      dialColor?: string;
      dialShape?: string;
      dialType?: string;
      strapColor?: string;
      strapMaterial?: string;
      style?: string;
      dialThickness?: string;
    };
  };
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  onFilterChange,
  availableFilters,
  currentFilters,
}) => {
  // Local state for filter values
  const [priceRange, setPriceRange] = useState<PriceRange>(
    currentFilters.priceRange
  );
  const [sortBy, setSortBy] = useState<string>(currentFilters.sortBy);
  const [inStock, setInStock] = useState<boolean>(currentFilters.inStock);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    currentFilters.watchFilters?.brands || []
  );
  const [gender, setGender] = useState<string | undefined>(
    currentFilters.watchFilters?.gender
  );
  const [dialColor, setDialColor] = useState<string | undefined>(
    currentFilters.watchFilters?.dialColor
  );
  const [dialShape, setDialShape] = useState<string | undefined>(
    currentFilters.watchFilters?.dialShape
  );
  const [dialType, setDialType] = useState<string | undefined>(
    currentFilters.watchFilters?.dialType
  );
  const [strapColor, setStrapColor] = useState<string | undefined>(
    currentFilters.watchFilters?.strapColor
  );
  const [strapMaterial, setStrapMaterial] = useState<string | undefined>(
    currentFilters.watchFilters?.strapMaterial
  );
  const [style, setStyle] = useState<string | undefined>(
    currentFilters.watchFilters?.style
  );
  const [dialThickness, setDialThickness] = useState<string | undefined>(
    currentFilters.watchFilters?.dialThickness
  );

  // Update local state when currentFilters change
  useEffect(() => {
    setPriceRange(currentFilters.priceRange);
    setSortBy(currentFilters.sortBy);
    setInStock(currentFilters.inStock);
    setSelectedBrands(currentFilters.watchFilters?.brands || []);
    setGender(currentFilters.watchFilters?.gender);
    setDialColor(currentFilters.watchFilters?.dialColor);
    setDialShape(currentFilters.watchFilters?.dialShape);
    setDialType(currentFilters.watchFilters?.dialType);
    setStrapColor(currentFilters.watchFilters?.strapColor);
    setStrapMaterial(currentFilters.watchFilters?.strapMaterial);
    setStyle(currentFilters.watchFilters?.style);
    setDialThickness(currentFilters.watchFilters?.dialThickness);
  }, [currentFilters]);

  // Lock background scroll when sidebar is open (mobile: scroll only the sidebar)
  useEffect(() => {
    if (!isOpen) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isOpen]);

  const [expanded, setExpanded] = useState({
    price: true,
    sort: true,
    availability: true,
    brands: true,
    gender: true,
    dialColor: false,
    dialShape: false,
    dialType: false,
    strapColor: false,
    strapMaterial: false,
    style: false,
    dialThickness: false,
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Apply all filters
  const applyFilters = () => {
    onFilterChange({
      priceRange,
      sortBy,
      inStock,
      watchFilters: {
        brands: selectedBrands,
        gender,
        dialColor,
        dialShape,
        dialType,
        strapColor,
        strapMaterial,
        style,
        dialThickness,
      },
    });

    // Close sidebar on mobile after applying
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setPriceRange({ min: 0, max: 10000 });
    setSortBy("");
    setInStock(false);
    setSelectedBrands([]);
    setGender(undefined);
    setDialColor(undefined);
    setDialShape(undefined);
    setDialType(undefined);
    setStrapColor(undefined);
    setStrapMaterial(undefined);
    setStyle(undefined);
    setDialThickness(undefined);

    onFilterChange({
      priceRange: { min: 0, max: 10000 },
      sortBy: "",
      inStock: false,
      watchFilters: {
        brands: [],
      },
    });
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (selectedBrands.length > 0) count++;
    if (gender) count++;
    if (dialColor) count++;
    if (dialShape) count++;
    if (dialType) count++;
    if (strapColor) count++;
    if (strapMaterial) count++;
    if (style) count++;
    if (dialThickness) count++;
    return count;
  };

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar with luxury styling */}
      <motion.div
        className="fixed top-0 right-0 bg-white z-50 w-[90%] max-w-sm shadow-xl flex flex-col overflow-hidden border-l border-amber-200"
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ display: isOpen ? "flex" : "none", height: "100dvh" }}
      >
        <div className="p-5 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Refine Selection
              </h2>
              <p className="text-xs text-amber-600 mt-1">
                {countActiveFilters()} filters applied
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-amber-50 transition-colors border border-amber-200"
              aria-label="Close filters"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          className="overflow-y-scroll flex-grow p-5 pb-8 space-y-7 overscroll-contain"
          style={{
            scrollbarWidth: "thin",
            WebkitOverflowScrolling: "touch",
            scrollbarGutter: "stable both-edges",
          }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Price Range Filter with luxury styling */}
          <div className="border-b border-amber-100 pb-6">
            <button
              className="flex items-center justify-between w-full text-left font-semibold text-amber-900 mb-3 group"
              onClick={() => toggleSection("price")}
              aria-expanded={expanded.price}
            >
              <span className="text-sm uppercase tracking-wider group-hover:text-amber-700 transition-colors">
                Price Range
              </span>
              <motion.div
                animate={{ rotate: expanded.price ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-amber-600"
              >
                <ChevronUpIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.price && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>₹{priceRange.min}</span>
                    <span>₹{priceRange.max}</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({
                        ...priceRange,
                        max: Number(e.target.value),
                      })
                    }
                    className="w-full accent-amber-600 h-2 mt-1"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Min Price
                      </label>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            min: Number(e.target.value),
                          })
                        }
                        className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        min="0"
                        max={priceRange.max}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Max Price
                      </label>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            max: Number(e.target.value),
                          })
                        }
                        className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        min={priceRange.min}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sort Filter */}
          <div className="border-b border-amber-100 pb-6">
            <button
              className="flex items-center justify-between w-full text-left font-semibold text-amber-900 mb-3 group"
              onClick={() => toggleSection("sort")}
              aria-expanded={expanded.sort}
            >
              <span className="text-sm uppercase tracking-wider group-hover:text-amber-700 transition-colors">
                Sort By
              </span>
              <motion.div
                animate={{ rotate: expanded.sort ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-amber-600"
              >
                <ChevronUpIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.sort && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 overflow-hidden"
                >
                  {availableFilters.sortOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        id={`sort-${option.value}`}
                        name="sort"
                        value={option.value}
                        checked={sortBy === option.value}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-amber-600 border-amber-300 focus:ring-amber-400"
                      />
                      <label
                        htmlFor={`sort-${option.value}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Brands Filter */}
          <div className="border-b border-amber-100 pb-6">
            <button
              className="flex items-center justify-between w-full text-left font-semibold text-amber-900 mb-3 group"
              onClick={() => toggleSection("brands")}
              aria-expanded={expanded.brands}
            >
              <span className="text-sm uppercase tracking-wider group-hover:text-amber-700 transition-colors">
                Brands
              </span>
              <motion.div
                animate={{ rotate: expanded.brands ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-amber-600"
              >
                <ChevronUpIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.brands && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      availableFilters.brands || [
                        "MOVADA",
                        "BALMAIN",
                        "GUESS",
                        "VERSACE",
                        "TITAN",
                        "FOSSIL",
                      ]
                    ).map((brand) => (
                      <label
                        key={brand}
                        className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-all cursor-pointer text-center ${
                          selectedBrands.includes(brand)
                            ? "bg-amber-500 text-white border-amber-500"
                            : "border-amber-200 hover:border-amber-300 text-gray-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand]);
                            } else {
                              setSelectedBrands(
                                selectedBrands.filter((b) => b !== brand)
                              );
                            }
                          }}
                          className="sr-only"
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Gender Filter */}
          <div className="border-b border-amber-100 pb-6">
            <button
              className="flex items-center justify-between w-full text-left font-semibold text-amber-900 mb-3 group"
              onClick={() => toggleSection("gender")}
              aria-expanded={expanded.gender}
            >
              <span className="text-sm uppercase tracking-wider group-hover:text-amber-700 transition-colors">
                Gender
              </span>
              <motion.div
                animate={{ rotate: expanded.gender ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-amber-600"
              >
                <ChevronUpIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.gender && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="flex justify-between gap-3">
                    {(
                      availableFilters.genders || ["Men", "Women", "Unisex"]
                    ).map((genderOption) => (
                      <button
                        key={genderOption}
                        onClick={() =>
                          setGender(
                            gender === genderOption ? undefined : genderOption
                          )
                        }
                        className={`flex-1 flex items-center justify-center px-3 py-2.5 rounded-lg border transition-all ${
                          gender === genderOption
                            ? "bg-amber-500 text-white border-amber-500 font-medium"
                            : "border-amber-200 hover:border-amber-300 text-gray-700"
                        }`}
                      >
                        <span className="text-sm">{genderOption}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dial Color Filter */}
          <div className="border-b border-amber-100 pb-6">
            <button
              className="flex items-center justify-between w-full text-left font-semibold text-amber-900 mb-3 group"
              onClick={() => toggleSection("dialColor")}
              aria-expanded={expanded.dialColor}
            >
              <span className="text-sm uppercase tracking-wider group-hover:text-amber-700 transition-colors">
                Dial Color
              </span>
              <motion.div
                animate={{ rotate: expanded.dialColor ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-amber-600"
              >
                <ChevronUpIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.dialColor && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      availableFilters.dialColors || [
                        "Black",
                        "White",
                        "Blue",
                        "Gold",
                        "Silver",
                        "Green",
                      ]
                    ).map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setDialColor(dialColor === color ? undefined : color)
                        }
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                          dialColor === color
                            ? "bg-amber-50 border-amber-400 text-amber-900 shadow-sm"
                            : "border-amber-100 hover:border-amber-200 text-gray-700"
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full mb-1 border"
                          style={{
                            backgroundColor: color.toLowerCase(),
                            boxShadow:
                              dialColor === color
                                ? "0 0 0 2px rgba(251, 191, 36, 0.6)"
                                : "none",
                          }}
                        ></span>
                        <span className="text-xs">{color}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dial Shape Filter */}
          <div className="border-b border-amber-100 pb-6">
            <button
              className="flex items-center justify-between w-full text-left font-semibold text-amber-900 mb-3 group"
              onClick={() => toggleSection("dialShape")}
              aria-expanded={expanded.dialShape}
            >
              <span className="text-sm uppercase tracking-wider group-hover:text-amber-700 transition-colors">
                Dial Shape
              </span>
              <motion.div
                animate={{ rotate: expanded.dialShape ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-amber-600"
              >
                <ChevronUpIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.dialShape && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      availableFilters.dialShapes || [
                        "Round",
                        "Square",
                        "Rectangle",
                        "Oval",
                        "Tonneau",
                      ]
                    ).map((shape) => (
                      <button
                        key={shape}
                        onClick={() =>
                          setDialShape(dialShape === shape ? undefined : shape)
                        }
                        className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-all ${
                          dialShape === shape
                            ? "bg-amber-500 text-white border-amber-500"
                            : "border-amber-200 hover:border-amber-300 text-gray-700"
                        }`}
                      >
                        <span className="text-sm">{shape}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Strap Color Filter */}
          <div className="border-b border-amber-100 pb-6">
            <button
              className="flex items-center justify-between w-full text-left font-semibold text-amber-900 mb-3 group"
              onClick={() => toggleSection("strapColor")}
              aria-expanded={expanded.strapColor}
            >
              <span className="text-sm uppercase tracking-wider group-hover:text-amber-700 transition-colors">
                Strap Color
              </span>
              <motion.div
                animate={{ rotate: expanded.strapColor ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-amber-600"
              >
                <ChevronUpIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.strapColor && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      availableFilters.strapColors || [
                        "Black",
                        "Brown",
                        "Silver",
                        "Gold",
                        "Blue",
                        "Green",
                      ]
                    ).map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setStrapColor(
                            strapColor === color ? undefined : color
                          )
                        }
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                          strapColor === color
                            ? "bg-amber-50 border-amber-400 text-amber-900 shadow-sm"
                            : "border-amber-100 hover:border-amber-200 text-gray-700"
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full mb-1 border"
                          style={{
                            backgroundColor: color.toLowerCase(),
                            boxShadow:
                              strapColor === color
                                ? "0 0 0 2px rgba(251, 191, 36, 0.6)"
                                : "none",
                          }}
                        ></span>
                        <span className="text-xs">{color}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Strap Material Filter */}
          <div className="border-b border-amber-100 pb-6">
            <button
              className="flex items-center justify-between w-full text-left font-semibold text-amber-900 mb-3 group"
              onClick={() => toggleSection("strapMaterial")}
              aria-expanded={expanded.strapMaterial}
            >
              <span className="text-sm uppercase tracking-wider group-hover:text-amber-700 transition-colors">
                Strap Material
              </span>
              <motion.div
                animate={{ rotate: expanded.strapMaterial ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-amber-600"
              >
                <ChevronUpIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.strapMaterial && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      availableFilters.strapMaterials || [
                        "Leather",
                        "Metal",
                        "Rubber",
                        "Fabric",
                        "Ceramic",
                        "Silicone",
                      ]
                    ).map((material) => (
                      <button
                        key={material}
                        onClick={() =>
                          setStrapMaterial(
                            strapMaterial === material ? undefined : material
                          )
                        }
                        className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-all ${
                          strapMaterial === material
                            ? "bg-amber-500 text-white border-amber-500"
                            : "border-amber-200 hover:border-amber-300 text-gray-700"
                        }`}
                      >
                        <span className="text-sm">{material}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Style Filter */}
          <div className="border-b border-amber-100 pb-6">
            <button
              className="flex items-center justify-between w-full text-left font-semibold text-amber-900 mb-3 group"
              onClick={() => toggleSection("style")}
              aria-expanded={expanded.style}
            >
              <span className="text-sm uppercase tracking-wider group-hover:text-amber-700 transition-colors">
                Style
              </span>
              <motion.div
                animate={{ rotate: expanded.style ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUpIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.style && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      availableFilters.styles || [
                        "Casual",
                        "Dress",
                        "Sports",
                        "Luxury",
                        "Smart",
                        "Vintage",
                      ]
                    ).map((styleOption) => (
                      <button
                        key={styleOption}
                        onClick={() =>
                          setStyle(
                            style === styleOption ? undefined : styleOption
                          )
                        }
                        className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-all ${
                          style === styleOption
                            ? "bg-amber-500 text-white border-amber-500"
                            : "border-amber-200 hover:border-amber-300 text-gray-700"
                        }`}
                      >
                        <span className="text-sm">{styleOption}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected Filters Summary */}
          {countActiveFilters() > 0 && (
            <div className="border-b border-amber-100 pb-6">
              <h3 className="font-semibold text-amber-900 mb-3 text-sm uppercase tracking-wider">
                Selected Filters
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedBrands.length > 0 && (
                  <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                    Brands: {selectedBrands.length}
                    <button
                      onClick={() => setSelectedBrands([])}
                      className="hover:text-amber-600 ml-1"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {gender && (
                  <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                    {gender}
                    <button
                      onClick={() => setGender(undefined)}
                      className="hover:text-amber-600 ml-1"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {dialColor && (
                  <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                    {dialColor} Dial
                    <button
                      onClick={() => setDialColor(undefined)}
                      className="hover:text-amber-600 ml-1"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {dialShape && (
                  <div className="bg-amber-50 px-2.5 py-1 rounded-full text-xs text-amber-800 flex items-center gap-1 border border-amber-100">
                    {dialShape} Shape
                    <button
                      onClick={() => setDialShape(undefined)}
                      className="hover:text-amber-600 ml-1"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {/* Add other filter chips as needed */}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div
          className="p-5 border-t border-amber-100 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.05)]"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex space-x-3">
            <button
              onClick={applyFilters}
              className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-sm"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="px-4 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors text-amber-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default FilterSidebar;
