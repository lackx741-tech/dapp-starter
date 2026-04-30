import { createConfig, http } from 'wagmi';
import { mainnet, base, arbitrum, polygon } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

export const wagmiConfig = createConfig({
  chains: [mainnet, base, arbitrum, polygon],
  connectors: [
    walletConnect({ projectId }),
    injected(),
    coinbaseWallet({ appName: 'dApp Starter' }),
  ],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_ETHEREUM),
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_BASE),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_RPC_ARBITRUM),
    [polygon.id]: http(process.env.NEXT_PUBLIC_RPC_POLYGON),
  },
});
