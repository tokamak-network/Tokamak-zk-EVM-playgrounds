export function isValidEthereumTxHash(hash: string): boolean {
  // 0x로 시작하고, 64자리 16진수인지 검사
  return /^0x([A-Fa-f0-9]{64})$/.test(hash);
}
