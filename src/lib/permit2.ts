import type { Address } from 'viem';

// ─── Permit2 ─────────────────────────────────────────────────────────────────

/**
 * Typed data returned by `buildPermit2Transfer`.
 * Sign this with `signTypedData` and pass the signature to `Permit2Executor.execute`.
 */
export interface Permit2TypedData {
  domain: {
    name: string;
    chainId: number;
    verifyingContract: Address;
  };
  types: {
    PermitTransferFrom: { name: string; type: string }[];
    TokenPermissions: { name: string; type: string }[];
  };
  primaryType: 'PermitTransferFrom';
  message: {
    permitted: { token: Address; amount: bigint };
    spender: Address;
    nonce: bigint;
    deadline: bigint;
  };
}

/**
 * Builds EIP-712 typed data for a Permit2 `PermitTransferFrom` signature.
 * Sign the returned typed data and pass the signature to `Permit2Executor.execute`.
 *
 * @param token    - the ERC-20 token address
 * @param amount   - amount to transfer
 * @param spender  - who is allowed to pull the tokens
 * @param deadline - Unix timestamp (seconds) after which the permit expires
 * @param nonce    - unique nonce (from Permit2 — use `IAllowanceTransfer.nonce`)
 * @param chainId  - the chain ID (required for EIP-712 domain separation)
 * @returns Typed data object ready for `wallet_signTypedData_v4`
 */
export function buildPermit2Transfer(
  token: Address,
  amount: bigint,
  spender: Address,
  deadline: bigint,
  nonce: bigint,
  chainId: number,
): Permit2TypedData {
  return {
    domain: {
      name: 'Permit2',
      chainId,
      verifyingContract: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    },
    types: {
      PermitTransferFrom: [
        { name: 'permitted', type: 'TokenPermissions' },
        { name: 'spender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
      TokenPermissions: [
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
    },
    primaryType: 'PermitTransferFrom',
    message: {
      permitted: { token, amount },
      spender,
      nonce,
      deadline,
    },
  };
}

// ─── ERC-2612 ─────────────────────────────────────────────────────────────────

/**
 * Typed data returned by `buildERC2612Permit`.
 * Sign this and pass v/r/s to `ERC2612Executor.execute`.
 */
export interface ERC2612TypedData {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: Address;
  };
  types: {
    Permit: { name: string; type: string }[];
  };
  primaryType: 'Permit';
  message: {
    owner: Address;
    spender: Address;
    value: bigint;
    nonce: bigint;
    deadline: bigint;
  };
}

/**
 * Builds EIP-712 typed data for an ERC-2612 gasless `permit` signature.
 * Sign the returned typed data and decompose the signature into v/r/s for
 * `ERC2612Executor.execute`.
 *
 * @param token    - the EIP-2612-compatible token address
 * @param owner    - the token holder's address
 * @param spender  - who is being approved
 * @param value    - approval amount
 * @param deadline - Unix timestamp (seconds) after which the permit expires
 * @param chainId  - the chain ID (required for EIP-712 domain)
 * @param tokenName  - token name as returned by `name()` (default: 'Token')
 * @param tokenVersion - EIP-712 version (default: '1')
 * @param nonce    - permit nonce from the token's `nonces(owner)` (default: 0n)
 * @returns Typed data object ready for `wallet_signTypedData_v4`
 */
export function buildERC2612Permit(
  token: Address,
  owner: Address,
  spender: Address,
  value: bigint,
  deadline: bigint,
  chainId: number,
  tokenName: string = 'Token',
  tokenVersion: string = '1',
  nonce: bigint = 0n,
): ERC2612TypedData {
  return {
    domain: {
      name: tokenName,
      version: tokenVersion,
      chainId,
      verifyingContract: token,
    },
    types: {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'Permit',
    message: {
      owner,
      spender,
      value,
      nonce,
      deadline,
    },
  };
}
