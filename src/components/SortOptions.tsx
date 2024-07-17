import React from 'react';

// export type SortOption = 'all' | 'liquidity' | 'recentCreated' | 'ended' | 'bomper';
export type SortOption = 'all' | 'recentCreated' | 'ended' | 'bomper';


interface SortOptionsProps {
  onSort: (option: SortOption) => void;
  currentSort: SortOption;
}

const sortOptionMapping: { [key: string]: SortOption } = {
  'All': 'all',
  // 'Liquidity': 'liquidity',
  'Recent Created 1hrs': 'recentCreated',
  'Ended': 'ended',
  'Bomper': 'bomper'
};

const SortOptions: React.FC<SortOptionsProps> = ({ onSort, currentSort }) => {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {Object.keys(sortOptionMapping).map((option) => (
        <button
          key={option}
          onClick={() => onSort(sortOptionMapping[option])}
          className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
            currentSort === sortOptionMapping[option]
              ? 'bg-blue-500 text-white neon-border'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default SortOptions;
