import axios from 'axios';

const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';

// If you're only using this on the server side, it's fine to reference process.env here
// If you rename your env var to NEXT_PUBLIC_ETHERSCAN_API_KEY, it becomes visible client-side (NOT recommended)
const API_KEY = process.env.ETHERSCAN_API_KEY;
console.log('ETHERSCAN_API_KEY:', process.env.ETHERSCAN_API_KEY);


/**
 * Fetches the bytecode of a transaction by its hash using the Etherscan API.
 *
 * @param transactionId - The hash of the transaction to fetch the bytecode for.
 * @returns The transaction bytecode, from, and to fields.
 * @throws Error if the bytecode cannot be retrieved or the transaction is invalid.
 */
export async function fetchTransactionBytecode(transactionId: string): Promise<{
  bytecode: string;
  from: string;
  to: string;
}> {
  console.log('ETHERSCAN_API_KEY:', API_KEY);

  try {
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: 'proxy',
        action: 'eth_getTransactionByHash',
        txhash: transactionId,
        apikey: API_KEY,
      },
    });

    console.log('response', response);

    // Validate the response
    if (
      !response.data ||
      response.data.status === '0' ||
      !response.data.result ||
      !response.data.result.input
    ) {
      throw new Error('Transaction bytecode not found or invalid response from Etherscan.');
    }

    return {
      bytecode: response.data.result.input,
      from: response.data.result.from,
      to: response.data.result.to,
    };
  } catch (error) {
    console.error('Error fetching transaction bytecode:', error);
    throw new Error('Failed to fetch transaction bytecode. Please check the transaction ID and try again.');
  }
}
