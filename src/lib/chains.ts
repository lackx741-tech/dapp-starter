import { mainnet, base, arbitrum, polygon } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';

/** Supported chains */
export const SUPPORTED_CHAINS = [mainnet, base, arbitrum, polygon] as const;
export type SupportedChain = (typeof SUPPORTED_CHAINS)[number];

/** Chain ID to chain name map */
export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  8453: 'Base',
  42161: 'Arbitrum',
  137: 'Polygon',
};

/** Chain ID to Tailwind badge color */
export const CHAIN_COLORS: Record<number, string> = {
  1: 'bg-blue-100 text-blue-800',
  8453: 'bg-indigo-100 text-indigo-800',
  42161: 'bg-cyan-100 text-cyan-800',
  137: 'bg-purple-100 text-purple-800',
};

/** Get chain by id */
export function getChain(chainId: number): Chain | undefined {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId);
}
