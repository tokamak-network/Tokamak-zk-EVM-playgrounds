import { useViewport } from '@/hooks/useMediaView';
import Image from 'next/image';

type HeaderProps = {
  logo: string;
  onLogoClick: () => void;
  isResultsShown?: boolean;
};

const Header = ({ logo, onLogoClick, isResultsShown = false }: HeaderProps) => {
  const { isOverBreakpoint } = useViewport();
 
  return (
    <div>
      <div className="fixed top-[40px] left-[40px]">
        <Image
          src={logo}
          alt="Synthesizer Logo"
          width={isOverBreakpoint ? 334 : 248}
          height={isOverBreakpoint ? 29.1 : 20}
          className="cursor-pointer transition-all duration-200 hover:opacity-80"
          onClick={onLogoClick}
          priority
        />
      </div>
    </div>
  );
};

export default Header;