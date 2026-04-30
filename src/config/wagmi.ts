import { createConfig, http } from 'wagmi';
import { mainnet, base, arbitrum, polygon } from 'viem/chains';
import { walletConnect } from '@wagmi/connectors';

/**
 * WalletConnect project ID — obtain a free one at https://cloud.walletconnect.com
 */
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

/**
 * Alchemy API key for RPC transport — obtain at https://www.alchemy.com
 */
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? '';

/**
 * Build an Alchemy RPC URL for a given network slug.
 */
function alchemyUrl(network: string): string {
  if (alchemyKey) return `https://${network}.g.alchemy.com/v2/${alchemyKey}`;
  return ''; // falls back to the chain's default public RPC
}

/**
 * wagmi configuration — supports Ethereum, Base, Arbitrum, Polygon.
 * WalletConnect is the primary connector (embedded, no extra provider needed).
 */
const config = createConfig({
  chains: [mainnet, base, arbitrum, polygon],
  connectors: [
    walletConnect({
      projectId,
      metadata: {
        name: 'dApp Starter',
        description: 'Plug-and-play Next.js dApp with ERC-4337 smart accounts',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://dapp-starter.vercel.app',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [mainnet.id]: alchemyUrl('eth-mainnet')
      ? http(alchemyUrl('eth-mainnet'))
      : http(),
    [base.id]: alchemyUrl('base-mainnet')
      ? http(alchemyUrl('base-mainnet'))
      : http(),
    [arbitrum.id]: alchemyUrl('arb-mainnet')
      ? http(alchemyUrl('arb-mainnet'))
      : http(),
    [polygon.id]: alchemyUrl('polygon-mainnet')
      ? http(alchemyUrl('polygon-mainnet'))
      : http(),
  },
});

export default config;
