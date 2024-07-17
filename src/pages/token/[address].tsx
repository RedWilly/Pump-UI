//[address].tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  ChartOptions
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
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
  ChevronRightIcon
} from 'lucide-react';
import Layout from '@/components/Layout';
import TradingViewChart from '@/components/TradingViewChart';
import { useCurrentTokenPrice, useTokenLiquidity, calcBuyReturn, calcSellReturn, useBuyTokens, useSellTokens, useUserBalance, useTokenAllowance, useApproveTokens } from '@/utils/blockchainUtils';
import { getTokenInfoAndTransactions, getHistoricalPriceData, getTokenUSDPriceHistory, getTokenHolders } from '@/utils/api';
import { formatTimestamp, formatAmount } from '@/utils/blockchainUtils';
import { ethers } from 'ethers';
import { parseUnits, formatUnits } from 'viem';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useDebounce } from 'use-debounce';
import { toast } from 'react-toastify';



ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const BONDING_CURVE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_BONDING_CURVE_MANAGER_ADDRESS as `0x${string}`;

const TokenDetail: React.FC = () => {
  const router = useRouter();
  const { address } = router.query;
  const { address: userAddress } = useAccount();

  const [isApproved, setIsApproved] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
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
  const [chartData, setChartData] = useState<any>(null);
  const [chartOptions, setChartOptions] = useState<ChartOptions<'line'>>({});

  // const [chartData, setChartData] = useState<{ time: number; open: number; high: number; low: number; close: number; volume: number }[]>([]);
  // const [chartData, setChartData] = useState<{ time: number; value: number }[]>([]);
  const [chartError, setChartError] = useState<string | null>(null);
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();

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


  const { data: buyReturnData, isLoading: isBuyCalculating } = calcBuyReturn(
    address as `0x${string}`, 
    parseUnits(debouncedFromAmount || '0', 18)
  );
  const { data: sellReturnData, isLoading: isSellCalculating } = calcSellReturn(
    address as `0x${string}`, 
    parseUnits(debouncedFromAmount || '0', 18)
  );
  
  const { ethBalance: fetchedEthBalance, tokenBalance: fetchedTokenBalance } = useUserBalance(userAddress as `0x${string}`, address as `0x${string}`);
  const { data: tokenAllowance } = useTokenAllowance(address as `0x${string}`, userAddress as `0x${string}`, BONDING_CURVE_MANAGER_ADDRESS);

  const { buyTokens } = useBuyTokens();
  const { sellTokens } = useSellTokens();
  const { approveTokens } = useApproveTokens();

  const fetchTokenData = useCallback(async (page: number) => {
    try {
      const data = await getTokenInfoAndTransactions(address as string, page, 10);
      setTokenInfo(data);
      setTransactions(data.transactions.data);
      setTotalTransactionPages(data.transactions.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching token data:', error);
    }
  }, [address]);

  const fetchHistoricalPriceData = useCallback(async () => {
    try {
      const historicalData = await getTokenUSDPriceHistory(address as string);
      if (Array.isArray(historicalData) && historicalData.length > 0) {
        const labels = historicalData.map(item => new Date(item.timestamp).getTime());
        const prices = historicalData.map(item => parseFloat(item.tokenPriceUSD));

        setChartData({
          labels,
          datasets: [
            {
              label: 'Price',
              data: prices,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
              pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
            }
          ]
        });

        setChartOptions({
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index' as const,
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'rgba(255, 255, 255, 1)',
              bodyColor: 'rgba(255, 255, 255, 0.8)',
              displayColors: false,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 9 }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
                tooltipFormat: 'MMM d, yyyy HH:mm',
              },
              adapters: {
                date: {
                  locale: enUS,
                },
              },
              grid: {
                display: false,
              },
              ticks: {
                maxTicksLimit: 8,
                color: 'rgba(255, 255, 255, 0.7)',
              }
            },
            y: {
              position: 'right' as const,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
                callback: function(value) {
                  if (typeof value === 'number') {
                    return '$' + value.toFixed(9);
                  }
                  return '$' + parseFloat(value).toFixed(9);
                }
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching historical price data:', error);
      // Handle error (e.g., set an error state or show a message to the user)
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
  }
  
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
          setToToken(prev => ({ ...prev, amount: ethAmount }));
          setIsCalculating(false);
        }
      } else {
        // Buying tokens
        if (buyReturnData !== undefined && !isBuyCalculating) {
          const tokenAmount = formatUnits(buyReturnData, 18);
          setToToken(prev => ({ ...prev, amount: tokenAmount }));
          setIsCalculating(false);
        }
      }
    } else {
      setToToken(prev => ({ ...prev, amount: '' }));
      setIsCalculating(false);
    }
  }, [debouncedFromAmount, buyReturnData, sellReturnData, isSwapped, isBuyCalculating, isSellCalculating]);

  useEffect(() => {
    setActionButtonText(isSwapped ? (isApproved ? 'Sell' : 'Approve') : 'Buy');
  }, [isSwapped, isApproved]);

  const handleSwap = useCallback(() => {
    setIsSwapped(prev => !prev);
    setFromToken(prev => ({ 
      symbol: prev.symbol === 'BONE' ? tokenInfo.symbol : 'BONE', 
      amount: '' 
    }));
    setToToken(prev => ({ 
      symbol: prev.symbol === 'BONE' ? tokenInfo.symbol : 'BONE', 
      amount: '' 
    }));
  }, [tokenInfo]);

  const handleFromAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFromToken(prev => ({ ...prev, amount: e.target.value }));
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
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 text-white">
        {/* Header Section */}
        <div className="flex items-center mb-6">
          <Image src={tokenInfo.logo} alt={tokenInfo.name} width={48} height={48} className="rounded-full mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-blue-400 neon-text">{tokenInfo.name}</h1>
            <p className="text-sm text-gray-300">{tokenInfo.symbol}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-blue-300">Current Price</h2>
            <p className="text-xl text-blue-400 neon-text">
              {/* {currentPrice ? ethers.utils.formatEther(currentPrice) : 'Loading...'} ETH */}
              {currentPrice ? formatAmount(currentPrice.toString()) : 'Loading...'} BONE
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-blue-300">Current Liquidity</h2>
            <p className="text-xl text-blue-400 neon-text">
            {liquidityData && liquidityData[2]
                ? `${formatAmount(liquidityData[2].toString())} BONE`
                : '0 BONE'}
            </p>
          </div>
        </div>

        {/* Price Chart Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-blue-300">Price Chart (USD)</h2>
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            {chartData ? (
              <Line options={chartOptions} data={chartData} />
            ) : (
              <div className="flex justify-center items-center h-64 text-gray-400">
                Loading chart data...
              </div>
            )}
          </div>
          </div>

      {/* Quick Actions Section */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-4 text-blue-300">Quick Actions</h2>
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-300">From</label>
              <span className="text-sm text-gray-400">
                Balance: {isSwapped ? tokenBalance : ethBalance} {fromToken.symbol}
              </span>
            </div>
            <div className="flex items-center bg-gray-600 rounded p-2">
              <input
                type="number"
                value={fromToken.amount}
                onChange={handleFromAmountChange}
                className="flex-grow bg-transparent text-white outline-none"
                placeholder="0.00"
                disabled={isTransacting}
              />
              <span className="ml-2 text-sm text-gray-300">{fromToken.symbol}</span>
            </div>
          </div>
          <button 
            onClick={handleSwap} 
            className="w-full flex justify-center py-2 text-gray-400 hover:text-blue-400"
            disabled={isTransacting}
          >
            <ArrowUpDownIcon size={20} />
          </button>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-300">To (Estimated)</label>
              <span className="text-sm text-gray-400">
                Balance: {isSwapped ? ethBalance : tokenBalance} {toToken.symbol}
              </span>
            </div>
            <div className="flex items-center bg-gray-600 rounded p-2">
              <input
                type="text"
                value={isCalculating ? 'Calculating...' : (toToken.amount ? parseFloat(toToken.amount).toFixed(5) : '')}
                readOnly
                className="flex-grow bg-transparent text-white outline-none"
                placeholder="0.00"
              />
              <span className="ml-2 text-sm text-gray-300">{toToken.symbol}</span>
            </div>
          </div>
          <button 
            onClick={handleAction} 
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={!fromToken.amount || isCalculating || isTransacting}
          >
            {isTransacting ? 'Processing...' : actionButtonText} {isSwapped ? '' : tokenInfo.symbol}
          </button>
        </div>
      </div>
        
        {/* Token Information Section */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-4 text-blue-300">Token Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="text-gray-300">Symbol:</span> <span className="text-blue-400">{tokenInfo?.symbol ?? 'Loading...'}</span></p>
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
                  <a href={`https://shibariumscan.io/address/${tokenInfo.address}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-gray-400 hover:text-blue-400">
                    <ExternalLinkIcon size={14} />
                  </a>
                </>
              )}
            </p>
            <p>
              <span className="text-gray-300">Creator:</span>
              {tokenInfo?.creatorAddress ? (
                <a href={`https://shibariumscan.io/address/${tokenInfo.creatorAddress}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 hover:underline">
                  {`${tokenInfo.creatorAddress.slice(-6)}`}
                  <ExternalLinkIcon size={14} className="ml-1" />
                </a>
              ) : (
                <span className="text-blue-400">Loading...</span>
              )}
            </p>
            <p><span className="text-gray-300">Creation Date:</span> <span className="text-blue-400">{tokenInfo?.createdAt ? formatTimestamp(tokenInfo.createdAt) : 'Loading...'}</span></p>
          </div>
          <div>
            <p><span className="text-gray-300">Description:</span> <span className="text-blue-400">{tokenInfo?.description ?? 'Loading...'}</span></p>
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
      </div>
        
        {/* Transaction History Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-blue-300">Transaction History</h2>
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
                        {tx.txHash.slice(-8)} ..
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* serverside pagination here */}
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
          <h2 className="text-lg font-semibold mb-4 text-blue-300">Token Holders</h2>
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
                    <div className="text-blue-400">
                      Bonding Curve
                    </div>
                  </td>
                  <td className="p-2 text-blue-400">Alpha</td>
                </tr>
                {currentHolders.map((holder, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="p-2">
                      {holder.address === tokenInfo?.creatorAddress ? (
                        <a href={`https://www.shibariumscan.io/address/${holder.address}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          Creator <ExternalLinkIcon size={14} className="inline ml-1" />
                        </a>
                      ) : (
                        <a href={`https://www.shibariumscan.io/address/${holder.address}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
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
          {tokenHolders.length === 0 && (
            <p className="text-gray-400 text-center mt-4">No token holder data available</p>
          )}
          
          {/* Pagination */}
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
         <div className="fixed bottom-4 right-4">
           <button className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
             <Share2Icon size={20} />
           </button>
         </div>
      </div>
    </Layout>
  );
};

export default TokenDetail;