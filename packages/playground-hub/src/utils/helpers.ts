export const appInit = () => {
  window.location.reload();
};

export const add0xPrefix = (value: string): string => {
  if (!value) return "";
  return value.startsWith("0x") ? value : `0x${value}`;
};

export const hexToDecimal = (hexValue: string): string => {
  try {
    // Remove 0x prefix if present
    const cleanHex = hexValue.replace("0x", "");
    // Convert to BigInt to handle large numbers
    const bigIntValue = BigInt(`0x${cleanHex}`);
    return bigIntValue.toString();
  } catch (error) {
    console.error("Error converting hex to decimal:", error);
    return "0";
  }
};
