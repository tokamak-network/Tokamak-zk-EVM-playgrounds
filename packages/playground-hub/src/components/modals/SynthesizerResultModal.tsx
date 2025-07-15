import React, { useState, useMemo } from "react";
import { useAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import SynthesizerResultModalImage from "../../assets/modals/synthesizer/synthesizer-result.svg";
import { useSynthesizerResult } from "../../hooks/useSynthesizerResult";
import {
  useDockerFileDownload,
  SynthesizerFiles,
} from "../../hooks/useDockerFileDownload";
import JsonIcon from "../../assets/modals/json.svg";
import DownloadIcon from "../../assets/modals/docker/download-button.svg";
import PauseIcon from "../../assets/modals/docker/pause.svg";
import DownloadedIcon from "../../assets/modals/docker/downloaded-button.svg";

// Helper function - you can move this to utils later
const add0xPrefix = (value: string): string => {
  if (!value) return "";
  return value.startsWith("0x") ? value : `0x${value}`;
};

// Download File Component
const DownloadFileItem: React.FC<{
  fileName: string;
  fileKey: keyof SynthesizerFiles;
  isDownloading: boolean;
  files: SynthesizerFiles;
  onDownload: (filename: string, content: string) => void;
  onFetchFiles: () => Promise<SynthesizerFiles | null>;
}> = ({
  fileName,
  fileKey,
  isDownloading,
  files,
  onDownload,
  onFetchFiles,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const fileContent = files[fileKey];
  const hasFile = !!fileContent;

  const handleClick = async () => {
    if (hasFile && fileContent) {
      setIsDialogOpen(true);
      const result = await onDownload(`${fileName}.json`, fileContent);
      setIsDialogOpen(false);
      // 실제로 파일이 저장되었을 때만 완료 상태로 설정
      if (result && result.success) {
        setIsDownloaded(true);
      }
    } else {
      setIsDialogOpen(true);
      const downloadedFiles = await onFetchFiles();
      // 다운로드한 파일 내용을 바로 사용
      if (downloadedFiles && downloadedFiles[fileKey]) {
        const result = await onDownload(
          `${fileName}.json`,
          downloadedFiles[fileKey]!
        );
        // 실제로 파일이 저장되었을 때만 완료 상태로 설정
        if (result && result.success) {
          setIsDownloaded(true);
        }
      }
      setIsDialogOpen(false);
    }
  };

  const isDownloadingState = isDownloading || isDialogOpen;

  const getIcon = () => {
    if (isDownloadingState) {
      return <img src={PauseIcon} alt="Downloading" className="w-6 h-6" />;
    } else if (isDownloaded) {
      return <img src={DownloadedIcon} alt="Downloaded" className="w-6 h-6" />;
    } else {
      return <img src={DownloadIcon} alt="Download" className="w-6 h-6" />;
    }
  };

  return (
    <div
      className="flex padding-[8px] items-center gap-[12px] flex-1 cursor-pointer hover:bg-gray-50 rounded"
      style={{
        display: "flex",
        padding: "8px",
        alignItems: "center",
        gap: "12px",
        flex: "1 0 0",
      }}
      onClick={handleClick}
    >
      <img src={JsonIcon} alt="JSON" className="w-6 h-6" />
      <span
        style={{
          color: "#333",
          fontFamily: "IBM Plex Mono",
          fontSize: "16px",
          fontStyle: "normal",
          fontWeight: 600,
          lineHeight: "20px",
          letterSpacing: "-0.32px",
          width: "105px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          wordBreak: "break-word",
          overflow: "hidden",
        }}
      >
        {fileName}
      </span>
      <div className="ml-auto" style={{ flexShrink: 0 }}>
        {getIcon()}
      </div>
    </div>
  );
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
  <div className="flex flex-col" style={{ rowGap: "5px" }}>
    <div className="flex flex-col" style={{ rowGap: "5px" }}>
      <strong className="block mb-1 text-sm font-mono text-[#222] font-medium">
        Contract Address:
      </strong>
      <span className="block p-[5px_8px] bg-[#F2F2F2] border border-[#5f5f5f] min-h-[16px] break-all font-mono text-xs">
        {summarizeAddress && contractAddress.length > 10
          ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`
          : contractAddress}
      </span>
    </div>
    <div className="flex flex-col" style={{ rowGap: "5px" }}>
      <strong className="block mb-1 text-sm font-mono text-[#222] font-medium">
        Key:
      </strong>
      <span className="block p-[5px_8px] bg-[#F2F2F2] border border-[#5f5f5f] min-h-[16px] break-all font-mono text-xs">
        {keyValue}
      </span>
    </div>
    <div className="flex flex-col" style={{ rowGap: "5px" }}>
      <strong className="block mb-1 text-sm font-mono text-[#222] font-medium">
        Value (Dec):
      </strong>
      <span className="block p-[5px_8px] bg-[#F2F2F2] border border-[#5f5f5f] min-h-[16px] break-all font-mono text-xs">
        {valueDecimal}
      </span>
    </div>
    <div className="flex flex-col" style={{ rowGap: "5px" }}>
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
  setActiveTab: (id: string) => void;
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
            backgroundColor: activeTab === tabItem.id ? "#00CCEC" : "#ffffff",
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
  const [activeTab, setActiveTab] = useState("logs");

  // Use the custom hook to get synthesizer result data
  const { storageLoad, placementLogs, storageStore, evmContractAddress } =
    useSynthesizerResult();

  // Use the custom hook for file downloads
  const { isDownloading, files, downloadSynthesizerFiles, downloadToLocal } =
    useDockerFileDownload();

  const isOpen = useMemo(
    () => activeModal === "synthesizer-result",
    [activeModal]
  );

  const onClose = () => {
    setActiveModal("none");
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

        <div className="z-[999] absolute w-full h-[64px] top-[110px] px-[24px] flex">
          <div
            style={{
              display: "flex",
              width: "747px",
              alignItems: "flex-start",
              gap: "16px",
              background: "#fff",
            }}
          >
            <DownloadFileItem
              fileName="Instance"
              fileKey="instance"
              isDownloading={isDownloading}
              files={files}
              onDownload={downloadToLocal}
              onFetchFiles={downloadSynthesizerFiles}
            />
            <DownloadFileItem
              fileName="Wiring of subcircuits"
              fileKey="placementVariables"
              isDownloading={isDownloading}
              files={files}
              onDownload={downloadToLocal}
              onFetchFiles={downloadSynthesizerFiles}
            />
            <DownloadFileItem
              fileName="Witness"
              fileKey="permutation"
              isDownloading={isDownloading}
              files={files}
              onDownload={downloadToLocal}
              onFetchFiles={downloadSynthesizerFiles}
            />
          </div>
        </div>

        {/* Modal Content */}
        <div
          className="p-6 z-[999] absolute top-[200px] left-[30px]"
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
              className="flex-1 w-full overflow-y-auto border border-t-0 border-[#E5E5E5] bg-[#fafafa] p-4 
             px-[6px]"
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
