import { useState } from "react";
import ScrollBar from "./ScrollBar";
import { add0xPrefix } from "../utils/helpers";
import { ServerData } from "../types/ProceeResult";
import { useSynthesizerResult } from "../hooks/useSynthesizerResult";
import { useAtom, useAtomValue } from "jotai";
import { showProcessResultModalAtom } from "../atoms/ui";

const ProcessResult = () => {
  const [permutationHovered, setPermutationHovered] = useState(false);
  const [placementHovered, setPlacementHovered] = useState(false);
  const showProcessResult = useAtomValue(showProcessResultModalAtom);

  const { logGroups } = useSynthesizerResult();

  const renderLogs = () => {
    return logGroups && logGroups.length > 0 ? (
      logGroups.map((logGroup, index) => (
        <div
          key={index}
          className="relative mt-[30px] bg-white border border-[#5f5f5f] p-[15px] text-black text-xs"
          style={{ fontFamily: "IBM Plex Mono, monospace" }}
        >
          <div className="absolute -top-[25px] -left-[1px] font-ibm-mono bg-white tracking-[0.15px] text-[#3b48ff] text-left font-medium text-xs p-1 px-2 border-t border-l border-r border-[#5f5f5f] rounded-t">
            Data #{index + 1} (Key: {logGroup.key})
          </div>
          <div>
            {/* Topics Section */}
            {logGroup.categories && (
              <div className="mb-3 text-left">
                <strong className="block mb-1 text-sm font-ibm-mono text-[#222] font-medium">
                  Topics:
                </strong>
                {Object.entries(logGroup.categories)
                  .filter(([key]) => key.startsWith("topic"))
                  .map(([categoryKey, category]) => (
                    <div key={categoryKey} className="mb-1">
                      <span className="block p-[5px_8px] bg-[#F2F2F2] border-t border-l border-[#5f5f5f] border-r border-b border-r-[#dfdfdf] border-b-[#dfdfdf] min-h-[16px] break-all font-ibm-mono">
                        {categoryKey}: {add0xPrefix(category.valueHex)}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Values Section */}
            {logGroup.categories && (
              <div className="mb-3 text-left">
                <strong className="block mb-1 text-sm font-ibm-mono text-[#222] font-medium">
                  Values:
                </strong>
                {Object.entries(logGroup.categories)
                  .filter(([key]) => key.startsWith("value"))
                  .map(([categoryKey, category]) => (
                    <div key={categoryKey} className="mb-1">
                      <span className="block p-[5px_8px] bg-[#F2F2F2] border-t border-l border-[#5f5f5f] border-r border-b border-r-[#dfdfdf] border-b-[#dfdfdf] min-h-[16px] break-all font-ibm-mono">
                        {categoryKey}: {add0xPrefix(category.valueHex)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      ))
    ) : (
      <p className="text-[#4A4A4A] mt-4 font-ibm-mono">
        No logs data available.
      </p>
    );
  };

  if (!showProcessResult) return null;

  return (
    <div className="flex flex-col gap-4 ">
      <div className="w-[729px]">
        <ScrollBar>
          <div>{renderLogs()}</div>
        </ScrollBar>
      </div>

      {/* {serverData && (
        <div className="h-9 justify-start items-center gap-5 inline-flex w-[729px] mt-4">
          {serverData.permutation && (
            <div className="grow shrink basis-0 h-9 flex-col justify-center items-center inline-flex overflow-hidden">
              <div className="self-stretch grow shrink basis-0 flex-col justify-center items-center flex">
                <div className="self-stretch h-px bg-[#a8a8a8]" />
                <div
                  className={`self-stretch grow shrink basis-0 ${permutationHovered ? "bg-[#6600b3]" : "bg-[#55008a]"} justify-center items-center gap-2 inline-flex cursor-pointer`}
                  onClick={() =>
                    handleDownload(serverData.permutation, "permutation.json")
                  }
                  onMouseEnter={() => setPermutationHovered(true)}
                  onMouseLeave={() => setPermutationHovered(false)}
                >
                  <div className="w-px self-stretch bg-[#a8a8a8]" />
                  <div className="grow shrink basis-0 self-stretch px-1 pt-0.5 justify-center items-center gap-3 flex">
                    <div className="text-[#f8f8f8] text-[13px] font-medium font-ibm-mono">
                      Download Permutation
                    </div>
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
                  className={`self-stretch grow shrink basis-0 ${placementHovered ? "bg-[#008080]" : "bg-[#008a4b]"} justify-center items-center gap-2 inline-flex cursor-pointer`}
                  onClick={() =>
                    handleDownload(
                      serverData.placementInstance,
                      "placement_instance.json"
                    )
                  }
                  onMouseEnter={() => setPlacementHovered(true)}
                  onMouseLeave={() => setPlacementHovered(false)}
                >
                  <div className="w-px self-stretch bg-[#a8a8a8]" />
                  <div className="grow shrink basis-0 h-[19px] px-1 pt-0.5 justify-center items-center gap-3 flex">
                    <div className="text-[#f8f8f8] text-[13px] font-medium font-ibm-mono">
                      Download Placement Instance
                    </div>
                  </div>
                  <div className="w-px self-stretch bg-[#5f5f5f]" />
                </div>
                <div className="self-stretch h-px bg-[#5f5f5f]" />
                <div className="self-stretch h-px" />
              </div>
            </div>
          )}
        </div>
      )} */}
    </div>
  );
};

export default ProcessResult;
