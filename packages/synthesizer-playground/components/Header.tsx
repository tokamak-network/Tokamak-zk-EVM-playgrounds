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
        <h1 
          className="text-[96px] leading-[96px] -mt-[60px] font-jersey font-normal m-0 break-words" 
          style={{ 
            color: '#FAFE00',
            textShadow: '0px 2px 0px rgba(161, 117, 16, 1.00)'
          }}
        >
          Synthesizer
        </h1>
        <h2 
          className="text-[96px] leading-[96px] text-white font-jersey font-normal m-0 break-words" 
          style={{ 
            textShadow: '0px 2px 0px rgba(161, 117, 16, 1.00)'
          }}
        >
          Developer Playground
        </h2>
      </div>
    </div>
  );
};

export default Header;