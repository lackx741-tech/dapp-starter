/** Contract addresses — CREATE2 singletons, same on every chain */
export const CONTRACTS = {
  Factory:               '0x653c0bd75e353f1FFeeb8AC9A510ea30F9064ceF',
  ERC4337FactoryWrapper: '0xC67c4793bDb979A1a4cd97311c7644b4f7a31ff9',
  Stage1Module:          '0xfBC5a55501E747b0c9F82e2866ab2609Fa9b99f4',
  Stage2Module:          '0x5C9C4AD7b287D37a37d267089e752236f368f94f',
  Guest:                 '0x2d21Ce2fBe0BAD8022BaE10B5C22eA69fE930Ee6',
  SessionManager:        '0x4AE428352317752a51Ac022C9D2551BcDef785cb',
  EIP7702Module:         '0x1f82E64E694894BACfa441709fC7DD8a30FA3E5d',
  BatchMulticall:        '0xF93E987DF029e95CdE59c0F5cD447e0a7002054D',
  Permit2Executor:       '0x4593D97d6E932648fb4425aC2945adaF66927773',
  ERC2612Executor:       '0xb8eF065061bbBF5dCc65083be8CC7B50121AE900',
  Permit2:               '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  EntryPoint:            '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
} as const;

export type ContractName = keyof typeof CONTRACTS;
