// api.ts

import axios from 'axios';
import { Token, TokenWithLiquidityEvents, PaginatedResponse, LiquidityEvent, TokenWithTransactions, PriceResponse, HistoricalPrice, USDHistoricalPrice, TokenHolder, TransactionResponse } from '@/interface/types';
import { ethers } from 'ethers';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getAllTokens(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Token>> {
  const response = await axios.get(`${API_BASE_URL}/api/tokens`, {
    params: { page, pageSize }
  });
  return response.data;
}


export async function getRecentTokens(page: number = 1, pageSize: number = 20, hours: number = 1): Promise<PaginatedResponse<Token> | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tokens/recent`, {
      params: { page, pageSize, hours }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Return null to indicate no recent tokens found
      return null;
    }
    throw error; // Re-throw other errors
  }
}

export async function getTokensWithLiquidity(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<TokenWithLiquidityEvents>> {
  const response = await axios.get(`${API_BASE_URL}/api/tokens/with-liquidityEvent`, {
    params: { page, pageSize }
  });
  return response.data;
}

export async function getTokenByAddress(address: string): Promise<Token> {
  const response = await axios.get(`${API_BASE_URL}/api/tokens/address/${address}`);
  return response.data;
}

export async function getTokenLiquidityEvents(tokenId: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<LiquidityEvent>> {
  const response = await axios.get(`${API_BASE_URL}/api/liquidity/token/${tokenId}`, {
    params: { page, pageSize }
  });
  return response.data;
}

export async function getTokenInfoAndTransactions(
  address: string,
  transactionPage: number = 1,
  transactionPageSize: number = 10
): Promise<TokenWithTransactions> {
  const response = await axios.get(`${API_BASE_URL}/api/tokens/address/${address}/info-and-transactions`, {
    params: { transactionPage, transactionPageSize }
  });
  return response.data;
}


//historical price
export async function getHistoricalPriceData(address: string): Promise<Token> {
  const response = await axios.get(`${API_BASE_URL}/api/tokens/address/${address}/historical-prices`);
  return response.data;
}

//eth price usd
export async function getCurrentPrice(): Promise<string> {
  try {
    const response = await axios.get<PriceResponse>(`${API_BASE_URL}/api/price`);
    return response.data.price;
  } catch (error) {
    console.error('Error fetching current price:', error);
    throw new Error('Failed to fetch current price');
  }
}


export async function getTokenUSDPriceHistory(address: string): Promise<USDHistoricalPrice[]> {
  try {
    const [ethPrice, historicalPrices] = await Promise.all([
      getCurrentPrice(),
      getHistoricalPriceData(address)
    ]);

    return historicalPrices.map((price: HistoricalPrice) => {
      const tokenPriceInWei = ethers.BigNumber.from(price.tokenPrice);
      const tokenPriceInETH = ethers.utils.formatEther(tokenPriceInWei);
      const tokenPriceUSD = parseFloat(tokenPriceInETH) * parseFloat(ethPrice);

      return {
        tokenPriceUSD: tokenPriceUSD.toFixed(9),  // Adjust decimal places as needed
        timestamp: price.timestamp
      };
    });
  } catch (error) {
    console.error('Error calculating USD price history:', error);
    throw new Error('Failed to calculate USD price history');
  }
}


export async function updateToken(
  address: string, 
  data: {
    logo?: string;
    description?: string;
    website?: string;
    telegram?: string;
    discord?: string;
    twitter?: string;
    youtube?: string;
  }
): Promise<Token> {
  try {
    const response = await axios.patch(`${API_BASE_URL}/api/tokens/update/${address}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating token:', error);
    throw new Error('Failed to update token');
  }
}

// get all transaction associated with a particular address
export async function getTransactionsByAddress(
  address: string, 
  page: number = 1, 
  pageSize: number = 20
): Promise<TransactionResponse> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/transactions/address/${address}`, {
      params: { page, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
}

//get all token address
export async function getAllTokenAddresses(): Promise<Array<{address: string, symbol: string}>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tokens/addresses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching token addresses and symbols:', error);
    throw new Error('Failed to fetch token addresses and symbols');
  }
}

//blockexplorer Get token Holders
export async function getTokenHolders(tokenAddress: string): Promise<TokenHolder[]> {
  try {
    const response = await axios.get(`https://www.shibariumscan.io/api/v2/tokens/${tokenAddress}/holders`);
    const data = response.data;

    return data.items.map((item: any) => {
      return {
        address: item.address.hash,
        balance: item.value
      };
    });
  } catch (error) {
    console.error('Error fetching token holders:', error);
    throw new Error('Failed to fetch token holders');
  }
}
