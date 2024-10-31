import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon } from 'lucide-react';
import { TokenHolder } from '@/interface/types';
import { formatAmountV3, shortenAddress } from '@/utils/blockchainUtils';

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
    <div className="w-full">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[#1a1a1a]">
            <th className="px-4 py-2 text-sm text-gray-400">Holder</th>
            <th className="px-4 py-2 text-sm text-gray-400">Amount</th>
          </tr>
        </thead>
        <tbody>
          {/* Bonding Curve Manager as the first entry */}
          <tr className="border-b border-[#2a2a2a]">
            <td className="px-4 py-2">
              <div className="text-gray-400 text-sm">Bonding Curve</div>
            </td>
            <td className="px-4 py-2 text-gray-400 text-sm">Alpha</td>
          </tr>
          {tokenHolders.map((holder, index) => (
            <tr key={index} className="border-b border-[#2a2a2a]">
              <td className="px-4 py-2">
                {holder.address === creatorAddress ? (
                  <a
                    href={`https://www.shibariumscan.io/address/${holder.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#CCFF00] text-sm flex items-center gap-1 transition-colors"
                  >
                    Creator <ExternalLinkIcon size={14} />
                  </a>
                ) : (
                  <a
                    href={`https://www.shibariumscan.io/address/${holder.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#CCFF00] text-sm flex items-center gap-1 transition-colors"
                  >
                    {shortenAddress(holder.address)} <ExternalLinkIcon size={14} />
                  </a>
                )}
              </td>
              <td className="px-4 py-2 text-gray-400 text-sm">{formatAmountV3(holder.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {tokenHolders.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No token holder data available
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] disabled:opacity-50"
          >
            <ChevronLeftIcon size={20} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === page
                  ? 'bg-[#CCFF00] text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] disabled:opacity-50"
          >
            <ChevronRightIcon size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TokenHolders;