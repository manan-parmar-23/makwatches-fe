import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FunnelIcon,
    XMarkIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";

type PriceRange = {
    min: number;
    max: number;
};

type FilterSidebarProps = {
    isOpen: boolean;
    onClose: () => void;
    onFilterChange: (filters: {
        priceRange?: PriceRange;
        sortBy?: string;
        inStock?: boolean;
    }) => void;
    availableFilters: {
        sortOptions: { value: string; label: string }[];
    };
    currentFilters: {
        priceRange: PriceRange;
        sortBy: string;
        inStock: boolean;
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
    const [expanded, setExpanded] = useState({
        price: true,
        sort: true,
        availability: true,
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

        onFilterChange({
            priceRange: { min: 0, max: 10000 },
            sortBy: "",
            inStock: false,
        });
    };

    return (
        <>
            {/* Mobile filter button */}
            <div className="md:hidden fixed bottom-4 right-4 z-30">
                <button
                    onClick={() => !isOpen && onClose()}
                    className="bg-primary text-white p-3 rounded-full shadow-lg flex items-center justify-center"
                    aria-label="Open filters"
                >
                    <FunnelIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                className="fixed md:sticky top-0 right-0 md:left-0 h-full md:h-[calc(100vh-80px)] bg-white z-50 w-72 md:w-64 shadow-lg md:shadow-none overflow-y-auto"
                initial={{ x: isOpen ? 0 : "100%" }}
                animate={{ x: isOpen ? 0 : "100%" }}
                transition={{ type: "tween" }}
                style={{ display: isOpen ? "block" : "none" }}
            >
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Filters</h2>
                        <button
                            onClick={onClose}
                            className="md:hidden p-1 rounded-full hover:bg-gray-100"
                            aria-label="Close filters"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    {/* Price Range Filter */}
                    <div className="border-b pb-4">
                        <button
                            className="flex items-center justify-between w-full text-left font-medium"
                            onClick={() => toggleSection("price")}
                            aria-expanded={expanded.price}
                        >
                            <span>Price Range</span>
                            <motion.div
                                animate={{ rotate: expanded.price ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
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
                                                className="w-full border rounded px-2 py-1 mt-1"
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
                                                className="w-full border rounded px-2 py-1 mt-1"
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
                                        className="w-full"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sort Filter */}
                    <div className="border-b pb-4">
                        <button
                            className="flex items-center justify-between w-full text-left font-medium"
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
                    <div className="border-b pb-4">
                        <button
                            className="flex items-center justify-between w-full text-left font-medium"
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
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="in-stock"
                                            checked={inStock}
                                            onChange={(e) => setInStock(e.target.checked)}
                                            className="mr-2"
                                        />
                                        <label htmlFor="in-stock">In Stock Only</label>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                        <button
                            onClick={applyFilters}
                            className="flex-1 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={resetFilters}
                            className="flex-1 border border-gray-300 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
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
