import axios from 'axios';

const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';
const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

interface TransactionBytecodeResponse {
  bytecode: string;
  from: string;
  to: string;
}

export const fetchTransactionBytecode = async (transactionId: string): Promise<TransactionBytecodeResponse> => {
  try {
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: 'proxy',
        action: 'eth_getTransactionByHash',
        txhash: transactionId,
        apikey: API_KEY,
      },
    });

    console.log("response", response);

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
      to: response.data.result.to
    };
  } catch (error) {
    console.error('Error fetching transaction bytecode:', error);
    throw new Error('Failed to fetch transaction bytecode. Please check the transaction ID and try again.');
  }
}; 