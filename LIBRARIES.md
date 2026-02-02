# 라이브러리 상세 설명

이 문서는 프로젝트에서 사용하는 각 라이브러리의 역할과 사용법을 상세히 설명합니다.

## 📦 MediaPipe 라이브러리

### @mediapipe/face_mesh

**설치**: `npm install @mediapipe/face_mesh`

**역할**:
- 실시간 얼굴 메시 인식 및 분석
- 468개의 얼굴 랜드마크 포인트 추출
- 얼굴 표정, 시선, 자세 분석

**주요 기능**:
```typescript
const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  },
})

faceMesh.setOptions({
  maxNumFaces: 1,              // 최대 얼굴 개수
  refineLandmarks: true,       // 랜드마크 정밀도 향상
  minDetectionConfidence: 0.5, // 최소 감지 신뢰도
  minTrackingConfidence: 0.5,  // 최소 추적 신뢰도
})

faceMesh.onResults((results) => {
  // results.multiFaceLandmarks: 얼굴 랜드마크 배열
  // results.image: 처리된 이미지
})
```

**사용 예시**:
- 시선 접촉 감지
- 표정 분석
- 얼굴 각도 측정
- 자세 평가

**사용 위치**: `src/components/CameraView/CameraView.tsx`

---

### @mediapipe/camera_utils

**설치**: `npm install @mediapipe/camera_utils`

**역할**:
- 카메라 스트림 자동 관리
- FPS 제어 및 최적화
- 해상도 설정

**주요 기능**:
```typescript
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement })
  },
  width: 1280,   // 비디오 너비
  height: 720,   // 비디오 높이
  fps: 30,       // 프레임 레이트
})

await camera.start()
```

**사용 예시**:
- 카메라 스트림 초기화
- FPS 제한으로 성능 최적화
- 해상도 자동 조정

**사용 위치**: `src/components/CameraView/CameraView.tsx`

---

### @mediapipe/drawing_utils

**설치**: `npm install @mediapipe/drawing_utils`

**역할**:
- MediaPipe 결과를 캔버스에 시각화
- 랜드마크 및 연결선 그리기

**주요 기능**:
```typescript
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { FACEMESH_TESSELATION } from '@mediapipe/face_mesh'

// 얼굴 메시 그리기
drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
  color: '#C0C0C070',
  lineWidth: 1,
})

// 랜드마크 점 그리기
drawLandmarks(ctx, landmarks, {
  color: '#FF0000',
  radius: 1,
})
```

**사용 예시**:
- 얼굴 메시 시각화
- 랜드마크 포인트 표시
- 디버깅 및 사용자 피드백

**사용 위치**: `src/components/CameraView/CameraView.tsx`

---

## 🎨 UI 라이브러리

### framer-motion

**설치**: `npm install framer-motion`

**역할**:
- React 컴포넌트 애니메이션
- 제스처 및 인터랙션 지원
- 레이아웃 애니메이션

**주요 기능**:
```typescript
import { motion } from 'framer-motion'

// 기본 애니메이션
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
>
  내용
</motion.div>

// 호버 효과
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  버튼
</motion.button>
```

**사용 예시**:
- 페이지 전환 애니메이션
- 컴포넌트 등장 효과
- 인터랙티브 요소
- 점수 업데이트 애니메이션

**사용 위치**: 
- `src/pages/ReadyPage.tsx`
- `src/pages/ResultPage.tsx`
- `src/components/QuestionOverlay/QuestionOverlay.tsx`

---

### classnames

**설치**: `npm install classnames`

**역할**:
- 조건부 CSS 클래스 이름 조합
- 동적 스타일링 지원

**주요 기능**:
```typescript
import classNames from 'classnames'

// 기본 사용
classNames('foo', 'bar') // 'foo bar'

// 조건부
classNames('foo', { bar: true, baz: false }) // 'foo bar'

// 배열
classNames(['foo', 'bar']) // 'foo bar'
```

**사용 예시**:
- 조건부 스타일 적용
- 상태에 따른 클래스 변경
- 모바일/데스크톱 스타일 분기

**사용 위치**: 전역 사용

---

## 🔧 상태 관리 및 유틸리티

### zustand

**설치**: `npm install zustand`

**역할**:
- 경량 전역 상태 관리
- Redux 대안으로 간단한 API 제공
- 타입스크립트 지원

**주요 기능**:
```typescript
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))

// 컴포넌트에서 사용
function Counter() {
  const { count, increment } = useStore()
  return <button onClick={increment}>{count}</button>
}
```

**사용 예시**:
- 게임 상태 관리
- 점수 및 평가 데이터 저장
- 얼굴/음성 분석 데이터 저장

**사용 위치**: `src/store/gameStore.ts`

---

### react-use

**설치**: `npm install react-use`

**역할**:
- 유용한 React 훅 모음집
- 일반적인 기능을 훅으로 제공

**주요 훅**:
```typescript
import { useDebounce, useThrottle, useMedia } from 'react-use'

// 디바운싱
const [value, setValue] = useState('')
const debouncedValue = useDebounce(value, 500)

// 스로틀링
const throttledCallback = useThrottle(callback, 1000)

// 미디어 쿼리
const isMobile = useMedia('(max-width: 768px)')
```

**사용 예시**:
- 검색 입력 디바운싱
- API 호출 스로틀링
- 반응형 레이아웃
- 윈도우 크기 감지

**사용 위치**: 전역 사용

---

## 🌐 웹 API

### Web Speech API

**역할**:
- 브라우저 내장 음성 인식 API
- 실시간 음성-텍스트 변환

**주요 기능**:
```typescript
const recognition = new webkitSpeechRecognition()
recognition.lang = 'ko-KR'
recognition.continuous = true
recognition.interimResults = true

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript
  // 음성 인식 결과 처리
}
```

**사용 위치**: `src/hooks/useSpeechRecognition.ts`

---

### Web Audio API

**역할**:
- 실시간 오디오 분석
- 볼륨 및 주파수 측정

**주요 기능**:
```typescript
const audioContext = new AudioContext()
const analyser = audioContext.createAnalyser()
const microphone = audioContext.createMediaStreamSource(stream)
microphone.connect(analyser)

const dataArray = new Uint8Array(analyser.frequencyBinCount)
analyser.getByteFrequencyData(dataArray)
```

**사용 위치**: `src/components/MicAnalyzer/MicAnalyzer.tsx`

---

## 📊 성능 최적화 팁

### MediaPipe 최적화
- FPS를 30으로 제한하여 CPU 사용량 감소
- `refineLandmarks: false`로 설정 시 성능 향상 (정밀도는 약간 감소)
- 필요시에만 얼굴 인식 수행

### 애니메이션 최적화
- `framer-motion`의 `will-change` 속성 자동 적용
- GPU 가속 애니메이션 사용 (`transform`, `opacity`)
- 불필요한 리렌더링 방지

### 상태 관리 최적화
- `zustand`의 선택적 구독 사용
- 큰 객체는 분리된 스토어로 관리
- 불변성 유지

---

## 🔗 추가 리소스

- [MediaPipe 공식 문서](https://mediapipe.dev/)
- [Framer Motion 문서](https://www.framer.com/motion/)
- [Zustand 문서](https://github.com/pmndrs/zustand)
- [React Use 문서](https://github.com/streamich/react-use)
- [Web Speech API 문서](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Web Audio API 문서](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
