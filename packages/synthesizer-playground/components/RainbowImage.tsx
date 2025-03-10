import Image from 'next/image';
import Bani from "../assets/bani.svg"
import { useViewport } from "@/hooks/useMediaView";
export default function RainbowImage() {
  const { isOverBreakpoint } = useViewport();

  return (
    <div className='flex w-full h-[100px] relative overflow-hidden'> 
    <div 
      className={`w-full ${isOverBreakpoint ? 'h-[50px]' : 'h-[36px]'} z-[1000] top-[40px] absolute`} 
      style={{ 
        backgroundImage: "url('/assets/rainbow.svg')", 
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 100%",
        backgroundPosition: "center bottom",
        animation: "moveRainbow 6s linear"
      }}
    />
      <div className='absolute w-full h-[73px] z-[9999999] opacity-0'
           style={{
          animation: "moveBani 6s linear"
        }}
      >
        <Image src={Bani} alt="Rainbow"
          width={isOverBreakpoint ? 113 : 92} height={isOverBreakpoint ? 73 : 60} className={`absolute top-[25px] ${isOverBreakpoint ? 'right-[-95px]' : 'right-[-78px]'}`}
       
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