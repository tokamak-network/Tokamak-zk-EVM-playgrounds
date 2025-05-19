// 비동기 함수로 Etherscan API 키 검증
export const validateEtherscanApiKey = async (
  apiKey: string
): Promise<boolean> => {
  // API 키가 비어있거나 형식이 맞지 않으면 즉시 실패 처리
  if (!apiKey || apiKey.trim().length < 30) {
    return false;
  }

  try {
    // Etherscan의 가장 간단한 API 요청으로 테스트 (이더리움 최신 블록 번호 조회)
    const response = await fetch(
      `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${apiKey}`
    );

    const data = await response.json();

    if (data.result.includes("Invalid API Key")) {
      return false;
    }

    if (data.status === "1" || data.message === "OK" || data.result) {
      // API 응답 검사: 결과가 성공이면 유효한 키
      return true;
    }

    // API 한도 초과 응답도 유효한 키로 간주 (키는 맞지만 사용량 초과)
    if (data.message && data.message.includes("rate limit")) {
      return true;
    }

    // API 키 오류 메시지가 있으면 유효하지 않은 키
    if (
      data.message &&
      data.message.toLowerCase().includes("invalid api key")
    ) {
      return false;
    }

    return false;
  } catch (error) {
    console.error("Error validating Etherscan API key:", error);
    return false;
  }
};
