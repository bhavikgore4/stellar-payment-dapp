/**
 * Stellar Testnet Friendbot API helper
 * Used for one-click testnet XLM funding (not wallet/transaction logic)
 */

export interface FriendbotResult {
  success: boolean;
  hash?: string;
  message: string;
}

export async function requestTestnetFunds(address: string): Promise<FriendbotResult> {
  if (!address || address.length !== 56 || !address.startsWith('G')) {
    return {
      success: false,
      message: 'Invalid Stellar address. Must start with G and be 56 characters.',
    };
  }

  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`
    );

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        message: text || `Friendbot request failed (${response.status})`,
      };
    }

    const data = await response.json();
    const hash = data?.hash as string | undefined;

    return {
      success: true,
      hash,
      message: hash
        ? 'Testnet account funded successfully!'
        : 'Testnet XLM requested successfully!',
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return {
      success: false,
      message: `Failed to request testnet XLM: ${message}`,
    };
  }
}
