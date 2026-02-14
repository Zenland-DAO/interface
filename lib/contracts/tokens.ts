import { mainnet, sepolia } from "wagmi/chains";
import type { Address } from "viem";

/**
 * Token configuration for a specific chain.
 */
export interface TokenConfig {
  /** Contract address */
  address: Address;
  /** Token decimals */
  decimals: number;
  /** Token symbol */
  symbol: string;
  /** Token name */
  name: string;
  /** Whether the token supports ERC20Permit (EIP-2612) */
  supportsPermit: boolean;

  /** EIP-2612 domain version (defaults to "1" if omitted) */
  permitVersion?: string;
  /** Token logo URL (optional) */
  logo?: string;
}

/**
 * Token type identifiers.
 */
export type StablecoinType = "USDC" | "USDT";
export type TokenType = StablecoinType | "DAO";

/**
 * Token configurations by chain ID.
 *
 * Note: ERC20Permit support:
 * - USDC: Supports EIP-2612 permit
 * - USDT: Does NOT support permit (uses legacy approve)
 * - DAO (ZEN): Supports permit (OpenZeppelin ERC20Votes)
 */
export const TOKEN_CONFIGS = {
  [sepolia.id]: {
    USDC: {
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as Address,
      decimals: 6,
      symbol: "USDC",
      name: "USD Coin",
      supportsPermit: true,
      // Circle USDC uses EIP-2612 domain version "2"
      permitVersion: "2",
    },
    USDT: {
      address: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06" as Address,
      decimals: 6,
      symbol: "USDT",
      name: "Tether USD",
      supportsPermit: false,
    },
    DAO: {
      address: "0xcfCff2dAad166cd75458E5F4Dd0c1F01c35D8d9C" as Address,
      decimals: 18,
      symbol: "ZEN",
      name: "Zenland Token",
      supportsPermit: true,
      permitVersion: "1",
    },
  },
  [mainnet.id]: {
    // Mainnet token addresses - TBD
    USDC: {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
      decimals: 6,
      symbol: "USDC",
      name: "USD Coin",
      supportsPermit: true,
      permitVersion: "2",
    },
    USDT: {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" as Address,
      decimals: 6,
      symbol: "USDT",
      name: "Tether USD",
      supportsPermit: false,
    },
    DAO: {
      address: "0x5e7A494312d1943aa01682059dF1C0D2f3A27c32" as Address,
      decimals: 18,
      symbol: "ZEN",
      name: "Zenland Token",
      supportsPermit: true,
      permitVersion: "1",
    },
  },
} as const;

/**
 * Get all stablecoins available for a chain.
 */
export function getStablecoins(chainId: number | undefined): TokenConfig[] {
  if (!chainId || !(chainId in TOKEN_CONFIGS)) {
    return [];
  }
  const tokens = TOKEN_CONFIGS[chainId as keyof typeof TOKEN_CONFIGS];
  return [tokens.USDC, tokens.USDT];
}

/**
 * Get a specific token config by type.
 */
export function getTokenConfig(
  chainId: number | undefined,
  tokenType: TokenType
): TokenConfig | undefined {
  if (!chainId || !(chainId in TOKEN_CONFIGS)) {
    return undefined;
  }
  return TOKEN_CONFIGS[chainId as keyof typeof TOKEN_CONFIGS][tokenType];
}

/**
 * Get the DAO token config for a chain.
 */
export function getDaoToken(chainId: number | undefined): TokenConfig | undefined {
  return getTokenConfig(chainId, "DAO");
}

/**
 * Find token config by address.
 */
export function getTokenByAddress(
  chainId: number | undefined,
  address: Address
): TokenConfig | undefined {
  if (!chainId || !(chainId in TOKEN_CONFIGS)) {
    return undefined;
  }
  const tokens = TOKEN_CONFIGS[chainId as keyof typeof TOKEN_CONFIGS];
  const normalizedAddress = address.toLowerCase();
  
  for (const token of Object.values(tokens)) {
    if (token.address.toLowerCase() === normalizedAddress) {
      return token;
    }
  }
  return undefined;
}

/**
 * Check if a token supports ERC20Permit.
 */
export function tokenSupportsPermit(
  chainId: number | undefined,
  tokenAddress: Address
): boolean {
  const token = getTokenByAddress(chainId, tokenAddress);
  return token?.supportsPermit ?? false;
}
