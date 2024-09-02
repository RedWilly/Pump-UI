import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon } from 'lucide-react';
import { TokenHolder } from '@/interface/types';
import { formatAmount } from '@/utils/blockchainUtils';

interface TokenHoldersProps {
  tokenHolders: TokenHolder[];
  currentPage: number;
  totalPages: number;
  tokenSymbol: string;
  creatorAddress: string;
  onPageChange: (page: number) => void;
}

const TokenHolders: React.FC<TokenHoldersProps> = ({
  tokenHolders,
  currentPage,
  totalPages,
  tokenSymbol,
  creatorAddress,
  onPageChange,
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-sm sm:text-base font-semibold mb-4 text-blue-300">Token Holders</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 text-left text-gray-300">Address</th>
              <th className="p-2 text-left text-gray-300">Amount</th>
            </tr>
          </thead>
          <tbody>
            {/* Bonding Curve Manager as the first entry */}
            <tr className="border-b border-gray-700">
              <td className="p-2">
                <div className="text-blue-400">Bonding Curve</div>
              </td>
              <td className="p-2 text-blue-400">Alpha</td>
            </tr>
            {tokenHolders.map((holder, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="p-2">
                  {holder.address === creatorAddress ? (
                    <a
                      href={`https://www.shibariumscan.io/address/${holder.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Creator <ExternalLinkIcon size={14} className="inline ml-1" />
                    </a>
                  ) : (
                    <a
                      href={`https://www.shibariumscan.io/address/${holder.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {holder.address.slice(0, 6)}...{holder.address.slice(-4)} <ExternalLinkIcon size={14} className="inline ml-1" />
                    </a>
                  )}
                </td>
                <td className="p-2 text-blue-400">{formatAmount(holder.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tokenHolders.length === 0 && <p className="text-gray-400 text-center mt-4">No token holder data available</p>}

      {/* Pagination for token holders */}
      {tokenHolders.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-700 text-gray-300 rounded-l hover:bg-gray-600 disabled:opacity-50"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <span className="px-4 py-1 bg-gray-800 text-gray-300">
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-700 text-gray-300 rounded-r hover:bg-gray-600 disabled:opacity-50"
          >
            <ChevronRightIcon size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TokenHolders;