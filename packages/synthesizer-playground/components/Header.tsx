import Image from 'next/image';

type HeaderProps = {
  logo: string;
  onLogoClick: () => void;
  isResultsShown?: boolean;
};

const Header = ({ logo, onLogoClick, isResultsShown = false }: HeaderProps) => {
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
      
      <div className={`absolute left-1/2 -translate-x-1/2 ${isResultsShown ? 'top-[95px] w-[507px] h-[45px]' : 'top-[280px] w-[736px]'} text-center transition-all duration-300`}>
        <h1 
          className={`${isResultsShown ? 'text-[42px] leading-[42px]' : 'text-[96px] leading-[96px] -mt-[60px]'} font-jersey font-normal m-0 break-words text-[#FAFE00]`}
          style={{ 
            textShadow: '0px 2px 0px rgba(161, 117, 16, 1.00)'
          }}
        >
          Synthesizer{' '}
          <span 
            className="text-white"
          >
            Developer Playground
          </span>
        </h1>
      </div>
    </div>
  );
};

export default Header;