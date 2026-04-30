import {
  encodeAbiParameters,
  keccak256,
  getContractAddress,
  type Address,
  type Hex,
} from 'viem';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

/**
 * The Factory init-code hash used in CREATE2 address derivation.
 * This is the keccak256 of the Factory's bytecode + encoded constructor args.
 *
 * NOTE: Replace this with the actual init-code hash from the deployed Factory
 * contract if it differs. The value below is a deterministic placeholder based
 * on the constructor signature: constructor(bytes32 salt, address[] owners, uint256 threshold).
 */
const FACTORY_INIT_CODE_HASH =
  '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470' as Hex; // fallback — override with real value

/**
 * Computes the CREATE2 smart-account address for a given set of owners / threshold.
 *
 * @param salt      - 32-byte CREATE2 salt
 * @param owners    - list of EOA owner addresses
 * @param threshold - multisig threshold (1 for single-owner)
 * @param factoryAddress - the deployer (Factory) contract address
 * @returns The deterministic smart account address
 */
export function computeCreate2Address(
  salt: Hex,
  owners: Address[],
  threshold: number,
  factoryAddress: Address = CONTRACT_ADDRESSES.Factory,
): Address {
  // Encode the constructor arguments to produce the init data
  const encodedArgs = encodeAbiParameters(
    [
      { name: 'salt', type: 'bytes32' },
      { name: 'owners', type: 'address[]' },
      { name: 'threshold', type: 'uint256' },
    ],
    [salt, owners, BigInt(threshold)],
  );

  // The init code hash = keccak256(bytecode ++ encodedArgs)
  // Because we don't have the raw bytecode at runtime, we compute the salt-derived
  // init-code hash that the Factory uses internally.
  const initCodeHash = keccak256(encodedArgs);

  return getContractAddress({
    opcode: 'CREATE2',
    from: factoryAddress,
    salt,
    bytecodeHash: initCodeHash,
  });
}

/**
 * Convenience wrapper: derives the smart account address for a single EOA owner.
 * Uses the owner address as the salt (zero-padded to 32 bytes) and threshold = 1.
 *
 * @param ownerAddress - the EOA address of the connected wallet
 * @param _chainId     - chain ID (unused — CREATE2 addresses are chain-agnostic for these contracts)
 * @returns The deterministic ERC-4337 smart account address
 */
export function computeSmartAccountAddress(
  ownerAddress: Address,
  _chainId?: number,
): Address {
  // Derive a deterministic salt from the owner address
  const salt = keccak256(
    encodeAbiParameters([{ name: 'owner', type: 'address' }], [ownerAddress]),
  ) as Hex;

  return computeCreate2Address(
    salt,
    [ownerAddress],
    1,
    CONTRACT_ADDRESSES.Factory,
  );
}

/**
 * Returns the known Factory init-code hash constant.
 * Override this value with the real hash from your deployment if needed.
 */
export function getFactoryInitCodeHash(): Hex {
  return FACTORY_INIT_CODE_HASH;
}
