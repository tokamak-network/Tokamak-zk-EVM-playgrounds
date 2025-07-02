import React, { useState, useMemo } from "react";
import { useAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import SynthesizerResultModalImage from "../../assets/modals/synthesizer/synthesizer-result.svg";
import { useSynthesizerResult } from "../../hooks/useSynthesizerResult";

// Mock data types - you can replace these with actual types later
type StorageItem = {
  contractAddress?: string;
  key: string;
  valueDecimal?: string;
  valueHex: string;
};

type LogItem = {
  topics?: string[];
  valueDec?: string;
  valueHex: string;
};

type StorageStoreItem = {
  contractAddress?: string;
  key: string;
  value?: string;
  valueHex: string;
};

type ServerData = {
  permutation?: string;
  placementInstance?: string;
};

// Helper function - you can move this to utils later
const add0xPrefix = (value: string): string => {
  if (!value) return "";
  return value.startsWith("0x") ? value : `0x${value}`;
};

// LogCard component - simplified version
const LogCard: React.FC<{
  contractAddress: string;
  keyValue: string;
  valueDecimal: string;
  valueHex: string;
  summarizeAddress?: boolean;
}> = ({
  contractAddress,
  keyValue,
  valueDecimal,
  valueHex,
  summarizeAddress,
}) => (
  <div className="space-y-3 text-left">
    <div>
      <strong className="block mb-1 text-sm font-mono text-[#222] font-medium">
        Contract Address:
      </strong>
      <span className="block p-[5px_8px] bg-[#F2F2F2] border border-[#5f5f5f] min-h-[16px] break-all font-mono text-xs">
        {summarizeAddress && contractAddress.length > 10
          ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`
          : contractAddress}
      </span>
    </div>
    <div>
      <strong className="block mb-1 text-sm font-mono text-[#222] font-medium">
        Key:
      </strong>
      <span className="block p-[5px_8px] bg-[#F2F2F2] border border-[#5f5f5f] min-h-[16px] break-all font-mono text-xs">
        {keyValue}
      </span>
    </div>
    <div>
      <strong className="block mb-1 text-sm font-mono text-[#222] font-medium">
        Value (Dec):
      </strong>
      <span className="block p-[5px_8px] bg-[#F2F2F2] border border-[#5f5f5f] min-h-[16px] break-all font-mono text-xs">
        {valueDecimal}
      </span>
    </div>
    <div>
      <strong className="block mb-1 text-sm font-mono text-[#222] font-medium">
        Value (Hex):
      </strong>
      <span className="block p-[5px_8px] bg-[#F2F2F2] border border-[#5f5f5f] min-h-[16px] break-all font-mono text-xs">
        {valueHex}
      </span>
    </div>
  </div>
);

// Tab Switcher component
const CustomTabSwitcher: React.FC<{
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "logs", label: "Logs" },
    { id: "storageLoad", label: "Storage Load" },
    { id: "storageStore", label: "Storage Store" },
  ];

  return (
    <div
      className="flex items-center flex-shrink-0 self-stretch"
      style={{
        height: "32px",
      }}
    >
      {tabs.map((tabItem) => (
        <div
          key={tabItem.id}
          onClick={() => setActiveTab(tabItem.id)}
          className="flex justify-center items-center flex-1 cursor-pointer"
          style={{
            height: "32px",
            borderRadius: "2px 2px 0px 0px",
            border:
              activeTab === tabItem.id
                ? "1px solid #365969"
                : "1px solid #E5E5E5",
            backgroundColor: activeTab === tabItem.id ? "#00CCEC" : "#F5F5F5",
            padding: "4px 8px",
          }}
        >
          <span
            style={{
              color: "#1E1E1E",
              fontFamily: '"IBM Plex Sans"',
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.15px",
            }}
          >
            {tabItem.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const SynthesizerResultModal: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const [activeTab, setActiveTab] = useState("storageLoad");
  const [permutationHovered, setPermutationHovered] = useState(false);
  const [placementHovered, setPlacementHovered] = useState(false);

  // Use the custom hook to get synthesizer result data
  const {
    storageLoad,
    placementLogs,
    storageStore,
    evmContractAddress,
    serverData,
    isLoading,
    error,
  } = useSynthesizerResult();

  const isOpen = useMemo(
    () => activeModal === "synthesizer-result",
    [activeModal]
  );

  const onClose = () => {
    setActiveModal("none");
  };

  const handleDownload = (fileContent: string | null, fileName: string) => {
    if (!fileContent) return;

    const blob = new Blob([fileContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  //   handleDownload(serverData.permutation, "permutation.json");
  // handleDownload(serverData.placementInstance, "placement_instance.json");

  const renderActiveTab = () => {
    if (activeTab === "storageLoad") {
      return storageLoad && storageLoad.length > 0 ? (
        storageLoad.map((item, index) => (
          <div
            key={index}
            className="relative mt-[30px] bg-white border border-[#5f5f5f] p-[15px] text-black text-xs"
          >
            <div
              className="absolute -top-[21px] -left-[1px] inline-flex flex-col justify-end items-center"
              style={{
                borderRadius: "2px 2px 0px 0px",
                border: "1px solid #365969",
                backgroundColor: "#00CCEC",
                color: "#1E1E1E",
                fontFamily: '"IBM Plex Sans"',
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.15px",
                padding: "4px 8px",
              }}
            >
              Data #{index + 1}
            </div>
            <LogCard
              contractAddress={item.contractAddress || evmContractAddress}
              keyValue={add0xPrefix(item.key)}
              valueDecimal={item.valueDecimal || "0"}
              valueHex={add0xPrefix(item.valueHex)}
            />
          </div>
        ))
      ) : (
        <p className="text-[#4A4A4A] mt-4 font-mono">
          No storage load data available.
        </p>
      );
    } else if (activeTab === "logs") {
      return placementLogs && placementLogs.length > 0 ? (
        placementLogs.map((log, index) => (
          <div
            key={index}
            className="relative mt-[30px] bg-white border border-[#5f5f5f] p-[15px] text-black text-xs"
          >
            <div
              className="absolute -top-[21px] -left-[1px] inline-flex flex-col justify-end items-center"
              style={{
                borderRadius: "2px 2px 0px 0px",
                border: "1px solid #365969",
                borderBottom: "1px solid #ffffff",
                backgroundColor: "#00CCEC",
                color: "#1E1E1E",
                fontFamily: '"IBM Plex Sans"',
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.15px",
                padding: "4px 8px",
              }}
            >
              Data #{index + 1}
            </div>
            <div>
              {log.topics && log.topics.length > 0 && (
                <div className="mb-3 text-left">
                  <strong className="block mb-1 text-sm font-mono text-[#222] font-medium">
                    Topics:
                  </strong>
                  {log.topics.map((topic: string, topicIndex: number) => (
                    <div
                      key={topicIndex}
                      className="mb-1"
                      style={{ marginBottom: "5px" }}
                    >
                      <span
                        className="flex flex-col justify-center items-start self-stretch"
                        style={{
                          width: "704px",
                          height: "32px",
                          backgroundColor: "#F2F2F2",
                          flex: "1 0 0",
                          color: "#111",
                          fontFamily: '"IBM Plex Mono"',
                          fontSize: "13px",
                          fontWeight: 400,
                          lineHeight: "normal",
                          padding: "8px",
                          borderTop: "1px solid #5F5F5F",
                          borderLeft: "1px solid #5F5F5F",
                          borderBottom: "1px solid #D0D0D0",
                          borderRight: "1px solid #D0D0D0",
                        }}
                      >
                        {topicIndex}: {add0xPrefix(topic)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mb-3 text-left" style={{ marginBottom: "5px" }}>
                <strong className="block mb-1 text-sm font-mono text-[#222] font-medium">
                  Value (Dec):
                </strong>
                <span
                  className="flex flex-col justify-center items-start self-stretch"
                  style={{
                    width: "704px",
                    height: "32px",
                    backgroundColor: "#F2F2F2",
                    flex: "1 0 0",
                    color: "#111",
                    fontFamily: '"IBM Plex Mono"',
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "normal",
                    padding: "8px",
                    borderTop: "1px solid #5F5F5F",
                    borderLeft: "1px solid #5F5F5F",
                    borderBottom: "1px solid #D0D0D0",
                    borderRight: "1px solid #D0D0D0",
                  }}
                >
                  {log.valueDec || "0"}
                </span>
              </div>
              <div className="mb-3 text-left" style={{ marginBottom: "5px" }}>
                <strong className="block mb-1 text-sm font-mono text-[#222] font-medium">
                  Value (Hex):
                </strong>
                <span
                  className="flex flex-col justify-center items-start self-stretch"
                  style={{
                    width: "704px",
                    height: "32px",
                    backgroundColor: "#F2F2F2",
                    flex: "1 0 0",
                    color: "#111",
                    fontFamily: '"IBM Plex Mono"',
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "normal",
                    padding: "8px",
                    borderTop: "1px solid #5F5F5F",
                    borderLeft: "1px solid #5F5F5F",
                    borderBottom: "1px solid #D0D0D0",
                    borderRight: "1px solid #D0D0D0",
                  }}
                >
                  {add0xPrefix(log.valueHex)}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-[#4A4A4A] mt-4 font-mono">No logs data available.</p>
      );
    } else if (activeTab === "storageStore") {
      return storageStore && storageStore.length > 0 ? (
        storageStore.map((item, index) => (
          <div
            key={index}
            className="relative mt-[30px] bg-white border border-[#5f5f5f] p-[15px] text-black text-xs"
          >
            <div
              className="absolute -top-[21px] -left-[1px] inline-flex flex-col justify-end items-center"
              style={{
                borderRadius: "2px 2px 0px 0px",
                border: "1px solid #365969",
                backgroundColor: "#00CCEC",
                color: "#1E1E1E",
                fontFamily: '"IBM Plex Sans"',
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.15px",
                padding: "4px 8px",
              }}
            >
              Data #{index + 1}
            </div>
            <LogCard
              contractAddress={item.contractAddress || evmContractAddress}
              keyValue={add0xPrefix(item.key)}
              valueDecimal={item.value || "0"}
              valueHex={add0xPrefix(item.valueHex)}
              summarizeAddress={true}
            />
          </div>
        ))
      ) : (
        <p className="text-[#4A4A4A] mt-4 font-mono">
          No storage store data available.
        </p>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-888 overflow-y-auto w-full h-full flex justify-center items-center">
      <div className="relative">
        {/* Modal Header */}
        <img
          src={SynthesizerResultModalImage}
          alt={"transaction-input-modal"}
          draggable={false}
          style={{
            userSelect: "none",
            // position: "absolute",
            pointerEvents: "none",
          }}
        ></img>
        <div
          className="absolute w-[18px] h-[18px] top-[20px] right-[22px] cursor-pointer"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <div
          className="p-6 z-[999] absolute top-[253px] left-[30px]"
          style={{}}
        >
          <div
            className="flex flex-col items-start"
            style={{
              width: "747px",
              height: "416px",
              flexShrink: 0,
            }}
          >
            <CustomTabSwitcher
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <div
              className="flex-1 w-full overflow-y-auto border border-t-0 border-[#5f5f5f] bg-[#fafafa] p-4 
            "
            >
              {renderActiveTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynthesizerResultModal;
