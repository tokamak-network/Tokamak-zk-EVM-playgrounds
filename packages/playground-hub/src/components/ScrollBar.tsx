import { ReactNode, useRef, useState, useEffect } from "react";
import { useViewport } from "../hooks/useMediaView";

interface ScrollBarProps {
  children: ReactNode;
}

const ScrollBar = ({ children }: ScrollBarProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const { height } = useViewport();

  // Update scroll dimensions when children change or component mounts
  useEffect(() => {
    const updateScrollDimensions = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setScrollHeight(container.scrollHeight);
        setClientHeight(container.clientHeight);
        setScrollTop(container.scrollTop);
      }
    };

    // Initial calculation with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateScrollDimensions, 0);

    // Set up ResizeObserver to watch for content changes
    const container = scrollContainerRef.current;
    let resizeObserver: ResizeObserver | null = null;

    if (container) {
      resizeObserver = new ResizeObserver(() => {
        updateScrollDimensions();
      });
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(timeoutId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [children]);

  // Additional effect to ensure initial state is set correctly on mount
  useEffect(() => {
    const updateInitialState = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setScrollHeight(container.scrollHeight);
        setClientHeight(container.clientHeight);
        setScrollTop(container.scrollTop);
      }
    };

    // Use requestAnimationFrame to ensure DOM is fully rendered
    const rafId = requestAnimationFrame(() => {
      updateInitialState();
      // Double-check after a short delay in case content is still loading
      setTimeout(updateInitialState, 100);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []); // Empty dependency array - only run on mount

  // Calculate maximum height based on viewport height
  useEffect(() => {
    const calculateMaxHeight = () => {
      // Use minHeight from useViewport (768px) as the baseline for 40vh
      const minWindowHeight = 768; // minHeight from useViewport
      const maxWindowHeight = 1200; // Maximum height for 60vh
      const minVh = 40;
      const maxVh = 75; // Increased from 60vh to 75vh to allow more content

      const clampedHeight = Math.max(
        minWindowHeight,
        Math.min(maxWindowHeight, height)
      );
      const ratio =
        (clampedHeight - minWindowHeight) / (maxWindowHeight - minWindowHeight);
      const calculatedVh = minVh + ratio * (maxVh - minVh);

      // Convert vh to pixels for max height calculation
      const maxHeightPx = (calculatedVh / 100) * height;
      setMaxHeight(maxHeightPx);
    };

    // Calculate when height changes
    calculateMaxHeight();
  }, [height]);

  // Calculate maximum height for overflow situations
  const getMaxHeight = () => {
    // Calculate available space more intelligently
    // Consider the space taken by buttons (46px) and margins/gaps (around 64px total)
    const buttonHeight = 46;
    const marginsAndGaps = 64; // Approximate space for margins and gaps
    const tabHeight = 40; // Height of the "Logs" tab
    const availableHeight = height - buttonHeight - marginsAndGaps - tabHeight;

    // Use the smaller of calculated max height or available viewport height
    const effectiveMaxHeight = Math.min(maxHeight, availableHeight);

    return effectiveMaxHeight;
  };

  // Get container style based on whether scrolling is needed
  const getContainerStyle = () => {
    const maxHeightPx = getMaxHeight();

    if (isScrollbarNeeded) {
      // When scrollbar is needed, use fixed height to prevent overflow
      return {
        height: `${maxHeightPx}px`,
        maxHeight: `${maxHeightPx}px`,
        borderBottom: "1px solid #5F5F5F",
        borderLeft: "1px solid #5F5F5F",
        borderRight: "1px solid #5F5F5F",
      };
    } else {
      // When no scrollbar needed, allow natural height with max limit
      return {
        height: "auto",
        maxHeight: `${maxHeightPx}px`,
        borderBottom: "1px solid #5F5F5F",
        borderLeft: "1px solid #5F5F5F",
        borderRight: "1px solid #5F5F5F",
      };
    }
  };

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

  // Check if scrollbar is needed - ensure both values are properly initialized
  // Also consider if content height exceeds the effective available space
  const isScrollbarNeeded =
    scrollHeight > 0 && clientHeight > 0 && scrollHeight > clientHeight;

  // Calculate scrollbar handle position and size
  const actualTrackHeight = clientHeight > 40 ? clientHeight - 40 : 200; // Subtract button heights
  const trackHeight = actualTrackHeight;
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
          className="absolute top-[-40px] text-center pt-[10px] left-[0px]"
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
          className="relative w-[790px] bg-[#bdbdbd] border-[1px] border-[#bdbdbd] p-[8px]"
          style={getContainerStyle()}
        >
          {/* Content Area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={`hide-scrollbar overflow-y-auto ${isScrollbarNeeded ? "pr-[25px]" : "pr-[8px]"}`}
            style={{
              height: "100%", // Take full height of parent container
              maxHeight: "inherit", // Inherit max height from parent
            }}
          >
            {children}
          </div>

          {/* Custom Scrollbar - Only show when needed */}
          {isScrollbarNeeded && (
            <div
              className="absolute right-[12px] top-[8px] w-[20px] bg-[#DFDFDF]"
              style={{ height: "calc(100% - 8px)" }}
            >
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
              <div className="relative" style={{ height: `calc(100% - 40px)` }}>
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
          )}
        </div>
      </div>
    </>
  );
};

export default ScrollBar;
