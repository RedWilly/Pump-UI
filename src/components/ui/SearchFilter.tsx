import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchFilterProps {
  onSearch: (query: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch }) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <div className="relative flex items-center max-w-md mx-auto mb-6">
      <input
        type="text"
        placeholder="Search tokens..."
        onChange={handleSearch}
        className="w-full py-2 pl-10 pr-4 text-sm bg-[#222222] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors duration-200"
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    </div>
  );
};

export default SearchFilter;