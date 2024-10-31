import React, { useEffect } from 'react';
import { ExternalLinkIcon } from 'lucide-react';
import { TokenWithTransactions } from '@/interface/types';
import { formatTimestamp, shortenAddress, formatAddressV2, formatAmount } from '@/utils/blockchainUtils';
import { Globe, Twitter, Send as Telegram } from 'lucide-react';
import { useTokenLiquidity, useCurrentTokenPrice } from '@/utils/blockchainUtils';
import { formatUnits } from 'viem';

interface TokenInfoProps {
  tokenInfo: TokenWithTransactions;
  showHeader?: boolean;
  refreshTrigger?: number;
}

const TokenInfo: React.FC<TokenInfoProps> = ({ tokenInfo, showHeader = false, refreshTrigger = 0 }) => {
  const tokenAddress = tokenInfo?.address as `0x${string}`;
  const { data: liquidityData, refetch: refetchLiquidity } = useTokenLiquidity(tokenAddress);
  const { data: currentPrice, refetch: refetchPrice } = useCurrentTokenPrice(tokenAddress);

  useEffect(() => {
    refetchLiquidity();
    refetchPrice();
  }, [refreshTrigger, refetchLiquidity, refetchPrice]);

  const calculateProgress = (currentLiquidity: bigint): number => {
    const liquidityInEth = parseFloat(formatUnits(currentLiquidity, 18));
    const target = 2500; 
    const progress = (liquidityInEth / target) * 100;
    return Math.min(progress, 100);
  };

  const TokenDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InfoItem 
          label="Contract" 
          value={tokenInfo?.address ? formatAddressV2(tokenInfo.address) : 'Loading...'}
          link={`https://shibariumscan.io/address/${tokenInfo?.address}`}
          isExternal={true}
        />
        <InfoItem 
          label="Deployer" 
          value={tokenInfo?.creatorAddress ? shortenAddress(tokenInfo.creatorAddress) : 'Loading...'}
          link={`/profile/${tokenInfo?.creatorAddress}`}
          isExternal={false}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoItem 
          label="Created" 
          value={tokenInfo?.createdAt ? formatTimestamp(tokenInfo.createdAt) : 'Loading...'}
        />
        <InfoItem 
          label="Current Price" 
          value={currentPrice ? `${formatAmount(currentPrice.toString())} BONE` : 'Loading...'}
        />
      </div>
    </div>
  );

  if (showHeader) {
    return (
      <div className="space-y-6">
        {/* Mobile Header (hidden on desktop) */}
        <div className="lg:hidden flex flex-col">
          {/* Full-width image container for mobile */}
          <div className="w-full h-[200px] mb-4 bg-[#1a1a1a] rounded-b-xl overflow-hidden">
            <img 
              src={tokenInfo.logo} 
              alt={tokenInfo.name} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Mobile Token Info Container */}
          <div className="px-4">
            {/* Name and Symbol - Updated to be inline */}
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-white inline-flex items-center justify-center gap-2">
                {tokenInfo.name}
                <span className="text-gray-400">${tokenInfo.symbol}</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 text-center mb-4">
              {tokenInfo.description}
            </p>

            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-6">
              {tokenInfo.website && (
                <a 
                  href={tokenInfo.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-[#CCFF00] transition-colors"
                >
                  <Globe size={24} />
                </a>
              )}
              {tokenInfo.twitter && (
                <a 
                  href={tokenInfo.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-[#CCFF00] transition-colors"
                >
                  <Twitter size={24} />
                </a>
              )}
              {tokenInfo.telegram && (
                <a 
                  href={tokenInfo.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-[#CCFF00] transition-colors"
                >
                  <Telegram size={24} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Header (hidden on mobile) - Updated alignment */}
        <div className="hidden lg:block">
          <div className="flex items-start gap-4">
            <img 
              src={tokenInfo.logo} 
              alt={tokenInfo.name} 
              className="w-24 h-24 rounded-lg"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{tokenInfo.name}</h1>
                <span className="text-gray-400">${tokenInfo.symbol}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{tokenInfo.description}</p>
              
              {/* Social Links */}
              <div className="flex gap-3 mt-4">
                {tokenInfo.website && (
                  <a href={tokenInfo.website} target="_blank" rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-[#CCFF00]">
                    <Globe size={20} />
                  </a>
                )}
                {tokenInfo.twitter && (
                  <a href={tokenInfo.twitter} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#CCFF00]">
                    <Twitter size={20} />
                  </a>
                )}
                {tokenInfo.telegram && (
                  <a href={tokenInfo.telegram} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#CCFF00]">
                    <Telegram size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar (shared between mobile and desktop) */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress to DEX</span>
            <span className="text-white">
              {liquidityData && liquidityData[2] ? 
                `${calculateProgress(liquidityData[2]).toFixed(1)}%` : '0%'}
            </span>
          </div>
          <div className="w-full bg-[#333333] rounded-full h-2.5">
            <div
              className="bg-[#CCFF00] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${liquidityData ? calculateProgress(liquidityData[2]) : 0}%` }}
            />
          </div>
        </div>

        {/* Token Details */}
        <TokenDetails />
      </div>
    );
  }

  // When showHeader is false, only show the token details
  return <TokenDetails />;
};

const InfoItem: React.FC<{ 
  label: string; 
  value?: string; 
  link?: string; 
  isExternal?: boolean;
}> = ({ label, value, link, isExternal }) => (
  <div className="bg-[#1a1a1a] p-3 rounded-lg">
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    <div className="text-sm text-white">
      {link ? (
        isExternal ? (
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#CCFF00] transition-colors flex items-center gap-1"
          >
            {value}
            <ExternalLinkIcon size={12} />
          </a>
        ) : (
          <a 
            href={link} 
            className="hover:text-[#CCFF00] transition-colors"
          >
            {value}
          </a>
        )
      ) : (
        value
      )}
    </div>
  </div>
);

export default TokenInfo;
