import handle from "../assets/images/handle.svg";
import handleGreen from "../assets/images/handle-green.svg";
import handlePink from "../assets/images/handle-pink.svg";

export default function Handle(props: {
  type: "orange" | "green" | "pink";
  className?: string;
}) {
  const { type, className } = props;
  const handleImage =
    type === "orange" ? handle : type === "green" ? handleGreen : handlePink;

  return (
    <img src={handleImage} alt="handle" className={`absolute ${className}`} />
  );
}
