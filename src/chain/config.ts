import { Chain } from 'viem'
import { flare, shibarium } from 'wagmi/chains'

interface ChainConfig {
  apiBaseUrl: string
  wsBaseUrl: string
  blockscoutUrl: string
  dexTarget: number
  contractAddresses: string[]
}

interface ChainConfigs {
  [chainId: number]: ChainConfig
}

// Shibarium Chain Configuration
const shibariumConfig: ChainConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
  wsBaseUrl: process.env.NEXT_PUBLIC_WS_BASE_URL!,
  blockscoutUrl: process.env.NEXT_PUBLIC_BLOCKSCOUT_URL!,
  dexTarget: Number(process.env.NEXT_PUBLIC_DEX_TARGET),
  contractAddresses: [
    process.env.NEXT_PUBLIC_BONDING_CURVE_MANAGER_ADDRESS!,
    process.env.NEXT_PUBLIC_BONDING_CURVE_MANAGER_ADDRESS_OLD!,
    process.env.NEXT_PUBLIC_BONDING_CURVE_MANAGER_ADDRESS_OLD1!,
  ].filter(Boolean)
}

// Flare Chain Configuration
const flareConfig: ChainConfig = {
  apiBaseUrl: process.env.FLARE_NEXT_PUBLIC_API_BASE_URL!,
  wsBaseUrl: process.env.FLARE_NEXT_PUBLIC_WS_BASE_URL!,
  blockscoutUrl: process.env.FLARE_NEXT_PUBLIC_BLOCKSCOUT_URL!,
  dexTarget: Number(process.env.FLARE_NEXT_PUBLIC_DEX_TARGET),
  contractAddresses: [
    process.env.FLARE_NEXT_PUBLIC_BONDING_CURVE_MANAGER_ADDRESS!
  ].filter(Boolean)
}

// Chain configurations mapped by chainId
export const chainConfigs: ChainConfigs = {
  [shibarium.id]: shibariumConfig,
  [flare.id]: flareConfig,
}

// Supported chains for the application
export const supportedChains: Chain[] = [shibarium, flare]

// Helper function to get chain configuration by chainId
export const getChainConfig = (chainId: number): ChainConfig | undefined => {
  return chainConfigs[chainId]
}

// Helper function to get current active contract address for a chain //wrong ill fix later on
export const getActiveContractAddress = (chainId: number): string | undefined => {
  const config = chainConfigs[chainId]
  return config?.contractAddresses[0] // Returns the most recent contract address
}
