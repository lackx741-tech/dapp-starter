import { ConnectButton } from '@/components/ConnectButton';
import { SmartAccountCard } from '@/components/SmartAccountCard';
import { ChainSelector } from '@/components/ChainSelector';

/**
 * Home page — demonstrates the plug-and-play dApp starter components.
 *
 * To use in your own project, copy the three components:
 * 1. `<ConnectButton />` — the wallet connection UI
 * 2. `<SmartAccountCard />` — smart account info panel
 * 3. `<ChainSelector />` — network switcher
 *
 * All you need is `<Web3Provider>` at your app root (already done in layout.tsx).
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Plug &amp; Play Ready
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            dApp Starter
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            WalletConnect + ERC-4337 smart accounts on Ethereum, Base, Arbitrum
            &amp; Polygon. Zero configuration — just set your env vars.
          </p>
        </div>

        {/* Top bar: connect + chain */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <ConnectButton />
          <ChainSelector />
        </div>

        {/* Smart Account Card */}
        <SmartAccountCard />

        {/* Quick-start instructions */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            🔌 Plug &amp; Play — Embed in any website
          </h2>

          <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
            <li>
              <span className="font-medium">Install</span>
              <pre className="mt-1 ml-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-xs overflow-x-auto">
                npm install wagmi viem @wagmi/connectors @tanstack/react-query
              </pre>
            </li>
            <li>
              <span className="font-medium">Add provider to your root layout</span>
              <pre className="mt-1 ml-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-xs overflow-x-auto">
{`import { Web3Provider } from './components/Web3Provider';

export default function Layout({ children }) {
  return <Web3Provider>{children}</Web3Provider>;
}`}
              </pre>
            </li>
            <li>
              <span className="font-medium">Drop the button anywhere</span>
              <pre className="mt-1 ml-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-xs overflow-x-auto">
{`import { ConnectButton } from './components/ConnectButton';

export default function MyPage() {
  return <ConnectButton />;
}`}
              </pre>
            </li>
            <li>
              <span className="font-medium">Set environment variables</span>
              <pre className="mt-1 ml-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-xs overflow-x-auto">
{`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key
NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/...`}
              </pre>
            </li>
          </ol>
        </div>

        {/* Contract addresses table */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              📦 Contract Addresses (all chains — CREATE2)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="text-left px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Contract
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                    Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[
                  ['Factory', '0x653c0bd75e353f1FFeeb8AC9A510ea30F9064ceF'],
                  ['ERC4337FactoryWrapper', '0xC67c4793bDb979A1a4cd97311c7644b4f7a31ff9'],
                  ['Stage1Module', '0xfBC5a55501E747b0c9F82e2866ab2609Fa9b99f4'],
                  ['Stage2Module', '0x5C9C4AD7b287D37a37d267089e752236f368f94f'],
                  ['SessionManager', '0x4AE428352317752a51Ac022C9D2551BcDef785cb'],
                  ['EntryPoint v0.7', '0x0000000071727De22E5E9d8BAf0edAc6f37da032'],
                  ['BatchMulticall', '0xF93E987DF029e95CdE59c0F5cD447e0a7002054D'],
                  ['Permit2', '0x000000000022D473030F116dDEE9F6B43aC78BA3'],
                ].map(([name, address]) => (
                  <tr key={name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {name}
                    </td>
                    <td className="px-6 py-3 font-mono text-gray-600 dark:text-gray-400 text-xs">
                      {address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="text-center text-xs text-gray-400 pb-8">
          dApp Starter — MIT License
        </footer>
      </div>
    </main>
  );
}
