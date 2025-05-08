import React from "react";
import Background from "./components/Background";
import PipelineBG from "./components/PipelineBG";
import Logo from "./components/Logo";
import TransactionInputModal from "./components/modals/TransactionInputModal";
import ErrorModal from "./components/modals/ErrorModal";
const App: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Background />
      <Logo />
      <PipelineBG />
      <TransactionInputModal />
      <ErrorModal />
    </div>
  );
};

export default App;
