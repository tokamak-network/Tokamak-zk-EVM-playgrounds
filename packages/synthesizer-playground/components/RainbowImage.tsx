import Image from 'next/image';
import Bani from "../assets/bani.svg"
import { useViewport } from "@/hooks/useMediaView";
import { useAnimation } from '@/context/AnimationContext';

export default function RainbowImage() {
  const { isOverBreakpoint } = useViewport();
  const { animationKey } = useAnimation();

  return (
    <div className={`flex w-full ${isOverBreakpoint ? 'h-[75px]' : 'h-[63px]'} relative overflow-hidden `}> 
      
    <div 
        className={`absolute w-full ${isOverBreakpoint ? 'h-[50px]' : 'h-[36px]'} z-[1000] bottom-[11px]
        '} 
      `} 
      style={{ 
        backgroundImage: "url('/assets/rainbow.svg')", 
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 100%",
        backgroundPosition: "center bottom",
        animation: "moveRainbow 6s linear"
        }}
        key={animationKey}
      
      />
      <div className={`absolute w-full ${isOverBreakpoint ? 'h-[75px]' : 'h-[63px]'} z-[9999999] opacity-0`}
           style={{
          animation: "moveBani 6s linear"
        }}
        key={animationKey+1}
      >
        <Image src={Bani} alt="Rainbow"
          width={isOverBreakpoint ? 113 : 92} height={isOverBreakpoint ? 73 : 60} className={`absolute bottom-[6px] ${isOverBreakpoint ? 'right-[-95px]' : 'right-[-78px]'}`}
          />
      </div>
       <style jsx>{`
      @keyframes moveRainbow {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0%);  
          }
        }
            @keyframes moveBani {
          0% {
            transform: translateX(-100%);
            opacity: 1
          }
          99% {
            opacity: 1
          }
          100% {
            transform: translateX(0%);
            opacity: 0;  
          }
        }
      `}</style>
      </div>
  );
} 