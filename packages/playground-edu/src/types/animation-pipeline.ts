export type PipelineAnimationProps = {
  isActive?: boolean; // 외부에서 전달되는 활성화 트리거
  onComplete?: () => void; // 애니메이션 완료 콜백
  onStart?: () => void; // 애니메이션 시작 콜백
  isPaused?: boolean; // 일시정지 플래그
  resetAnimation?: boolean; // 애니메이션 초기화 플래그
};
