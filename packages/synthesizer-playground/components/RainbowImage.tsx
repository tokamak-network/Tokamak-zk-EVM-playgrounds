import Image from 'next/image';
import Bani from "../assets/bani.svg"

export default function RainbowImage() {
 
  return (
    <div className='flex w-full h-[100px] relative overflow-hidden'> 
    <div 
      className="w-full h-[50px] z-[1000] top-[40px] absolute" 
      style={{ 
        backgroundImage: "url('/assets/rainbow.svg')", 
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 100%",
        backgroundPosition: "center bottom",
        animation: "moveRainbow 4s linear"
      }}
    />
      <div className='absolute w-full h-[73px]'
           style={{
          animation: "moveBani 4s linear"
        }}
      >
        <Image src={Bani} alt="Rainbow"
          width={113} height={73} className='absolute top-[25px] right-[-113px]'
       
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
          from {
            transform: translateX(-100%);
           
          }
          to {
            transform: translateX(0%);  
          }
        }
      `}</style>
      </div>
  );
} 