import React from 'react';
import CustomInput from './CustomInput';

type TransactionFormProps = {
  transactionHash: string;
  setTransactionHash: (value: string) => void;
  handleSubmit: () => void;
  isProcessing: boolean;
  error?: boolean;
};

const TransactionForm = ({
  transactionHash,
  setTransactionHash,
  handleSubmit,
  isProcessing,
  error = false,
}: TransactionFormProps) => {
  const isDisabled = !transactionHash || isProcessing;

  return (
    <div className="absolute top-[424px] left-1/2 -translate-x-1/2 flex items-center gap-4 justify-center w-[728px] h-[59px] z-[2]">
      <CustomInput
        value={transactionHash}
        onChange={setTransactionHash}
        disabled={isProcessing}
        error={error}
      />
      <div className="w-40 h-[59px] pr-px flex-col justify-center items-center inline-flex overflow-hidden">
        <div className="flex-col justify-center items-center flex">
          <div className="self-stretch h-px bg-[#a8a8a8]" />
          <div className={`h-14 justify-center items-center gap-2 inline-flex ${
            isDisabled ? 'bg-[#7c7c88]' : error ? 'bg-[#BC2828]' : 'bg-[#2A72E5]'
          }`}>
            <div className="w-px self-stretch bg-[#a8a8a8]" />
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className="px-1 pb-0.5 justify-center items-center gap-2 flex cursor-pointer disabled:cursor-not-allowed"
            >
              <div data-svg-wrapper className="relative">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M4 2H18V4H4V20H6V16V14H8H16H18L18 20H20L20 6L22 6V20L22 22L18 22H16H8H6L2 22V20V4V2H4ZM8 20H16V16H8V20ZM20 6H18L18 4L20 4V6ZM6 6H15V10H6V6Z" fill="#E0E0E0"/>
                </svg>
              </div>
              <div className="text-[#dfdfdf] text-2xl font-ibm-mono font-medium leading-[31.2px]">Process</div>
            </button>
            <div className="w-px self-stretch bg-[#5f5f5f]" />
          </div>
          <div className="self-stretch h-px bg-[#5f5f5f]" />
          <div className="self-stretch h-px" />
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
