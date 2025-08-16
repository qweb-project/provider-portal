import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi'
import { CDP_CONFIG as cdpConfig } from './coinbase';


const connector = createCDPEmbeddedWalletConnector({
  cdpConfig: cdpConfig,
  providerConfig: {
    chains: [base, baseSepolia],
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http()
    }
  }
});

export const wagmiConfig = createConfig({
  connectors: [connector],
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});