import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AnimationProvider } from "@/context/AnimationContext";
import { useViewport } from "@/hooks/useMediaView";
import Stars from "@/components/Stars";
import Header from "@/components/Header";
import RainbowImage from "@/components/RainbowImage";
import MainBanner from "@/components/MainBanner";
import TransactionInput from "@/components/TransactionInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProcessResult from "./components/ProcessResult";
import HeroSection from "./components/HeroSection";
import { useUI } from "./hooks/useUI";
import { WSLInstallModal } from "./components/modals";

const MainContent = () => {
  // Responsive design hook
  const { isOverBreakpoint } = useViewport();
  const { isInProcess, isFirstTime, isHeroUp, isStarted } = useUI();

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
        } items-center h-screen ${!isHeroUp ? "gap-y-[70px]" : "gap-y-[20px]"} pt-[47px] ${isHeroUp ? "w-[792px]" : "w-[89%] max-w-[996px]"}`}
      >
        <HeroSection />
        <div
          className={`flex justify-center items-center w-full h-[50px] ${
            isHeroUp ? "mt-[0px]" : isStarted ? "mt-[20px]" : "mt-[70px]"
          }`}
        >
          {isStarted ? <TransactionInput /> : <MainBanner />}
        </div>
        <div
          className={`flex flex-col justify-center items-center ${isInProcess && isFirstTime ? "mt-[2`3px]" : ""} ${
            isInProcess && !isFirstTime ? "h-full" : ""
          } ${isHeroUp ? "h-full" : ""}`}
        >
          <LoadingSpinner />
          <ProcessResult />
        </div>
        <WSLInstallModal
          isOpen={true}
          onClose={() => {}}
          onInstall={() => {}}
        />
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
