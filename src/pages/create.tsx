import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Layout from '@/components/Layout';
import { useCreateToken } from '@/utils/blockchainUtils';
import { updateToken } from '@/utils/api';
import { ChevronDownIcon, ChevronUpIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const CreateToken: React.FC = () => {
  const router = useRouter();
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [tokenImage, setTokenImage] = useState<File | null>(null);
  const [tokenImageUrl, setTokenImageUrl] = useState<string | null>(null);
  const [website, setWebsite] = useState('');
  const [telegram, setTelegram] = useState('');
  const [discord, setDiscord] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [creationStep, setCreationStep] = useState<'idle' | 'uploading' | 'creating' | 'updating' | 'completed' | 'error'>('idle');
  const [isSocialExpanded, setIsSocialExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const { createToken, isLoading: isBlockchainLoading } = useCreateToken();

  const uploadToIPFS = useCallback(async (file: File) => {
    setIsUploading(true);
    setCreationStep('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Uploading image to IPFS...');
      const response = await axios.post('/api/upload-to-ipfs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.url) {
        console.log('Image uploaded successfully:', response.data.url);
        setTokenImageUrl(response.data.url);
        toast.success('Image uploaded to IPFS successfully!');
        return response.data.url;
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`Failed to upload image: ${error.response.data.error || error.message}`);
      } else {
        toast.error('Failed to upload image. Please try again.');
      }
      return null;
    } finally {
      setIsUploading(false);
      setCreationStep('idle');
    }
  }, []);

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTokenImage(file);
      const newImageUrl = await uploadToIPFS(file);
      if (newImageUrl) {
        setTokenImageUrl(newImageUrl);
      }
    }
  }, [uploadToIPFS]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenImageUrl) {
      toast.error('Please upload an image before creating the token.');
      return;
    }

    setCreationStep('creating');
    let tokenAddress: string | null = null;

    try {
      console.log('Creating token on blockchain...');
      tokenAddress = await createToken(tokenName, tokenSymbol);
      console.log('Token created on blockchain:', tokenAddress);
      
      setCreationStep('updating');

      // Add a 4-second delay before updating the server - gives the backend time to catch event and process
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      console.log('Updating token in backend...');
      await updateToken(tokenAddress, {
        logo: tokenImageUrl,
        description: tokenDescription,
        website,
        telegram,
        discord,
        twitter,
        youtube
      });
      console.log('Token updated in backend');
      
      setCreationStep('completed');
      toast.success('Token created and updated successfully!');
      router.push(`/token/${tokenAddress}`);
    } catch (error) {
      console.error('Error in token creation/update process:', error);
      if (tokenAddress) {
        toast.error('Token created on blockchain but failed to update in backend. Please try updating later in your portfolio.');
      } else {
        toast.error('Failed to create token. Please try again.');
      }
      setCreationStep('error');
    }
  }, [tokenName, tokenSymbol, tokenImageUrl, tokenDescription, website, telegram, discord, twitter, youtube, createToken, router]);

  const getButtonText = useCallback(() => {
    switch (creationStep) {
      case 'uploading':
        return 'Uploading image...';
      case 'creating':
        return isBlockchainLoading ? 'Waiting for blockchain confirmation...' : 'Creating token on blockchain...';
      case 'updating':
        return 'Updating token in backend...';
      case 'completed':
        return 'Token created successfully!';
      case 'error':
        return 'Error occurred. Visit Portfolio to Update TokenInfo';
      default:
        return 'Create Token';
    }
  }, [creationStep, isBlockchainLoading]);

  const isButtonDisabled = creationStep !== 'idle' || !tokenName || !tokenSymbol || !tokenImageUrl;

  const toggleSocialSection = () => {
    setIsSocialExpanded(!isSocialExpanded);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-blue-400 mb-6 neon-text">Create New Token</h1>
        
        {/* Info button with tooltip */}
        <div className="relative mb-4">
          <button
            type="button"
            className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <InformationCircleIcon className="h-6 w-6" />
          </button>
          {showTooltip && (
            <div className="absolute left-0 top-8 bg-gray-800 text-white p-3 rounded-md shadow-lg z-10 w-64">
              <p className="text-sm">
                Cost to deploy: 1 BONE<br />
                This serves as an initial boost to the bonding curve.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 card">
          <div>
            <label htmlFor="tokenName" className="block text-sm font-medium text-gray-300 mb-1">
              Token Name
            </label>
            <input
              type="text"
              id="tokenName"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              required
              className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="tokenSymbol" className="block text-sm font-medium text-gray-300 mb-1">
              Token Symbol
            </label>
            <input
              type="text"
              id="tokenSymbol"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              required
              className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="tokenDescription" className="block text-sm font-medium text-gray-300 mb-1">
              Token Description
            </label>
            <textarea
              id="tokenDescription"
              value={tokenDescription}
              onChange={(e) => setTokenDescription(e.target.value)}
              rows={3}
              className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="tokenImage" className="block text-sm font-medium text-gray-300 mb-1">
              Token Image
            </label>
            <input
              type="file"
              id="tokenImage"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isUploading}
            />
            {isUploading && <p className="text-sm text-gray-400 mt-1">Uploading image to IPFS...</p>}
          </div>
          {tokenImageUrl && (
            <div className="mt-2">
              <img
                src={tokenImageUrl}
                alt="Token preview"
                className="h-32 w-32 object-cover rounded-md"
              />
              <p className="text-sm text-gray-400 mt-1">IPFS URL: {tokenImageUrl}</p>
            </div>
          )}
          
          {/* Collapsible Social Media Section */}
          <div className="border border-gray-600 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={toggleSocialSection}
              className="w-full flex justify-between items-center p-3 bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200"
            >
              <span className="font-medium">Social Media Links (Optional)</span>
              {isSocialExpanded ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
            {isSocialExpanded && (
              <div className="p-4 bg-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="telegram" className="block text-sm font-medium text-gray-300 mb-1">
                    Telegram
                  </label>
                  <input
                    type="url"
                    id="telegram"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="discord" className="block text-sm font-medium text-gray-300 mb-1">
                    Discord
                  </label>
                  <input
                    type="url"
                    id="discord"
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="twitter" className="block text-sm font-medium text-gray-300 mb-1">
                    Twitter
                  </label>
                  <input
                    type="url"
                    id="twitter"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="youtube" className="block text-sm font-medium text-gray-300 mb-1">
                    YouTube
                  </label>
                  <input
                    type="url"
                    id="youtube"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`w-full btn ${isButtonDisabled ? 'btn-disabled' : 'btn-primary'}`}
            >
              {getButtonText()}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateToken;