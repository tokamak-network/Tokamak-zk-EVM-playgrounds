import { useState, useEffect } from "react";

// Custom hook for responsive design breakpoints
export const useViewport = () => {
  const [isOverBreakpoint, setIsOverBreakpoint] = useState(true);

  useEffect(() => {
    const checkBreakpoint = () => {
      // Using 768px as the breakpoint (md in Tailwind)
      setIsOverBreakpoint(window.innerWidth >= 768);
    };

    // Check on mount
    checkBreakpoint();

    // Add event listener
    window.addEventListener("resize", checkBreakpoint);

    // Cleanup
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, []);

  return { isOverBreakpoint };
};
