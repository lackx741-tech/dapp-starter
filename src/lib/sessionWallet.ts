import {
  type WalletClient,
  type Address,
  type Hex,
  type TypedData,
  type Abi,
  encodeFunctionData,
  hexToString,
  isHex,
} from 'viem';
import type { SessionData } from './sessionSync';

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
    __sessionWalletOriginal?: EIP1193Provider;
  }
}

/** Minimal EIP-1193 provider interface */
export interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}

/**
 * SessionWallet — an EIP-1193 provider that intercepts transactions and
 * signs them using the saved session instead of prompting the user.
 *
 * Use `.injectAsProvider()` to replace `window.ethereum` so any dApp
 * that reads window.ethereum automatically uses this session.
 */
export class SessionWallet implements EIP1193Provider {
  private readonly session: SessionData;
  private readonly walletClient: WalletClient;

  constructor(session: SessionData, walletClient: WalletClient) {
    this.session = session;
    this.walletClient = walletClient;
  }

  /** EIP-1193 request handler */
  async request(args: { method: string; params?: unknown[] }): Promise<unknown> {
    const { method, params = [] } = args;

    switch (method) {
      case 'eth_accounts':
      case 'eth_requestAccounts': {
        const addresses = await this.walletClient.getAddresses();
        return addresses;
      }

      case 'eth_chainId': {
        return `0x${this.session.chainId.toString(16)}`;
      }

      case 'personal_sign': {
        const [message, _address] = params as [string, string];
        return this.signMessage(isHex(message) ? hexToString(message) : message);
      }

      case 'eth_sign': {
        const [_address, message] = params as [string, string];
        return this.signMessage(isHex(message) ? hexToString(message) : message);
      }

      case 'eth_signTypedData_v4': {
        const [_address, typedDataJson] = params as [string, string];
        const typedData = JSON.parse(typedDataJson) as TypedData;
        return this.signTypedData(typedData);
      }

      case 'eth_sendTransaction': {
        const [tx] = params as [{ to: string; value?: string; data?: string }];
        return this.sendTransaction({
          to: tx.to as Address,
          value: tx.value ? BigInt(tx.value) : 0n,
          data: (tx.data ?? '0x') as Hex,
        });
      }

      default: {
        // Fall through to the original provider if available
        if (typeof window !== 'undefined' && window.__sessionWalletOriginal) {
          return window.__sessionWalletOriginal.request(args);
        }
        throw new Error(`Method not supported by SessionWallet: ${method}`);
      }
    }
  }

  /**
   * Send a transaction using the session (signs via walletClient).
   */
  async sendTransaction(tx: { to: Address; value?: bigint; data?: Hex }): Promise<Hex> {
    const [account] = await this.walletClient.getAddresses();
    return this.walletClient.sendTransaction({
      account,
      to: tx.to,
      value: tx.value ?? 0n,
      data: tx.data ?? '0x',
      chain: undefined,
    });
  }

  /**
   * Sign a message using the session key.
   */
  async signMessage(message: string): Promise<Hex> {
    const [account] = await this.walletClient.getAddresses();
    return this.walletClient.signMessage({ account, message });
  }

  /**
   * Sign typed data (EIP-712) using the session.
   */
  async signTypedData(typedData: TypedData): Promise<Hex> {
    const [account] = await this.walletClient.getAddresses();
    const td = typedData as unknown as {
      domain: Parameters<WalletClient['signTypedData']>[0]['domain'];
      types: Parameters<WalletClient['signTypedData']>[0]['types'];
      primaryType: string;
      message: Record<string, unknown>;
    };
    const { domain, types, primaryType, message } = td;
    return this.walletClient.signTypedData({
      account,
      domain,
      types,
      primaryType,
      message,
    });
  }

  /**
   * Call a contract function via the session.
   */
  async callContract(params: {
    address: Address;
    abi: Abi;
    functionName: string;
    args: unknown[];
    value?: bigint;
  }): Promise<Hex> {
    const callData = encodeFunctionData({
      abi: params.abi,
      functionName: params.functionName,
      args: params.args,
    });
    return this.sendTransaction({
      to: params.address,
      value: params.value ?? 0n,
      data: callData,
    });
  }

  /**
   * Inject this SessionWallet as `window.ethereum`.
   * Saves the original provider so it can be restored.
   */
  injectAsProvider(): void {
    if (typeof window === 'undefined') return;
    if (!window.__sessionWalletOriginal && window.ethereum) {
      window.__sessionWalletOriginal = window.ethereum;
    }
    window.ethereum = this;
  }

  /**
   * Remove this SessionWallet from `window.ethereum` and restore the original.
   */
  removeProvider(): void {
    if (typeof window === 'undefined') return;
    if (window.__sessionWalletOriginal) {
      window.ethereum = window.__sessionWalletOriginal;
      window.__sessionWalletOriginal = undefined;
    } else {
      window.ethereum = undefined;
    }
  }
}
