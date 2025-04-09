import Pipelines from "../Pipelines";
import pipeline from "../../assets/images/pipe.png";

export default function EvmToQAP() {
  return (
    <div className="absolute w-full h-full">
      {/* 기본 파이프라인 이미지 (배경) */}
      <img
        src={pipeline}
        alt="pipeline-bg"
        className="absolute max-w-full max-h-full object-contain"
      />

      <Pipelines
        id="section1"
        autoFill={true}
        animationDuration={1000}
        startX={65}
        startY={0}
        endX={75}
        endY={90}
        direction="vertical"
        persistent={true}
        onFillComplete={() => console.log("Section 1 filled")}
      />
      <Pipelines
        id="section2"
        autoFill={true}
        animationDuration={1800}
        startX={60}
        startY={92}
        endX={400}
        endY={92}
        direction="horizontal"
        persistent={true}
        delay={350}
        onFillComplete={() => console.log("Section 2 filled")}
      />
      <Pipelines
        id="section3"
        autoFill={true}
        animationDuration={1000}
        startX={363}
        startY={88}
        endX={360}
        endY={210}
        direction="vertical"
        persistent={true}
        delay={1300}
        onFillComplete={() => console.log("Section 3 filled")}
      />
      <Pipelines
        id="section4"
        autoFill={true}
        animationDuration={1300}
        startX={368}
        startY={215}
        endX={150}
        endY={215}
        direction="horizontal"
        persistent={true}
        delay={1800}
        onFillComplete={() => console.log("Section 4 filled")}
      />
      <Pipelines
        id="section5"
        autoFill={true}
        animationDuration={1000}
        startX={190}
        startY={215}
        endX={190}
        endY={100}
        direction="vertical"
        persistent={true}
        delay={2500}
        onFillComplete={() => console.log("Section 5 filled")}
      />
      <Pipelines
        id="section6"
        autoFill={true}
        animationDuration={800}
        startX={180}
        startY={160}
        endX={100}
        endY={160}
        direction="horizontal"
        persistent={true}
        delay={2830}
        onFillComplete={() => console.log("Section 6 filled")}
      />
      <Pipelines
        id="section7"
        autoFill={true}
        animationDuration={1000}
        startX={120}
        startY={175}
        endX={120}
        endY={215}
        direction="vertical"
        persistent={true}
        delay={3070}
        onFillComplete={() => console.log("Section 7 filled")}
      />
      <Pipelines
        id="section8"
        autoFill={true}
        animationDuration={1000}
        startX={120}
        startY={218}
        endX={30}
        endY={218}
        direction="horizontal"
        persistent={true}
        delay={3100}
        onFillComplete={() => console.log("Section 8filled")}
      />
      <Pipelines
        id="section9"
        autoFill={true}
        animationDuration={1000}
        startX={25}
        startY={215}
        endX={20}
        endY={285}
        direction="vertical"
        persistent={true}
        delay={3600}
        onFillComplete={() => console.log("Section 9 filled")}
      />
    </div>
  );
}
