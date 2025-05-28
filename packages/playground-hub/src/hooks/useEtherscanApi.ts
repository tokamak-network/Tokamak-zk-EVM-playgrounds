import { useState, useEffect, useRef } from "react";
import { validateEtherscanApiKey } from "../utils/checkEtherscanApi";

export const useDebouncedEtherscanValidation = (etherscanApiKey: string) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 입력이 없으면 검증하지 않음
    if (!etherscanApiKey) {
      setIsValid(null);
      return;
    }

    // debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const valid = await validateEtherscanApiKey(etherscanApiKey);
      setIsValid(valid);
    }, 500);

    // cleanup
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [etherscanApiKey]);

  return { isValid };
};
