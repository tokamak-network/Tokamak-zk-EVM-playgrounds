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
    </div>
  );
};

export default Header;