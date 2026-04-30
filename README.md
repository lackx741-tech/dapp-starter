# dApp Starter — Plug & Play ERC-4337

> Production-ready Next.js dApp starter with WalletConnect, ERC-4337 smart accounts (CREATE2 singletons), multi-chain support, and a single `<ConnectButton />` you can drop into any website.

---

## Quick Start (3 steps)

```bash
# 1. Clone
git clone https://github.com/lackx741-tech/dapp-starter.git
cd dapp-starter

# 2. Set env vars
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Run
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔌 Plug & Play — Embed in Any Website

Copy **4 folders** into your existing Next.js/React project:

```
src/components/   (ConnectButton, SmartAccountCard, ChainSelector, Web3Provider)
src/config/       (chains, contracts, wagmi)
src/hooks/        (useSmartAccount, useSession, useBatchCall, useUserOp, usePermit2)
src/lib/          (create2, imageHash, session, userOp, batchCall, permit2)
```

Then:

### Step 1 — Wrap your app root

```tsx
// app/layout.tsx (Next.js App Router)
import { Web3Provider } from './components/Web3Provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
```

### Step 2 — Drop the button anywhere

```tsx
import { ConnectButton } from './components/ConnectButton';

export default function MyPage() {
  return (
    <header>
      <ConnectButton />
    </header>
  );
}
```

That's it. On connect, the button automatically:
1. Computes the CREATE2 smart account address
2. Derives the image hash
3. Creates or restores a session

### Step 3 — Set environment variables

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id   # https://cloud.walletconnect.com
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key           # https://www.alchemy.com
NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v2/base/rpc?apikey=your_key
```

---

## How the On-Connect Flow Works

```
User connects wallet (WalletConnect)
        │
        ▼
1. Get EOA address from wagmi useAccount
        │
        ▼
2. computeSmartAccountAddress(eoa)
   → keccak256(abi.encode(eoa)) as salt
   → CREATE2(Factory, salt, [eoa], threshold=1)
        │
        ▼
3. computeImageHash([eoa], threshold=1)
   → keccak256(abi.encode(owners[], threshold))
        │
        ▼
4. loadSession(eoa) — check localStorage + memory cache
        │
   ┌────┴────┐
valid?       no
   │          │
   ▼          ▼
use cached  SessionManager.createSession(
session       smartAccount, sessionHash, expiry
            )
            → saveSession() to localStorage
```

---

## Contract Addresses (CREATE2 — same on all chains)

| Contract | Address |
|---|---|
| Factory | `0x653c0bd75e353f1FFeeb8AC9A510ea30F9064ceF` |
| ERC4337FactoryWrapper | `0xC67c4793bDb979A1a4cd97311c7644b4f7a31ff9` |
| Stage1Module | `0xfBC5a55501E747b0c9F82e2866ab2609Fa9b99f4` |
| Stage2Module | `0x5C9C4AD7b287D37a37d267089e752236f368f94f` |
| Guest | `0x2d21Ce2fBe0BAD8022BaE10B5C22eA69fE930Ee6` |
| SessionManager | `0x4AE428352317752a51Ac022C9D2551BcDef785cb` |
| EIP7702Module | `0x1f82E64E694894BACfa441709fC7DD8a30FA3E5d` |
| BatchMulticall | `0xF93E987DF029e95CdE59c0F5cD447e0a7002054D` |
| Permit2Executor | `0x4593D97d6E932648fb4425aC2945adaF66927773` |
| ERC2612Executor | `0xb8eF065061bbBF5dCc65083be8CC7B50121AE900` |
| Permit2 | `0x000000000022D473030F116dDEE9F6B43aC78BA3` |
| EntryPoint v0.7 | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` |

---

## Supported Chains

| Chain | ID | Explorer |
|---|---|---|
| Ethereum | 1 | https://etherscan.io |
| Base | 8453 | https://basescan.org |
| Arbitrum | 42161 | https://arbiscan.io |
| Polygon | 137 | https://polygonscan.com |

---

## Hook API Reference

### `useSmartAccount()`

Core hook — runs the full on-connect flow automatically.

```ts
const {
  smartAccountAddress, // Address | null — the CREATE2 smart account
  imageHash,           // Hex | null — keccak256(abi.encode(owners, threshold))
  session,             // SessionData | null
  isLoading,           // boolean
  isConnected,         // boolean
  chainId,             // number | undefined
  error,               // Error | null
} = useSmartAccount();
```

### `useSession()`

Manages session persistence.

```ts
const {
  session,      // SessionData | null
  isValid,      // boolean — true if session is not expired
  saveSession,  // (data: SessionData) => void
  clearSession, // () => void
} = useSession();
```

### `useBatchCall()`

Batch multiple contract calls into a single UserOperation.

```ts
const { executeBatch, isLoading, userOpHash, error } = useBatchCall();

await executeBatch([
  { target: tokenAddress, value: 0n, data: transferCalldata },
  { target: nftAddress, value: 0n, data: mintCalldata },
], nonce);
```

### `useUserOp()`

Build, sign, and send any UserOperation.

```ts
const { sendUserOp, isLoading, userOpHash, error } = useUserOp();

await sendUserOp({
  sender: smartAccountAddress,
  nonce: 0n,
  callData: '0x...',
});
```

### `usePermit2()`

Gasless token approvals via Permit2 and ERC-2612.

```ts
const { signPermit2, signERC2612, isLoading, error } = usePermit2();

// Permit2
const sig = await signPermit2(tokenAddress, amount, spender, deadline, nonce);

// ERC-2612
const sig = await signERC2612(tokenAddress, spender, value, deadline);
```

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Web3:** wagmi v2 + viem v2
- **Wallet:** WalletConnect (via `@wagmi/connectors`)
- **Account Abstraction:** ERC-4337 (EntryPoint v0.7)
- **Chains:** Ethereum, Base, Arbitrum, Polygon
- **Styling:** Tailwind CSS

---

## License

MIT