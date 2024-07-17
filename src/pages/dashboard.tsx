import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { getTransactionsByAddress, getAllTokenAddresses } from '@/utils/api';
import { Transaction, PaginatedResponse } from '@/interface/types';
import { formatTimestamp, formatAddressV2, formatAmount, useERC20Balance } from '@/utils/blockchainUtils';

interface TransactionResponse extends Omit<PaginatedResponse<Transaction>, 'data'> {
  transactions: Transaction[];
}

const TokenBalanceItem: React.FC<{ 
  tokenAddress: string; 
  symbol: string; 
  userAddress: string;
  onClick: () => void;
}> = ({ tokenAddress, symbol, userAddress, onClick }) => {
  const { balance } = useERC20Balance(tokenAddress as `0x${string}`, userAddress as `0x${string}`);
  
  if (!balance || balance.toString() === '0') {
    return null;
  }

  const handleAddressClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://shibariumscan.io/address/${tokenAddress}`, '_blank');
  };

  return (
    <div 
      className="card p-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold text-blue-400 mb-2">{symbol}</h3>
      <p className="text-gray-300">Balance: {formatAmount(balance.toString())}</p>
      <p className="text-gray-400 text-sm mt-2">
        Address: 
        <span 
          className="text-blue-400 hover:underline ml-1 cursor-pointer"
          onClick={handleAddressClick}
        >
          {formatAddressV2(tokenAddress)}
        </span>
      </p>
    </div>
  );
};

const UserDashboard: React.FC = () => {
  const { address } = useAccount();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenAddresses, setTokenAddresses] = useState<Array<{address: string, symbol: string}>>([]);

  useEffect(() => {
    if (address) {
      fetchTransactions(address, currentPage);
      fetchTokenAddresses();
    }
  }, [address, currentPage]);

  const fetchTransactions = async (userAddress: string, page: number) => {
    setIsLoading(true);
    try {
      const response: TransactionResponse = await getTransactionsByAddress(userAddress, page);
      setTransactions(response.transactions);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTokenAddresses = async () => {
    try {
      const addresses = await getAllTokenAddresses();
      setTokenAddresses(addresses);
    } catch (error) {
      console.error('Error fetching token addresses:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getTokenSymbol = (tokenAddress: string) => {
    const token = tokenAddresses.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    return token ? token.symbol : 'Unknown';
  };

  const handleTokenClick = (tokenAddress: string) => {
    router.push(`/token/${tokenAddress}`);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-blue-400 mb-6 neon-text">Your Dashboard</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4 neon-text">Your Tokens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokenAddresses.map((token) => (
              <TokenBalanceItem
                key={token.address}
                tokenAddress={token.address}
                symbol={token.symbol}
                userAddress={address || ''}
                onClick={() => handleTokenClick(token.address)}
              />
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold text-blue-400 mb-4 neon-text">Recent Transactions</h2>
          {isLoading ? (
            <p className="text-gray-300">Loading transactions...</p>
          ) : transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto card">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Token</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{tx.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{getTokenSymbol(tx.recipientAddress)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formatAmount(tx.tokenAmount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formatAmount(tx.tokenPrice)} ETH</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formatTimestamp(tx.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-300 card p-4">No recent transactions.</p>
          )}
          
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;