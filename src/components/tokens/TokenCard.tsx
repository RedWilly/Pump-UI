// TokenCard.tsx

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CurrencyDollarIcon, UserIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';
import { Token, TokenWithLiquidityEvents } from '@/interface/types';
import { useTokenLiquidity, formatTimestamp, formatAmountV2 } from '@/utils/blockchainUtils';
import Spinner from '@/components/ui/Spinner';


interface TokenCardProps {
  token: Token | TokenWithLiquidityEvents;
  isEnded: boolean;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, isEnded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLiquidity, setCurrentLiquidity] = useState<string>('0');
  const tokenAddress = token.address as `0x${string}`;
  const { data: liquidityData } = useTokenLiquidity(tokenAddress);
  

  useEffect(() => {
    if (liquidityData && liquidityData[2]) {
      setCurrentLiquidity(liquidityData[2].toString());
    }
  }, [liquidityData]);


  const isTokenWithLiquidity = (token: Token | TokenWithLiquidityEvents): token is TokenWithLiquidityEvents => {
    return 'liquidityEvents' in token && token.liquidityEvents.length > 0;
  };

  const handleClick = () => {
    setIsLoading(true);
  };

  if (isEnded && isTokenWithLiquidity(token)) {
    const liquidityEvent = token.liquidityEvents[0];
    const uniswapLink = `https://app.uniswap.org/swap?outputCurrency=${token.address}&chain=ethereum`;

    return (
      <div className="w-full max-w-sm p-4 bg-gray-800 rounded-lg shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gray-700 rounded-md flex items-center justify-center w-16 h-16">
            <img src={token.logo} alt={`${token.name} Logo`} width={64} height={64} className="object-cover rounded-md" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{token.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <TagIcon className="h-4 w-4" />
              <span>Listed on Uniswap</span>
            </div>
          </div>
        </div>
        <div className="grid gap-2 mb-4 text-[10px] sm:text-xs">
          <div className="flex items-center justify-center text-gray-300">
            <span>Initial Liquidity Added</span>
          </div>
          <div className="flex items-center justify-between text-white">
            <span>{token.symbol}</span>
            <span>{formatAmountV2(liquidityEvent.tokenAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-white">
            <span>ETH</span>
            <span>{formatAmountV2(liquidityEvent.ethAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Listed</span>
            <span>{formatTimestamp(liquidityEvent.timestamp)}</span>
          </div>
          <div className="flex items-center justify-between text-white">
            {/* <span>Current Liquidity</span>
            <span>{formatAmount(currentLiquidity)}</span> */}
          </div>
        </div>
        <div className="flex justify-center">
          <a
            href={uniswapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-center whitespace-nowrap"
          >
            Buy on Chewyswap
          </a>
        </div>
      </div>
    );
  }

  const creatorAddressLink = `/profile/${token.creatorAddress}`;

  return (
    <Link href={`/token/${token.address}`} onClick={handleClick}>
      <div className="w-full bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer relative">
      {isLoading && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-10">
            <Spinner size="medium" />
          </div>
        )}
        <div className="h-40 sm:h-48 overflow-hidden">
          <img src={token.logo} alt={token.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gray-700 rounded-md flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 overflow-hidden">
              <img src={token.logo} alt={token.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-blue-400">{token.name}</h3>
              <p className="text-[10px] sm:text-xs text-gray-400">{token.symbol}</p>
            </div>
          </div>
          <div className="grid gap-2 text-[10px] sm:text-xs">
            <div className="flex items-center text-gray-400">
              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
              <span className="flex items-center">
                Liquidity:{'\u00A0'}
                <Image
                  src="/logo/ethereum.png"
                  alt="ETH"
                  width={16}
                  height={16}
                  className="inline-block align-middle mr-1"
                />
                {formatAmountV2(currentLiquidity)}
              </span>
            </div>
            <div className="flex items-center text-gray-400">
              <UserIcon className="h-4 w-4 mr-2" />
              <span>
                Deployed by{' '}
                <span
                  className="text-blue-500 hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = creatorAddressLink;
                  }}
                >
                  {token.creatorAddress ? `${token.creatorAddress.slice(-6)}` : 'Unknown'}
                </span>
              </span>
            </div>
            <div className="flex items-center text-gray-400">
              <ClockIcon className="h-4 w-4 mr-2" />
              <span>Created {formatTimestamp(token.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TokenCard;