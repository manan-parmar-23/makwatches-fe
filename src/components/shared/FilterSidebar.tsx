import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

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

  const [expanded, setExpanded] = useState({
    price: true,
    sort: true,
    availability: true,
    brands: true,
    gender: false,
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

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/40 bg-opacity-50 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar with luxury styling */}
      <motion.div
        className="fixed md:sticky top-0 right-0 md:left-0 h-screen md:h-[calc(100vh-80px)] bg-white z-50 w-[85%] max-w-xs md:w-64 shadow-xl md:shadow-none flex flex-col border-l md:border-r border-amber-200"
        initial={{ x: isOpen ? 0 : "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ display: isOpen ? "flex" : "none" }}
      >
        <div className="p-5 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight font-serif text-amber-900">
              Refine Selection
            </h2>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-sm hover:bg-amber-50 transition-colors border border-amber-200"
              aria-label="Close filters"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          className="overflow-y-auto flex-grow p-5 pb-8 space-y-8 overscroll-contain"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Price Range Filter with luxury styling */}
          <div className="border-b border-amber-100 pb-5">
            <button
              className="flex items-center justify-between w-full text-left font-semibold uppercase tracking-widest text-sm group py-1.5"
              onClick={() => toggleSection("price")}
              aria-expanded={expanded.price}
            >
              <span className="group-hover:text-amber-600 transition-colors">
                Price Range
              </span>
              <motion.div
                animate={{ rotate: expanded.price ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-amber-600"
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.price && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-3 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm text-gray-500">Min</label>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            min: Number(e.target.value),
                          })
                        }
                        className="w-full border border-amber-300 rounded px-2 py-2 mt-1 text-base"
                        min="0"
                        max={priceRange.max}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Max</label>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            max: Number(e.target.value),
                          })
                        }
                        className="w-full border border-amber-300 rounded px-2 py-2 mt-1 text-base"
                        min={priceRange.min}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({
                        ...priceRange,
                        max: Number(e.target.value),
                      })
                    }
                    className="w-full accent-amber-600 h-2 mt-3"
                    style={{ touchAction: "none" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sort Filter */}
          <div className="border-b border-amber-100 pb-4">
            <button
              className="flex items-center justify-between w-full text-left font-medium py-1.5"
              onClick={() => toggleSection("sort")}
              aria-expanded={expanded.sort}
            >
              <span>Sort By</span>
              <motion.div
                animate={{ rotate: expanded.sort ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.sort && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-2 overflow-hidden"
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
                        className="mr-2"
                      />
                      <label htmlFor={`sort-${option.value}`}>
                        {option.label}
                      </label>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Availability Filter */}
          <div className="border-b border-amber-100 pb-4">
            <button
              className="flex items-center justify-between w-full text-left font-medium py-1.5"
              onClick={() => toggleSection("availability")}
              aria-expanded={expanded.availability}
            >
              <span>Availability</span>
              <motion.div
                animate={{ rotate: expanded.availability ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.availability && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  <div className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id="in-stock"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500 h-4 w-4"
                    />
                    <label htmlFor="in-stock" className="flex-grow py-1">
                      In Stock Only
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Brands Filter */}
          <div className="border-b border-amber-100 pb-4">
            <button
              className="flex items-center justify-between w-full text-left font-medium"
              onClick={() => toggleSection("brands")}
              aria-expanded={expanded.brands}
            >
              <span className="font-medium text-amber-800 uppercase text-sm tracking-wider">
                Brands
              </span>
              <motion.div
                animate={{ rotate: expanded.brands ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.brands && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
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
                    <div
                      key={brand}
                      className="flex items-center hover:text-amber-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={`brand-${brand}`}
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
                        className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                      />
                      <label htmlFor={`brand-${brand}`} className="text-sm">
                        {brand}
                      </label>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Gender Filter */}
          <div className="border-b border-amber-100 pb-4">
            <button
              className="flex items-center justify-between w-full text-left font-medium"
              onClick={() => toggleSection("gender")}
              aria-expanded={expanded.gender}
            >
              <span className="font-medium text-amber-800 uppercase text-sm tracking-wider">
                Gender
              </span>
              <motion.div
                animate={{ rotate: expanded.gender ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.gender && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {(availableFilters.genders || ["Men", "Women", "Unisex"]).map(
                    (genderOption) => (
                      <div
                        key={genderOption}
                        className="flex items-center hover:text-amber-700 transition-colors"
                      >
                        <input
                          type="radio"
                          id={`gender-${genderOption}`}
                          name="gender"
                          checked={gender === genderOption}
                          onChange={() => setGender(genderOption)}
                          className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                        />
                        <label
                          htmlFor={`gender-${genderOption}`}
                          className="text-sm"
                        >
                          {genderOption}
                        </label>
                      </div>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dial Color Filter */}
          <div className="border-b border-amber-100 pb-4">
            <button
              className="flex items-center justify-between w-full text-left font-medium"
              onClick={() => toggleSection("dialColor")}
              aria-expanded={expanded.dialColor}
            >
              <span className="font-medium text-amber-800 uppercase text-sm tracking-wider">
                Dial Color
              </span>
              <motion.div
                animate={{ rotate: expanded.dialColor ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.dialColor && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
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
                    <div
                      key={color}
                      className="flex items-center hover:text-amber-700 transition-colors"
                    >
                      <input
                        type="radio"
                        id={`dial-color-${color}`}
                        name="dialColor"
                        checked={dialColor === color}
                        onChange={() => setDialColor(color)}
                        className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                      />
                      <label
                        htmlFor={`dial-color-${color}`}
                        className="text-sm"
                      >
                        {color}
                      </label>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dial Shape Filter */}
          <div className="border-b border-amber-100 pb-4">
            <button
              className="flex items-center justify-between w-full text-left font-medium"
              onClick={() => toggleSection("dialShape")}
              aria-expanded={expanded.dialShape}
            >
              <span className="font-medium text-amber-800 uppercase text-sm tracking-wider">
                Dial Shape
              </span>
              <motion.div
                animate={{ rotate: expanded.dialShape ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.dialShape && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {(
                    availableFilters.dialShapes || [
                      "Round",
                      "Square",
                      "Rectangle",
                      "Oval",
                      "Tonneau",
                    ]
                  ).map((shape) => (
                    <div
                      key={shape}
                      className="flex items-center hover:text-amber-700 transition-colors"
                    >
                      <input
                        type="radio"
                        id={`dial-shape-${shape}`}
                        name="dialShape"
                        checked={dialShape === shape}
                        onChange={() => setDialShape(shape)}
                        className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                      />
                      <label
                        htmlFor={`dial-shape-${shape}`}
                        className="text-sm"
                      >
                        {shape}
                      </label>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Strap Color Filter */}
          <div className="border-b border-amber-100 pb-4">
            <button
              className="flex items-center justify-between w-full text-left font-medium"
              onClick={() => toggleSection("strapColor")}
              aria-expanded={expanded.strapColor}
            >
              <span className="font-medium text-amber-800 uppercase text-sm tracking-wider">
                Strap Color
              </span>
              <motion.div
                animate={{ rotate: expanded.strapColor ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.strapColor && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
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
                    <div
                      key={color}
                      className="flex items-center hover:text-amber-700 transition-colors"
                    >
                      <input
                        type="radio"
                        id={`strap-color-${color}`}
                        name="strapColor"
                        checked={strapColor === color}
                        onChange={() => setStrapColor(color)}
                        className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                      />
                      <label
                        htmlFor={`strap-color-${color}`}
                        className="text-sm"
                      >
                        {color}
                      </label>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Strap Material Filter */}
          <div className="border-b border-amber-100 pb-4">
            <button
              className="flex items-center justify-between w-full text-left font-medium"
              onClick={() => toggleSection("strapMaterial")}
              aria-expanded={expanded.strapMaterial}
            >
              <span className="font-medium text-amber-800 uppercase text-sm tracking-wider">
                Strap Material
              </span>
              <motion.div
                animate={{ rotate: expanded.strapMaterial ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.strapMaterial && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
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
                    <div
                      key={material}
                      className="flex items-center hover:text-amber-700 transition-colors"
                    >
                      <input
                        type="radio"
                        id={`strap-material-${material}`}
                        name="strapMaterial"
                        checked={strapMaterial === material}
                        onChange={() => setStrapMaterial(material)}
                        className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                      />
                      <label
                        htmlFor={`strap-material-${material}`}
                        className="text-sm"
                      >
                        {material}
                      </label>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Style Filter */}
          <div className="border-b border-amber-100 pb-4">
            <button
              className="flex items-center justify-between w-full text-left font-medium"
              onClick={() => toggleSection("style")}
              aria-expanded={expanded.style}
            >
              <span className="font-medium text-amber-800 uppercase text-sm tracking-wider">
                Style
              </span>
              <motion.div
                animate={{ rotate: expanded.style ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded.style && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
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
                    <div
                      key={styleOption}
                      className="flex items-center hover:text-amber-700 transition-colors"
                    >
                      <input
                        type="radio"
                        id={`style-${styleOption}`}
                        name="style"
                        checked={style === styleOption}
                        onChange={() => setStyle(styleOption)}
                        className="mr-2 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                      />
                      <label
                        htmlFor={`style-${styleOption}`}
                        className="text-sm"
                      >
                        {styleOption}
                      </label>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom for mobile */}
        <div className="p-5 pt-4 border-t border-amber-100 bg-white flex-shrink-0 md:border-t-0 md:p-0 md:mt-5 sticky bottom-0 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex space-x-2">
            <button
              onClick={applyFilters}
              className="flex-1 bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-700 transition-colors shadow-md"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="flex-1 border border-amber-300 py-2 px-4 rounded hover:bg-amber-50 transition-colors text-amber-800"
            >
              Reset
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default FilterSidebar;
