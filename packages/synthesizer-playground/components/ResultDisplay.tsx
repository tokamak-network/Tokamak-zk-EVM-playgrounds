import { useState, useEffect } from 'react';
import CustomTabSwitcher from './CustomTabSwitcher';
import LogCard from './LogCard';
import ScrollBar from './ScrollBar';
import { add0xPrefix, summarizeHex } from '../helpers/helpers';

type ResultDisplayProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  storageLoad: any[];
  placementLogs: any[];
  storageStore: any[];
  evmContractAddress: string;
  handleDownload: (fileContent: string | null, fileName: string) => void;
  serverData: { permutation: string | null; placementInstance: string | null } | null;
};

const ResultDisplay = ({
  activeTab,
  setActiveTab,
  storageLoad,
  placementLogs,
  storageStore,
  evmContractAddress,
  handleDownload,
  serverData,
}: ResultDisplayProps) => {
  const [permutationHovered, setPermutationHovered] = useState(false);
  const [placementHovered, setPlacementHovered] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);

  // Update window height on mount and resize
  useEffect(() => {
    const updateWindowHeight = () => {
      setWindowHeight(window.innerHeight);
    };
    
    // Set initial height
    updateWindowHeight();
    
    // Add event listener
    window.addEventListener('resize', updateWindowHeight);
    
    // Clean up
    return () => window.removeEventListener('resize', updateWindowHeight);
  }, []);

  const renderActiveTab = () => {
    if (activeTab === 'storageLoad') {
      return storageLoad && storageLoad.length > 0 ? (
        storageLoad.map((item, index) => (
          <div key={index} className="relative mt-[30px] bg-white border border-[#5f5f5f] p-[15px] text-black font-tahoma text-xs">
            <div className="absolute -top-[25px] -left-[1px] font-ibm-mono bg-white tracking-[0.15px] text-[#3b48ff] text-left font-medium text-xs p-1 px-2 border-t border-l border-r border-[#5f5f5f] rounded-t">
              Data #{index + 1}
            </div>
            <LogCard
              contractAddress={item.contractAddress || evmContractAddress}
              keyValue={add0xPrefix(item.key)}
              valueDecimal={item.valueDecimal || '0'}
              valueHex={add0xPrefix(item.valueHex)}
            />
          </div>
        ))
      ) : (
        <p className="text-[#4A4A4A] mt-4 font-ibm-mono">No storage load data available.</p>
      );
    } else if (activeTab === 'logs') {
      return placementLogs && placementLogs.length > 0 ? (
        placementLogs.map((log, index) => (
          <div key={index} className="relative mt-[30px] bg-white border border-[#5f5f5f] p-[15px] text-black font-tahoma text-xs">
            <div className="absolute -top-[25px] -left-[1px] font-ibm-mono bg-white tracking-[0.15px] text-[#3b48ff] text-left font-medium text-xs p-1 px-2 border-t border-l border-r border-[#5f5f5f] rounded-t">
              Data #{index + 1}
            </div>
            <div>
              {log.topics && log.topics.length > 0 && (
                <div className="mb-3 text-left">
                  <strong className="block mb-1 text-sm font-ibm-mono text-[#222] font-medium">Topics:</strong>
                  {log.topics.map((topic: string, topicIndex: number) => (
                    <div key={topicIndex} className="mb-1">
                      <span className="block p-[5px_8px] bg-[#F2F2F2] border-t border-l border-[#5f5f5f] border-r border-b border-r-[#dfdfdf] border-b-[#dfdfdf] min-h-[16px] break-all font-ibm-mono">
                        {topicIndex}: {add0xPrefix(topic)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mb-3 text-left">
                <strong className="block mb-1 text-sm font-ibm-mono text-[#222] font-medium">Value (Dec):</strong>
                <span className="block p-[5px_8px] bg-[#F2F2F2] border-t border-l border-[#5f5f5f] border-r border-b border-r-[#dfdfdf] border-b-[#dfdfdf] min-h-[16px] break-all font-ibm-mono">
                  {log.valueDec || '0'}
                </span>
              </div>
              <div className="mb-3 text-left">
                <strong className="block mb-1 text-sm font-ibm-mono text-[#222] font-medium">Value (Hex):</strong>
                <span className="block p-[5px_8px] bg-[#F2F2F2] border-t border-l border-[#5f5f5f] border-r border-b border-r-[#dfdfdf] border-b-[#dfdfdf] min-h-[16px] break-all font-ibm-mono">
                  {add0xPrefix(log.valueHex)}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-[#4A4A4A] mt-4 font-ibm-mono">No logs data available.</p>
      );
    } else if (activeTab === 'storageStore') {
      return storageStore && storageStore.length > 0 ? (
        storageStore.map((item, index) => (
          <div key={index} className="relative mt-[30px] bg-white border border-[#5f5f5f] p-[15px] text-black font-tahoma text-xs">
            <div className="absolute -top-[25px] -left-[1px] font-ibm-mono bg-white tracking-[0.15px] text-[#3b48ff] text-left font-medium text-xs p-1 px-2 border-t border-l border-r border-[#5f5f5f] rounded-t">
              Data #{index + 1}
            </div>
            <LogCard
              contractAddress={item.contractAddress || evmContractAddress}
              keyValue={add0xPrefix(item.key)}
              valueDecimal={item.value || '0'}
              valueHex={add0xPrefix(item.valueHex)}
              summarizeAddress={true}
            />
          </div>
        ))
      ) : (
        <p className="text-[#4A4A4A] mt-4 font-ibm-mono">No storage store data available.</p>
      );
    }
    return null;
  };

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[228px] pb-[134px]">
      <div className="w-[728px] h-[714px]">
        <CustomTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
        <ScrollBar>
          {renderActiveTab()}
        </ScrollBar>
        {serverData && (
          <div className="w-[710px] h-[31px] flex justify-start gap-2 p-2 pt-[3px] bg-[#bdbdbd] font-ibm-mono">
            {serverData.permutation && (
              <button
                onClick={() => handleDownload(serverData.permutation, 'permutation.json')}
                onMouseEnter={() => setPermutationHovered(true)}
                onMouseLeave={() => setPermutationHovered(false)}
                className={`font-ibm-mono text-sm font-normal w-[350px] flex items-center justify-center cursor-pointer rounded-none border-l border-t border-[#a8a8a8] border-b border-r border-b-[#5f5f5f] border-r-[#5f5f5f] text-[#F8F8F8] transition-colors duration-200
                  ${permutationHovered ? 'bg-[#6600b3]' : 'bg-[#55008A]'}`}
              >
                Download Permutation
              </button>
            )}
            {serverData.placementInstance && (
              <button
                onClick={() => handleDownload(serverData.placementInstance, 'placement_instance.json')}
                onMouseEnter={() => setPlacementHovered(true)}
                onMouseLeave={() => setPlacementHovered(false)}
                className={`font-ibm-mono text-sm font-normal w-[350px] flex items-center justify-center cursor-pointer rounded-none border-l border-t border-[#a8a8a8] border-b border-r border-b-[#5f5f5f] border-r-[#5f5f5f] text-[#F8F8F8] transition-colors duration-200
                  ${placementHovered ? 'bg-[#008080]' : 'bg-[#008A4C]'}`}
              >
                Download Placement Instance
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay; 