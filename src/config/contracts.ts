import type { Address } from 'viem';

/**
 * All contract addresses — deployed via CREATE2, so the same address
 * on every supported EVM chain (Ethereum, Base, Arbitrum, Polygon).
 */
export const CONTRACT_ADDRESSES: Record<string, Address> = {
  Factory: '0x653c0bd75e353f1FFeeb8AC9A510ea30F9064ceF',
  ERC4337FactoryWrapper: '0xC67c4793bDb979A1a4cd97311c7644b4f7a31ff9',
  Stage1Module: '0xfBC5a55501E747b0c9F82e2866ab2609Fa9b99f4',
  Stage2Module: '0x5C9C4AD7b287D37a37d267089e752236f368f94f',
  Guest: '0x2d21Ce2fBe0BAD8022BaE10B5C22eA69fE930Ee6',
  SessionManager: '0x4AE428352317752a51Ac022C9D2551BcDef785cb',
  EIP7702Module: '0x1f82E64E694894BACfa441709fC7DD8a30FA3E5d',
  BatchMulticall: '0xF93E987DF029e95CdE59c0F5cD447e0a7002054D',
  Permit2Executor: '0x4593D97d6E932648fb4425aC2945adaF66927773',
  ERC2612Executor: '0xb8eF065061bbBF5dCc65083be8CC7B50121AE900',
  Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  EntryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
} as const;

// ─── ABIs ────────────────────────────────────────────────────────────────────

/** Factory ABI — createAccount, getAddress */
export const FACTORY_ABI = [
  {
    name: 'createAccount',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'salt', type: 'bytes32' },
      { name: 'owners', type: 'address[]' },
      { name: 'threshold', type: 'uint256' },
    ],
    outputs: [{ name: 'account', type: 'address' }],
  },
  {
    name: 'getAddress',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'salt', type: 'bytes32' },
      { name: 'owners', type: 'address[]' },
      { name: 'threshold', type: 'uint256' },
    ],
    outputs: [{ name: 'account', type: 'address' }],
  },
] as const;

/** ERC4337FactoryWrapper ABI — createAccount, getAddress */
export const ERC4337_FACTORY_WRAPPER_ABI = [
  {
    name: 'createAccount',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'salt', type: 'bytes32' },
      { name: 'owners', type: 'address[]' },
      { name: 'threshold', type: 'uint256' },
    ],
    outputs: [{ name: 'account', type: 'address' }],
  },
  {
    name: 'getAddress',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'salt', type: 'bytes32' },
      { name: 'owners', type: 'address[]' },
      { name: 'threshold', type: 'uint256' },
    ],
    outputs: [{ name: 'account', type: 'address' }],
  },
] as const;

/** Stage1Module ABI */
export const STAGE1_MODULE_ABI = [
  {
    name: 'imageHash',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'getOwners',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
  },
  {
    name: 'isValidSignature',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'hash', type: 'bytes32' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [{ name: 'magicValue', type: 'bytes4' }],
  },
] as const;

/** Stage2Module ABI */
export const STAGE2_MODULE_ABI = [
  {
    name: 'imageHash',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'upgradeTo',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'implementation', type: 'address' }],
    outputs: [],
  },
  {
    name: 'execute',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'target', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    outputs: [],
  },
] as const;

/** SessionManager ABI */
export const SESSION_MANAGER_ABI = [
  {
    name: 'createSession',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'smartAccount', type: 'address' },
      { name: 'sessionHash', type: 'bytes32' },
      { name: 'expiry', type: 'uint256' },
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
    inputs: [
      { name: 'smartAccount', type: 'address' },
      { name: 'sessionHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'getSession',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'smartAccount', type: 'address' },
      { name: 'sessionHash', type: 'bytes32' },
    ],
    outputs: [
      { name: 'expiry', type: 'uint256' },
      { name: 'active', type: 'bool' },
    ],
  },
] as const;

/** EntryPoint v0.7 ABI */
export const ENTRY_POINT_ABI = [
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
    name: 'depositTo',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [],
  },
  {
    name: 'getNonce',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'key', type: 'uint192' },
    ],
    outputs: [{ name: 'nonce', type: 'uint256' }],
  },
] as const;

/** BatchMulticall ABI */
export const BATCH_MULTICALL_ABI = [
  {
    name: 'execute',
    type: 'function',
    stateMutability: 'nonpayable',
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
    outputs: [],
  },
] as const;

/** Permit2Executor ABI */
export const PERMIT2_EXECUTOR_ABI = [
  {
    name: 'execute',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'permit',
        type: 'tuple',
        components: [
          {
            name: 'permitted',
            type: 'tuple',
            components: [
              { name: 'token', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
          },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      {
        name: 'transferDetails',
        type: 'tuple',
        components: [
          { name: 'to', type: 'address' },
          { name: 'requestedAmount', type: 'uint256' },
        ],
      },
      { name: 'owner', type: 'address' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
] as const;

/** ERC2612Executor ABI */
export const ERC2612_EXECUTOR_ABI = [
  {
    name: 'execute',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
    outputs: [],
  },
] as const;
