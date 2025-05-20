import { useState } from "react";
import handle from "../assets/images/handle.svg";
import handleGreen from "../assets/images/handle-green.svg";
import handlePink from "../assets/images/handle-pink.png";

export default function Handle(props: {
  type: "orange" | "green" | "pink";
  className?: string;
  onClick?: () => void;
}) {
  const { type, className, onClick } = props;
  const handleImage =
    type === "orange" ? handle : type === "green" ? handleGreen : handlePink;

  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
        cursor-pointer
        transition-transform duration-2000 ease-in-out
        z-[100]
      `}
      style={{ transform: `rotate(${rotation}deg)` }}
      onClick={handleClick}
    />
  );
}
