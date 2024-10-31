import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Token, TokenWithLiquidityEvents } from '@/interface/types';
import { useTokenLiquidity, formatTimestampV1, formatTimestamp, formatAmountV2 } from '@/utils/blockchainUtils';
import { useRouter } from 'next/router';
import { Globe, Twitter, Send as Telegram, Clock } from 'lucide-react';
import LoadingBar from '@/components/ui/LoadingBar';

interface TokenCardProps {
  token: Token | TokenWithLiquidityEvents;
  isEnded: boolean;
  onTokenClick: (address: string) => void;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, isEnded, onTokenClick }) => {
  const [currentLiquidity, setCurrentLiquidity] = useState<string>('0');
  const tokenAddress = token.address as `0x${string}`;
  const shouldFetchLiquidity = !token._count?.liquidityEvents;
  const { data: liquidityData } = useTokenLiquidity(shouldFetchLiquidity ? tokenAddress : null);
  const router = useRouter();

  useEffect(() => {
    if (shouldFetchLiquidity && liquidityData && liquidityData[2]) {
      setCurrentLiquidity(liquidityData[2].toString());
    }
  }, [liquidityData, shouldFetchLiquidity]);

  const calculateProgress = (liquidity: string): number => {
    if (token._count?.liquidityEvents > 0) {
      return 100;
    }
    const currentValue = parseFloat(formatAmountV2(liquidity));
    const target = Number(process.env.NEXT_PUBLIC_DEX_TARGET);
    return Math.min((currentValue / target) * 100, 100);
  };

  const progress = calculateProgress(currentLiquidity);
  const isCompleted = token._count?.liquidityEvents > 0;

  const SocialLinks = () => (
    <div className="flex items-center gap-2 absolute top-3 right-3">
      {token.website && (
        <a 
          href={token.website} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-400 hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <Globe size={16} />
        </a>
      )}
      {token.twitter && (
        <a 
          href={token.twitter} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-400 hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <Twitter size={16} />
        </a>
      )}
      {token.telegram && (
        <a 
          href={token.telegram} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-400 hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <Telegram size={16} />
        </a>
      )}
    </div>
  );

  const handleClick = () => {
    onTokenClick(token.address);
  };

  if (isEnded && 'liquidityEvents' in token && token.liquidityEvents.length > 0) {
    const liquidityEvent = token.liquidityEvents[0];
    const uniswapLink = `https://chewyswap.dog/swap/?outputCurrency=${token.address}&chain=shibarium`;

    return (
      <div onClick={handleClick} className="cursor-pointer">
        <div className="bg-[#222222] rounded-lg overflow-hidden hover:bg-[#2a2a2a] transition-colors duration-200">
          <div className="p-4">
            <div className="flex gap-4 mb-4">
              <div className="w-24 h-24 flex-shrink-0">
                <img 
                  src={token.logo} 
                  alt={token.name} 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {token.name} <span className="text-gray-400">{token.symbol}</span>
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">{token.description}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Progress to DEX</span>
                <span className="text-[#CCFF00]">Completed</span>
              </div>
              <div className="w-full bg-[#333333] rounded-full h-2">
                <div
                  className="bg-[#CCFF00] h-2 rounded-full transition-all duration-500 w-full"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={uniswapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2 text-sm bg-[#CCFF00] text-black rounded-md hover:bg-[#B8E600] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Trade
              </a>
              <Link
                href={`/token/${token.address}`}
                className="flex-1 text-center py-2 text-sm bg-[#333333] text-white rounded-md hover:bg-[#444444] transition-colors"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <Link href={`/token/${token.address}`}>
        <div className="bg-[#222222] rounded-lg overflow-hidden hover:bg-[#2a2a2a] transition-colors duration-200 relative">
          <SocialLinks />
          <div className="p-4">
            <div className="flex gap-4 mb-4">
              <div className="w-24 h-24 flex-shrink-0">
                <img 
                  src={token.logo} 
                  alt={token.name} 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {token.name} <span className="text-gray-400">{token.symbol}</span>
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">{token.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-400">
                <Clock size={16} className="mr-2" />
                <span>{formatTimestampV1(token.createdAt)}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress to DEX</span>
                  <span className={`${isCompleted ? 'text-[#CCFF00]' : 'text-white'}`}>
                    {isCompleted ? 'Completed' : `${progress.toFixed(1)}%`}
                  </span>
                </div>
                <div className="w-full bg-[#333333] rounded-full h-2">
                  <div
                    className="bg-[#CCFF00] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <button 
              className="w-full py-2 text-sm bg-[#CCFF00] text-black rounded-md hover:bg-[#B8E600] transition-colors mt-4"
            >
              View Details
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default TokenCard;
