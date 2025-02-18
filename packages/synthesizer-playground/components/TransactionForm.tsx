import Image from 'next/image';
import CustomInput from './CustomInput';

type TransactionFormProps = {
  transactionId: string;
  setTransactionId: (value: string) => void;
  handleSubmit: () => void;
  isProcessing: boolean;
  error?: boolean;
};

const TransactionForm = ({
  transactionId,
  setTransactionId,
  handleSubmit,
  isProcessing,
  error = false,
}: TransactionFormProps) => {
  return (
    <div className="absolute top-[424px] left-1/2 -translate-x-1/2 flex items-center gap-4 justify-center w-[728px] h-[59px] z-10">
      <CustomInput
        value={transactionId}
        onChange={setTransactionId}
        disabled={isProcessing}
        error={error}
      />
      <button
        onClick={handleSubmit}
        disabled={isProcessing}
        className={`h-[59px] w-[159px] flex items-center justify-center relative gap-2 
          border-l border-t border-[#a8a8a8] border-b border-r border-b-[#5F5F5F] border-r-[#5F5F5F]
          rounded-none p-0 transition-all duration-200
          ${error 
            ? 'bg-[#BC2828] hover:bg-[#ec3030]' 
            : 'bg-[#2A72E5] hover:bg-[#5B9AFF] active:bg-[#1057C9]'
          }
          ${isProcessing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer opacity-100'}`}
      >
        <span className="relative w-6 h-6">
          <Image
            src="/assets/save.svg"
            alt="icon"
            width={20}
            height={20}
            className="absolute left-0.5 top-0.5"
          />
        </span>
        <span className="text-[#F8F8F8] text-2xl font-ibm-mono font-medium break-words">
          Process
        </span>
      </button>
    </div>
  );
};

export default TransactionForm; 