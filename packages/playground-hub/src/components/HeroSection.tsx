import { useAtomValue } from "jotai";
import { isFirstTimeAtom } from "../atoms/ui";

const HeroSectionFirstTime = () => {
  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h1
        style={{
          color: "#FFF",
          textAlign: "center",
          textShadow: "0 2px 0 #006CD8",
          fontFamily: "'Jersey 10', cursive",
          fontSize: "84px",
          fontStyle: "normal",
          fontWeight: "400",
          lineHeight: "normal",
          letterSpacing: "5.46px",
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
          fontSize: "156px",
          fontStyle: "normal",
          fontWeight: "400",
          lineHeight: "normal",
          letterSpacing: "10.92px",
        }}
      >
        Playground
      </h2>
    </div>
  );
};

const HeroSectionNotFirstTime = () => {
  return (
    <div
      style={{
        color: "#57D2FF",
        textAlign: "center",
        textShadow: "0 2px 0 #0E3260",
        fontFamily: "Jersey 10",
        fontSize: "50px",
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
  const isFirstTime = useAtomValue(isFirstTimeAtom);

  if (isFirstTime) return <HeroSectionFirstTime />;

  return <HeroSectionNotFirstTime />;
}
