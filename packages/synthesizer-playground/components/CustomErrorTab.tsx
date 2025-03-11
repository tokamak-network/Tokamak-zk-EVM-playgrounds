import { useMemo, useState } from 'react';

type CustomErrorTabProps = {
  errorMessage?: string;
};

const CustomErrorTab = ({
  errorMessage = "Failed to fetch transaction bytecode.\nPlease check the transaction ID and try again.",
}: CustomErrorTabProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const handleGoToMain = () => {
    window.location.reload();
  };

  const errorMessageForInterface = useMemo(() => {
    switch (true) {
      case errorMessage.includes('Invalid API KEY'):
        return `Etherscan API key missing or invalid.
        Please set a valid API key in the settings and try again.`;
      case errorMessage.includes('Unsupported'):
        return `Invalid token selected. Please select TON,USDC or USDT and try again.`;
      // case errorMessage.includes('Unsupported'):
      //   return `Unsupported function. Please use standard ERC20 functions only. TON's approveAndCall function is not supported. `;
      default:
        return "Failed to fetch transaction bytecode.\nPlease check the transaction ID and try again.";
    }
  }, [errorMessage]);

  return (
    <div className="w-[402px] inline-flex justify-center items-center z-10">
      {/* Left vertical border */}
      <div className="w-[1px] self-stretch bg-[#DFDFDF]" />

      {/* Main error container */}
      <div className="w-[400px] self-stretch bg-[#BDBDBD] flex flex-col justify-start items-start">
        {/* Header */}
        <div className="self-stretch h-[23px] flex flex-col justify-start items-start">
          <div className="self-stretch h-[1px] bg-[#DFDFDF]" />
          <div className="w-full h-[22px] pb-0.5 px-2 bg-[#0F2058] flex justify-start items-center gap-3">
            <div className="text-white text-xs font-ibm-mono">Error</div>
          </div>
        </div>

        {/* Body */}
        <div className="self-stretch px-2 py-4 flex flex-col justify-start items-start gap-3">
          {/* Decorative error indicator */}
          <div className="pb-[1px] pr-[1px] flex flex-col justify-center items-center">
            <div className="bg-[#F2F2F2] flex flex-col justify-center items-center">
              <div className="self-stretch h-[1px] bg-[#5F5F5F]" />
              <div className="self-stretch h-[31px] flex justify-center items-center gap-2">
                <div className="w-[1px] self-stretch bg-[#5F5F5F]" />
                <div className="flex justify-start items-start gap-1">
                  {/* Red blocks */}
                  {Array.from({ length: 25 }).map((_, idx) => (
                    <div key={`red-${idx}`} className="w-[9px] h-6 relative">
                      <div className="absolute inset-0 bg-[#BC2828]" />
                    </div>
                  ))}
                  {/* Grey blocks */}
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={`grey-${idx}`} className="w-2 h-6 relative">
                      <div className="absolute inset-0 bg-[#A5A5A5]" />
                    </div>
                  ))}
                </div>
                <div className="w-[1px] self-stretch bg-[#DFDFDF]" />
              </div>
              <div className="self-stretch h-[1px] bg-[#DFDFDF]" />
            </div>
          </div>

          {/* Error message and button */}
          <div className="flex flex-col justify-start items-start gap-4">
            <div className="self-stretch text-[#222] text-sm font-ibm-mono leading-[23px] whitespace-pre-line text-left">
              {errorMessageForInterface}
            </div>

            {/* Back to main button */}
            <div className="self-stretch h-[31px] flex flex-col justify-center items-start gap-2">
              <div className="self-stretch h-[31px] pr-[1px] flex flex-col justify-center items-center">
                <div className="self-stretch h-[31px] flex flex-col justify-center items-center">
                  <div className="self-stretch h-[1px] bg-[#A8A8A8]" />
                  <button
                    className={`self-stretch h-7 flex items-center justify-center transition-colors no-underline
                      ${isHovered ? 'bg-[#A5A5A5]' : 'bg-[#BDBDBD]'}`}
                    onClick={handleGoToMain}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <div className="w-[1px] self-stretch bg-[#A8A8A8]" />
                    <div className="flex-1 h-[19px] pt-0.5 px-1 flex justify-center items-center gap-3">
                      <div className="text-[#222222] text-sm font-ibm-mono whitespace-pre-line no-underline text-decoration-none">
                        Back to main page
                      </div>
                    </div>
                    <div className="w-[1px] self-stretch bg-[#5F5F5F]" />
                  </button>
                  <div className="self-stretch h-[1px] bg-[#5F5F5F]" />
                  <div className="self-stretch h-[1px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch h-[1px] bg-[#5F5F5F]" />
      </div>
      <div className="w-[1px] self-stretch bg-[#5F5F5F]" />
    </div>
  );
};

export default CustomErrorTab; 