//demo test ui - api calls
// Types
export interface LiquidityEvent {
  id: string;
  tokenId: string;
  ethAmount: string;
  tokenAmount: string;
  txHash: string;
  timestamp: string;
}

export interface Token {
  id: string;
  address: string;
  creatorAddress: string;
  name: string;
  symbol: string;
  logo: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    liquidityEvents: number;
  };
  liquidity: string; // This represents the current liquidity from the blockchain
}

export interface TokenWithLiquidityEvents extends Token {
  liquidityEvents: LiquidityEvent[];
}

export interface PaginatedResponse<T> {
  tokens: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// Demo data
const allTokens: Token[] = [
  {
    id: "b611264f-4f38-40d6-a28b-9d7c15475117",
    address: "0xC37082F13e423cDB65dEfD70A621830e725aB673",
    creatorAddress: "0xC1FAC90f63FbE9A1D14Dde052342622e416A2e11",
    name: "testChewy",
    symbol: "tchewy",
    logo: "https://dd.dexscreener.com/ds-data/dexes/chewyswap.png",
    description: "Am testing chewyswap token",
    createdAt: "2024-07-08T10:35:59.104Z",
    updatedAt: "2024-07-08T10:35:59.104Z",
    _count: {
      liquidityEvents: 0
    },
    liquidity: "1000000000000000000" // 1 ETH
  },
  {
    id: "c17a2e94-bf4b-4fb1-9ead-d710583825f3",
    address: "0x17fC704671aEc932b3562E17f835e372108C7E0b",
    creatorAddress: "0x4318A580dd67Cc4e6708E2540212CFb07989d454",
    name: "My test",
    symbol: "my test",
    logo: "https://i.ibb.co/vxDGdjR/test.png",
    description: "this is just a test",
    createdAt: "2024-07-07T23:00:56.937Z",
    updatedAt: "2024-07-07T23:00:56.937Z",
    _count: {
      liquidityEvents: 0
    },
    liquidity: "500000000000000000" // 0.5 ETH
  },
  {
    id: "8f721a35-60f6-4eb0-9321-419b516b155b",
    address: "0x4840bdbEde5e3a86C753ec975be33c27246D503C",
    creatorAddress: "0xC1FAC90f63FbE9A1D14Dde052342622e416A2e11",
    name: "My test",
    symbol: "mite",
    logo: "https://i.ibb.co/vxDGdjR/test.png",
    description: "comeone",
    createdAt: "2024-07-07T22:59:19.266Z",
    updatedAt: "2024-07-07T22:59:19.266Z",
    _count: {
      liquidityEvents: 0
    },
    liquidity: "2000000000000000000" // 2 ETH
  },
  {
    id: "d9e81f3b-7c8a-4b8b-9c2f-4f3a7e5d6c8b",
    address: "0x5678901234567890123456789012345678901234",
    creatorAddress: "0xE5F6789012345678901234567890123456789012",
    name: "Recent Test Token",
    symbol: "RTT",
    logo: "https://example.com/recent-test-token-logo.png",
    description: "A token created for testing recent token functionality",
    createdAt: "2024-07-09T12:19:19.266Z", // Created within the last hour
    updatedAt: "2024-07-09T12:19:19.266Z",
    _count: {
      liquidityEvents: 0
    },
    liquidity: "100000000000000000" // 0.1 ETH
  }
];

const allTokensWithLiquidity: TokenWithLiquidityEvents[] = [
  {
    id: "1",
    address: "0x1234567890123456789012345678901234567890",
    creatorAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    name: "Decentralized Finance Token",
    symbol: "DFT",
    logo: "https://dd.dexscreener.com/ds-data/dexes/chewyswap.png",
    description: "A token for decentralized finance applications",
    createdAt: "2023-07-10T14:30:00Z",
    updatedAt: "2023-07-10T15:45:00Z",
    _count: {
      liquidityEvents: 1
    },
    liquidity: "5000000000000000000", // 5 ETH (current liquidity)
    liquidityEvents: [
      {
        id: "101",
        tokenId: "1",
        ethAmount: "5000000000000000000",
        tokenAmount: "10040000000000000000000",
        txHash: "0xaabbccddee1122334455667788990011223344556677889900112233445566",
        timestamp: "2023-07-10T15:45:00Z"
      }
    ]
  },
  {
    id: "2",
    address: "0x2345678901234567890123456789012345678901",
    creatorAddress: "0xbcdef1234567890abcdef1234567890abcdef123",
    name: "Governance Token",
    symbol: "GOV",
    logo: "https://i.ibb.co/vxDGdjR/test.png",
    description: "A token for community governance and voting",
    createdAt: "2023-07-09T10:15:00Z",
    updatedAt: "2023-07-09T11:30:00Z",
    _count: {
      liquidityEvents: 1
    },
    liquidity: "3000000000000000000", // 3 ETH (current liquidity)
    liquidityEvents: [
      {
        id: "102",
        tokenId: "2",
        ethAmount: "3000000000000000000",
        tokenAmount: "6000000000",
        txHash: "0xbbccddee1122334455667788990011223344556677889900112233445566778",
        timestamp: "2023-07-09T11:30:00Z"
      }
    ]
  },
  {
    id: "3",
    address: "0x3456789012345678901234567890123456789012",
    creatorAddress: "0xcdef1234567890abcdef1234567890abcdef1234",
    name: "Yield Farming Token",
    symbol: "YFT",
    logo: "https://example.com/yft-logo.png",
    description: "A token for yield farming and liquidity mining",
    createdAt: "2023-07-08T09:00:00Z",
    updatedAt: "2023-07-08T10:20:00Z",
    _count: {
      liquidityEvents: 1
    },
    liquidity: "7000000000000000000", // 7 ETH (current liquidity)
    liquidityEvents: [
      {
        id: "103",
        tokenId: "3",
        ethAmount: "7000000000000000000",
        tokenAmount: "14000000000",
        txHash: "0xccddee1122334455667788990011223344556677889900112233445566778899",
        timestamp: "2023-07-08T10:20:00Z"
      }
    ]
  },
];

// Functions to simulate API calls
export const getDemoTokens = (page: number, pageSize: number): PaginatedResponse<Token> => {
  const startIndex = (page - 1) * pageSize;
  const paginatedTokens = allTokens.slice(startIndex, startIndex + pageSize);

  return {
    tokens: paginatedTokens,
    totalCount: allTokens.length,
    currentPage: page,
    totalPages: Math.ceil(allTokens.length / pageSize)
  };
};

export const getDemoTokensWithLiquidity = (page: number, pageSize: number): PaginatedResponse<TokenWithLiquidityEvents> => {
  const startIndex = (page - 1) * pageSize;
  const paginatedTokens = allTokensWithLiquidity.slice(startIndex, startIndex + pageSize);

  return {
    tokens: paginatedTokens,
    totalCount: allTokensWithLiquidity.length,
    currentPage: page,
    totalPages: Math.ceil(allTokensWithLiquidity.length / pageSize)
  };
};

// Function to get a single token by address
export const getDemoTokenByAddress = (address: string): Token | TokenWithLiquidityEvents | undefined => {
  return [...allTokens, ...allTokensWithLiquidity].find(token => token.address === address);
};

// Function to get recent tokens
export const getDemoRecentTokens = (page: number, pageSize: number, hours: number): PaginatedResponse<Token> => {
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
  
  const recentTokens = allTokens.filter(token => new Date(token.createdAt) >= cutoffTime);
  const startIndex = (page - 1) * pageSize;
  const paginatedTokens = recentTokens.slice(startIndex, startIndex + pageSize);

  return {
    tokens: paginatedTokens,
    totalCount: recentTokens.length,
    currentPage: page,
    totalPages: Math.ceil(recentTokens.length / pageSize)
  };
};

// Function to simulate searching tokens
export const searchDemoTokens = (query: string, page: number, pageSize: number): PaginatedResponse<Token> => {
  const filteredTokens = allTokens.filter(token => 
    token.name.toLowerCase().includes(query.toLowerCase()) ||
    token.symbol.toLowerCase().includes(query.toLowerCase())
  );
  
  const startIndex = (page - 1) * pageSize;
  const paginatedTokens = filteredTokens.slice(startIndex, startIndex + pageSize);

  return {
    tokens: paginatedTokens,
    totalCount: filteredTokens.length,
    currentPage: page,
    totalPages: Math.ceil(filteredTokens.length / pageSize)
  };
};

// Function to simulate fetching token liquidity from blockchain - depre
export const fetchDemoTokenLiquidity = (address: string): string => {
  const token = [...allTokens, ...allTokensWithLiquidity].find(t => t.address === address);
  return token ? token.liquidity : "0";
};