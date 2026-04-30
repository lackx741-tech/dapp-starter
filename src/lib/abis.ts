/** Minimal ABIs for all contracts */

export const FACTORY_ABI = [
  {
    name: 'getAddress',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ],
    outputs: [{ name: 'account', type: 'address' }],
  },
  {
    name: 'createAccount',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ],
    outputs: [{ name: 'account', type: 'address' }],
  },
] as const;

export const SESSION_MANAGER_ABI = [
  {
    name: 'saveSession',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'sessionHash', type: 'bytes32' },
      { name: 'expiry', type: 'uint256' },
      { name: 'imageHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'validateSession',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'smartAccount', type: 'address' },
      { name: 'sessionHash', type: 'bytes32' },
    ],
    outputs: [{ name: 'valid', type: 'bool' }],
  },
  {
    name: 'revokeSession',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'sessionHash', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'SessionCreated',
    type: 'event',
    inputs: [
      { name: 'smartAccount', type: 'address', indexed: true },
      { name: 'sessionHash', type: 'bytes32', indexed: true },
      { name: 'expiry', type: 'uint256', indexed: false },
    ],
  },
] as const;

export const BATCH_MULTICALL_ABI = [
  {
    name: 'executeBatch',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'calls',
        type: 'tuple[]',
        components: [
          { name: 'target', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'data', type: 'bytes' },
        ],
      },
    ],
    outputs: [{ name: 'results', type: 'bytes[]' }],
  },
] as const;

export const ENTRY_POINT_ABI = [
  {
    name: 'getUserOpHash',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        name: 'userOp',
        type: 'tuple',
        components: [
          { name: 'sender', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'initCode', type: 'bytes' },
          { name: 'callData', type: 'bytes' },
          { name: 'accountGasLimits', type: 'bytes32' },
          { name: 'preVerificationGas', type: 'uint256' },
          { name: 'gasFees', type: 'bytes32' },
          { name: 'paymasterAndData', type: 'bytes' },
          { name: 'signature', type: 'bytes' },
        ],
      },
    ],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'handleOps',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'ops',
        type: 'tuple[]',
        components: [
          { name: 'sender', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'initCode', type: 'bytes' },
          { name: 'callData', type: 'bytes' },
          { name: 'accountGasLimits', type: 'bytes32' },
          { name: 'preVerificationGas', type: 'uint256' },
          { name: 'gasFees', type: 'bytes32' },
          { name: 'paymasterAndData', type: 'bytes' },
          { name: 'signature', type: 'bytes' },
        ],
      },
      { name: 'beneficiary', type: 'address' },
    ],
    outputs: [],
  },
] as const;
