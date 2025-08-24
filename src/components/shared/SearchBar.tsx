import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

type SearchBarProps = {
  onSearch: (query: string) => void;
  placeholder?: string;
};

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search products...",
}) => {
  const [query, setQuery] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        onSearch(query);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="block w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
        placeholder={placeholder}
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          aria-label="Clear search"
        >
          <XMarkIcon className="h-5 w-5 text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
