import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import Layout from '@/components/layout/Layout';
import { getTransactionsByAddress, getAllTokenAddresses, getTokensByCreator } from '@/utils/api';
import { Transaction, PaginatedResponse, Token } from '@/interface/types';
import { formatTimestamp, formatAddressV2, formatAmountV3, useERC20Balance } from '@/utils/blockchainUtils';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ExternalLinkIcon } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import Spinner from '@/components/ui/Spinner';

interface TransactionResponse extends Omit<PaginatedResponse<Transaction>, 'data'> {
    transactions: Transaction[];
}

interface TokenBalanceItemProps {
  tokenAddress: string;
  symbol: string;
  userAddress: string;
  onClick: () => void;
}

const TokenBalanceItem: React.FC<TokenBalanceItemProps> = ({ tokenAddress, symbol, userAddress, onClick }) => {
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
      className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200 shadow-md"
      onClick={onClick}
    >
      <h3 className="text-xs sm:text-sm font-semibold text-blue-400 mb-2">{symbol}</h3>
      <p className="text-gray-300 text-[10px] sm:text-xs">Balance: {formatAmountV3(balance.toString())}</p>
      <p className="text-gray-400 text-[10px] sm:text-xs mt-2">
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

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center mt-6 space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <div className="flex items-center space-x-1">
        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-2 py-1 text-xs sm:text-sm rounded-md transition-colors duration-200 ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            );
          } else if (
            page === currentPage - 2 ||
            page === currentPage + 2
          ) {
            return (
              <span key={page} className="text-gray-500 text-xs sm:text-sm">
                ...
              </span>
            );
          }
          return null;
        })}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </div>
  );
};

interface TokenTabProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
}

const TokenTab: React.FC<TokenTabProps> = ({ title, isActive, onClick }) => (
  <button
    className={`w-full rounded-lg py-2.5 text-xs sm:text-sm font-medium leading-5 ${
      isActive
        ? 'bg-white text-blue-700 shadow'
        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
    }`}
    onClick={onClick}
  >
    {title}
  </button>
);

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const { address: profileAddress } = router.query;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenAddresses, setTokenAddresses] = useState<Array<{address: string, symbol: string}>>([]);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'held' | 'created'>('held');
  const [createdTokens, setCreatedTokens] = useState<Token[]>([]);
  const [createdTokensPage, setCreatedTokensPage] = useState(1);
  const [createdTokensTotalPages, setCreatedTokensTotalPages] = useState(1);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const addressToUse = (profileAddress as string) || connectedAddress || '';

  const fetchTransactions = useCallback(async (address: string, page: number) => {
    setIsLoading(true);
    try {
        const response: TransactionResponse = await getTransactionsByAddress(address, page);
      setTransactions(response.transactions); // Change this line
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTokenAddresses = useCallback(async () => {
    try {
      const addresses = await getAllTokenAddresses();
      setTokenAddresses(addresses);
    } catch (error) {
      console.error('Error fetching token addresses:', error);
    }
  }, []);

  const fetchCreatedTokens = useCallback(async (creatorAddress: string, page: number) => {
    setIsLoading(true);
    try {
      const response = await getTokensByCreator(creatorAddress, page);
      setCreatedTokens(response.tokens);
      setCreatedTokensTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching created tokens:', error);
      setCreatedTokens([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (addressToUse) {
      fetchTransactions(addressToUse, currentPage);
      fetchTokenAddresses();
      fetchCreatedTokens(addressToUse, createdTokensPage);
    }
  }, [addressToUse, currentPage, createdTokensPage, fetchTransactions, fetchTokenAddresses, fetchCreatedTokens]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getTokenSymbol = (tokenAddress: string) => {
    const token = tokenAddresses.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    return token ? token.symbol : 'Unknown';
  };

  const handleTokenClick = (tokenAddress: string) => {
    setIsTokenLoading(true);
    router.push(`/token/${tokenAddress}`).finally(() => {
      setIsTokenLoading(false);
    });
  };

  const handleCreatedTokensPageChange = (newPage: number) => {
    setCreatedTokensPage(newPage);
  };

  const toggleTxExpand = (txId: string) => {
    setExpandedTx(expandedTx === txId ? null : txId);
  };

  return (
    <Layout>
      <SEO 
        title={`${addressToUse ? `Profile: ${formatAddressV2(addressToUse)}` : 'Your Profile'} - DEGFun`}
        description={`View token holdings and transactions for ${addressToUse ? formatAddressV2(addressToUse) : 'your account'}.`}
        image="seo/profile.jpg"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-400 mb-6">
          {addressToUse === connectedAddress ? 'Your Profile' : `Profile: ${formatAddressV2(addressToUse)}`}
        </h1>
        
        <div className="mb-8">
          <div className="flex justify-center mb-4 space-x-1 bg-blue-900/20 rounded-lg p-1">
            <TokenTab title="Tokens Held" isActive={activeTab === 'held'} onClick={() => setActiveTab('held')} />
            <TokenTab title="Tokens Created" isActive={activeTab === 'created'} onClick={() => setActiveTab('created')} />
          </div>
          
          {activeTab === 'held' && (
            <div>
              {tokenAddresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tokenAddresses.map((token) => (
                    <TokenBalanceItem
                      key={token.address}
                      tokenAddress={token.address}
                      symbol={token.symbol}
                      userAddress={addressToUse}
                      onClick={() => handleTokenClick(token.address)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-300 text-center text-sm sm:text-base">No tokens held</p>
              )}
            </div>
          )}

          {activeTab === 'created' && (
            <div>
              {isLoading ? (
                <p className="text-gray-300 text-center">Loading created tokens...</p>
              ) : createdTokens.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {createdTokens.map((token) => (
                    <div 
                      key={token.address}
                      className="bg-gray-800 rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200 shadow-md flex items-start"
                      onClick={() => handleTokenClick(token.address)}
                    >
                      {token.logo && (
                        <img src={token.logo} alt={`${token.name} logo`} className="w-16 h-16 mr-3 sm:mr-4 rounded-full" />
                      )}
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-blue-400 mb-1">
                          {token.name} <span className="text-gray-400">({token.symbol})</span>
                        </h3>
                        <p className="text-gray-400 text-[9px] sm:text-xs">{token.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300 text-center text-sm sm:text-base">No tokens created</p>
              )}
              {createdTokensTotalPages > 1 && (
                <Pagination
                  currentPage={createdTokensPage}
                  totalPages={createdTokensTotalPages}
                  onPageChange={handleCreatedTokensPageChange}
                />
              )}
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-blue-400 mb-4">Recent Transactions</h2>
          {isLoading ? (
            <p className="text-gray-300">Loading transactions...</p>
          ) : transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">Token</th>
                    <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-300 uppercase tracking-wider">ETH</th>
                    <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">Tx</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {transactions.map((tx) => (
                    <React.Fragment key={tx.id}>
                      <tr 
                        className="hover:bg-gray-700 transition-colors duration-150 cursor-pointer sm:cursor-default"
                        onClick={() => toggleTxExpand(tx.id)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-[10px] sm:text-xs text-gray-300">{tx.type}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[10px] sm:text-xs text-gray-300 hidden sm:table-cell">{getTokenSymbol(tx.recipientAddress)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[10px] sm:text-xs text-gray-300">{formatAmountV3(tx.tokenAmount)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[10px] sm:text-xs text-gray-300">{formatAmountV3(tx.ethAmount)} ETH</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[10px] sm:text-xs text-gray-300 hidden sm:table-cell">{formatTimestamp(tx.timestamp)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[10px] sm:text-xs text-gray-300 hidden sm:table-cell">
                          <a
                            href={`https://shibariumscan.io/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-400 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {tx.txHash.slice(-8)}
                            <ExternalLinkIcon size={12} className="ml-1" />
                          </a>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-[10px] sm:text-xs text-gray-300 sm:hidden">
                          <ChevronDownIcon size={16} className={`transition-transform ${expandedTx === tx.id ? 'rotate-180' : ''}`} />
                        </td>
                      </tr>
                      {expandedTx === tx.id && (
                        <tr className="bg-gray-750 sm:hidden">
                          <td colSpan={4}>
                            <div className="px-4 py-2 space-y-2">
                              <p className="text-[10px] text-gray-300">Token: {getTokenSymbol(tx.recipientAddress)}</p>
                              <p className="text-[10px] text-gray-300">Date: {formatTimestamp(tx.timestamp)}</p>
                              <a
                                href={`https://etherscan.io/tx/${tx.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-[10px] text-blue-400 hover:underline"
                              >
                                View TX
                                <ExternalLinkIcon size={12} className="ml-1" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-300 bg-gray-800 rounded-lg p-4 shadow-md">No recent transactions.</p>
          )}
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
      {isTokenLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Spinner size="large" />
        </div>
      )}
    </Layout>
  );
};

export default ProfilePage;
