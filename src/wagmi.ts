import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi'
import { CDP_CONFIG as cdpConfig } from './coinbase';


const connector = createCDPEmbeddedWalletConnector({
  cdpConfig: cdpConfig,
  providerConfig: {
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http()
    }
  }
});

export const wagmiConfig = createConfig({
  connectors: [connector],
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});