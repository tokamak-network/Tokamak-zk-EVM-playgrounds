import tankFilled from "../../assets/images/tank-filled.png";

export default function FillingTank() {
  return (
    <div className="absolute max-w-full max-h-full object-contain top-[697px] right-[109px]">
      <img src={tankFilled} alt="result" />
    </div>
  );
}
