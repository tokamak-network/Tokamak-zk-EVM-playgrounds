import { useState } from "react";
import handleOrange from "../assets/images/handles/handle-orange.png";
import handleGreen from "../assets/images/handles/handle-green.png";
import handlePink from "../assets/images/handles/handle-pink.png";
import handleInactive from "../assets/images/handles/handle-inactive.svg";
import { usePipelineAnimation } from "../hooks/usePipelineAnimation";

export default function Handle(props: {
  type: "orange" | "green" | "pink";
  className?: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  const { type, className, onClick, isActive } = props;
  const handleImage = !isActive
    ? handleInactive
    : type === "orange"
      ? handleOrange
      : type === "green"
        ? handleGreen
        : handlePink;

  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { isAnimationRunning } = usePipelineAnimation();

  const handleClick = () => {
    if (isAnimating) return; // 이미 애니메이션 중이면 무시

    setIsAnimating(true);
    setRotation((prev) => prev + 360); // 항상 360도 추가

    // 애니메이션 완료 후 상태 초기화 (1초 후)
    setTimeout(() => {
      setIsAnimating(false);
      // 부모 컴포넌트에서 전달된 onClick 핸들러 호출
      if (onClick) onClick();
    }, 1000);
  };

  return (
    <img
      src={handleImage}
      alt="handle"
      className={`
        absolute 
        ${className} 
         ${!isActive || isAnimationRunning ? "cursor-not-allowed" : "cursor-pointer"}
        transition-transform duration-2000 ease-in-out
        z-[100] 
      `}
      style={{ transform: `rotate(${rotation}deg)` }}
      onClick={isActive && !isAnimationRunning ? handleClick : undefined}
    />
  );
}
