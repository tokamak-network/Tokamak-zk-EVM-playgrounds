import logo from "../assets/images/logo.svg";
import { useModals } from "../hooks/useModals";

export default function Logo() {
  const { anyModalOpen } = useModals();
  return (
    <div
      className={`flex flex-col items-center justify-center h-[88px] ${
        anyModalOpen ? "opacity-50" : ""
      }`}
    >
      <img src={logo} alt="logo" />
    </div>
  );
}
