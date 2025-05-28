const ETHERSCAN_API_URL = "https://api.etherscan.io/api";

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
  const API_KEY = JSON.parse(localStorage.getItem("etherscanApiKey"));
  console.log("ETHERSCAN_API_KEY:", API_KEY);

  const url = `${ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionByHash&txhash=${transactionId}&apikey=${API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  console.log("*******");
  console.log("response", data);

  // Validate the response
  if (!data || data.status === "0" || !data.result || !data.result.input) {
    if (
      data.result &&
      typeof data.result === "string" &&
      data.result.includes("Invalid API Key")
    ) {
      throw new Error("Invalid API KEY");
    }
    throw new Error(
      "Transaction bytecode not found or invalid response from Etherscan."
    );
  }

  return {
    bytecode: data.result.input,
    from: data.result.from,
    to: data.result.to,
  };
}
