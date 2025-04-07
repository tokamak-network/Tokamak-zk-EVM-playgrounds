import React from "react";

const App: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-2xl font-bold text-blue-600">
        Hello Electron + React + Tailwind!
      </h1>
      <p className="mt-2">
        This is your Electron application with React and Tailwind CSS.
      </p>
      <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Click me
      </button>
    </div>
  );
};

export default App;
