import React, { useEffect, useRef } from "react";

interface PixelFlowProps {
  className?: string;
  pipelinePath?: { x: number; y: number }[];
  maxPixels?: number;
  animationSpeed?: number;
  maxYCells?: number;
  maxXCells?: number;
  bendAfterY?: number;
  secondBendAfterY?: number;
  horizontalThickness?: number;
  bendAfterX?: number;
  onAnimationComplete?: () => void;
  autoStart?: boolean; // 자동 시작 여부
}

const PixelFlow: React.FC<PixelFlowProps> = ({
  className,
  pipelinePath,
  maxPixels: userMaxPixels,
  animationSpeed = 1,
  maxYCells = 50,
  maxXCells = 6,
  bendAfterY = 52,
  secondBendAfterY = 82,
  horizontalThickness = 6,
  bendAfterX = 274,
  onAnimationComplete,
  autoStart = true, // 기본값: 자동 시작
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationStartedRef = useRef(false);
  const animationCompleteRef = useRef(false);

  useEffect(() => {
    // 애니메이션이 이미 시작되었으면 다시 시작하지 않음
    if (animationStartedRef.current) {
      return;
    }

    // 자동 시작이 아니면 시작하지 않음
    if (!autoStart) {
      return;
    }

    // 애니메이션 시작 표시
    animationStartedRef.current = true;

    const maxPixels =
      userMaxPixels || Math.max(300, Math.ceil(maxXCells * maxYCells * 1.5));

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    updateCanvasSize();

    const PIXEL_SIZE = 6;

    const colors = [
      "#365969", // 첫번째 열 - 진한 파란색
      "#159CFC", // 두번째 열 - 진한 회청색
      "#7AC8FF", // 세번째 열 - 밝은 파란색
      "#159CFC", // 네번째 열 - 하늘색
      "#0079D0", // 다섯번째 열 - 밝은 파란색
      "#365969", // 여섯번째 열 - 진한 파란색
    ];

    const defaultPoint = { x: canvas.width / 2, y: 50 };
    const startPoint =
      pipelinePath && pipelinePath.length > 0 ? pipelinePath[0] : defaultPoint;

    const startGridX = Math.floor(startPoint.x / PIXEL_SIZE);
    const startGridY = Math.floor(startPoint.y / PIXEL_SIZE);
    const maxGridY = startGridY + maxYCells;

    // 첫 번째 꺾임 지점 (대각선 시작)
    const bendGridY = startGridY + Math.floor(bendAfterY / PIXEL_SIZE);

    // 두 번째 꺾임 지점 (수평 이동 시작)
    const secondBendGridY =
      startGridY + Math.floor(secondBendAfterY / PIXEL_SIZE) + 2;

    // 수평 파이프라인의 Y 범위 계산
    const horizontalStartY =
      secondBendGridY - Math.floor(horizontalThickness / 2) - 3;
    const horizontalEndY = horizontalStartY + horizontalThickness;

    // 세 번째 꺾임 지점 (X 기준, 다시 45도로 꺾임)
    const thirdBendGridX =
      startGridX +
      Math.floor(maxXCells / 2) +
      Math.floor(bendAfterX / PIXEL_SIZE);

    // 고정된 픽셀 저장
    const fixedPixels = new Map<string, string>();

    // 애니메이션 단계
    type AnimationPhase =
      | "vertical"
      | "diagonal"
      | "horizontal"
      | "diagonal2"
      | "completed";
    let currentPhase: AnimationPhase = "vertical";

    // 각 단계별 진행 상태 (0-100%)
    const phaseProgress = {
      vertical: 0,
      diagonal: 0,
      horizontal: 0,
      diagonal2: 0,
    };

    // 각 단계별 파티클 수
    const phaseParticleCount = {
      vertical: Math.floor(maxPixels * 0.4),
      diagonal: Math.floor(maxPixels * 0.2),
      horizontal: Math.floor(maxPixels * 0.2),
      diagonal2: Math.floor(maxPixels * 0.2),
    };

    // 각 단계별 활성 파티클 수
    const activeParticleCount = {
      vertical: 0,
      diagonal: 0,
      horizontal: 0,
      diagonal2: 0,
    };

    // 각 단계별 완료 여부
    const phaseCompleted = {
      vertical: false,
      diagonal: false,
      horizontal: false,
      diagonal2: false,
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      column: number;
      baseSpeed: number;
      mode: "vertical" | "diagonal" | "horizontal" | "diagonal2";
      horizontalRow: number;
      active: boolean;
      used: boolean; // 이미 사용된 파티클인지 여부

      constructor() {
        this.active = false;
        this.used = false;
        this.reset();
      }

      reset() {
        // 이미 사용된 파티클이면 재사용하지 않음
        if (this.used) {
          this.active = false;
          return;
        }

        this.active = true;
        this.used = true; // 사용된 것으로 표시

        // 현재 단계에 따라 초기화
        if (currentPhase === "vertical") {
          this.mode = "vertical";
          this.column = Math.floor(Math.random() * maxXCells);
          this.x = (startGridX + this.column) * PIXEL_SIZE;
          this.y = startGridY * PIXEL_SIZE;
          this.baseSpeed = (0.5 + Math.random() * 0.5) * animationSpeed;
          this.vx = 0;
          this.vy = this.baseSpeed;
          this.color = colors[this.column % colors.length];
          this.alpha = 0.5 + Math.random() * 0.5;
          activeParticleCount.vertical++;
        } else if (currentPhase === "diagonal") {
          this.mode = "diagonal";
          this.column = Math.floor(Math.random() * maxXCells);
          this.x = (startGridX + this.column) * PIXEL_SIZE;
          this.y = bendGridY * PIXEL_SIZE;
          this.baseSpeed = (0.5 + Math.random() * 0.5) * animationSpeed;
          this.vx = this.baseSpeed;
          this.vy = this.baseSpeed;
          this.color = colors[this.column % colors.length];
          this.alpha = 0.5 + Math.random() * 0.5;
          activeParticleCount.diagonal++;
        } else if (currentPhase === "horizontal") {
          this.mode = "horizontal";
          this.horizontalRow =
            horizontalStartY + Math.floor(Math.random() * horizontalThickness);
          this.y = this.horizontalRow * PIXEL_SIZE;
          this.x =
            (startGridX + maxXCells - 1 + (secondBendGridY - bendGridY)) *
            PIXEL_SIZE;
          this.baseSpeed = (0.5 + Math.random() * 0.5) * animationSpeed;
          this.vx = this.baseSpeed * 1.5;
          this.vy = 0;

          // Y축 기준으로 색상 설정 (horizontalStartY부터 시작하는 행 인덱스 기준)
          const rowIndex = this.horizontalRow - horizontalStartY;
          this.color = colors[rowIndex % colors.length];

          this.alpha = 0.5 + Math.random() * 0.5;
          activeParticleCount.horizontal++;
        } else if (currentPhase === "diagonal2") {
          this.mode = "diagonal2";
          this.horizontalRow =
            horizontalStartY + Math.floor(Math.random() * horizontalThickness);
          this.y = this.horizontalRow * PIXEL_SIZE;
          this.x = thirdBendGridX * PIXEL_SIZE;
          this.baseSpeed = (0.5 + Math.random() * 0.5) * animationSpeed;
          this.vx = this.baseSpeed;
          this.vy = this.baseSpeed;
          this.color = colors[this.horizontalRow % colors.length];
          this.alpha = 0.5 + Math.random() * 0.5;
          activeParticleCount.diagonal2++;
        } else {
          // 완료 단계에서는 파티클을 활성화하지 않음
          this.active = false;
        }
      }

      update() {
        if (!this.active) return;

        // 알파값 감소
        this.alpha -= 0.002;

        // 위치 업데이트
        this.x += this.vx;
        this.y += this.vy;

        // 그리드 좌표 계산
        const gridX = Math.floor(this.x / PIXEL_SIZE);
        const gridY = Math.floor(this.y / PIXEL_SIZE);

        // 모드 전환 체크
        if (this.mode === "vertical" && gridY >= bendGridY) {
          this.mode = "diagonal";
          this.vx = this.baseSpeed;
          this.vy = this.baseSpeed;

          // 진행 상태 업데이트
          phaseProgress.vertical = 100;

          // 수직 단계 완료 표시
          if (!phaseCompleted.vertical) {
            phaseCompleted.vertical = true;
            console.log("Vertical phase completed");
          }
        } else if (this.mode === "diagonal" && gridY >= secondBendGridY) {
          this.mode = "horizontal";
          this.vx = this.baseSpeed * 1.5;
          this.vy = 0;

          // 수평 이동 시작 시 Y 좌표를 정확히 그리드에 맞춤
          this.horizontalRow =
            horizontalStartY + Math.floor(Math.random() * horizontalThickness);
          this.y = this.horizontalRow * PIXEL_SIZE;

          // 진행 상태 업데이트
          phaseProgress.diagonal = 100;

          // Y축 기준으로 행 인덱스에 따라 색상 설정
          //   const rowIndex = this.horizontalRow - horizontalStartY;
          //   this.color = colors[rowIndex % colors.length];

          // 대각선 단계 완료 표시
          if (!phaseCompleted.diagonal) {
            phaseCompleted.diagonal = true;
            console.log("Diagonal phase completed");
          }
        }
        //   else if (this.mode === "horizontal") {
        //       // 현재 Y 좌표를 기준으로 행 인덱스 계산
        //       const rowIndex = Math.floor(this.y / PIXEL_SIZE) - horizontalStartY;
        //       this.color = colors[rowIndex % colors.length];

        //       // 세 번째 꺾임 지점에 도달하면 모드 변경
        //       if (gridX >= thirdBendGridX) {
        //           this.mode = "diagonal2";
        //           this.vx = this.baseSpeed;
        //           this.vy = this.baseSpeed;

        //           // 진행 상태 업데이트
        //           phaseProgress.horizontal = 100;

        //           // 수평 단계 완료 표시
        //           if (!phaseCompleted.horizontal) {
        //               phaseCompleted.horizontal = true;
        //               console.log("Horizontal phase completed");
        //           }
        //       }
        //   }
        else if (this.mode === "horizontal" && gridX >= thirdBendGridX) {
          this.mode = "diagonal2";
          this.vx = this.baseSpeed;
          this.vy = this.baseSpeed;

          // 진행 상태 업데이트
          phaseProgress.horizontal = 100;

          // 수평 단계 완료 표시
          if (!phaseCompleted.horizontal) {
            phaseCompleted.horizontal = true;
            console.log("Horizontal phase completed");
          }
        }

        // 진행 상태 업데이트
        if (this.mode === "vertical") {
          phaseProgress.vertical = Math.max(
            phaseProgress.vertical,
            ((gridY - startGridY) / (bendGridY - startGridY)) * 100
          );
        } else if (this.mode === "diagonal") {
          phaseProgress.diagonal = Math.max(
            phaseProgress.diagonal,
            ((gridY - bendGridY) / (secondBendGridY - bendGridY)) * 100
          );
        } else if (this.mode === "horizontal") {
          phaseProgress.horizontal = Math.max(
            phaseProgress.horizontal,
            ((gridX -
              (startGridX + maxXCells + (secondBendGridY - bendGridY))) /
              (thirdBendGridX -
                (startGridX + maxXCells + (secondBendGridY - bendGridY)))) *
              100
          );
        } else if (this.mode === "diagonal2") {
          phaseProgress.diagonal2 = Math.max(
            phaseProgress.diagonal2,
            ((gridY - horizontalStartY) / (maxGridY - horizontalStartY)) * 100
          );
        }

        // 고정된 픽셀 추가 (모드에 따라 다르게 처리)
        const key = `${gridX},${gridY}`;
        if (!fixedPixels.has(key)) {
          let finalColor;

          if (this.mode === "vertical") {
            // 수직 모드일 때 X축 기준으로 열 인덱스에 따라 색상 설정
            const colIndex = gridX - startGridX;
            finalColor = colors[colIndex % colors.length];
          } else if (this.mode === "horizontal") {
            // 수평 모드일 때 Y축 기준으로 행 인덱스에 따라 색상 설정
            const rowIndex = gridY - horizontalStartY;
            if (rowIndex === 0) {
              finalColor = colors[0]; // 첫 번째 행: 빨간색
            } else if (rowIndex === 1) {
              finalColor = colors[1]; // 두 번째 행: 초록색
            } else if (rowIndex === 2) {
              finalColor = colors[2]; // 세 번째 행: 파란색
            } else if (rowIndex === 3) {
              finalColor = colors[3]; // 네 번째 행: 노란색
            } else if (rowIndex === 4) {
              finalColor = colors[4]; // 다섯 번째 행: 마젠타
            } else if (rowIndex === 5) {
              finalColor = colors[5]; // 여섯 번째 행: 시안
            } else {
              finalColor = colors[rowIndex % colors.length]; // 그 외 행: 기존 색상 배열 사용
            }
          } else {
            // 다른 모드(대각선 등)일 때는 현재 색상 사용
            finalColor = this.color;
          }

          fixedPixels.set(key, finalColor);
        }

        // 재설정 조건
        if (this.alpha <= 0) {
          // 단계별 활성 파티클 수 감소
          if (this.active) {
            if (this.mode === "vertical") activeParticleCount.vertical--;
            else if (this.mode === "diagonal") activeParticleCount.diagonal--;
            else if (this.mode === "horizontal")
              activeParticleCount.horizontal--;
            else if (this.mode === "diagonal2") activeParticleCount.diagonal2--;
          }

          this.active = false;
        } else if (this.mode === "vertical" && gridY >= bendGridY + 5) {
          // 단계별 활성 파티클 수 감소
          if (this.active) activeParticleCount.vertical--;

          this.active = false;
        } else if (this.mode === "diagonal" && gridY >= secondBendGridY + 5) {
          // 단계별 활성 파티클 수 감소
          if (this.active) activeParticleCount.diagonal--;

          this.active = false;
        } else if (this.mode === "horizontal" && gridX >= thirdBendGridX + 5) {
          // 단계별 활성 파티클 수 감소
          if (this.active) activeParticleCount.horizontal--;

          this.active = false;
        } else if (
          this.mode === "diagonal2" &&
          (gridY >= maxGridY + 20 || gridX >= startGridX + maxXCells + 150)
        ) {
          // 단계별 활성 파티클 수 감소
          if (this.active) activeParticleCount.diagonal2--;

          this.active = false;

          // 두 번째 대각선 단계 완료 표시
          if (!phaseCompleted.diagonal2 && phaseProgress.diagonal2 >= 95) {
            phaseCompleted.diagonal2 = true;
            console.log("Diagonal2 phase completed");
          }
        }
      }

      draw() {
        if (!this.active || this.alpha <= 0) return;

        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, PIXEL_SIZE, PIXEL_SIZE);
      }
    }

    // 파티클 생성
    const particles: Particle[] = [];

    for (let i = 0; i < maxPixels; i++) {
      particles.push(new Particle());
    }

    // 단계 전환 체크
    function checkPhaseTransition() {
      if (currentPhase === "vertical" && phaseProgress.vertical >= 95) {
        currentPhase = "diagonal";
        console.log("Phase transition: vertical -> diagonal");
      } else if (currentPhase === "diagonal" && phaseProgress.diagonal >= 95) {
        currentPhase = "horizontal";
        console.log("Phase transition: diagonal -> horizontal");
      } else if (
        currentPhase === "horizontal" &&
        phaseProgress.horizontal >= 95
      ) {
        currentPhase = "diagonal2";
        console.log("Phase transition: horizontal -> diagonal2");
      } else if (
        currentPhase === "diagonal2" &&
        phaseProgress.diagonal2 >= 95
      ) {
        currentPhase = "completed";
        console.log("Animation completed");
        animationCompleteRef.current = true;
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    }

    // 애니메이션 완료 체크
    function checkAnimationComplete() {
      // 모든 파티클이 비활성화되었는지 확인
      const allInactive = particles.every((p) => !p.active);

      // 모든 단계가 완료되었는지 확인
      const allPhasesCompleted =
        phaseCompleted.vertical &&
        phaseCompleted.diagonal &&
        phaseCompleted.horizontal &&
        phaseCompleted.diagonal2;

      if (allInactive && allPhasesCompleted && !animationCompleteRef.current) {
        console.log("All particles inactive and all phases completed");
        animationCompleteRef.current = true;
        if (onAnimationComplete) {
          onAnimationComplete();
        }
        return true;
      }

      return false;
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 고정된 픽셀 그리기
      fixedPixels.forEach((color, key) => {
        const [x, y] = key.split(",").map(Number);

        // Y축 범위 체크
        const inYRange = y <= maxGridY + 30;

        if (inYRange) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = color;
          ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      });

      // 파티클 업데이트 및 그리기
      for (const particle of particles) {
        particle.update();
        particle.draw();
      }

      // 단계 전환 체크
      checkPhaseTransition();

      // 현재 단계에 따라 비활성화된 파티클 재활성화
      if (currentPhase !== "completed") {
        // 현재 단계에 필요한 파티클 수 계산
        let neededParticles = 0;

        if (currentPhase === "vertical") {
          neededParticles = Math.max(
            0,
            phaseParticleCount.vertical - activeParticleCount.vertical
          );
        } else if (currentPhase === "diagonal") {
          neededParticles = Math.max(
            0,
            phaseParticleCount.diagonal - activeParticleCount.diagonal
          );
        } else if (currentPhase === "horizontal") {
          neededParticles = Math.max(
            0,
            phaseParticleCount.horizontal - activeParticleCount.horizontal
          );
        } else if (currentPhase === "diagonal2") {
          neededParticles = Math.max(
            0,
            phaseParticleCount.diagonal2 - activeParticleCount.diagonal2
          );
        }

        // 비활성화된 파티클 중 아직 사용되지 않은 파티클 찾기
        const unusedParticles = particles.filter((p) => !p.active && !p.used);
        const particlesToActivate = Math.min(
          unusedParticles.length,
          neededParticles,
          5
        ); // 한 번에 최대 5개 활성화

        for (let i = 0; i < particlesToActivate; i++) {
          unusedParticles[i].reset();
        }
      }

      // 애니메이션 완료 체크
      const isComplete = checkAnimationComplete();

      // 애니메이션이 완료되지 않았으면 계속 실행
      if (!isComplete) {
        requestAnimationFrame(animate);
      }
    }

    const animationId = requestAnimationFrame(animate);

    window.addEventListener("resize", updateCanvasSize);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [
    pipelinePath,
    userMaxPixels,
    animationSpeed,
    maxYCells,
    maxXCells,
    bendAfterY,
    secondBendAfterY,
    horizontalThickness,
    bendAfterX,
    onAnimationComplete,
    autoStart,
  ]);

  // 애니메이션 시작 함수 (외부에서 호출 가능)
  const startAnimation = () => {
    if (!animationStartedRef.current) {
      animationStartedRef.current = true;
      // 애니메이션 시작 로직 (필요하면 추가)
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`pixel-flow-canvas ${className || ""}`}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        zIndex: 5,
        backgroundColor: "transparent",
        pointerEvents: "none",
      }}
    />
  );
};

export default PixelFlow;
