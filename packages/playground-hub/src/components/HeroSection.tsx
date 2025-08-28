import { useUI } from "../hooks/useUI";
import { useViewport } from "../hooks/useMediaView";

const HeroSectionFirstTime = () => {
  const { isOverBreakpoint } = useViewport();
  return (
    <div
      className="flex flex-col gap-y-[24px]"
      style={{ textAlign: "center", color: "white" }}
    >
      <h1
        style={{
          color: "#FFF",
          textAlign: "center",
          textShadow: "0 2px 0 #006CD8",
          fontFamily: "'Jersey 10', cursive",
          fontSize: isOverBreakpoint ? "84px" : "56px",
          fontStyle: "normal",
          fontWeight: "400",
          letterSpacing: "5.46px",
          height: isOverBreakpoint ? "49px" : "30px",
          lineHeight: isOverBreakpoint ? "49px" : "30px",
        }}
      >
        ZK Proofs. One Click.
      </h1>
      <h2
        style={{
          color: "#57D2FF",
          textAlign: "center",
          textShadow: "0 6px 0 #0E3260",
          fontFamily: "'Jersey 10', cursive",
          fontSize: isOverBreakpoint ? "156px" : "103px",
          fontStyle: "normal",
          fontWeight: "400",
          letterSpacing: "10.92px",
          height: isOverBreakpoint ? "100px" : "62px",
          lineHeight: isOverBreakpoint ? "100px" : "62px",
          verticalAlign: "bottom",
        }}
      >
        Playground
      </h2>
    </div>
  );
};

const HeroSectionNotFirstTime = () => {
  const { isOverBreakpoint } = useViewport();
  return (
    <div
      style={{
        color: "#57D2FF",
        textAlign: "center",
        textShadow: "0 2px 0 #0E3260",
        fontFamily: "Jersey 10",
        fontSize: isOverBreakpoint ? "50px" : "36px",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: "normal",
        letterSpacing: "1px",
      }}
    >
      Turn your transaction into a ZK Proof
    </div>
  );
};

export default function HeroSection() {
  const { isFirstTime } = useUI();

  if (isFirstTime) return <HeroSectionFirstTime />;

  return <HeroSectionNotFirstTime />;
}
