import { useSynthesizerResult } from "../hooks/useSynthesizerResult";
import { add0xPrefix, hexToDecimal } from "../utils/helpers";

export default function ProcessResult() {
  const {
    logGroups,
    // isLoading,
    // error,
    // instanceData,
    // logEntries,
  } = useSynthesizerResult();

  return logGroups && logGroups.length > 0 ? (
    logGroups.map((group, groupIndex) => (
      <div
        key={groupIndex}
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
          Data #{groupIndex + 1}
        </div>
        <div>
          {/* Topics */}
          {Object.entries(group.categories)
            .filter(([type]) => type.startsWith("topic"))
            .map(([type, category]) => (
              <div key={type} className="mb-3 text-left">
                <strong className="block mb-1 text-sm font-mono text-[#222] font-medium">
                  {type.charAt(0).toUpperCase() + type.slice(1)}:
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
                  {add0xPrefix(category.valueHex)}
                </span>
              </div>
            ))}

          {/* Value (Decimal) */}
          {Object.entries(group.categories)
            .filter(([type]) => type.startsWith("value"))
            .map(([type, category]) => (
              <div key={type} className="mb-3 text-left">
                <strong className="block mb-1 text-sm font-mono text-[#222] font-medium">
                  Value (Decimal):
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
                  {hexToDecimal(category.valueHex)}
                </span>
              </div>
            ))}

          {/* Value (Hex) */}
          {Object.entries(group.categories)
            .filter(([type]) => type.startsWith("value"))
            .map(([type, category]) => (
              <div key={type} className="mb-3 text-left">
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
                  {add0xPrefix(category.valueHex)}
                </span>
              </div>
            ))}
        </div>
      </div>
    ))
  ) : (
    <p className="text-[#4A4A4A] mt-4 font-mono">No logs data available.</p>
  );
}
