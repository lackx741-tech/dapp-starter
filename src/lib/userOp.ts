import {
  encodeAbiParameters,
  keccak256,
  encodePacked,
  type Address,
  type Hex,
} from 'viem';

/**
 * EntryPoint v0.7 UserOperation type.
 * Follows the ERC-4337 spec for EntryPoint 0.7.0.
 */
export interface UserOperation {
  /** Smart account that initiates the operation */
  sender: Address;
  /** Anti-replay nonce from EntryPoint.getNonce */
  nonce: bigint;
  /** Factory address for account deployment (optional, only for first-time deployments) */
  factory?: Address;
  /** Init calldata for account deployment (optional) */
  factoryData?: Hex;
  /** Calldata to execute on the smart account */
  callData: Hex;
  /** Gas limit for the main execution call */
  callGasLimit: bigint;
  /** Gas limit for signature verification */
  verificationGasLimit: bigint;
  /** Gas overhead not captured by other limits */
  preVerificationGas: bigint;
  /** Maximum total fee per gas unit (EIP-1559) */
  maxFeePerGas: bigint;
  /** Maximum priority fee per gas unit (EIP-1559) */
  maxPriorityFeePerGas: bigint;
  /** Paymaster contract address (optional) */
  paymaster?: Address;
  /** Gas limit for paymaster validation (optional) */
  paymasterVerificationGasLimit?: bigint;
  /** Gas limit for paymaster post-op (optional) */
  paymasterPostOpGasLimit?: bigint;
  /** Paymaster extra data (optional) */
  paymasterData?: Hex;
  /** Signature over the UserOp hash */
  signature: Hex;
}

/**
 * Parameters for building a UserOperation.
 */
export interface BuildUserOpParams {
  sender: Address;
  nonce: bigint;
  callData: Hex;
  factory?: Address;
  factoryData?: Hex;
  callGasLimit?: bigint;
  verificationGasLimit?: bigint;
  preVerificationGas?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  paymaster?: Address;
  paymasterVerificationGasLimit?: bigint;
  paymasterPostOpGasLimit?: bigint;
  paymasterData?: Hex;
  signature?: Hex;
}

/**
 * Builds a UserOperation with sensible defaults for missing gas fields.
 *
 * **Important**: The `maxFeePerGas` and `maxPriorityFeePerGas` fields default to `0n`.
 * For production use, always fetch live gas prices from the network using
 * `client.estimateFeesPerGas()` and pass them explicitly. Bundlers will reject
 * UserOperations with zero gas prices.
 *
 * @param params - Required + optional UserOp fields
 * @returns A complete `UserOperation` object
 */
export function buildUserOp(params: BuildUserOpParams): UserOperation {
  return {
    sender: params.sender,
    nonce: params.nonce,
    factory: params.factory,
    factoryData: params.factoryData,
    callData: params.callData,
    callGasLimit: params.callGasLimit ?? 200_000n,
    verificationGasLimit: params.verificationGasLimit ?? 150_000n,
    preVerificationGas: params.preVerificationGas ?? 50_000n,
    maxFeePerGas: params.maxFeePerGas ?? 0n,
    maxPriorityFeePerGas: params.maxPriorityFeePerGas ?? 0n,
    paymaster: params.paymaster,
    paymasterVerificationGasLimit: params.paymasterVerificationGasLimit,
    paymasterPostOpGasLimit: params.paymasterPostOpGasLimit,
    paymasterData: params.paymasterData,
    signature: params.signature ?? '0x',
  };
}

/**
 * Computes the EIP-712 UserOperation hash for EntryPoint v0.7.
 * This hash is what the smart account signs.
 *
 * @param userOp  - the UserOperation to hash
 * @param chainId - the target chain ID
 * @param entryPointAddress - defaults to the canonical EntryPoint v0.7 address
 * @returns The hash that should be signed
 */
export function getUserOpHash(
  userOp: UserOperation,
  chainId: number,
  entryPointAddress: Address = '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
): Hex {
  // Pack factory + factoryData
  const initCode: Hex =
    userOp.factory && userOp.factoryData
      ? encodePacked(
          ['address', 'bytes'],
          [userOp.factory, userOp.factoryData],
        )
      : '0x';

  // Pack paymaster fields
  const paymasterAndData: Hex =
    userOp.paymaster
      ? encodePacked(
          ['address', 'uint128', 'uint128', 'bytes'],
          [
            userOp.paymaster,
            userOp.paymasterVerificationGasLimit ?? 0n,
            userOp.paymasterPostOpGasLimit ?? 0n,
            userOp.paymasterData ?? '0x',
          ],
        )
      : '0x';

  // Pack gas limits into accountGasLimits (bytes32)
  const accountGasLimits = encodePacked(
    ['uint128', 'uint128'],
    [userOp.verificationGasLimit, userOp.callGasLimit],
  );

  // Pack fee fields into gasFees (bytes32)
  const gasFees = encodePacked(
    ['uint128', 'uint128'],
    [userOp.maxPriorityFeePerGas, userOp.maxFeePerGas],
  );

  // Inner hash of the packed UserOp
  const packedUserOpHash = keccak256(
    encodeAbiParameters(
      [
        { name: 'sender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'initCodeHash', type: 'bytes32' },
        { name: 'callDataHash', type: 'bytes32' },
        { name: 'accountGasLimits', type: 'bytes32' },
        { name: 'preVerificationGas', type: 'uint256' },
        { name: 'gasFees', type: 'bytes32' },
        { name: 'paymasterAndDataHash', type: 'bytes32' },
      ],
      [
        userOp.sender,
        userOp.nonce,
        keccak256(initCode),
        keccak256(userOp.callData),
        accountGasLimits as Hex,
        userOp.preVerificationGas,
        gasFees as Hex,
        keccak256(paymasterAndData),
      ],
    ),
  );

  // Final hash includes the EntryPoint address and chain ID (EIP-712-style domain)
  return keccak256(
    encodeAbiParameters(
      [
        { name: 'userOpHash', type: 'bytes32' },
        { name: 'entryPoint', type: 'address' },
        { name: 'chainId', type: 'uint256' },
      ],
      [packedUserOpHash, entryPointAddress, BigInt(chainId)],
    ),
  );
}

/**
 * Sends a UserOperation to a bundler via `eth_sendUserOperation` JSON-RPC.
 *
 * @param userOp      - the signed UserOperation
 * @param bundlerUrl  - the bundler's RPC endpoint URL
 * @param entryPointAddress - defaults to EntryPoint v0.7
 * @returns The UserOperation hash returned by the bundler
 */
export async function sendUserOp(
  userOp: UserOperation,
  bundlerUrl: string,
  entryPointAddress: Address = '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
): Promise<Hex> {
  const response = await fetch(bundlerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_sendUserOperation',
      params: [serializeUserOp(userOp), entryPointAddress],
    }),
  });

  if (!response.ok) {
    throw new Error(`Bundler request failed: ${response.statusText}`);
  }

  const json = (await response.json()) as { result?: Hex; error?: { message: string } };

  if (json.error) {
    throw new Error(`Bundler error: ${json.error.message}`);
  }

  return json.result!;
}

/**
 * Serializes a UserOperation for JSON-RPC transmission.
 * Converts bigint values to hex strings as required by the ERC-4337 spec.
 */
function serializeUserOp(
  userOp: UserOperation,
): Record<string, string | undefined> {
  return {
    sender: userOp.sender,
    nonce: `0x${userOp.nonce.toString(16)}`,
    factory: userOp.factory,
    factoryData: userOp.factoryData,
    callData: userOp.callData,
    callGasLimit: `0x${userOp.callGasLimit.toString(16)}`,
    verificationGasLimit: `0x${userOp.verificationGasLimit.toString(16)}`,
    preVerificationGas: `0x${userOp.preVerificationGas.toString(16)}`,
    maxFeePerGas: `0x${userOp.maxFeePerGas.toString(16)}`,
    maxPriorityFeePerGas: `0x${userOp.maxPriorityFeePerGas.toString(16)}`,
    paymaster: userOp.paymaster,
    paymasterVerificationGasLimit: userOp.paymasterVerificationGasLimit
      ? `0x${userOp.paymasterVerificationGasLimit.toString(16)}`
      : undefined,
    paymasterPostOpGasLimit: userOp.paymasterPostOpGasLimit
      ? `0x${userOp.paymasterPostOpGasLimit.toString(16)}`
      : undefined,
    paymasterData: userOp.paymasterData,
    signature: userOp.signature,
  };
}
