import Image from 'next/image';

const RainbowImage = () => {
  return (
    <Image
      src="/assets/rainbow.svg"
      alt=""
      width={1920}
      height={1080}
      className="fixed bottom-[44px] left-0 w-full max-w-full object-contain z-[1000] pointer-events-none"
    />
  );
};

export default RainbowImage; 