import {
  type PublicClient,
  type WalletClient,
  type Hex,
  type Address,
  encodeFunctionData,
} from 'viem';
import { CONTRACTS } from './constants';
import { BATCH_MULTICALL_ABI, SESSION_MANAGER_ABI } from './abis';
import type { SessionData } from './sessionSync';

/** A single call in a batch */
export interface Call {
  target: Address;
  value: bigint;
  data: Hex;
}

/**
 * Validates a session on-chain via SessionManager.validateSession.
 */
export async function validateSessionOnChain(
  session: SessionData,
  publicClient: PublicClient
): Promise<boolean> {
  try {
    const valid = await publicClient.readContract({
      address: CONTRACTS.SessionManager as Address,
      abi: SESSION_MANAGER_ABI,
      functionName: 'validateSession',
      args: [
        session.smartAccountAddress as Address,
        session.sessionHash as Hex,
      ],
    });
    return valid as boolean;
  } catch {
    return false;
  }
}

/**
 * Executes a batch of calls via the SessionManager + BatchMulticall.
 *
 * Flow:
 * 1. Validate session (local expiry check + on-chain)
 * 2. Build BatchMulticall calldata
 * 3. Sign with walletClient
 * 4. Send as a regular transaction (simplified — full ERC-4337 UserOp flow
 *    requires a bundler endpoint which is environment-specific)
 */
export async function executeWithSession(params: {
  session: SessionData;
  calls: Call[];
  walletClient: WalletClient;
  publicClient: PublicClient;
}): Promise<Hex> {
  const { session, calls, walletClient, publicClient } = params;

  // 1. Local expiry check
  const nowSecs = Math.floor(Date.now() / 1000);
  if (session.expiry < nowSecs) {
    throw new Error('Session has expired');
  }

  // 2. On-chain validation
  const valid = await validateSessionOnChain(session, publicClient);
  if (!valid) {
    throw new Error('Session is not valid on-chain');
  }

  // 3. Build BatchMulticall calldata
  const callData = encodeFunctionData({
    abi: BATCH_MULTICALL_ABI,
    functionName: 'executeBatch',
    args: [calls.map((c) => ({ target: c.target, value: c.value, data: c.data }))],
  });

  // 4. Send via walletClient (the session key signer)
  const [account] = await walletClient.getAddresses();
  const hash = await walletClient.sendTransaction({
    account,
    to: CONTRACTS.BatchMulticall as Address,
    data: callData,
    value: calls.reduce((acc, c) => acc + c.value, 0n),
    chain: publicClient.chain ?? null,
  });

  return hash;
}
