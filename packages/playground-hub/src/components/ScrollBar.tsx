import { ReactNode, useRef, useState, useEffect } from "react";

interface ScrollBarProps {
  children: ReactNode;
}

const ScrollBar = ({ children }: ScrollBarProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setScrollHeight(container.scrollHeight);
      setClientHeight(container.clientHeight);
    }
  }, [children]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
    setScrollHeight(target.scrollHeight);
    setClientHeight(target.clientHeight);
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Calculate scrollbar handle position and size
  const trackHeight = clientHeight > 40 ? clientHeight - 40 : 200; // Subtract button heights
  const handleHeight = Math.max(
    20,
    (clientHeight / scrollHeight) * trackHeight
  );
  const handleTop =
    scrollHeight > clientHeight
      ? (scrollTop / (scrollHeight - clientHeight)) *
        (trackHeight - handleHeight)
      : 0;

  return (
    <>
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="relative">
        {/* Logs Tab */}
        <div
          className="absolute top-[-40px] text-center pt-[10px]"
          style={{
            width: "73px",
            height: "40px",
            background: "#BDBDBD",
            borderTop: "1px solid #5F5F5F",
            borderLeft: "1px solid #5F5F5F",
            borderRight: "1px solid #5F5F5F",
            fontSize: "16px",
            fontFamily: "IBM Plex Mono",
          }}
        >
          Logs
        </div>

        {/* Main Container */}
        <div
          className="relative w-[750px] bg-[#bdbdbd] border-[9px] border-[#bdbdbd]"
          style={{ height: "50vh" }}
        >
          {/* Content Area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="hide-scrollbar overflow-y-auto h-full pr-[25px]"
          >
            {children}
          </div>

          {/* Custom Scrollbar */}
          <div className="absolute right-[0px] top-[-0px] w-[20px] h-full bg-[#DFDFDF]">
            {/* Top Button */}
            <button
              onClick={scrollToTop}
              className="w-[20px] h-[20px] bg-[#BDBDBD] border-0 cursor-pointer flex items-center justify-center"
              style={{
                borderTop: "1px solid #A8A8A8",
                borderLeft: "1px solid #A8A8A8",
                borderRight: "1px solid #5F5F5F",
                borderBottom: "1px solid #5F5F5F",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8.66602 5.3335H7.33301V6.6665H8.66602V5.3335ZM7.33301 6.6665H6V7.99951H7.33301V6.6665ZM10 6.6665H8.66602V7.99951H10V6.6665ZM6 7.99951H4.66602V9.3335H6V7.99951ZM11.333 7.99951H10V9.3335H11.333V7.99951ZM4.66602 9.3335H3.33301V10.6665H4.66602V9.3335ZM12.666 9.3335H11.333V10.6665H12.666V9.3335Z"
                  fill="#222222"
                />
              </svg>
            </button>

            {/* Track */}
            <div
              className="relative flex-1"
              style={{ height: `${trackHeight}px` }}
            >
              {/* Handle */}
              <div
                className="absolute left-0 w-[20px] bg-[#BDBDBD]"
                style={{
                  height: `${handleHeight}px`,
                  transform: `translateY(${handleTop}px)`,
                  borderTop: "1px solid #A8A8A8",
                  borderLeft: "1px solid #A8A8A8",
                  borderRight: "1px solid #5F5F5F",
                  borderBottom: "1px solid #5F5F5F",
                  transition: "transform 0.1s ease",
                }}
              />
            </div>

            {/* Bottom Button */}
            <button
              onClick={scrollToBottom}
              className="w-[20px] h-[20px] bg-[#BDBDBD] border-0 cursor-pointer flex items-center justify-center"
              style={{
                borderTop: "1px solid #A8A8A8",
                borderLeft: "1px solid #A8A8A8",
                borderRight: "1px solid #5F5F5F",
                borderBottom: "1px solid #5F5F5F",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ transform: "rotate(180deg)" }}
              >
                <path
                  d="M8.66602 5.3335H7.33301V6.6665H8.66602V5.3335ZM7.33301 6.6665H6V7.99951H7.33301V6.6665ZM10 6.6665H8.66602V7.99951H10V6.6665ZM6 7.99951H4.66602V9.3335H6V7.99951ZM11.333 7.99951H10V9.3335H11.333V7.99951ZM4.66602 9.3335H3.33301V10.6665H4.66602V9.3335ZM12.666 9.3335H11.333V10.6665H12.666V9.3335Z"
                  fill="#222222"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScrollBar;
