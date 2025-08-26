# Pixel Loading Animation System

## 📋 Overview

행성 이미지를 픽셀화하여 단계별 로딩 애니메이션을 구현하는 시스템입니다. 로딩 진행도에 따라 픽셀들이 왼쪽에서 날아와서 이미지를 단계적으로 완성시키는 효과를 제공합니다.

## 🎯 Design Specifications

### Image Properties

- **Original Size**: 80px × 50px
- **Position**: 우측에서 21px, 상단에서 49px
- **Source**: `src/assets/planet.svg`
- **Container**: LoadingModal 내부

### Animation Stages

총 4단계로 구성되며, 각 단계는 이미지를 세로로 4등분한 영역에 해당합니다.

#### Stage Breakdown

```
Stage 1: 0-12.5px  (상단 1/4)
Stage 2: 12.5-25px (상단 2/4)
Stage 3: 25-37.5px (상단 3/4)
Stage 4: 37.5-50px (하단 1/4)
```

## 🎨 Animation Behavior

### 1. Pixel Generation

- 각 단계에서 해당 높이 영역의 픽셀들을 생성
- 픽셀 크기: 2px × 2px (레트로 느낌)
- 픽셀 간격: 1px (선택적)

### 2. Movement Pattern

```
시작 위치: 왼쪽 화면 밖 (-100px)
목표 위치: 최종 이미지 위치 (right: 21px, top: 49px)
이동 방향: 왼쪽 → 오른쪽
```

### 3. Timing Configuration

```typescript
interface AnimationTiming {
  stageDelay: number;        // 각 단계 시작 간격 (예: 500ms)
  pixelDelay: number;        // 픽셀 간 지연 시간 (예: 50ms)
  flyDuration: number;       // 픽셀 이동 시간 (예: 300ms)
  totalDuration: number;     // 전체 애니메이션 시간
}
```

## 🔧 Implementation Strategy

### 1. Pixel Data Structure

```typescript
interface Pixel {
  id: string;
  x: number;          // 최종 x 좌표
  y: number;          // 최종 y 좌표
  color: string;      // 픽셀 색상
  stage: number;      // 소속 단계 (1-4)
  delay: number;      // 개별 지연 시간
}

interface LoadingStage {
  stage: number;      // 단계 번호 (1-4)
  pixels: Pixel[];    // 해당 단계의 픽셀들
  isActive: boolean;  // 현재 진행 중인지
  isComplete: boolean; // 완료되었는지
}
```

### 2. Animation States

```typescript
enum AnimationState {
  IDLE = 'idle',           // 대기 상태
  STAGE_1 = 'stage_1',     // 1단계 진행 중
  STAGE_2 = 'stage_2',     // 2단계 진행 중
  STAGE_3 = 'stage_3',     // 3단계 진행 중
  STAGE_4 = 'stage_4',     // 4단계 진행 중
  COMPLETE = 'complete'    // 완료
}
```

### 3. Component Props

```typescript
interface LoadingModalProps {
  isOpen: boolean;
  loadingStage: number;    // 현재 로딩 단계 (0-4)
  message?: string;
  onComplete?: () => void; // 애니메이션 완료 콜백
}
```

## 🎬 Animation Flow

### Sequence Diagram

```
1. loadingStage = 1 → Stage 1 픽셀들이 왼쪽에서 날아옴
2. Stage 1 완료 → loadingStage = 2 → Stage 2 픽셀들 시작
3. Stage 2 완료 → loadingStage = 3 → Stage 3 픽셀들 시작
4. Stage 3 완료 → loadingStage = 4 → Stage 4 픽셀들 시작
5. Stage 4 완료 → 전체 이미지 완성, onComplete() 호출
```

### CSS Animation Classes

```css
.pixel {
  position: absolute;
  width: 2px;
  height: 2px;
  transition: transform 300ms ease-out;
}

.pixel-flying {
  transform: translateX(-120px); /* 시작 위치 */
}

.pixel-landed {
  transform: translateX(0); /* 최종 위치 */
}

.pixel-fade-in {
  animation: fadeIn 200ms ease-in;
}
```

## 🎨 Visual Effects

### 1. Pixel Trail Effect

- 픽셀이 이동할 때 잔상 효과 추가
- `box-shadow`나 `::after` 사용

### 2. Sparkle Effect

- 픽셀이 도착할 때 반짝임 효과
- 작은 별 모양이나 글리터 효과

### 3. Stage Completion Effect

- 각 단계 완료 시 해당 영역에 빛나는 효과
- `border` 또는 `outline` 애니메이션

## 📁 File Structure

```
src/
├── components/
│   └── modals/
│       ├── LoadingModal.tsx          # 메인 컴포넌트
│       └── PixelAnimation.tsx        # 픽셀 애니메이션 컴포넌트
├── hooks/
│   └── usePixelAnimation.ts          # 애니메이션 로직 훅
├── utils/
│   ├── pixelGenerator.ts             # 픽셀 데이터 생성
│   └── imageToPixels.ts              # 이미지 → 픽셀 변환
└── assets/
    └── planet.svg                    # 원본 이미지
```

## 🔄 Usage Example

```tsx
// 기본 사용법
<LoadingModal
  isOpen={true}
  loadingStage={currentStage}
  message="Loading universe..."
  onComplete={() => console.log('Animation complete!')}
/>

// 단계별 제어
const [stage, setStage] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    setStage(prev => prev < 4 ? prev + 1 : prev);
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

## 🎛️ Configuration Options

```typescript
const animationConfig = {
  pixelSize: 2,           // 픽셀 크기 (px)
  stageDelay: 500,        // 단계 간 지연 (ms)
  pixelDelay: 50,         // 픽셀 간 지연 (ms)
  flyDuration: 300,       // 이동 시간 (ms)
  sparkleEnabled: true,   // 반짝임 효과 활성화
  trailEnabled: true,     // 잔상 효과 활성화
};
```

## 🚀 Performance Considerations

1. **Virtual Scrolling**: 많은 픽셀 처리 시 가상화 적용
2. **RAF Optimization**: `requestAnimationFrame` 사용
3. **Memory Management**: 완료된 픽셀 정리
4. **GPU Acceleration**: `transform3d` 사용

## 📝 Implementation Checklist

- [ ] 이미지를 픽셀 데이터로 변환
- [ ] 4단계 영역 분할 로직
- [ ] 픽셀 이동 애니메이션
- [ ] 단계별 진행 제어
- [ ] 시각적 효과 (반짝임, 잔상)
- [ ] 성능 최적화
- [ ] 사용자 인터페이스 연동
- [ ] 테스트 및 디버깅

---

_Last Updated: 2024-12-24_
_Version: 1.0.0_
