import React, { useState } from 'react';
import TokenCard from './TokenCard';
import { Token, TokenWithLiquidityEvents } from '@/interface/types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import LoadingBar from '@/components/ui/LoadingBar';

interface TokenListProps {
  tokens: (Token | TokenWithLiquidityEvents)[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isEnded: boolean;
}

const TokenList: React.FC<TokenListProps> = ({ tokens, currentPage, totalPages, onPageChange, isEnded }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleTokenClick = async (tokenAddress: string) => {
    setIsLoading(true);
    await router.push(`/token/${tokenAddress}`);
    setIsLoading(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {tokens.map((token) => (
          <TokenCard 
            key={token.id} 
            token={token} 
            isEnded={isEnded} 
            onTokenClick={handleTokenClick}
          />
        ))}
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingBar size="large" />
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-[#222222] text-gray-400 hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
                  currentPage === page
                    ? 'bg-[#CCFF00] text-black'
                    : 'bg-[#222222] text-gray-400 hover:bg-[#2a2a2a]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md bg-[#222222] text-gray-400 hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
};

export default TokenList;