import { useState } from 'react';
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
        <p className="text-gray-600 mt-4">No storage load data available.</p>
      );
    } else if (activeTab === 'logs') {
      return placementLogs && placementLogs.length > 0 ? (
        placementLogs.map((log, index) => (
          <div key={index} className="relative mt-[30px] bg-white border border-[#5f5f5f] p-[15px] text-black font-tahoma text-xs">
            <div className="absolute -top-[25px] -left-[1px] font-ibm-mono bg-white tracking-[0.15px] text-[#3b48ff] text-left font-medium text-xs p-1 px-2 border-t border-l border-r border-[#5f5f5f] rounded-t">
              Log #{index + 1}
            </div>
            <div>
              {log.topics && log.topics.length > 0 && (
                <div className="mb-3 text-left">
                  <strong className="block mb-1 text-sm font-ibm-mono text-[#222] font-medium">Topics:</strong>
                  {log.topics.map((topic: string, topicIndex: number) => (
                    <div key={topicIndex} className="mb-1">
                      <span className="block p-[5px_8px] bg-[#F2F2F2] border-t border-l border-[#5f5f5f] border-r border-b border-r-[#dfdfdf] border-b-[#dfdfdf] min-h-[16px] break-all font-ibm-mono">
                        {add0xPrefix(topic)}
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
        <p className="text-gray-600 mt-4">No logs data available.</p>
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
        <p className="text-gray-600 mt-4">No storage store data available.</p>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col">
      <CustomTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="bg-white border border-[#5f5f5f] p-4 min-h-[200px]">
        <div className="flex flex-col gap-4">
          {renderActiveTab()}
          {serverData && (
            <div className="mt-4 flex gap-4">
              {serverData.permutation && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  onMouseEnter={() => setPermutationHovered(true)}
                  onMouseLeave={() => setPermutationHovered(false)}
                  onClick={() => handleDownload(serverData.permutation, 'permutation.json')}
                >
                  Download Permutation
                </button>
              )}
              {serverData.placementInstance && (
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  onMouseEnter={() => setPlacementHovered(true)}
                  onMouseLeave={() => setPlacementHovered(false)}
                  onClick={() => handleDownload(serverData.placementInstance, 'placement_instance.json')}
                >
                  Download Placement Instance
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay; 