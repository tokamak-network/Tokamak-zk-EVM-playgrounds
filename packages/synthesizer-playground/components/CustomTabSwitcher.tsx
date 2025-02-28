interface CustomTabSwitcherProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CustomTabSwitcher = ({ activeTab, setActiveTab }: CustomTabSwitcherProps) => {
  // Helper function to render a single tab
  const renderTab = (tabKey: string, label: string, isActive: boolean) => {
    if (isActive) {
      return (
        <div
          onClick={() => setActiveTab(tabKey)}
          className="cursor-pointer flex flex-col justify-center items-center inline-flex"
        >
          <div className="bg-[#BDBDBD] flex flex-col justify-center items-center">
            <div className="self-stretch h-[1px] bg-[#DFDFDF]" />
            <div className="h-[39px] flex justify-center items-center">
              <div className="w-[1px] self-stretch bg-[#DFDFDF]" />
              <div className="px-4 flex justify-center items-center h-full">
                <div className="text-[#222222] text-base font-ibm-mono font-medium tracking-[0.15px]">
                  {label}
                </div>
              </div>
              <div className="w-[1px] self-stretch bg-[#5F5F5F]" />
            </div>
            <div className="self-stretch h-[1px] bg-[#5F5F5F]" />
            <div className="self-stretch h-[1px] bg-[#DFDFDF]" />
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={() => setActiveTab(tabKey)}
        className="cursor-pointer flex flex-col justify-center items-center inline-flex"
      >
        <div className="bg-[#BDBDBD] flex flex-col justify-center items-center">
          <div className="self-stretch h-[1px] bg-[#DFDFDF]" />
          <div className="h-[39px] flex justify-center items-center">
            <div className="w-[1px] self-stretch bg-[#DFDFDF]" />
            <div className="px-4 flex justify-center items-center h-full">
              <div className="text-[#4A4A4A] text-base font-ibm-mono font-medium tracking-[0.15px]">
                {label}
              </div>
            </div>
            <div className="w-[1px] self-stretch bg-[#5F5F5F]" />
          </div>
          <div className="self-stretch h-[1px] bg-[#5F5F5F]" />
          <div className="self-stretch h-[1px] bg-[#DFDFDF]" />
        </div>
      </div>
    );
  };

  return (
    <div className="w-[729px] flex justify-start items-end">
      {renderTab('storageLoad', 'Storage Load', activeTab === 'storageLoad')}
      {renderTab('logs', 'Logs', activeTab === 'logs')}
      {renderTab('storageStore', 'Storage Store', activeTab === 'storageStore')}
    </div>
  );
};

export default CustomTabSwitcher; 