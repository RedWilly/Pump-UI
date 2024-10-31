import React from 'react';

export type SortOption = 'trending' | 'new' | 'finalized';

interface SortOptionsProps {
  onSort: (option: SortOption) => void;
  currentSort: SortOption;
}

const sortOptionMapping: { [key: string]: SortOption } = {
  'Trending': 'trending',
  'New': 'new',
  'Finalized': 'finalized'
};

const SortOptions: React.FC<SortOptionsProps> = ({ onSort, currentSort }) => {
  return (
    <div className="mb-5 flex flex-wrap gap-2 justify-center">
      {Object.keys(sortOptionMapping).map((option) => (
        <button
          key={option}
          onClick={() => onSort(sortOptionMapping[option])}
          className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
            currentSort === sortOptionMapping[option]
              ? 'bg-[#222222] text-white'
              : 'text-gray-300 hover:bg-[#222222]'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default SortOptions;