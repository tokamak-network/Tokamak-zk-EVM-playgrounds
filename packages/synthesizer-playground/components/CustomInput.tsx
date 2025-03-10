import { useState } from 'react';

interface CustomInputProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  onBlur?: () => void;
}

const CustomInput = ({
  value = '',
  onChange = () => {},
  disabled = false,
  error = false,
  onBlur,
}: CustomInputProps) => {
  const [active, setActive] = useState(false);

  const handleBlur = () => {
    setActive(false);
    onBlur?.();
  };

  return (
    <div className='relative'>
      <input
        type="text"
        className={`w-[552px] h-[59px] border-none px-4 font-ibm-mono text-2xl font-normal leading-[31.2px] placeholder:text-[#999999] outline-none
          ${error ? 'text-[#a01313]' : active || value ? 'text-[#222222]' : 'text-[#999999]'}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter transaction ID"
        // disabled={disabled}
        onFocus={() => setActive(true)}
        onBlur={handleBlur}
      />
     {/* 배경용 div */}
      <div className={`absolute inset-0 bg-[#5B9AFF] opacity-0 pointer-events-none ${active && !disabled ? 'animate-focusEffect' : ''}`} />
      {/* 테두리용 div */}
      <div className={`absolute inset-0 border-2 border-[#5B9AFF] opacity-0 pointer-events-none ${active && !disabled ? 'animate-focusEffect' : ''}`} />
    </div>
  );
};

export default CustomInput;
