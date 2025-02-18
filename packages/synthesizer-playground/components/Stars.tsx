import Image from 'next/image';

const Stars = () => {
  return (
    <Image
      src="/src/assets/Stars.svg"
      alt=""
      width={1920}
      height={1080}
      className="fixed bottom-0 left-0 w-full max-w-full object-contain z-[1000] pointer-events-none"
    />
  );
};

export default Stars; 