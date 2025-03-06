import Image from 'next/image';
import BG_IMAGE from '../assets/background.svg'

const Stars = () => {
  return (
    <div className='absolute flex bottom-0 left-0 w-full h-full justify-center items-end z-[-100]'>      
      <Image
        src={BG_IMAGE}
        alt="bg-image"
        className='w-full'
        style={{
          minHeight: '415px',
          maxHeight: '630px',
          objectFit: 'cover',
        }}
        priority
        />
    </div>
  );
};

export default Stars; 