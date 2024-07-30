//[address].tsx
import { GetServerSideProps } from 'next';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import 'chartjs-adapter-date-fns';
import {
  CopyIcon,
  ExternalLinkIcon,
  TwitterIcon,
  GlobeIcon,
  MessageCircleIcon,
  YoutubeIcon,
  Share2Icon,
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Info
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import TradingViewChart from '@/components/charts/TradingViewChart';
import {
  useCurrentTokenPrice,
  useTokenLiquidity,
  useCalcBuyReturn,
  useCalcSellReturn,
  useBuyTokens,
  useSellTokens,
  useUserBalance,
  useTokenAllowance,
  useApproveTokens,
  formatAmountV2,
} from '@/utils/blockchainUtils';
import { getTokenInfoAndTransactions, getTokenUSDPriceHistory, getTokenHolders, searchTokens } from '@/utils/api';
import { formatTimestamp, formatAmount } from '@/utils/blockchainUtils';
import { ethers } from 'ethers';
import { parseUnits, formatUnits } from 'viem';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useDebounce } from 'use-debounce';
import { toast } from 'react-toastify';
import ShareButton from '@/components/ui/ShareButton';
import SEO from '@/components/seo/SEO';
import { TokenWithTransactions } from '@/interface/types';
// import OGPreview from '@/components/OGPreview'


const BONDING_CURVE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_BONDING_CURVE_MANAGER_ADDRESS as `0x${string}`;

interface TokenDetailProps {
  initialTokenInfo: TokenWithTransactions;
  initialPriceHistory: any[];
  initialHolders: any[];
}

// const TokenDetail: React.FC = () => {
  const TokenDetail: React.FC<TokenDetailProps> = ({ initialTokenInfo }) => {

  const router = useRouter();
  const { address } = router.query;
  const { address: userAddress } = useAccount();

  const [isApproved, setIsApproved] = useState(false);
  // const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenWithTransactions>(initialTokenInfo);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionPage, setTransactionPage] = useState(1);
  const [totalTransactionPages, setTotalTransactionPages] = useState(1);
  const [fromToken, setFromToken] = useState({ symbol: 'BONE', amount: '' });
  const [toToken, setToToken] = useState({ symbol: '', amount: '' });
  const [isSwapped, setIsSwapped] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [ethBalance, setEthBalance] = useState('0.000');
  const [tokenBalance, setTokenBalance] = useState('0.000');
  const [actionButtonText, setActionButtonText] = useState('Buy');
  const [chartError, setChartError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  //holders
  const [tokenHolders, setTokenHolders] = useState<Awaited<ReturnType<typeof getTokenHolders>>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [holdersPerPage] = useState(20);

  //confirm
  const { data: transactionReceipt, isError: transactionError, isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: transactionHash,
    confirmations: 2,
  });

  const [debouncedFromAmount] = useDebounce(fromToken.amount, 300);

  const { data: currentPrice, refetch: refetchCurrentPrice } = useCurrentTokenPrice(address as `0x${string}`);
  const { data: liquidityData, refetch: refetchLiquidity } = useTokenLiquidity(address as `0x${string}`);

  const { data: buyReturnData, isLoading: isBuyCalculating } = useCalcBuyReturn(address as `0x${string}`, parseUnits(debouncedFromAmount || '0', 18));
  const { data: sellReturnData, isLoading: isSellCalculating } = useCalcSellReturn(address as `0x${string}`, parseUnits(debouncedFromAmount || '0', 18));

  const { ethBalance: fetchedEthBalance, tokenBalance: fetchedTokenBalance } = useUserBalance(userAddress as `0x${string}`, address as `0x${string}`);
  const { data: tokenAllowance } = useTokenAllowance(address as `0x${string}`, userAddress as `0x${string}`, BONDING_CURVE_MANAGER_ADDRESS);

  const { buyTokens } = useBuyTokens();
  const { sellTokens } = useSellTokens();
  const { approveTokens } = useApproveTokens();

  const fetchTokenData = useCallback(
    async (page: number) => {
      try {
        const data = await getTokenInfoAndTransactions(address as string, page, 10);
        setTokenInfo(data);
        setTransactions(data.transactions.data);
        setTotalTransactionPages(data.transactions.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
    },
    [address]
  );

  const fetchHistoricalPriceData = useCallback(async () => {
    try {
      const historicalData = await getTokenUSDPriceHistory(address as string);
      if (Array.isArray(historicalData) && historicalData.length > 0) {
        const formattedData = historicalData.map((item, index, arr) => {
          const prevItem = arr[index - 1] || item;
          return {
            time: new Date(item.timestamp).getTime() / 1000,
            open: parseFloat(prevItem.tokenPriceUSD),
            high: Math.max(parseFloat(prevItem.tokenPriceUSD), parseFloat(item.tokenPriceUSD)),
            low: Math.min(parseFloat(prevItem.tokenPriceUSD), parseFloat(item.tokenPriceUSD)),
            close: parseFloat(item.tokenPriceUSD),
          };
        });
        setChartData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching historical price data:', error);
      setChartError('Failed to load chart data');
    }
  }, [address]);

  const fetchTokenHolders = async () => {
    if (address) {
      try {
        const holders = await getTokenHolders(address as string);
        setTokenHolders(holders);
      } catch (error) {
        console.error('Error fetching token holders:', error);
        toast.error('Failed to fetch token holders');
      }
    }
  };

  // Get current holders
  const indexOfLastHolder = currentPage * holdersPerPage;
  const indexOfFirstHolder = indexOfLastHolder - holdersPerPage;
  const currentHolders = tokenHolders.slice(indexOfFirstHolder, indexOfLastHolder);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const fetchAllData = useCallback(async () => {
    if (address) {
      await fetchTokenData(transactionPage);
      await fetchHistoricalPriceData();
      refetchCurrentPrice();
      refetchLiquidity();
      fetchTokenHolders();
    }
  }, [address, transactionPage, fetchTokenData, fetchHistoricalPriceData, refetchCurrentPrice, refetchLiquidity]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (tokenAllowance !== undefined && address) {
      setIsApproved(tokenAllowance > 0);
    }
  }, [tokenAllowance, address]);

  useEffect(() => {
    if (fetchedEthBalance) {
      setEthBalance(parseFloat(formatUnits(fetchedEthBalance, 18)).toFixed(5));
    }
    if (fetchedTokenBalance) {
      setTokenBalance(parseFloat(formatUnits(fetchedTokenBalance, 18)).toFixed(5));
    }
  }, [fetchedEthBalance, fetchedTokenBalance]);

  useEffect(() => {
    if (transactionReceipt && !transactionError) {
      if (isSwapped) {
        if (!isApproved) {
          setIsApproved(true);
          toast.success('Token approval successful');
        } else {
          toast.success('Tokens sold successfully');
        }
      } else {
        toast.success('Tokens bought successfully');
      }
      fetchAllData();
    } else if (transactionError) {
      toast.error('Transaction failed');
    }
  }, [transactionReceipt, transactionError, isSwapped, isApproved, fetchAllData]);

  useEffect(() => {
    if (debouncedFromAmount) {
      setIsCalculating(true);
      if (isSwapped) {
        // Selling tokens
        if (sellReturnData !== undefined && !isSellCalculating) {
          const ethAmount = formatUnits(sellReturnData, 18);
          setToToken((prev) => ({ ...prev, amount: ethAmount }));
          setIsCalculating(false);
        }
      } else {
        // Buying tokens
        if (buyReturnData !== undefined && !isBuyCalculating) {
          const tokenAmount = formatUnits(buyReturnData, 18);
          setToToken((prev) => ({ ...prev, amount: tokenAmount }));
          setIsCalculating(false);
        }
      }
    } else {
      setToToken((prev) => ({ ...prev, amount: '' }));
      setIsCalculating(false);
    }
  }, [debouncedFromAmount, buyReturnData, sellReturnData, isSwapped, isBuyCalculating, isSellCalculating]);

  useEffect(() => {
    setActionButtonText(isSwapped ? (isApproved ? 'Sell' : 'Approve') : 'Buy');
  }, [isSwapped, isApproved]);

  const handleSwap = useCallback(() => {
    setIsSwapped((prev) => !prev);
    setFromToken((prev) => ({
      symbol: prev.symbol === 'BONE' ? tokenInfo.symbol : 'BONE',
      amount: '',
    }));
    setToToken((prev) => ({
      symbol: prev.symbol === 'BONE' ? tokenInfo.symbol : 'BONE',
      amount: '',
    }));
  }, [tokenInfo]);

  const handleFromAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFromToken((prev) => ({ ...prev, amount: e.target.value }));
    setIsCalculating(true);
  }, []);

  const handleAction = useCallback(async () => {
    if (!address || !fromToken.amount || !userAddress) {
      toast.error('Missing required information');
      return;
    }

    const amount = parseUnits(fromToken.amount, 18);
    setIsTransacting(true);

    try {
      let txHash;
      if (isSwapped) {
        if (!isApproved) {
          txHash = await approveTokens(address as `0x${string}`);
        } else {
          txHash = await sellTokens(address as `0x${string}`, amount);
        }
      } else {
        txHash = await buyTokens(address as `0x${string}`, amount);
      }
      console.log('Transaction hash:', txHash);
      setTransactionHash(txHash);
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Transaction failed to initiate: ' + (error as Error).message);
      setIsTransacting(false);
    }
  }, [address, fromToken.amount, userAddress, isSwapped, isApproved, approveTokens, sellTokens, buyTokens]);

  useEffect(() => {
    if (!isWaiting && !transactionError) {
      setIsTransacting(false);
      setTransactionHash(undefined);
    }
  }, [isWaiting, transactionError]);

  const handlePageChange = useCallback((newPage: number) => {
    setTransactionPage(newPage);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  if (!tokenInfo) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-white">Loading...</div>
      </Layout>
    );
  }

  const calculateProgress = (currentLiquidity: bigint): number => {
    const liquidityInEth = parseFloat(formatUnits(currentLiquidity, 18));
    const target = 2500; 
    const progress = (liquidityInEth / target) * 100;
    return Math.min(progress, 100);
  };

  return (
    <Layout>
      {/* <SEO token={tokenInfo} /> */}
      <SEO
        token={{
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          description: tokenInfo.description,
          logo: tokenInfo.logo
        }}
      />
      <div className="w-full min-h-screen bg-gray-900 text-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-center mb-6 gap-4">
            <Image src={tokenInfo.logo} alt={tokenInfo.name} width={64} height={64} className="rounded-full" />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-400">{tokenInfo.name}</h1>
              <p className="text-sm text-gray-300">{tokenInfo.symbol}</p>
            </div>
          </div>

      {/* Price and Liquidity Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-base sm:text-lg font-semibold mb-2 text-blue-300">Current Price</h2>
          <p className="text-lg sm:text-xl text-blue-400">
            {currentPrice ? formatAmount(currentPrice.toString()) : 'Loading...'} BONE
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-base sm:text-lg font-semibold mb-2 text-blue-300">Current Liquidity</h2>
          <p className="text-lg sm:text-xl text-blue-400 mb-2">
            {liquidityData && liquidityData[2] ? `${formatAmountV2(liquidityData[2].toString())} BONE` : '0 BONE'}
          </p>
          {liquidityData && liquidityData[2] && (
            <>
              <div className="w-full bg-gray-700 rounded-full h-4 mb-2 relative">
                <div 
                  className="bg-blue-600 h-full rounded-l-full transition-all duration-500 ease-out"
                  style={{ width: `${calculateProgress(liquidityData[2])}%` }}
                ></div>
                <div 
                  className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-semibold text-white"
                >
                  {calculateProgress(liquidityData[2]).toFixed(2)}%
                </div>
              </div>
              
            </>
          )}
        </div>
      </div>

          {/* Token Information Section */}
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg mb-8">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowTokenInfo(!showTokenInfo)}>
              <h2 className="text-base sm:text-lg font-semibold text-blue-300">Token Information</h2>
              <Info size={20} className={`${showTokenInfo ? 'transform rotate-180' : ''}`} />
            </div>
            {showTokenInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                <div>
                  <p>
                    <span className="text-gray-300">Symbol:</span> <span className="text-blue-400">{tokenInfo?.symbol ?? 'Loading...'}</span>
                  </p>
                  <p>
                    <span className="text-gray-300">Contract Address:</span>
                    <span className="text-blue-400">
                      {tokenInfo?.address ? `${tokenInfo.address.slice(-6)}` : 'Loading...'}
                    </span>
                    {tokenInfo?.address && (
                      <>
                        <button onClick={() => copyToClipboard(tokenInfo.address)} className="ml-2 text-gray-400 hover:text-blue-400">
                          <CopyIcon size={14} />
                        </button>
                        <a
                          href={`https://shibariumscan.io/address/${tokenInfo.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-gray-400 hover:text-blue-400"
                        >
                          <ExternalLinkIcon size={14} />
                        </a>
                      </>
                    )}
                  </p>
                  <p>
                    <span className="text-gray-300">Creator:</span>
                    {tokenInfo?.creatorAddress ? (
                      <a
                        href={`https://shibariumscan.io/address/${tokenInfo.creatorAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-400 hover:underline"
                      >
                        {`${tokenInfo.creatorAddress.slice(-6)}`}
                        <ExternalLinkIcon size={14} className="ml-1" />
                      </a>
                    ) : (
                      <span className="text-blue-400">Loading...</span>
                    )}
                  </p>
                  <p>
                    <span className="text-gray-300">Creation Date:</span>{' '}
                    <span className="text-blue-400">{tokenInfo?.createdAt ? formatTimestamp(tokenInfo.createdAt) : 'Loading...'}</span>
                  </p>
                </div>
                <div>
                  <p>
                    <span className="text-gray-300">Description:</span> <span className="text-blue-400">{tokenInfo?.description ?? 'Loading...'}</span>
                  </p>
                  <div className="mt-4">
                    <span className="text-gray-300">Socials:</span>
                    <div className="flex space-x-4 mt-2">
                      {tokenInfo?.telegram && (
                        <a href={tokenInfo.telegram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                          <MessageCircleIcon size={16} />
                        </a>
                      )}
                      {tokenInfo?.website && (
                        <a href={tokenInfo.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                          <GlobeIcon size={16} />
                        </a>
                      )}
                      {tokenInfo?.twitter && (
                        <a href={tokenInfo.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                          <TwitterIcon size={16} />
                        </a>
                      )}
                      {tokenInfo?.discord && (
                        <a href={tokenInfo.discord} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                          <MessageCircleIcon size={16} />
                        </a>
                      )}
                      {tokenInfo?.youtube && (
                        <a href={tokenInfo.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                          <YoutubeIcon size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Chart Section */}
          <div className="mb-8">
            <h2 className="text-base sm:text-lg font-semibold mb-4 text-blue-300">Price Chart (USD)</h2>
            <div className="bg-gray-800 p-2 sm:p-4 rounded-lg shadow">
              {chartData.length > 0 ? (
                <TradingViewChart data={chartData} />
              ) : (
                <div className="flex justify-center items-center h-48 sm:h-64 md:h-80 text-gray-400 text-sm sm:text-base">
                  {chartError || 'Loading chart data...'}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg mb-8">
            <h2 className="text-base sm:text-lg font-semibold mb-4 text-blue-300">Quick Actions</h2>
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="mb-4 relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                  <label className="text-sm text-gray-300 mb-1 sm:mb-0">From</label>
                  <span className="text-xs sm:text-sm text-gray-400">
                    Balance: {isSwapped ? tokenBalance : ethBalance} {fromToken.symbol}
                  </span>
                </div>
                <div className="flex items-center bg-gray-600 rounded p-2">
                  <input
                    type="number"
                    value={fromToken.amount}
                    onChange={handleFromAmountChange}
                    className="w-full bg-transparent text-white outline-none text-sm sm:text-base"
                    placeholder="0.00"
                    disabled={isTransacting}
                  />
                  <span className="ml-2 text-xs sm:text-sm text-gray-300 whitespace-nowrap">{fromToken.symbol}</span>
                </div>
              </div>
              <button onClick={handleSwap} className="w-full flex justify-center py-2 text-gray-400 hover:text-blue-400 mb-4">
                <ArrowUpDownIcon size={20} />
              </button>
              <div className="mb-4 relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                  <label className="text-sm text-gray-300 mb-1 sm:mb-0">To (Estimated)</label>
                  <span className="text-xs sm:text-sm text-gray-400">
                    Balance: {isSwapped ? ethBalance : tokenBalance} {toToken.symbol}
                  </span>
                </div>
                <div className="flex items-center bg-gray-600 rounded p-2">
                  <input
                    type="text"
                    value={isCalculating ? 'Calculating...' : toToken.amount ? parseFloat(toToken.amount).toFixed(5) : ''}
                    readOnly
                    className="w-full bg-transparent text-white outline-none text-sm sm:text-base"
                    placeholder="0.00"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-gray-300 whitespace-nowrap">{toToken.symbol}</span>
                </div>
              </div>
              <button
                onClick={handleAction}
                className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
                disabled={!fromToken.amount || isCalculating || isTransacting}
              >
                {isTransacting ? 'Processing...' : actionButtonText} {isSwapped ? '' : tokenInfo.symbol}
              </button>
            </div>
          </div>

          {/* Transaction History Section */}
          <div className="mb-8">
            <h2 className="text-base sm:text-lg font-semibold mb-4 text-blue-300">Transaction History</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-2 text-left text-gray-300">Maker</th>
                    <th className="p-2 text-left text-gray-300">Type</th>
                    <th className="p-2 text-left text-gray-300">BONE</th>
                    <th className="p-2 text-left text-gray-300">{tokenInfo.symbol}</th>
                    <th className="p-2 text-left text-gray-300">Date</th>
                    <th className="p-2 text-left text-gray-300">Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-700">
                      <td className="p-2 text-blue-400">{tx.senderAddress.slice(0, 6)}...{tx.senderAddress.slice(-4)}</td>
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

          {/* Token Holders Section */}
          <div className="mb-8">
            <h2 className="text-base sm:text-lg font-semibold mb-4 text-blue-300">Token Holders</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-2 text-left text-gray-300">Address</th>
                    <th className="p-2 text-left text-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Add Bonding Curve Manager as the first entry */}
                  <tr className="border-b border-gray-700">
                    <td className="p-2">
                      <div className="text-blue-400">Bonding Curve</div>
                    </td>
                    <td className="p-2 text-blue-400">Alpha</td>
                  </tr>
                  {currentHolders.map((holder, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="p-2">
                        {holder.address === tokenInfo?.creatorAddress ? (
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
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-l hover:bg-gray-600 disabled:opacity-50"
                >
                  <ChevronLeftIcon size={20} />
                </button>
                <span className="px-4 py-1 bg-gray-800 text-gray-300">
                  {currentPage} of {Math.ceil(tokenHolders.length / holdersPerPage)}
                </span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === Math.ceil(tokenHolders.length / holdersPerPage)}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-r hover:bg-gray-600 disabled:opacity-50"
                >
                  <ChevronRightIcon size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Share Button */}
          <ShareButton tokenInfo={tokenInfo} />

        </div>
      </div>
      {/* {process.env.NODE_ENV === 'development' && <OGPreview />} */}
    </Layout>
  );
};

//simple server-side rendering  just to get token info for seo - nothing more 
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { address } = context.params as { address: string };

  try {
    const tokenInfo = await getTokenInfoAndTransactions(address, 1, 1);

    return {
      props: {
        initialTokenInfo: tokenInfo,
      },
    };
  } catch (error) {
    console.error('Error fetching token data:', error);
    return {
      notFound: true,
    };
  }
};

export default TokenDetail;