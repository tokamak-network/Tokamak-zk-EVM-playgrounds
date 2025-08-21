import ScrollBar from "./ScrollBar";
import { add0xPrefix, hexToDecimal } from "../utils/helpers";
import { useSynthesizerResult } from "../hooks/useSynthesizerResult";
import { useAtomValue } from "jotai";
import { showProcessResultModalAtom } from "../atoms/ui";
import { useBinaryFileDownload } from "../hooks/useBinaryFileDownload";
import { useBenchmark } from "../hooks/useBenchmark";
import JSZip from "jszip";

const Logs = () => {
  const { logGroups: test } = useSynthesizerResult();

  const logGroups = [...test, ...test, ...test, ...test, ...test, ...test];

  return logGroups && logGroups.length > 0 ? (
    logGroups.map((logGroup, index) => (
      <div
        key={index}
        className="relative mt-[30px] bg-white p-[15px] text-black text-xs"
        style={{
          fontFamily: "IBM Plex Mono, monospace",
          background: "#fff",
          borderTop: "1px solid #5F5F5F",
          borderLeft: "1px solid #5F5F5F",
          borderRight: "1px solid #5F5F5F",
        }}
      >
        {/* <div className="absolute">gogo</div> */}
        <div
          className="absolute top-[-23px] left-[-0.8px] font-ibm-mono text-[#3b48ff] w-[58px] h-[22px] text-center  rounded-t py-[4px] z-[100]"
          style={{
            background: "#fff",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.15px",
            borderTop: "1px solid #5F5F5F",
            borderLeft: "1px solid #5F5F5F",
            borderRight: "1px solid #5F5F5F",
            borderTopRightRadius: "2px",
            borderTopLeftRadius: "2px",
          }}
        >
          Data #{index + 1}
        </div>
        <div
          className="absolute top-[-1px] left-[0px] w-[56.5px] h-[1px]"
          style={{
            background: "#fff",
          }}
        ></div>
        <div>
          {/* Topics Section */}
          {logGroup.categories && (
            <div className="mb-3 text-left mb-[9px]">
              <strong className="block mb-1 text-sm font-ibm-mono text-[#222] font-medium text-[14px] mb-[4px]">
                Topics:
              </strong>
              <div className="flex flex-col gap-y-[4px] text-[12px]">
                {Object.entries(logGroup.categories)
                  .filter(([key]) => key.startsWith("topic"))
                  .map(([categoryKey, category]) => (
                    <div key={categoryKey} className="mb-1">
                      <span className="block p-[5px_8px] bg-[#F2F2F2] border-t border-l border-[#5f5f5f] border-r border-b border-r-[#dfdfdf] border-b-[#dfdfdf] min-h-[16px] break-all font-ibm-mono">
                        {categoryKey.match(/\d+/)?.[0] || categoryKey}:{" "}
                        {add0xPrefix(category.valueHex)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Values Section */}
          {logGroup.categories && (
            <div className="mb-3 text-left">
              <strong className="block text-[#222] font-medium text-[14px] mb-[4px]">
                Values:
              </strong>
              {Object.entries(logGroup.categories)
                .filter(([key]) => key.startsWith("value"))
                .map(([categoryKey, category]) => (
                  <div key={categoryKey} className="mb-1">
                    <span className="block p-[5px_8px] bg-[#F2F2F2] border-t border-l border-[#5f5f5f] border-r border-b border-r-[#dfdfdf] border-b-[#dfdfdf] min-h-[16px] break-all font-ibm-mono text-[11px]">
                      {categoryKey}: {hexToDecimal(category.valueHex)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    ))
  ) : (
    <p className="text-[#4A4A4A] mt-4 font-ibm-mono">No logs data available.</p>
  );
};

const ProcessResult = () => {
  const showProcessResult = useAtomValue(showProcessResultModalAtom);

  const { downloadSynthesizerFiles, downloadProveFiles } =
    useBinaryFileDownload();
  const { generateBenchmarkData } = useBenchmark();

  // Combined download handler for proof and benchmark files
  const handleDownloadCombined = async () => {
    console.log("Creating combined zip file...");

    // First load all files into state
    console.log("Loading files from binary directory...");
    const synthesizerFiles = await downloadSynthesizerFiles();
    const proveFilesResult = await downloadProveFiles();

    console.log("*****");
    console.log("synthesizerFiles", synthesizerFiles);
    console.log("proveFilesResult", proveFilesResult);

    try {
      // 1. Get proof file
      let proofData: string | null = null;
      let instanceData: string | null = null;

      if (proveFilesResult?.proof) {
        proofData = proveFilesResult.proof;
        console.log("Using proof from loaded files");
      }

      if (!proofData) {
        console.error("No proof data available");
        return { success: false, error: "No proof data available" };
      }

      // 2. Get instance file
      if (synthesizerFiles?.instance) {
        instanceData = synthesizerFiles.instance;
        console.log("Using instance from loaded files");
      }

      if (!instanceData) {
        console.error("No instance data available");
        return { success: false, error: "No instance data available" };
      }

      // 3. Get benchmark data
      const benchmarkData = generateBenchmarkData();
      if (!benchmarkData) {
        console.error("No benchmark data available");
        return { success: false, error: "No benchmark data available" };
      }

      // 4. Create zip file
      const zip = new JSZip();

      // Add proof file
      zip.file("proof.json", proofData);

      // Add instance file
      zip.file("instance.json", instanceData);

      // Add benchmark file
      const benchmarkJson = JSON.stringify(benchmarkData, null, 2);
      zip.file("benchmark.json", benchmarkJson);

      // 5. Download zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `tokamak-zk-evm-proof.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      console.log("📦 Combined zip file downloaded successfully");

      return { success: true };
    } catch (error) {
      console.error("Failed to create combined zip file:", error);
      return { success: false, error: String(error) };
    }
  };

  // if (!showProcessResult) return null;

  return (
    <div className="flex flex-col gap-4 h-full gap-y-[24px]">
      <div className="w-[729px]">
        <ScrollBar>
          <Logs />
        </ScrollBar>
      </div>
      <div className="flex w-full h-[46px] justify-between z-[100]">
        <button
          className="w-[354px] bg-[#008BEE] cursor-pointer"
          style={{
            color: "#F8F8F8",
            fontFamily: "IBM Plex Mono",
            fontSize: "16px",
            fontStyle: "normal",
            fontWeight: "700",
            lineHeight: "normal",
          }}
          onClick={handleDownloadCombined}
        >
          Download Proof
        </button>
        <button
          className="w-[354px] bg-[#773FE0] cursor-pointer"
          style={{
            color: "#F8F8F8",
            fontFamily: "IBM Plex Mono",
            fontSize: "16px",
            fontStyle: "normal",
            fontWeight: "700",
            lineHeight: "normal",
          }}
          onClick={async () => {
            const url =
              "https://docs.google.com/forms/d/e/1FAIpQLSdVqGLRSrO2JhR0apXe5MzrUM9WdQZLJQTpnfd0hiUoNmNESw/viewform";

            console.log("📝 Opening Google Form in external browser...");
            try {
              const result = await window.electron.openExternalUrl(url);
              console.log("🌐 openExternalUrl result:", result);
              if (!result.success) {
                console.error("Failed to open external URL:", result.error);
              }
            } catch (error) {
              console.error("Error calling openExternalUrl:", error);
            }
          }}
        >
          Submit Proof
        </button>
      </div>
    </div>
  );
};

export default ProcessResult;
