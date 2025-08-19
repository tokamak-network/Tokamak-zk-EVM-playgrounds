import React from "react";
import Logo from "@/assets/logo.svg";

interface HeaderProps {
  isResultsShown?: boolean;
  isOverBreakpoint?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isOverBreakpoint = true }) => {
  const onLogoClick = () => window.location.reload();

  // Debug: log the logo import
  console.log("Header Logo:", Logo);

  return (
    <div>
      <div className="fixed top-[40px] left-[40px]">
        <img
          src={Logo}
          alt="Synthesizer Logo"
          width={isOverBreakpoint ? 334 : 248}
          height={isOverBreakpoint ? 29.1 : 20}
          className="cursor-pointer transition-all duration-200 hover:opacity-80"
          onClick={onLogoClick}
        />
      </div>
    </div>
  );
};

export default Header;
