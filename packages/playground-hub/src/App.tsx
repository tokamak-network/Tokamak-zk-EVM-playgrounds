import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import Background from "./components/Background";
import PipelineBG from "./components/PipelineBG";
import Logo from "./components/Logo";
import TransactionInputModal from "./components/modals/TransactionInputModal";
import ErrorModal from "./components/modals/ErrorModal";
import Settings from "./pages/Settings";
import DockerModal from "./components/modals/DockerModal";
import ExitModal from "./components/modals/ExitModal";
import LoadingModal from "./components/modals/LoadingModal";
import SynthesizerError from "./components/modals/SynthesizerError";

const MainContent = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Background />
      <Logo />
      <PipelineBG />
      <TransactionInputModal />
      <DockerModal />
      <ErrorModal />
      <ExitModal />
      <LoadingModal />
      <SynthesizerError />
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
