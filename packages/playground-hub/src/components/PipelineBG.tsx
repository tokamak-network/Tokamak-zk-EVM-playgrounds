import outlinePipeline from "../assets/images/outline-pipe.png";
import smallPipeline from "../assets/images/small-pipe.png";
import pipeline from "../assets/images/pipe.png";
import tank from "../assets/images/tank.png";
import CloudWithRain from "./CloudWithRain";
import Handle from "./Handle";
import Bubbles from "./Bubble";
import "../styles/pipelineAnimation.css";
import PixelatedPipeline from "./PixelatedPipeline";
import PixelFlow from "./PixelFlow";
import Pipelines from "./Pipelines";

// 이미지에 맞게 X축 기준 색상 배열 (열별)
const colors = [
  "#365969", // 첫번째 열 - 진한 파란색
  "#159CFC", // 두번째 열 - 진한 회청색
  "#7AC8FF", // 세번째 열 - 밝은 파란색
  "#159CFC", // 네번째 열 - 하늘색
  "#0079D0", // 다섯번째 열 - 밝은 파란색
  "#365969", // 여섯번째 열 - 진한 파란색
];

export default function PipelineBG() {
  const pipelinePath = [
    { x: 133, y: 145 }, // 시작점
  ];

  return (
    <div className="w-[1080px] h-[935px] flex items-center justify-center relative">
      <img
        src={outlinePipeline}
        alt="pipeline-bg"
        className="absolute max-w-full max-h-full object-contain"
      />
      <img
        src={smallPipeline}
        alt="smallPipeline-bg"
        className="absolute max-w-full max-h-full object-contain mr-[27px]"
      />

      {/* 물이 흐르는 애니메이션을 위한 SVG 오버레이 */}
      {/* <div className="absolute max-w-full max-h-full mt-[155px] pipeline-water-container">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 800"
          preserveAspectRatio="none"
          className="pipeline-svg"
        >
          <path
            d="M50,100 L300,100 C350,100 350,200 400,200 L700,200 C750,200 750,300 800,300 L950,300"
            className="pipeline-path"
            fill="none"
            stroke="transparent"
            strokeWidth="20"
          />
          <path
            d="M50,100 L300,100 C350,100 350,200 400,200 L700,200 C750,200 750,300 800,300 L950,300"
            className="water-animation"
            fill="none"
            stroke="#4FC3F7"
            strokeWidth="18"
            strokeDasharray="1000"
            strokeDashoffset="1000"
          />
        </svg>
      </div> */}

      {/* 픽셀화된 파이프라인 애니메이션 */}
      {/* <PixelatedPipeline className="absolute max-w-full max-h-full mt-[155px]" /> */}

      {/* 픽셀 흐름 애니메이션 */}
      <div className="absolute max-w-full max-h-full mt-[155px] w-full h-full">
        {/* <PixelFlow pipelinePath={pipelinePath} /> */}
      </div>

      <div className="absolute w-full h-full">
        {/* 기본 파이프라인 이미지 (배경) */}
        <img
          src={pipeline}
          alt="pipeline-bg"
          className="absolute max-w-full max-h-full object-contain mt-[155px]"
        />

        {/* 첫 번째 파이프라인 섹션 */}
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
        {/* 두 번째 파이프라인 섹션 */}
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
          delay={350} // 첫 번째 섹션이 채워진 후 시작
          onFillComplete={() => console.log("Section 2 filled")}
        />
        {/* 세 번째 파이프라인 섹션 */}
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
          delay={1300} // 두 번째 섹션이 채워진 후 시작
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
          onFillComplete={() => console.log("Section 5 filled")}
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
          onFillComplete={() => console.log("Section 5 filled")}
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
          onFillComplete={() => console.log("Section 5 filled")}
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
          onFillComplete={() => console.log("Section 5 filled")}
        />
      </div>

      {/* <Pipelines
        autoFill={true}
        animationDuration={1000}
        startX={0}
        startY={0}
        endX={10}
        endY={12}
        fillPercentage={0}
      />
      <Pipelines
        autoFill={true}
        animationDuration={1000}
        startX={10}
        startY={11}
        endX={20}
        endY={18}
        fillPercentage={0}
        direction="horizontal"
      /> */}
      {/* <Pipelines
        autoFill={true}
        animationDuration={3000}
        startX={0}
        startY={0}
        endX={45}
        endY={41}
        fillPercentage={0}
      /> */}
      {/* <CloudWithRain
        position="top-[113px] left-[105px]"
        cloudType="blue"
        showRain={true}
      />
      <CloudWithRain
        position="top-[113px] right-[155px]"
        cloudType="skyblue"
        showRain={true}
      /> */}
      <img
        src={tank}
        alt="tank"
        className="absolute max-w-full max-h-full object-contain bottom-[10px] right-[25px]"
      />

      {/* 디버깅용 표시 - 개발 중에만 사용 */}
      {/* {true && (
        <div
          style={{
            position: "absolute",
            left: pipelinePath[0].x,
            top: pipelinePath[0].y,
            width: "10px",
            height: "10px",
            backgroundColor: "red",
            borderRadius: "50%",
            zIndex: 20,
          }}
        />
      )} */}

      <div className="w-full h-full absolute">
        <Handle type="orange" className="top-[400px] left-[70px]" />
        <Handle type="orange" className="top-[535px] left-[482px]" />
        <Handle type="green" className="top-[575px] left-[216px]" />
        <Handle type="green" className="top-[775px] left-[395px]" />
        <Handle type="green" className="top-[695px] left-[695px]" />
        <Handle type="pink" className="top-[588px] left-[875px]" />
      </div>
      <Bubbles />
    </div>
  );
}
