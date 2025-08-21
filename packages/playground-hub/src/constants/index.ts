// RPC Configuration
export const RPC_URL =
  "https://eth-mainnet.g.alchemy.com/v2/PbqCcGx1oHN7yNaFdUJUYqPEN0QSp23S";

export const getEnvVars = async () => {
  if (window.env) {
    return await window.env.getEnvVars();
  }
};
