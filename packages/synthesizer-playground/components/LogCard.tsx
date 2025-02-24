import { summarizeHex, getValueDecimal } from '../helpers/helpers';

type LogCardProps = {
  contractAddress: string;
  keyValue: string;
  valueDecimal: string;
  valueHex: string;
  summarizeAddress?: boolean;
};

const LogCard = ({
  contractAddress,
  keyValue,
  valueDecimal,
  valueHex,
  summarizeAddress = false,
}: LogCardProps) => {
  return (
    <div className="relative text-black font-tahoma text-xs">
      {contractAddress && (
        <div className="mb-3 text-left">
          <strong className="block mb-1 text-sm font-ibm-mono text-[#222] font-medium">
            Contract Address:
          </strong>
          <span 
            className="block p-[5px_8px] bg-[#F2F2F2] border-t border-l border-[#5f5f5f] border-r border-b border-r-[#dfdfdf] border-b-[#dfdfdf] min-h-[16px] break-all font-ibm-mono" 
            title={contractAddress}
          >
            {summarizeAddress ? summarizeHex(contractAddress) : contractAddress}
          </span>
        </div>
      )}
      {keyValue && (
        <div className="mb-3 text-left">
          <strong className="block mb-1 text-sm font-ibm-mono text-[#222] font-medium">
            Key:
          </strong>
          <span 
            className="block p-[5px_8px] bg-[#F2F2F2] border-t border-l border-[#5f5f5f] border-r border-b border-r-[#dfdfdf] border-b-[#dfdfdf] min-h-[16px] break-all font-ibm-mono" 
            title={keyValue}
          >
            {summarizeHex(keyValue)}
          </span>
        </div>
      )}
      <div className="mb-3 text-left">
        <strong className="block mb-1 text-sm font-ibm-mono text-[#222] font-medium">
          Value (Decimal):
        </strong>
        <span className="block p-[5px_8px] bg-[#F2F2F2] border-t border-l border-[#5f5f5f] border-r border-b border-r-[#dfdfdf] border-b-[#dfdfdf] min-h-[16px] break-all font-ibm-mono">
          {valueDecimal || getValueDecimal(valueHex)}
        </span>
      </div>
      <div className="mb-3 text-left">
        <strong className="block mb-1 text-sm font-ibm-mono text-[#222] font-medium">
          Value (Hex):
        </strong>
        <span 
          className="block p-[5px_8px] bg-[#F2F2F2] border-t border-l border-[#5f5f5f] border-r border-b border-r-[#dfdfdf] border-b-[#dfdfdf] min-h-[16px] break-all font-ibm-mono" 
          title={valueHex}
        >
          {valueHex}
        </span>
      </div>
    </div>
  );
};

export default LogCard; 