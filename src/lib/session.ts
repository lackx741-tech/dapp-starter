import {
  encodeAbiParameters,
  keccak256,
  type Address,
  type Hex,
} from 'viem';

/**
 * Represents a saved dApp session for a smart account.
 */
export interface SessionData {
  /** The ERC-4337 smart account address (CREATE2-derived) */
  smartAccountAddress: Address;
  /** The EOA address of the connected wallet */
  ownerAddress: Address;
  /** The image hash stored in Stage1/Stage2 module */
  imageHash: Hex;
  /** The chain ID this session was created on */
  chainId: number;
  /** Unix timestamp (seconds) when the session expires */
  expiry: number;
  /** The on-chain session hash registered in SessionManager */
  sessionHash: Hex;
  /** Unix timestamp (seconds) when the session was created */
  createdAt: number;
}

const SESSION_KEY_PREFIX = 'dapp_session_';

/** In-memory cache to avoid repeated localStorage reads */
const memoryCache = new Map<string, SessionData>();

/**
 * Generates the localStorage key for a given owner address.
 */
function storageKey(ownerAddress: Address): string {
  return `${SESSION_KEY_PREFIX}${ownerAddress.toLowerCase()}`;
}

/**
 * Saves a session to both localStorage and in-memory cache.
 * Safe to call in SSR contexts (no-ops if localStorage is unavailable).
 *
 * @param data - The session data to persist
 */
export function saveSession(data: SessionData): void {
  const key = storageKey(data.ownerAddress);
  memoryCache.set(key, data);

  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage may be blocked in private browsing — fall back to memory only
  }
}

/**
 * Loads a session for a given owner address.
 * Checks the in-memory cache first, then falls back to localStorage.
 *
 * @param ownerAddress - the EOA address whose session to load
 * @returns The session data, or `null` if none found
 */
export function loadSession(ownerAddress: Address): SessionData | null {
  const key = storageKey(ownerAddress);

  // Check memory cache first
  if (memoryCache.has(key)) return memoryCache.get(key)!;

  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as SessionData;
    memoryCache.set(key, data);
    return data;
  } catch {
    return null;
  }
}

/**
 * Removes a session from both localStorage and in-memory cache.
 *
 * @param ownerAddress - the EOA address whose session to clear
 */
export function clearSession(ownerAddress: Address): void {
  const key = storageKey(ownerAddress);
  memoryCache.delete(key);

  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Returns `true` when the session is still within its validity window.
 *
 * @param data - a loaded `SessionData` object
 */
export function isSessionValid(data: SessionData): boolean {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return data.expiry > nowSeconds;
}

/**
 * Derives a deterministic session hash from session data (without the hash itself).
 * Used to register the session on-chain with SessionManager.createSession.
 *
 * @param data - session data (all fields except `sessionHash`)
 * @returns keccak256 of the ABI-encoded session fields
 */
export function createSessionHash(
  data: Omit<SessionData, 'sessionHash'>,
): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { name: 'smartAccountAddress', type: 'address' },
        { name: 'ownerAddress', type: 'address' },
        { name: 'imageHash', type: 'bytes32' },
        { name: 'chainId', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'createdAt', type: 'uint256' },
      ],
      [
        data.smartAccountAddress,
        data.ownerAddress,
        data.imageHash,
        BigInt(data.chainId),
        BigInt(data.expiry),
        BigInt(data.createdAt),
      ],
    ),
  );
}
