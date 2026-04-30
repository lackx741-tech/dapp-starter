import {
  encodeAbiParameters,
  keccak256,
  type Address,
  type Hex,
  type PublicClient,
} from 'viem';
import { STAGE1_MODULE_ABI } from '@/config/contracts';

/**
 * Computes the image hash for a given set of owners and threshold.
 * Image hash = keccak256(abi.encode(owners, threshold)).
 * This is the canonical format used by Stage1 and Stage2 modules.
 *
 * @param owners    - ordered list of owner EOA addresses
 * @param threshold - multisig threshold
 * @returns 32-byte image hash as a `0x`-prefixed hex string
 */
export function computeImageHash(owners: Address[], threshold: number): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { name: 'owners', type: 'address[]' },
        { name: 'threshold', type: 'uint256' },
      ],
      [owners, BigInt(threshold)],
    ),
  );
}

/**
 * Reads the image hash stored on-chain by calling `imageHash()` on a deployed
 * smart account (Stage1Module or Stage2Module).
 *
 * @param smartAccountAddress - the deployed smart account address
 * @param client              - a viem `PublicClient` connected to the correct chain
 * @returns The on-chain image hash
 */
export async function getOnChainImageHash(
  smartAccountAddress: Address,
  client: PublicClient,
): Promise<Hex> {
  const result = await client.readContract({
    address: smartAccountAddress,
    abi: STAGE1_MODULE_ABI,
    functionName: 'imageHash',
  });

  return result as Hex;
}
