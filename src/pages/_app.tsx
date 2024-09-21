import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { WagmiConfig, createConfig, WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';


const customMainnet = {
  ...mainnet,
  rpcUrls: {
    default: {
      http: ['https://eth-mainnet.public.blastapi.io'],
    },
    public: {
      http: ['https://eth-mainnet.public.blastapi.io'],
    },
  },
};


const config = getDefaultConfig({
  appName: "DEGFun",
  projectId: "YOUR_PROJECT_ID", // TODO: add project id - optional
  chains: [customMainnet],
  ssr: true,
});

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <WebSocketProvider>
            <Component {...pageProps} />
          </WebSocketProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
      <ToastContainer />
    </WagmiConfig>
  )
}