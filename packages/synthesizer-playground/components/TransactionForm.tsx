import React, { useState } from 'react';
import CustomInput from './CustomInput';
import { useAnimation } from '@/context/AnimationContext';

type TransactionFormProps = {
  transactionHash: string;
  setTransactionHash: (value: string) => void;
  handleSubmit: () => void;
  isProcessing: boolean;
  isError?: boolean;
  isResultsShown?: boolean;
  needToExpand: boolean;
};

const TransactionForm = ({
  transactionHash,
  setTransactionHash,
  handleSubmit,
  isProcessing,
  isError = false,
  isResultsShown = false,
  needToExpand
}: TransactionFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const isDisabled = !transactionHash || isProcessing;

  // Function to truncate hash for display
  const truncateHash = (hash: string) => {
    if (hash.length <= 35) return hash;
    return `${hash.slice(0, 35)}...`;
  };

  const { updateAnimationKey } = useAnimation();

  const error = transactionHash === '' || transactionHash === undefined || transactionHash === null ? false : isError;

  return (
    <div className={`flex items-center gap-4 transition-all duration-300`}>
      {isResultsShown || needToExpand ? (
        <div className="h-10 justify-start items-center gap-4 inline-flex col">
          <div 
            className="w-[400px] h-10 flex-col justify-center items-start inline-flex overflow-hidden cursor-text"
            onClick={()=>setIsEditing(true)}
          >
            <div className="self-stretch h-px bg-[#a8a8a8]" />
            <div className="self-stretch grow shrink basis-0 justify-center items-center gap-2 inline-flex">
              <div className="w-px self-stretch bg-[#a8a8a8]" />
              <div className="grow shrink basis-0 h-[23px] pb-0.5 justify-start items-start flex">
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full h-full border-none bg-transparent px-0 font-ibm-mono text-base font-normal text-[#999999] outline-none placeholder:text-[#999999]"
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    placeholder="Enter transaction ID"
                    disabled={isProcessing}
                    onBlur={() => {
                      setIsEditing(false)
                    }}
                    onFocus={() => {
                      setIsEditing(true)
                     setTransactionHash('')
                   }}
                   autoFocus  
                  />
                ) : (
                  <div className={`text-base font-normal font-ibm-mono ${error ? 'text-[#da1f1f]' : 'text-[#999999]'}`}>
                    {truncateHash(transactionHash)}
                  </div>
                )}
              </div>
              <div className="w-px self-stretch bg-[#5f5f5f]" />
            </div>
            <div className="self-stretch h-px bg-[#5f5f5f]" />
            <div className="self-stretch h-px" />
          </div>
          <div className="h-10 pr-px flex-col justify-center items-center inline-flex overflow-hidden">
            <div className="grow shrink basis-0 flex-col justify-center items-center flex">
              <div className="self-stretch h-px bg-[#a8a8a8]" />
              <div className={`grow shrink basis-0 ${error ? 'bg-[#bc2828] hover:bg-[#EC3030]' : (isEditing || isProcessing) && transactionHash ? 'bg-[#2A72E5] hover:bg-[#5B9AFF] active:bg-[#1057C9]' : 'bg-[#7c7c88]'} justify-center items-center gap-2 inline-flex h-[59px]`}>
                <div className="w-px self-stretch bg-[#a8a8a8]" />
                <button
                  onClick={() => {
                    handleSubmit();
                    setIsEditing(false);
                    updateAnimationKey()
                  }}
                  disabled={isDisabled}
                  className="px-1 pb-0.5 justify-center items-center gap-2 flex cursor-pointer disabled:cursor-not-allowed"
                >
                  <div data-svg-wrapper className="relative">
                    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M4 2.5H18V4.5H4V20.5H6V16.5V14.5H8H16H18L18 20.5H20L20 6.5L22 6.5V20.5L22 22.5L18 22.5H16H8H6L2 22.5V20.5V4.5V2.5H4ZM8 20.5H16V16.5H8V20.5ZM20 6.5H18L18 4.5L20 4.5V6.5ZM6 6.5H15V10.5H6V6.5Z" fill="#E0E0E0"/>
                    </svg>
                  </div>
                  <div className="text-[#dfdfdf] text-xl font-medium font-ibm-mono">Process</div>
                </button>
                <div className="w-px self-stretch bg-[#5f5f5f]" />
              </div>
              <div className="self-stretch h-px bg-[#5f5f5f]" />
              <div className="self-stretch h-px" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-[728px] h-[59px] flex items-center gap-x-[16px]">
          <CustomInput
            value={transactionHash}
            onChange={setTransactionHash}
            disabled={isProcessing}
              error={error}
              setTransactionHash={setTransactionHash}
          />
          <div className="w-40 h-[59px] pr-px flex-col justify-center items-center inline-flex overflow-hidden">
            <div className="flex-col justify-center items-center flex">
              <div 
                className={`h-14 justify-center items-center gap-2 inline-flex transition-colors cursor-pointer
                  ${!transactionHash 
                    ? 'bg-[#7c7c88] hover:bg-[#696975]' 
                    : error 
                      ? 'bg-[#BC2828] hover:bg-[#EC3030]' 
                      : 'bg-[#2A72E5] hover:bg-[#5B9AFF] active:bg-[#1057C9]'
                  } h-[59px] w-[160px] border-[1px] border-t-[#A8A8A8] border-l-[#A8A8A8] border-r-[#5F5F5F] border-b-[#5F5F5F]`}
                >
                <button
                  onClick={() => {
                    handleSubmit();
                    updateAnimationKey()
                  }}
                  disabled={isDisabled}
                    className="px-1 pb-0.5 justify-center items-center gap-2 flex cursor-pointer disabled:cursor-not-allowed h-[100%]"
                >
                  <div data-svg-wrapper className="relative">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M4 2H18V4H4V20H6V16V14H8H16H18L18 20H20L20 6L22 6V20L22 22L18 22H16H8H6L2 22V20V4V2H4ZM8 20H16V16H8V20ZM20 6H18L18 4L20 4V6ZM6 6H15V10H6V6Z" fill="#E0E0E0"/>
                    </svg>
                  </div>
                  <div className="text-[#dfdfdf] text-2xl font-ibm-mono font-medium leading-[31.2px]">Process</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default TransactionForm;
