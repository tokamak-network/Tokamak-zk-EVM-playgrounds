import Image from 'next/image';

type HeaderProps = {
  logo: string;
  onLogoClick: () => void;
};

const Header = ({ logo, onLogoClick }: HeaderProps) => {
  return (
    <div>
      <div className="fixed top-10 left-10 w-[334px] h-[29.1px]">
        <Image
          src="/assets/logo.svg"
          alt="Synthesizer Logo"
          width={334}
          height={29}
          className="cursor-pointer transition-all duration-200 ease-in-out hover:opacity-80"
          onClick={onLogoClick}
        />
      </div>
      <div className="absolute z-10 top-[280px] left-1/2 -translate-x-1/2 w-[736px]">
        <h1 className="text-[96px] leading-[60px] -mt-[60px] text-yellow-400 font-jersey drop-shadow-[0_1px_0_#a17510,0_2px_0_#a17510]">
          Synthesizer
        </h1>
        <h2 className="text-[96px] leading-[60px] m-0 text-white font-jersey drop-shadow-[0_1px_0_#a17510,0_2px_0_#a17510]">
          Developer Playground
        </h2>
      </div>
    </div>
  );
};

export default Header; 