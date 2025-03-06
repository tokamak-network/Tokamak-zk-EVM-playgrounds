import { useState, useEffect } from "react";

type ViewportConfig = {
  minWidth?: number;
  minHeight?: number;
};

export const useViewport = ({ minWidth = 960, minHeight = 540 }: ViewportConfig = {}) => {
  const [requiredMinimumWidth, setRequiredMinimumWidth] = useState(false);
  const [requiredMinimumHeight, setRequiredMinimumHeight] = useState(false);
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const checkViewport = () => {
      setRequiredMinimumWidth(window.innerWidth > minWidth);
      setRequiredMinimumHeight(window.innerHeight > minHeight);
       setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Initial check
    checkViewport();

    // Add resize event listener
    window.addEventListener("resize", checkViewport);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkViewport);
    };
  }, [minWidth, minHeight]);
    
  const isViewportSatisfied = requiredMinimumWidth && requiredMinimumHeight;

  return { isViewportSatisfied , width: viewport.width, height: viewport.height};
};