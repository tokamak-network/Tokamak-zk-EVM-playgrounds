import Image from 'next/image';

type HeaderProps = {
  logo: string;
  onLogoClick: () => void;
};

const Header = ({ logo, onLogoClick }: HeaderProps) => {
  return (
    <div>
      <div className="fixed top-[40px] left-[40px]">
        <Image
          src={logo}
          alt="Synthesizer Logo"
          width={334}
          height={29.1}
          className="cursor-pointer transition-all duration-200 hover:opacity-80"
          onClick={onLogoClick}
          priority
        />
      </div>
      
      <div className="absolute z-[2] top-[280px] left-1/2 -translate-x-1/2 w-[736px]">
        <h1 className="text-[96px] leading-[60px] -mt-[60px] text-yellow-400 font-jersey m-0" style={{ textShadow: '0 1px 0 #a17510, 0 2px 0 #a17510' }}>
          Synthesizer
        </h1>
        <h2 className="text-[96px] leading-[60px] m-0 text-white font-jersey" style={{ textShadow: '0 1px 0 #a17510, 0 2px 0 #a17510' }}>
          Developer Playground
        </h2>
      </div>
    </div>
  );
};

export default Header;