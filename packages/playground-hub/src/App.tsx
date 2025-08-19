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

      <div
        style={{
          display: "flex",
          flex: "1",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "35px",
        }}
      >
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
          {/* Placeholder for main playground content */}
          <div style={{ textAlign: "center", color: "white" }}>
            <h1
              style={{
                fontSize: "2.25rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: "white",
                fontFamily: "'Jersey 10', cursive",
              }}
            >
              ZK Proofs. One Click.
            </h1>
            <p
              style={{
                fontSize: "1.125rem",
                marginBottom: "1rem",
                color: "white",
                opacity: "0.8",
                fontFamily: "'Jersey 10', cursive",
              }}
            >
              Ready for development
            </p>
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
