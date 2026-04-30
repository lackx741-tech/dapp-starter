import { encodeFunctionData, type Address, type Hex } from 'viem';
import { BATCH_MULTICALL_ABI, CONTRACT_ADDRESSES } from '@/config/contracts';
import { buildUserOp, type UserOperation } from './userOp';

/**
 * A single call to include in a batch transaction.
 */
export interface Call {
  /** Target contract address */
  target: Address;
  /** ETH value to send (use `0n` for non-payable calls) */
  value: bigint;
  /** ABI-encoded calldata */
  data: Hex;
}

/**
 * ABI-encodes an array of calls for the BatchMulticall contract.
 *
 * @param calls - array of `{ target, value, data }` calls
 * @returns ABI-encoded calldata for `BatchMulticall.execute(calls)`
 */
export function encodeBatchCall(calls: Call[]): Hex {
  return encodeFunctionData({
    abi: BATCH_MULTICALL_ABI,
    functionName: 'execute',
    args: [calls],
  });
}

/**
 * Builds a UserOperation that executes a batch of calls via BatchMulticall.
 *
 * @param calls  - the calls to batch
 * @param sender - the smart account address that will execute the batch
 * @param nonce  - the anti-replay nonce from EntryPoint.getNonce
 * @returns A ready-to-sign `UserOperation`
 */
export function buildBatchUserOp(
  calls: Call[],
  sender: Address,
  nonce: bigint,
): UserOperation {
  const callData = encodeBatchCall(calls);

  return buildUserOp({
    sender,
    nonce,
    callData,
    // Route through the BatchMulticall singleton
    // (The smart account's execute method should forward to BatchMulticall)
  });
}

/**
 * Returns the canonical BatchMulticall contract address.
 */
export function getBatchMulticallAddress(): Address {
  return CONTRACT_ADDRESSES.BatchMulticall;
}
