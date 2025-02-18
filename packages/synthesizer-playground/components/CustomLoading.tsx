import { useEffect, useState } from 'react';

const CustomLoading = () => {
  const [activeBoxes, setActiveBoxes] = useState(0);
  const totalBoxes = 24;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBoxes((prev) => (prev < totalBoxes ? prev + 1 : 0));
    }, 75);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-[512px] left-1/2 -translate-x-1/2 z-10">
      <div className="relative w-full flex flex-row items-center justify-center text-left text-xs text-white font-ibm-mono">
        <div className="self-stretch w-[1px] relative bg-[#dfdfdf]" />
        <div className="self-stretch w-[400px] bg-[#bdbdbd] flex flex-col items-start justify-start">
          {/* Header */}
          <div className="self-stretch h-[23px] flex flex-col items-start justify-start">
            <div className="self-stretch relative bg-[#dfdfdf] h-[1px]" />
            <div className="w-[400px] bg-[#0f2058] h-[22px] flex flex-row items-center justify-start px-2 pb-0.5 box-border">
              <div className="relative">Loading...</div>
            </div>
          </div>
          {/* Body */}
          <div className="self-stretch flex flex-col items-start justify-start p-2 gap-3 text-sm text-[#222]">
            <div className="overflow-hidden flex flex-col items-center justify-center pr-[1px] pb-[1px]">
              <div className="bg-[#f2f2f2] flex flex-col items-center justify-center">
                <div className="self-stretch relative bg-[#5f5f5f] h-[1px]" />
                <div className="self-stretch h-[31px] flex flex-row items-center justify-center gap-2 w-[385px] mx-auto">
                  <div className="self-stretch w-[1px] relative bg-[#5f5f5f]" />
                  <div className="flex flex-row items-start justify-start gap-1">
                    {Array.from({ length: totalBoxes }).map((_, idx) => (
                      <div key={idx} className="w-3 relative h-6">
                        <div className={`absolute inset-0 ${idx < activeBoxes ? 'bg-[#2a72e5]' : 'bg-[#a5a5a5]'}`} />
                      </div>
                    ))}
                  </div>
                  <div className="self-stretch w-[1px] relative bg-[#dfdfdf]" />
                </div>
                <div className="self-stretch relative bg-[#dfdfdf] h-[1px]" />
              </div>
            </div>
            <div className="flex flex-col items-start justify-start gap-4">
              <p className="self-stretch relative leading-[23px] m-0">
                Loading, please wait...
              </p>
            </div>
          </div>
          <div className="self-stretch relative bg-[#5f5f5f] h-[1px]" />
        </div>
        <div className="self-stretch w-[1px] relative bg-[#5f5f5f]" />
      </div>
    </div>
  );
};

export default CustomLoading; 