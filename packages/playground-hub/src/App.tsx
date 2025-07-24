import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Background from "./components/Background";
import PipelineBG from "./components/PipelineBG";
import Logo from "./components/Logo";
import Settings from "./pages/Settings";
import PlaygroundModals from "./components/modals";
import CudaStatus from "./components/CudaStatus";
import { useDocker } from "./hooks/useDocker";

const MainContent = () => {
  // Docker 상태를 지속적으로 모니터링하기 위해 useDocker 훅 호출
  useDocker();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Background />
      <Logo />
      <PipelineBG />
      <PlaygroundModals />
      {/* <CudaStatus /> */}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
