import { useState, useEffect, useRef } from "react";
import { isValidEthereumTxHash } from "../utils/checkTransactionHash";

export const useDebouncedTxHashValidation = (txHash: string) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!txHash) {
      setIsValid(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setIsValid(isValidEthereumTxHash(txHash));
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [txHash]);

  return { isValid };
};
