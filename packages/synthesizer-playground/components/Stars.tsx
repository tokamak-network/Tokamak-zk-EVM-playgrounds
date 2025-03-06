import Image from 'next/image';
import BG_IMAGE from '../assets/background.svg'

const Stars = () => {
  return (
    <div className='absolute flex bottom-0 left-0 w-full h-full justify-center items-end z-[-100]'>      
      <Image
        src={BG_IMAGE}
        alt="bg-image"
        className='w-full animate-twinkle'
        style={{
          minHeight: '415px',
          maxHeight: '630px',
          objectFit: 'cover',
        }}
        priority
      />
        <style jsx global>{`
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
      `}</style>
    </div>
  );
};

export default Stars; 