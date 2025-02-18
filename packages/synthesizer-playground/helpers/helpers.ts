// Copy from original project
export const serializePlacements = (placements: any): string => {
  const convertValue = (val: any): any => {
    if (typeof val === 'bigint') {
      return val.toString();
    }
    if (Array.isArray(val)) {
      return val.map(convertValue);
    }
    if (typeof val === 'object' && val !== null) {
      return Object.fromEntries(
        Object.entries(val).map(([k, v]) => [k, convertValue(v)])
      );
    }
    return val;
  };
  return JSON.stringify({ placements: convertValue(placements) });
};

export const summarizeHex = (value: any): string => {
  let hex = value;
  if (typeof hex !== 'string') {
    if (hex instanceof Buffer) {
      hex = hex.toString('hex');
    } else if (typeof hex === 'number' || typeof hex === 'bigint') {
      hex = hex.toString(16);
    } else {
      hex = String(hex);
    }
  }
  return hex;
};

export const getValueDecimal = (hexValue: string): string => {
  if (!hexValue) return "";
  try {
    const cleanHex = hexValue.startsWith("0x") ? hexValue : "0x" + hexValue;
    return BigInt(cleanHex).toString(10);
  } catch (error) {
    return "";
  }
};

export const add0xPrefix = (value: any): string => {
  if (value === null || value === undefined) return '';
  const strValue = value.toString();
  return strValue.startsWith('0x') ? strValue : `0x${strValue}`;
}; 