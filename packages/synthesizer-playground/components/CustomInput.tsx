import { useState } from 'react';

interface CustomInputProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

const CustomInput = ({
  value = '',
  onChange = () => {},
  disabled = false,
  error = false,
}: CustomInputProps) => {
  const [active, setActive] = useState(false);

  return (
    <div className="w-[552px] h-[59px] flex-col justify-center items-start inline-flex">
      <div className="self-stretch h-px bg-[#a8a8a8]" />
      <div className="self-stretch h-14 bg-[#f7f7f7] justify-center items-center gap-2 inline-flex">
        <div className="w-px self-stretch bg-[#a8a8a8]" />
        <div className="grow shrink basis-0 h-[33px] pb-0.5 justify-start items-start flex">
          <input
            type="text"
            className={`w-full h-full border-none bg-transparent px-4 font-ibm-mono text-2xl font-normal leading-[31.2px] outline-none placeholder:text-[#999999] focus:placeholder:opacity-0 ${
              error ? 'text-[#a01313]' : active || value ? 'text-[#222222]' : 'text-[#999999]'
            }`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter transaction ID"
            disabled={disabled}
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
          />
        </div>
        <div className="w-px self-stretch bg-[#5f5f5f]" />
      </div>
      <div className="self-stretch h-px bg-[#5f5f5f]" />
      <div className="self-stretch h-px" />
    </div>
  );
};

export default CustomInput;
