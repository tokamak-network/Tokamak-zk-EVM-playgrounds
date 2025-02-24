import Image from 'next/image';

type HeaderProps = {
  logo: string;
  onLogoClick: () => void;
};

const Header = ({ logo, onLogoClick }: HeaderProps) => {
  return (
    <div>
      <div className="fixed top-10 left-10">
        <Image
          src={logo}
          alt="Synthesizer Logo"
          width={334}
          height={29}
          className="cursor-pointer transition-opacity duration-200 hover:opacity-80"
          onClick={onLogoClick}
          priority
        />
      </div>
      
      <div className="absolute z-10 top-[280px] left-1/2 -translate-x-1/2 w-[736px]">
        <h1 className="text-[96px] leading-[60px] -mt-[60px] text-yellow-400 font-jersey shadow-title">
          Synthesizer
        </h1>
        <h2 className="text-[96px] leading-[60px] m-0 text-white font-jersey shadow-title">
          Developer Playground
        </h2>
      </div>
    </div>
  );
};

export default Header;