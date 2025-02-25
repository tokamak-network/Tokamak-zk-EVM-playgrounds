import React from 'react';
import CustomInput from './CustomInput';
import Image from 'next/image';

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
  return (
    <div className="absolute top-[424px] left-1/2 -translate-x-1/2 flex items-center gap-4 justify-center w-[728px] h-[59px] z-[2]">
      <CustomInput
        placeholder="Transaction Hash"
        value={transactionHash}
        onChange={setTransactionHash}
        disabled={isProcessing}
        error={error}
      />
      <button
        onClick={handleSubmit}
        disabled={isProcessing}
        className={`h-[59px] w-[159px] flex items-center justify-center relative gap-2 border border-[#a8a8a8] border-b-[#5F5F5F] border-r-[#5F5F5F] rounded-none p-0 transition-all duration-200 cursor-pointer
          ${error ? 'bg-[#BC2828]' : 'bg-[#2A72E5]'}
          ${isProcessing ? 'opacity-60 cursor-not-allowed' : 'opacity-100 hover:bg-[#2864C7]'}`}
      >
        <span className="relative w-6 h-6">
          <Image
            src="/assets/save.svg"
            alt="Process"
            width={20}
            height={20}
            className="absolute left-[2px] top-[2px]"
          />
        </span>
        <span className="text-[#F8F8F8] text-2xl font-ibm-mono font-medium">Process</span>
      </button>
    </div>
  );
};

export default TransactionForm;
