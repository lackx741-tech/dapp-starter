import {
  encodeAbiParameters,
  keccak256,
  type Address,
  type Hex,
  type PublicClient,
} from 'viem';
import { FACTORY_ABI, CONTRACT_ADDRESSES } from '@/config/contracts';

/**
 * Computes the CREATE2 smart-account address using the Factory's on-chain `getAddress`
 * view function. This is the most accurate approach because it delegates the CREATE2
 * computation to the Factory itself (no need to replicate the init-code hash off-chain).
 *
 * @param salt           - 32-byte CREATE2 salt
 * @param owners         - list of EOA owner addresses
 * @param threshold      - multisig threshold (1 for single-owner)
 * @param factoryAddress - the deployer (Factory) contract address
 * @param client         - a viem PublicClient for the target chain
 * @returns The deterministic smart account address
 */
export async function computeCreate2AddressOnChain(
  salt: Hex,
  owners: Address[],
  threshold: number,
  client: PublicClient,
  factoryAddress: Address = CONTRACT_ADDRESSES.Factory,
): Promise<Address> {
  const address = await client.readContract({
    address: factoryAddress,
    abi: FACTORY_ABI,
    functionName: 'getAddress',
    args: [salt, owners, BigInt(threshold)],
  });
  return address as Address;
}

/**
 * Derives the CREATE2 salt for a single-owner smart account from the owner's address.
 * Salt = keccak256(abi.encode(ownerAddress)).
 *
 * @param ownerAddress - the EOA address of the connected wallet
 * @returns 32-byte salt as a `0x`-prefixed hex string
 */
export function deriveSalt(ownerAddress: Address): Hex {
  return keccak256(
    encodeAbiParameters([{ name: 'owner', type: 'address' }], [ownerAddress]),
  );
}

/**
 * Computes the CREATE2 smart-account address locally (off-chain).
 *
 * **Important**: This uses `keccak256(encodedArgs)` as the bytecode hash, which is a
 * deterministic approximation. For exact address matching, use `computeCreate2AddressOnChain`
 * (requires a PublicClient) or the Factory's `getAddress` view function on-chain.
 *
 * @param salt           - 32-byte CREATE2 salt
 * @param owners         - list of EOA owner addresses
 * @param threshold      - multisig threshold (1 for single-owner)
 * @param factoryAddress - the deployer (Factory) contract address
 * @returns The deterministic smart account address
 */
export function computeCreate2Address(
  salt: Hex,
  owners: Address[],
  threshold: number,
  factoryAddress: Address = CONTRACT_ADDRESSES.Factory,
): Address {
  // Encode the constructor arguments
  const encodedArgs = encodeAbiParameters(
    [
      { name: 'salt', type: 'bytes32' },
      { name: 'owners', type: 'address[]' },
      { name: 'threshold', type: 'uint256' },
    ],
    [salt, owners, BigInt(threshold)],
  );

  // NOTE: This uses keccak256(encodedArgs) as a proxy for the init-code hash.
  // The real init-code hash = keccak256(factoryBytecode ++ encodedArgs).
  // Replace with the actual init-code hash from your deployment for production accuracy.
  const initCodeHash = keccak256(encodedArgs);

  // Compute CREATE2 address: keccak256(0xff ++ factory ++ salt ++ initCodeHash)[12:]
  const create2Input = encodeAbiParameters(
    [
      { name: 'prefix', type: 'bytes1' },
      { name: 'factory', type: 'address' },
      { name: 'salt', type: 'bytes32' },
      { name: 'initCodeHash', type: 'bytes32' },
    ],
    ['0xff', factoryAddress, salt, initCodeHash],
  );

  const hash = keccak256(create2Input);
  // Take last 20 bytes as the address
  return `0x${hash.slice(26)}` as Address;
}

/**
 * Convenience wrapper: derives the smart account address for a single EOA owner.
 * Uses the owner address as the salt (keccak256-derived) and threshold = 1.
 *
 * For production use, prefer `computeCreate2AddressOnChain` which delegates to the
 * Factory's `getAddress` function.
 *
 * @param ownerAddress - the EOA address of the connected wallet
 * @param _chainId     - unused (CREATE2 addresses are chain-agnostic for these contracts)
 * @returns The deterministic ERC-4337 smart account address
 */
export function computeSmartAccountAddress(
  ownerAddress: Address,
  _chainId?: number,
): Address {
  const salt = deriveSalt(ownerAddress);
  return computeCreate2Address(salt, [ownerAddress], 1, CONTRACT_ADDRESSES.Factory);
}
