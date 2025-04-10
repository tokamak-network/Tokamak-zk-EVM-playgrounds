export default function Pipelines({
  id,
  startX,
  startY,
  endX,
  endY,
  direction,
  autoFill = false,
  animationDuration = 1000,
  delay = 0,
  persistent = false,
  onFillComplete,
}: PipelinesProps) {
  // 파이프라인 길이 계산
  const length = direction === "horizontal" 
    ? Math.abs(endX - startX) 
    : Math.abs(endY - startY);

  // 파이프라인 너비/높이 설정
  const width = direction === "horizontal" ? length : 10;
  
  // 수평일 때는 20px, 수직일 때는 길이 사용
  const height = direction === "vertical" ? length : 20;

  // 파이프라인 위치 계산
  const left = direction === "horizontal" ? Math.min(startX, endX) : startX - 5;
  
  // 수평일 때 중앙 정렬을 위해 높이의 절반만큼 위로 조정
  const top = direction === "vertical" 
    ? Math.min(startY, endY) 
    : startY - 10; // 20px 높이의 절반인 10px만큼 위로 조정

  // ... rest of the code remains the same ...
} 