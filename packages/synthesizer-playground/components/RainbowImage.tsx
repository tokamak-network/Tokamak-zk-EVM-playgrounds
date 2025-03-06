import Image from 'next/image';
import Bani from "../assets/bani.svg"

export default function RainbowImage() {
 
  return (
    <div className='flex w-full'
      style={{
        animation: "moveOnce 5s"
    }}
    > 
    <div 
      className="w-full h-[50px] z-[1000]" 
      style={{ 
        backgroundImage: "url('/assets/rainbow.svg')", 
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 100%",
        backgroundPosition: "center bottom",
        // animation: "moveOnce 10s"
      }}
    />
      <div className='absolute w-full h-[73px]'
        style={{
          // animation: "moveBani 10s"
        }}
      >
        <Image src={Bani} alt="Rainbow"
          width={113} height={73} className='absolute top-[-10px] right-[-113px]' />
      </div>
       <style jsx>{`
        @keyframes moveOnce {
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
             display: block;
          }
          100% {
            transform: translateX(0%);
            display: none;
          }
      `}</style>
      </div>
  );
} 