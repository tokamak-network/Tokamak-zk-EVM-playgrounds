import { useState, useEffect } from 'react';
import CustomTabSwitcher from './CustomTabSwitcher';
import LogCard from './LogCard';
import ScrollBar from './ScrollBar';
import { add0xPrefix } from '../helpers/helpers';
import { StorageItem, StorageStoreItem, LogItem, ServerData } from '@/types/api-types';
import { useViewport } from '@/hooks/useMediaView';

type ResultDisplayProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  storageLoad: StorageItem[];
  placementLogs: LogItem[];
  storageStore: StorageStoreItem[];
  evmContractAddress: string;
  handleDownload: (fileContent: string | null, fileName: string) => void;
  serverData: ServerData | null;
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
  const { isViewportSatisfied, width, height } = useViewport();

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
    <div className="flex flex-col gap-4">
      <div className="w-[729px]">
        <CustomTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
        <ScrollBar>
          <div className="h-[10%]">
            {renderActiveTab()}
            </div>
        </ScrollBar>
      </div>
      
      {serverData && (
        <div className="h-9 justify-start items-center gap-5 inline-flex w-[729px] mt-4">
          {serverData.permutation && (
            <div className="grow shrink basis-0 h-9 flex-col justify-center items-center inline-flex overflow-hidden">
              <div className="self-stretch grow shrink basis-0 flex-col justify-center items-center flex">
                <div className="self-stretch h-px bg-[#a8a8a8]" />
                <div 
                  className={`self-stretch grow shrink basis-0 ${permutationHovered ? 'bg-[#6600b3]' : 'bg-[#55008a]'} justify-center items-center gap-2 inline-flex cursor-pointer`}
                  onClick={() => handleDownload(serverData.permutation, 'permutation.json')}
                  onMouseEnter={() => setPermutationHovered(true)}
                  onMouseLeave={() => setPermutationHovered(false)}
                >
                  <div className="w-px self-stretch bg-[#a8a8a8]" />
                  <div className="grow shrink basis-0 self-stretch px-1 pt-0.5 justify-center items-center gap-3 flex">
                    <div className="text-[#f8f8f8] text-[13px] font-medium font-ibm-mono">Download Permutation</div>
                  </div>
                  <div className="w-px self-stretch bg-[#5f5f5f]" />
                </div>
                <div className="self-stretch h-px bg-[#5f5f5f]" />
                <div className="self-stretch h-px" />
              </div>
            </div>
          )}
          
          {serverData.placementInstance && (
            <div className="grow shrink basis-0 h-9 flex-col justify-center items-center inline-flex overflow-hidden">
              <div className="self-stretch grow shrink basis-0 flex-col justify-center items-center flex">
                <div className="self-stretch h-px bg-[#a8a8a8]" />
                <div 
                  className={`self-stretch grow shrink basis-0 ${placementHovered ? 'bg-[#008080]' : 'bg-[#008a4b]'} justify-center items-center gap-2 inline-flex cursor-pointer`}
                  onClick={() => handleDownload(serverData.placementInstance, 'placement_instance.json')}
                  onMouseEnter={() => setPlacementHovered(true)}
                  onMouseLeave={() => setPlacementHovered(false)}
                >
                  <div className="w-px self-stretch bg-[#a8a8a8]" />
                  <div className="grow shrink basis-0 h-[19px] px-1 pt-0.5 justify-center items-center gap-3 flex">
                    <div className="text-[#f8f8f8] text-[13px] font-medium font-ibm-mono">Download Placement Instance</div>
                  </div>
                  <div className="w-px self-stretch bg-[#5f5f5f]" />
                </div>
                <div className="self-stretch h-px bg-[#5f5f5f]" />
                <div className="self-stretch h-px" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultDisplay; 