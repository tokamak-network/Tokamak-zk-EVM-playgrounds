export interface SynthesizerResponse {
  tokenAddress: string;
  balance: string;
  // Add other fields as needed
}

const SUPPORTED_TOKENS = {
  TON: '0x123...', // Add actual TON address
  USDC: '0x456...', // Add actual USDC address
  USDT: '0x789...', // Add actual USDT address
  BNB: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52'
};

export class MockSynthesizerAdapter {
  async getTokenData(tokenAddress: string): Promise<SynthesizerResponse> {
    // Simulate the error for invalid tokens
    if (!Object.values(SUPPORTED_TOKENS).includes(tokenAddress)) {
      throw new Error(`Unsupported token address: ${tokenAddress}. Supported tokens are TON(Tokamak), USDT, and USDC.`);
    }

    // Return mock data
    return {
      tokenAddress,
      balance: '1000000000000000000', // 1 token with 18 decimals
      // Add other mock data
    };
  }

  // Add other methods that will be in the real adapter
} 