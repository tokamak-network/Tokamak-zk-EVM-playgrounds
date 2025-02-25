import { useState } from 'react';

interface CustomInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

const CustomInput = ({
  placeholder = '0x...',
  value = '',
  onChange = () => {},
  disabled = false,
  error = false,
}: CustomInputProps) => {
  const [active, setActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <style jsx>{`
        input::placeholder {
          color: ${error ? '#a01313' : '#999999'} !important;
          opacity: 1;
        }
      `}</style>
      <div
        className={`relative flex flex-col items-start justify-center text-left text-2xl font-ibm-mono ${
          error ? 'text-[#a01313]' : disabled ? 'text-[#444]' : 'text-[#999]'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="self-stretch relative bg-[#a8a8a8] h-[1px]" />
        <div
          className={`w-[550px] flex flex-row items-center justify-center ${
            disabled ? 'bg-[#d0d0d7]' : 'bg-[#f7f7f7]'
          } h-[59px] transition-all duration-200`}
        >
          <div className="self-stretch w-[1px] relative bg-[#a8a8a8]" />
          <div className="flex-1 flex flex-row items-start justify-start pb-0.5">
            <input
              type="text"
              className={`relative w-full h-full border-none bg-transparent px-4 font-ibm-mono text-2xl outline-none ${
                error ? 'text-[#a01313]' : active || value ? 'text-[#222222]' : 'text-[#999999]'
              } placeholder:font-medium`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              onFocus={() => setActive(true)}
              onBlur={() => setActive(false)}
            />
          </div>
          <div className="self-stretch w-[1px] relative bg-[#5f5f5f]" />
        </div>
        <div className="self-stretch relative bg-[#5f5f5f] h-[1px]" />
        <div className="self-stretch relative bg-[#dfdfdf] h-[1px]" />
      </div>
    </>
  );
};

export default CustomInput;
