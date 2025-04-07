import React from "react";
import Background from "./components/Background";
import PipelineBG from "./components/PipelineBG";

const App: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Background />
      <PipelineBG />
    </div>
  );
};

export default App;
