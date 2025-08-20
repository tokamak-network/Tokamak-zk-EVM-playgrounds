import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AnimationProvider } from "@/context/AnimationContext";
import { useViewport } from "@/hooks/useMediaView";
import Stars from "@/components/Stars";
import Header from "@/components/Header";
import RainbowImage from "@/components/RainbowImage";
import MainBanner from "@/components/MainBanner";
import TransactionInput from "@/components/TransactionInput";
import { useAtomValue } from "jotai";
import { isStartedAtom } from "./atoms/ui";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProcessResult from "./components/ProcessResult";
import HeroSection from "./components/HeroSection";
import { useUI } from "./hooks/useUI";

const MainContent = () => {
  // Responsive design hook
  const { isOverBreakpoint } = useViewport();
  const isStarted = useAtomValue(isStartedAtom);
  const { isInProcess, isFirstTime } = useUI();

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
      <div
        className={`flex flex-col ${
          !isFirstTime ? "justify-start" : "justify-center"
        } items-center h-screen ${!isFirstTime ? "gap-y-[70px]" : "gap-y-[32px]"} pt-[47px]`}
      >
        <HeroSection />
        <div className={`flex justify-center items-center w-full h-[50px]`}>
          {isStarted ? <TransactionInput /> : <MainBanner />}
        </div>
        <div
          className={`flex flex-col justify-center items-center ${
            isInProcess && !isFirstTime ? "h-full" : ""
          }`}
        >
          <LoadingSpinner />
          <ProcessResult />
        </div>
      </div>

      {/* Rainbow animation at bottom */}
      <div style={{ width: "100%", marginBottom: "8px" }}>
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
