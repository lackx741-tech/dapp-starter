import { mainnet, base, arbitrum, polygon } from 'viem/chains';

/**
 * All supported chains for the dApp starter.
 * These are the chains that WalletConnect and wagmi will support.
 */
export const supportedChains = [mainnet, base, arbitrum, polygon] as const;

/**
 * The default chain for the dApp. Base is a great default for low-fee UX.
 */
export const defaultChain = base;

/**
 * Chain metadata for UI display (name, color indicator, block explorer).
 */
export const chainMeta: Record<
  number,
  { name: string; color: string; explorerUrl: string; shortName: string }
> = {
  [mainnet.id]: {
    name: 'Ethereum',
    shortName: 'ETH',
    color: '#627EEA',
    explorerUrl: 'https://etherscan.io',
  },
  [base.id]: {
    name: 'Base',
    shortName: 'BASE',
    color: '#0052FF',
    explorerUrl: 'https://basescan.org',
  },
  [arbitrum.id]: {
    name: 'Arbitrum',
    shortName: 'ARB',
    color: '#12AAFF',
    explorerUrl: 'https://arbiscan.io',
  },
  [polygon.id]: {
    name: 'Polygon',
    shortName: 'MATIC',
    color: '#8247E5',
    explorerUrl: 'https://polygonscan.com',
  },
};
