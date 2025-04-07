import React from "react";
import cloudSkyblue from "../assets/images/cloud-skyblue.svg";
import cloudBlue from "../assets/images/cloud-blue.svg";
import blueRain from "../assets/images/rain-blue.svg";

interface CloudWithRainProps {
  position: string;
  cloudType?: "blue" | "skyblue";
  showRain?: boolean;
  rainOffset?: string;
}

export default function CloudWithRain({
  position,
  cloudType = "skyblue",
  showRain = true,
  rainOffset = "top-[35px] ml-[10px]",
}: CloudWithRainProps) {
  const cloudImage = cloudType === "blue" ? cloudBlue : cloudSkyblue;
  const rainStyle = {
    animation: "rainDrop 2s linear infinite",
  };
  const rainStyle2 = {
    animation: "rainDrop2 2s linear infinite",
  };
  const rainStyle3 = {
    animation: "rainDrop3 2s linear infinite",
  };

  return (
    <div className={`absolute ${position} `}>
      <img
        src={cloudImage}
        alt={`cloud-${cloudType}`}
        className="max-w-full max-h-full object-contain"
      />
      {showRain && (
        <div className={`absolute ${rainOffset}`}>
          <img
            src={blueRain}
            alt="blue-rain"
            className="w-full h-full animate-rain"
            style={rainStyle}
          />
          <img
            src={blueRain}
            alt="blue-rain"
            className="w-full h-full animate-rain"
            style={rainStyle2}
          />
          <img
            src={blueRain}
            alt="blue-rain"
            className="w-full h-full animate-rain"
            style={rainStyle3}
          />
        </div>
      )}
    </div>
  );
}
