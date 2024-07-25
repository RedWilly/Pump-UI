import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Layout from '@/components/Layout';
import { useCreateToken } from '@/utils/blockchainUtils';
import { updateToken } from '@/utils/api';
import { ChevronDownIcon, ChevronUpIcon, CloudArrowUpIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400 mb-6 neon-text text-center">Create New Token</h1>
        
        {/* Info button with tooltip */}
        <div className="relative mb-6 flex justify-center">
          <button
            type="button"
            className="text-gray-400 hover:text-blue-400 transition-colors duration-200 flex items-center bg-gray-800 px-3 py-2 rounded-md shadow-md"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <InformationCircleIcon className="h-5 w-5 mr-2" />
            <span className="text-sm">Deployment Cost Info</span>
          </button>
          {showTooltip && (
            <div className="absolute left-1/2 transform -translate-x-1/2 top-12 bg-gray-800 text-white p-4 rounded-md shadow-lg z-10 w-64 border border-gray-700">
              <p className="text-sm">
                Cost to deploy: 1 BONE<br />
                This serves as an initial boost to the bonding curve.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-gray-800 p-6 rounded-lg shadow-xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                placeholder="Enter token name"
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
                className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                placeholder="Enter token symbol"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="tokenDescription" className="block text-sm font-medium text-gray-300 mb-1">
              Token Description
            </label>
            <textarea
              id="tokenDescription"
              value={tokenDescription}
              onChange={(e) => setTokenDescription(e.target.value)}
              rows={4}
              className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              placeholder="Describe your token"
            />
          </div>

          <div>
            <label htmlFor="tokenImage" className="block text-sm font-medium text-gray-300 mb-2">
              Token Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md hover:border-blue-500 transition duration-150 ease-in-out">
              <div className="space-y-1 text-center">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-400">
                  <label
                    htmlFor="tokenImage"
                    className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition duration-150 ease-in-out"
                  >
                    <span className="px-3 py-2 rounded-md">Upload a file</span>
                    <input
                      id="tokenImage"
                      name="tokenImage"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="pl-1 pt-2">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            {isUploading && <p className="text-sm text-gray-400 mt-2">Uploading image to IPFS...</p>}
          </div>

          {tokenImageUrl && (
            <div className="mt-4 flex justify-center">
              <div className="text-center">
                <img
                  src={tokenImageUrl}
                  alt="Token preview"
                  className="h-32 w-32 object-cover rounded-md mx-auto"
                />
                <p className="text-xs text-gray-400 mt-2 break-all max-w-xs mx-auto">IPFS: {tokenImageUrl}</p>
              </div>
            </div>
          )}
          
          {/* Collapsible Social Media Section */}
          <div className="border border-gray-600 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={toggleSocialSection}
              className="w-full flex justify-between items-center p-4 bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200"
            >
              <span className="font-medium">Social Media Links (Optional)</span>
              {isSocialExpanded ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
            {isSocialExpanded && (
              <div className="p-4 bg-gray-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: 'website', label: 'Website', value: website, setter: setWebsite },
                  { id: 'telegram', label: 'Telegram', value: telegram, setter: setTelegram },
                  { id: 'discord', label: 'Discord', value: discord, setter: setDiscord },
                  { id: 'twitter', label: 'Twitter', value: twitter, setter: setTwitter },
                  { id: 'youtube', label: 'YouTube', value: youtube, setter: setYoutube },
                ].map((item) => (
                  <div key={item.id}>
                    <label htmlFor={item.id} className="block text-sm font-medium text-gray-300 mb-1">
                      {item.label}
                    </label>
                    <input
                      type="url"
                      id={item.id}
                      value={item.value}
                      onChange={(e) => item.setter(e.target.value)}
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                      placeholder={`Enter ${item.label.toLowerCase()} URL`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-150 ease-in-out ${
                isButtonDisabled
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
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