import logo from "../assets/images/logo.png";

export default function Logo() {
  return (
    <div className="flex flex-col items-center justify-center h-[88px]">
      <img src={logo} alt="logo" />
    </div>
  );
}
