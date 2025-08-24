"use client";

import React, { useState, useRef, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

type EnhancedSearchBarProps = {
  onSearch: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onSearch,
  initialValue = "",
  placeholder = "Search products...",
  className = "",
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(autoFocus);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
    onSearch("");
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`relative flex items-center w-full ${className}`}
    >
      <div
        className={`flex items-center w-full bg-white rounded-full border transition-all duration-200 ${
          isFocused ? "border-primary shadow-sm" : "border-gray-200"
        }`}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="submit"
          className="p-2 text-gray-500 hover:text-primary"
          aria-label="Search"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </motion.button>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full px-2 py-2 text-gray-800 bg-transparent focus:outline-none"
          aria-label="Search query"
        />

        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={clearSearch}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
};

export default EnhancedSearchBar;
