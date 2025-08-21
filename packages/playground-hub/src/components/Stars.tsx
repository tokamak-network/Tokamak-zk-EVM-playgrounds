import React from "react";

// Import star/background images using path aliases
import ICON_1 from "@/assets/background_images/Brightness Low.svg";
import ICON_2 from "@/assets/background_images/Ellipses Horizontal.svg";
import ICON_4 from "@/assets/background_images/Spinner2.svg";
import ICON_5 from "@/assets/background_images/Vector.svg";
import ICON_6 from "@/assets/background_images/Vector2.svg";
import ICON_7 from "@/assets/background_images/Vector3.svg";

interface StarsProps {
  isOverBreakpoint?: boolean;
}

const Stars: React.FC<StarsProps> = ({ isOverBreakpoint = true }) => {
  return (
    <div
      className={`absolute flex w-full ${isOverBreakpoint ? "h-[624px]" : "h-[416px]"}  justify-center items-end z-[1]] px-[38px] bottom-[0px]`}
    >
      <div className="relative w-full h-full">
        <img
          src={ICON_1}
          alt="bg-image"
          className="absolute animate-twinkle"
          style={{
            width: "32px",
            height: "32px",
            top: "0%",
            left: "0%",
          }}
        />
        <img
          src={ICON_2}
          alt="bg-image"
          className="absolute animate-twinkle"
          style={{
            width: "24px",
            height: "24px",
            top: "144px",
            left: "4%",
          }}
        />
        <img
          src={ICON_5}
          alt="bg-image"
          className="absolute animate-twinkle"
          style={{
            width: "16px",
            height: "16px",
            top: "245px",
            left: "13%",
          }}
        />
        <img
          src={ICON_6}
          alt="bg-image"
          className="absolute animate-twinkle"
          style={{
            width: "24px",
            height: "24px",
            top: "385px",
            left: "1.4%",
          }}
        />
        <img
          src={ICON_4}
          alt="bg-image"
          className="absolute animate-twinkle"
          style={{
            width: "24px",
            height: "24px",
            top: "427px",
            left: "10.8%",
          }}
        />
        <img
          src={ICON_7}
          alt="bg-image"
          className="absolute animate-twinkle"
          style={{
            width: "12px",
            height: "12px",
            top: "20px",
            right: "9.2%",
          }}
        />
        <img
          src={ICON_2}
          alt="bg-image"
          className="absolute animate-twinkle"
          style={{
            width: "24px",
            height: "24px",
            top: "95px",
            right: "0%",
          }}
        />
        <img
          src={ICON_4}
          alt="bg-image"
          className="absolute animate-twinkle"
          style={{
            width: "24px",
            height: "24px",
            top: "195px",
            right: "8.6%",
          }}
        />
        <img
          src={ICON_6}
          alt="bg-image"
          className="absolute animate-twinkle"
          style={{
            width: "16px",
            height: "16px",
            top: "320px",
            right: "17.1%",
          }}
        />
        <img
          src={ICON_1}
          alt="bg-image"
          className="absolute animate-twinkle"
          style={{
            width: "32px",
            height: "32px",
            top: "369px",
            right: "1.5%",
          }}
        />
        <img
          src={ICON_2}
          alt="bg-image"
          className="absolute animate-twinkle"
          style={{
            width: "24px",
            height: "24px",
            top: "478px",
            right: "20.4%",
          }}
        />
        <img
          src={ICON_4}
          alt="bg-image"
          className="absolute animate-twinkle"
          style={{
            width: "24px",
            height: "24px",
            bottom: "0%",
            right: "14.5%",
          }}
        />
        <style>{`
          @keyframes twinkle {
            0% {
              opacity: 1;
            }
            25% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.7;
            }
            75% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
          }
          
          .animate-twinkle {
            animation: twinkle 4s infinite ease-in-out;
          }

          .animate-twinkle:nth-child(1) { animation-delay: 0.0s; }
          .animate-twinkle:nth-child(2) { animation-delay: 0.3s; }
          .animate-twinkle:nth-child(3) { animation-delay: 0.6s; }
          .animate-twinkle:nth-child(4) { animation-delay: 0.9s; }
          .animate-twinkle:nth-child(5) { animation-delay: 1.2s; }
          .animate-twinkle:nth-child(6) { animation-delay: 1.5s; }
          .animate-twinkle:nth-child(7) { animation-delay: 1.8s; }
          .animate-twinkle:nth-child(8) { animation-delay: 2.1s; }
          .animate-twinkle:nth-child(9) { animation-delay: 2.4s; }
          .animate-twinkle:nth-child(10) { animation-delay: 2.7s; }
          .animate-twinkle:nth-child(11) { animation-delay: 3.0s; }
          .animate-twinkle:nth-child(12) { animation-delay: 3.3s; }
        `}</style>
      </div>
    </div>
  );
};

export default Stars;
