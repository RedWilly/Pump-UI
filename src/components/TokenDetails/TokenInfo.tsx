import React, { useState } from 'react';
import { CopyIcon, ExternalLinkIcon, MessageCircleIcon, GlobeIcon, TwitterIcon, YoutubeIcon, Info } from 'lucide-react';
import { TokenWithTransactions } from '@/interface/types';
import { formatTimestamp, shortenAddress, formatAddressV2 } from '@/utils/blockchainUtils';
import { toast } from 'react-toastify';

interface TokenInfoProps {
  tokenInfo: TokenWithTransactions;
}

const TokenInfo: React.FC<TokenInfoProps> = ({ tokenInfo }) => {
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg mb-8">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowTokenInfo(!showTokenInfo)}>
        <h2 className="text-sm sm:text-base font-semibold text-blue-300">Token Information</h2>
        <Info size={20} className={`${showTokenInfo ? 'transform rotate-180' : ''}`} />
      </div>
      {showTokenInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm mt-4">
          <div>
            <p>
              <span className="text-gray-300">Symbol:</span> <span className="text-blue-400">{tokenInfo?.symbol ?? 'Loading...'}</span>
            </p>
            <p>
              <span className="text-gray-300">Contract Address:</span>
              <span className="text-blue-400">
                {tokenInfo?.address ? formatAddressV2(tokenInfo.address) : 'Loading...'}
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
                  {tokenInfo?.creatorAddress ? shortenAddress(tokenInfo.creatorAddress) : 'Loading...'}
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
  );
};

export default TokenInfo;