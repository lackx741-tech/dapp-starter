# dapp-starter

## dApp Starter — Next.js 14 + WalletConnect + ERC-4337 + Session Keys

A production-ready dApp starter kit built with:
- **Next.js 14** (App Router)
- **wagmi v2 + viem** — type-safe Ethereum interactions
- **WalletConnect** — multi-wallet support
- **ERC-4337 Smart Accounts** — CREATE2 factory, session management
- **Supabase** — real-time session dashboard
- **Session Wallet** — EIP-1193 provider injection for seamless dApp interactions

## Quick Start

```bash
cp .env.example .env.local
# Fill in your environment variables
npm install
npm run dev
```

## Environment Variables

See `.env.example` for all required variables:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — Get from [cloud.walletconnect.com](https://cloud.walletconnect.com)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Get from [supabase.com](https://supabase.com)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `NEXT_PUBLIC_RPC_*` — Optional custom RPC URLs (falls back to public RPCs)

## Contract Addresses (CREATE2 singletons — all chains)

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

## Supabase Setup

Run this SQL in your Supabase SQL editor to create the `sessions` table:

```sql
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  session_hash text not null unique,
  smart_account_address text not null,
  owner_address text not null,
  image_hash text not null,
  chain_id integer not null,
  expiry bigint not null,
  created_at timestamptz not null default now(),
  last_active timestamptz not null default now(),
  is_revoked boolean not null default false,
  tx_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

-- Enable Row Level Security
alter table public.sessions enable row level security;

-- Allow read/insert for anon (adjust per your auth requirements)
create policy "Allow all for anon" on public.sessions
  for all using (true) with check (true);

-- Enable realtime
alter publication supabase_realtime add table public.sessions;
```

## Project Structure

```
src/
├── app/
│   ├── api/sessions/          # REST API for session CRUD
│   ├── admin/page.tsx         # Real-time admin dashboard
│   ├── layout.tsx             # Root layout with Web3Provider
│   └── page.tsx               # Home page
├── components/
│   ├── ConnectButton.tsx      # WalletConnect + smart account init
│   ├── SmartAccountCard.tsx   # Display smart account info
│   ├── SessionInteractionPanel.tsx  # Send txs, sign messages, batch calls
│   ├── SessionStats.tsx       # Dashboard stats bar
│   ├── SessionTable.tsx       # Sortable/paginated session table
│   ├── ProviderInjector.tsx   # Inject session as window.ethereum
│   └── Web3Provider.tsx       # Root wagmi/tanstack/session providers
├── context/
│   └── SessionContext.tsx     # React context for session state
├── hooks/
│   ├── useSmartAccount.ts     # Smart account init + session creation
│   ├── useSessionWallet.ts    # SessionWallet hook
│   ├── useSessionTransaction.ts  # Send txs via session
│   └── useAdminSessions.ts   # Admin dashboard data + realtime
└── lib/
    ├── abis.ts                # Contract ABIs
    ├── chains.ts              # Supported chains config
    ├── constants.ts           # Contract addresses
    ├── db.ts                  # Supabase client + CRUD helpers
    ├── sessionExecutor.ts     # Batch execution via session
    ├── sessionSync.ts         # Sync sessions to backend
    ├── sessionWallet.ts       # EIP-1193 session provider
    └── wagmiConfig.ts         # wagmi configuration
```
