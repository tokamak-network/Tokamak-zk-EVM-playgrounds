import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AnimationProvider } from "@/context/AnimationContext";
import { useViewport } from "@/hooks/useMediaView";
import Stars from "@/components/Stars";
import Header from "@/components/Header";
import RainbowImage from "@/components/RainbowImage";

const MainContent = () => {
  // Responsive design hook
  const { isOverBreakpoint } = useViewport();

  return (
    <div
      className="flex flex-col justify-center items-center h-screen overflow-auto pt-[75px] relative"
      style={{
        background: "linear-gradient(179.38deg, #000306, #003466)",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* Background stars component */}
      <Stars isOverBreakpoint={isOverBreakpoint} />

      {/* Header with logo */}
      <Header isOverBreakpoint={isOverBreakpoint} />

      <div className="flex flex-1 flex-col justify-center items-center gap-y-[35px]">
        {/* Main content area - can add new components here */}
        <div className="w-full h-full flex flex-col items-center justify-center">
          {/* Placeholder for main playground content */}
          <div className="text-white text-center">
            <h1 className="text-4xl font-bold mb-4 font-jersey">
              Tokamak ZK-EVM Playground
            </h1>
            <p className="text-lg opacity-80 font-jersey">
              Ready for development
            </p>
          </div>
        </div>
      </div>

      {/* Rainbow animation at bottom */}
      <div className="w-full mb-[8px]">
        <RainbowImage isOverBreakpoint={isOverBreakpoint} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AnimationProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainContent />} />
        </Routes>
      </HashRouter>
    </AnimationProvider>
  );
};

export default App;
