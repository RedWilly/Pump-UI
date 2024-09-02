import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { formatTimestamp, formatAmount, shortenAddress } from '@/utils/blockchainUtils';
import { Transaction } from '@/interface/types';

interface TransactionHistoryProps {
  transactions: Transaction[];
  transactionPage: number;
  totalTransactionPages: number;
  tokenSymbol: string;
  handlePageChange: (newPage: number) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  transactionPage,
  totalTransactionPages,
  tokenSymbol,
  handlePageChange,
}) => {
  return (
    <div className="mb-8">
      {/* <h2 className="text-sm sm:text-base font-semibold mb-4 text-blue-300">Transaction History</h2> */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 text-left text-gray-300">Maker</th>
              <th className="p-2 text-left text-gray-300">Type</th>
              <th className="p-2 text-left text-gray-300">BONE</th>
              <th className="p-2 text-left text-gray-300">{tokenSymbol}</th>
              <th className="p-2 text-left text-gray-300">Date</th>
              <th className="p-2 text-left text-gray-300">Tx</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-700">
                <td className="p-2 text-blue-400">{shortenAddress(tx.senderAddress)}</td>
                <td className="p-2 text-blue-400">{tx.type}</td>
                <td className="p-2 text-blue-400">{formatAmount(tx.ethAmount)}</td>
                <td className="p-2 text-blue-400">{formatAmount(tx.tokenAmount)}</td>
                <td className="p-2 text-blue-400">{formatTimestamp(tx.timestamp)}</td>
                <td className="p-2 text-blue-400">
                  <a href={`https://shibariumscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {tx.txHash.slice(-8)}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination for transactions */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(transactionPage - 1)}
          disabled={transactionPage === 1}
          className="px-3 py-1 bg-gray-700 text-gray-300 rounded-l hover:bg-gray-600 disabled:opacity-50"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <span className="px-4 py-1 bg-gray-800 text-gray-300">
          {transactionPage} of {totalTransactionPages}
        </span>
        <button
          onClick={() => handlePageChange(transactionPage + 1)}
          disabled={transactionPage === totalTransactionPages}
          className="px-3 py-1 bg-gray-700 text-gray-300 rounded-r hover:bg-gray-600 disabled:opacity-50"
        >
          <ChevronRightIcon size={20} />
        </button>
      </div>
    </div>
  );
};

export default TransactionHistory;