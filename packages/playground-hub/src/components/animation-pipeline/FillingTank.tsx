import tankFilled from "../../assets/images/tank-filled.png";

export default function FillingTank() {
  return (
    <div className="absolute max-w-full max-h-full object-contain top-[696px] right-[110px]">
      <img src={tankFilled} alt="result" />
    </div>
  );
}
