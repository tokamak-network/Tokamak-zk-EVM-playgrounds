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

const MainContent = () => {
  // Responsive design hook
  const { isOverBreakpoint } = useViewport();
  const isStarted = useAtomValue(isStartedAtom);

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

      <div className="flex flex-col justify-center items-center h-screen">
        {/* Main content area - can add new components here */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="flex flex-col justify-center items-center gap-y-[70px]">
            {/* Placeholder for main playground content */}
            <div style={{ textAlign: "center", color: "white" }}>
              <h1
                style={{
                  color: "#FFF",
                  textAlign: "center",
                  textShadow: "0 2px 0 #006CD8",
                  fontFamily: "'Jersey 10', cursive",
                  fontSize: "84px",
                  fontStyle: "normal",
                  fontWeight: "400",
                  lineHeight: "normal",
                  letterSpacing: "5.46px",
                }}
              >
                ZK Proofs. One Click.
              </h1>
              <h2
                style={{
                  color: "#57D2FF",
                  textAlign: "center",
                  textShadow: "0 6px 0 #0E3260",
                  fontFamily: "'Jersey 10', cursive",
                  fontSize: "156px",
                  fontStyle: "normal",
                  fontWeight: "400",
                  lineHeight: "normal",
                  letterSpacing: "10.92px",
                }}
              >
                Playground
              </h2>
            </div>
            <div className="flex justify-center items-center w-full h-[50px] ">
              {isStarted ? <TransactionInput /> : <MainBanner />}
            </div>
            <LoadingSpinner />
            <ProcessResult />
          </div>
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
