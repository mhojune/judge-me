# Judge Me - 아키텍처 및 동작 방식 분석

## 📋 목차
1. [전체 구조 개요](#전체-구조-개요)
2. [애플리케이션 흐름](#애플리케이션-흐름)
3. [컴포넌트 구조](#컴포넌트-구조)
4. [데이터 흐름](#데이터-흐름)
5. [상태 관리](#상태-관리)
6. [점수 계산 시스템](#점수-계산-시스템)
7. [AI 평가 시스템](#ai-평가-시스템)
8. [성능 최적화](#성능-최적화)

---

## 전체 구조 개요

### 기술 스택
- **프론트엔드**: React 18 + TypeScript + Vite
- **상태 관리**: Zustand
- **애니메이션**: Framer Motion
- **얼굴 인식**: MediaPipe Face Mesh
- **음성 처리**: Web Speech API + Web Audio API
- **백엔드**: Cloudflare Workers + Workers AI (Llama-3-8b-instruct)

### 프로젝트 구조
```
judge-me/
├── src/
│   ├── main.tsx              # 진입점
│   ├── App.tsx               # 루트 컴포넌트 (페이지 라우팅)
│   ├── pages/                # 페이지 컴포넌트
│   │   ├── ReadyPage.tsx     # 준비 화면
│   │   ├── GamePage.tsx      # 게임 화면
│   │   └── ResultPage.tsx    # 결과 화면
│   ├── components/           # 재사용 컴포넌트
│   │   ├── CameraView/       # 카메라 및 얼굴 인식
│   │   ├── MicAnalyzer/      # 마이크 및 음성 분석
│   │   ├── QuestionOverlay/  # 질문 오버레이
│   │   └── ScoreBreakdown/   # 점수 배점 표시
│   ├── hooks/                # 커스텀 훅
│   │   ├── useCamera.ts      # 카메라 스트림 관리
│   │   ├── useMic.ts         # 마이크 스트림 관리
│   │   ├── useTimer.ts       # 타이머 관리
│   │   └── useSpeechRecognition.ts # 음성 인식
│   ├── store/                # 상태 관리
│   │   └── gameStore.ts      # 전역 게임 상태
│   └── utils/                # 유틸리티
│       ├── scoreCalculator.ts # 점수 계산 로직
│       └── aiJudge.ts        # AI 평가 API 연동
└── workers/                  # Cloudflare Workers
    └── ai-judge.js           # AI 평가 Worker
```

---

## 애플리케이션 흐름

### 1. 진입점 (main.tsx)
```typescript
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```
- React 애플리케이션을 DOM에 마운트
- StrictMode로 개발 모드에서 잠재적 문제 감지

### 2. 루트 컴포넌트 (App.tsx)
```typescript
gameState: 'ready' | 'playing' | 'result'
```
- **상태 관리**: `gameState`로 현재 페이지 결정
- **페이지 전환**:
  - `ready` → `playing`: `handleGameStart()`
  - `playing` → `result`: `handleGameEnd(result)`
  - `result` → `ready`: `handleRestart()`

### 3. 페이지 흐름

#### ReadyPage (준비 화면)
1. 사용자가 카메라/마이크 시작 버튼 클릭
2. `CameraView`와 `MicAnalyzer`가 각각 스트림 시작
3. 스트림이 활성화되면 "✓ 작동 중" 표시
4. "게임 시작" 버튼 클릭 → `onStart()` 호출 → `gameState`를 `'playing'`으로 변경

#### GamePage (게임 화면)
1. **초기화** (`useEffect`):
   - `startGame()`: 게임 상태 초기화
   - `resetAudioTracking()`: 음성 추적 데이터 리셋
   - 5초 카운트다운 시작
   
2. **카운트다운 완료 후**:
   - 랜덤 질문 선택
   - `setQuestion()`: 질문 저장
   - `setShowQuestion(true)`: 질문 표시
   - `QuestionOverlay`에 60초 타이머 시작

3. **게임 진행 중**:
   - **얼굴 인식**: `CameraView` → `handleFaceDetected()` → 점수 계산
   - **음성 인식**: `MicAnalyzer` → `handleAudioData()` → 텍스트 변환
   - **실시간 피드백**: `ScoreBreakdown`에 표시

4. **게임 종료**:
   - 시간 만료 또는 "제출하기" 버튼 클릭
   - `submitGame()` 호출:
     - AI 평가 API 호출 (`evaluateAnswer()`)
     - 최종 점수 계산
     - `onGameEnd(finalResult)` 호출 → `gameState`를 `'result'`로 변경

#### ResultPage (결과 화면)
1. 최종 점수 및 등급 표시 (S, A, B, C, D)
2. 얼굴 평가 세부 점수 표시
3. AI 평가 점수 및 피드백 표시
4. 질문과 답변 표시
5. "다시 시작하기" 버튼 → `onRestart()` → `gameState`를 `'ready'`로 변경

---

## 컴포넌트 구조

### CameraView
**역할**: 카메라 스트림 및 얼굴 인식

**동작 방식**:
1. `useCamera` 훅으로 카메라 스트림 획득
2. MediaPipe Face Mesh 초기화
3. `Camera` 유틸리티로 비디오 스트림 처리
4. 매 프레임마다:
   - `faceMesh.send({ image: video })` 호출
   - 얼굴 랜드마크 감지
   - 캔버스에 얼굴 메시 그리기
   - `onFaceDetected(landmarks)` 콜백 호출

**주요 상태**:
- `isActive`: 카메라 활성화 여부
- `isStreaming`: 스트림 상태 (useCamera에서 관리)

### MicAnalyzer
**역할**: 마이크 스트림 및 음성 분석

**동작 방식**:
1. `useMic` 훅으로 마이크 스트림 획득
2. `useSpeechRecognition` 훅으로 음성 인식 시작
3. Web Audio API로 오디오 분석:
   - `AudioContext` 생성
   - `AnalyserNode`로 주파수 데이터 추출
   - `requestAnimationFrame`으로 실시간 분석
4. 볼륨 및 주파수 계산:
   - 노이즈 캘리브레이션 (처음 2초)
   - 말하기 상태 감지
   - `onAudioData()` 콜백 호출 (10프레임마다)

**주요 기능**:
- **노이즈 캘리브레이션**: 처음 60프레임 동안 기본 노이즈 레벨 측정
- **볼륨 계산**: 최대값(70%) + 평균값(30%) + 활성 주파수 비율
- **말하기 감지**: 노이즈 레벨을 고려한 동적 threshold

### QuestionOverlay
**역할**: 질문 표시 및 타이머 관리

**동작 방식**:
1. `useTimer` 훅으로 카운트다운 관리
2. 질문이 있을 때만 타이머 시작
3. 시간 만료 시 `onTimeUp()` 콜백 호출

### ScoreBreakdown
**역할**: 점수 배점 정보 및 실시간 피드백 표시

**동작 방식**:
1. `useGameStore`에서 `faceScore`, `feedback` 구독
2. 실시간 피드백 항상 표시
3. "점수 배점 보기" 버튼으로 상세 정보 토글

---

## 데이터 흐름

### 얼굴 인식 데이터 흐름
```
CameraView (MediaPipe)
  ↓ landmarks 감지
handleFaceDetected (GamePage)
  ↓ updateFaceData()
gameStore.faceData
  ↓ calculateFaceScore()
scoreCalculator.ts
  ↓ 점수 계산
gameStore.faceScore, faceScoreDetails
  ↓ setFeedback()
gameStore.feedback
  ↓ ScoreBreakdown 표시
```

### 음성 인식 데이터 흐름
```
MicAnalyzer (Web Speech API)
  ↓ 음성 → 텍스트 변환
transcript (GamePage state)
  ↓ 제출 시 사용
submitGame()
  ↓ evaluateAnswer()
AI 평가 API
```

### 음성 분석 데이터 흐름
```
MicAnalyzer (Web Audio API)
  ↓ 볼륨/주파수 분석
handleAudioData (GamePage)
  ↓ updateAudioData(), updateAudioTracking()
gameStore.audioData, audioTracking
  ↓ (점수 계산은 제거됨, 음성 인식만 사용)
```

### AI 평가 데이터 흐름
```
submitGame (GamePage)
  ↓ evaluateAnswer(question, transcript, faceScore)
aiJudge.ts
  ↓ POST 요청
Cloudflare Workers (ai-judge.js)
  ↓ Workers AI 호출
Llama-3-8b-instruct
  ↓ JSON 응답 파싱
aiResult { aiScore, aiFeedback, finalScore }
  ↓ finalResult 생성
onGameEnd(finalResult)
  ↓ ResultPage 표시
```

---

## 상태 관리

### gameStore (Zustand)

**주요 상태**:
```typescript
{
  // 게임 상태
  isPlaying: boolean
  currentQuestion: string
  
  // 점수
  currentScore: number      // 실시간 점수 (얼굴 10%)
  faceScore: number         // 얼굴 평가 점수
  faceScoreDetails: {...}   // 얼굴 평가 세부 점수
  
  // 피드백
  feedback: string | null   // 실시간 피드백 메시지
  
  // 미디어 데이터
  faceData: {...}           // 얼굴 랜드마크 데이터
  audioData: {...}          // 음성 분석 데이터
  audioTracking: {...}      // 음성 추적 데이터 (히스토리)
}
```

**주요 액션**:
- `startGame()`: 게임 시작, 상태 초기화
- `setScores()`: 얼굴/음성/종합 점수 설정
- `setScoreDetails()`: 세부 점수 설정
- `setFeedback()`: 피드백 메시지 설정
- `updateFaceData()`: 얼굴 인식 데이터 업데이트
- `updateAudioData()`: 음성 분석 데이터 업데이트
- `updateAudioTracking()`: 음성 추적 데이터 업데이트

---

## 점수 계산 시스템

### 얼굴 평가 점수 (100점 만점)

**구성 요소**:
1. **시선 접촉 (40점)**
   - 눈의 중심과 얼굴 중심의 거리 측정
   - 정면을 볼수록 높은 점수
   - `calculateEyeContactScore()` 함수

2. **표정 안정성 (30점)**
   - 프레임 간 얼굴 위치 변화량 측정
   - 움직임이 적을수록 높은 점수
   - `calculateFaceStabilityScore()` 함수

3. **자세 (30점)**
   - 수직 각도 (60%)
   - 좌우 기울기 (40%)
   - `calculatePostureScore()` 함수

**계산 방식**:
```typescript
faceScore = (eyeContact * 0.4) + (stability * 0.3) + (posture * 0.3)
```

### 최종 점수 계산

**가중치**:
- 얼굴 평가: 10%
- AI 평가: 90%

**계산 방식**:
```typescript
finalScore = (faceScore * 0.1) + (aiScore * 0.9)
```

**실시간 표시**:
- 게임 중에는 얼굴 점수만 표시 (`faceScore * 0.1`)
- AI 평가는 결과 화면에서만 표시

---

## AI 평가 시스템

### Cloudflare Workers (ai-judge.js)

**동작 방식**:
1. POST 요청 받기
2. 요청 본문 파싱: `{ question, answer, faceScore }`
3. AI 프롬프트 구성:
   - System Prompt: 평가 기준 설명
   - User Prompt: 질문과 답변
4. Workers AI 호출:
   - 모델: `@cf/meta/llama-3-8b-instruct`
   - 한국어 지원
5. 응답 파싱:
   - JSON 형식 추출
   - 점수 및 피드백 추출
6. 종합 점수 계산:
   - 얼굴 10% + AI 90%
7. 응답 반환

**평가 기준**:
- 답변의 적절성 (40점)
- 답변의 구체성 (30점)
- 답변의 논리성 (30점)

### 프론트엔드 연동 (aiJudge.ts)

**동작 방식**:
1. `evaluateAnswer()` 함수 호출
2. 환경 변수에서 API URL 가져오기 (`VITE_AI_JUDGE_API_URL`)
3. POST 요청 전송
4. 응답 처리:
   - 성공: `{ success: true, aiScore, aiFeedback, finalScore }`
   - 실패: 기본값 반환 (얼굴 10% + AI 기본값 50점 * 90%)

---

## 성능 최적화

### 1. 얼굴 인식 최적화
- **FPS 제한**: 기본 30fps
- **MediaPipe 최적화**: 내부 최적화 활용
- **프레임 간 비교**: `previousLandmarks`로 안정성 계산

### 2. 음성 분석 최적화
- **콜백 호출 제한**: 10프레임마다 한 번만 호출 (약 6fps)
- **상태 업데이트 최적화**: 값이 실제로 변경되었을 때만 업데이트
- **노이즈 캘리브레이션**: 처음 2초 동안 기본 노이즈 측정

### 3. 상태 관리 최적화
- **Zustand 선택적 구독**: 필요한 상태만 구독
- **Ref 사용**: 불필요한 리렌더링 방지 (`useRef`)
- **콜백 최적화**: `useRef`로 콜백 저장하여 의존성 배열 문제 해결

### 4. 렌더링 최적화
- **조건부 렌더링**: 필요한 경우에만 컴포넌트 렌더링
- **애니메이션 최적화**: Framer Motion의 GPU 가속 활용
- **메모이제이션**: `useMemo`, `useCallback` 활용

### 5. 메모리 관리
- **스트림 정리**: 컴포넌트 언마운트 시 스트림 정지
- **MediaPipe 정리**: `faceMesh.close()` 호출
- **AudioContext 정리**: `audioContext.close()` 호출
- **히스토리 제한**: 최근 100개만 유지

---

## 주요 훅 (Hooks)

### useCamera
- 카메라 스트림 획득 및 관리
- 권한 요청 및 에러 처리
- 모바일 Safari 환경 고려

### useMic
- 마이크 스트림 획득 및 관리
- 권한 요청 및 에러 처리
- 오디오 옵션 설정 (echoCancellation, noiseSuppression 등)

### useTimer
- 카운트다운 타이머 관리
- 시간 만료 시 콜백 실행
- 정확한 시간 추적

### useSpeechRecognition
- Web Speech API 래퍼
- 실시간 음성-텍스트 변환
- 브라우저 호환성 처리 (Chrome, Edge)
- 연속 인식 지원

---

## 에러 처리

### 카메라/마이크 권한
- `NotAllowedError`: 권한 거부 메시지 표시
- `NotFoundError`: 장치 없음 메시지 표시
- 사용자에게 명확한 안내 제공

### AI 평가 실패
- 네트워크 오류: 기본 점수 사용
- API 오류: 기본 점수 사용
- 파싱 오류: 기본값 사용 (50점)

### MediaPipe 오류
- 초기화 실패: 에러 메시지 표시
- 스트림 오류: 자동 재시도 또는 에러 표시

---

## 보안 고려사항

### 브라우저 권한
- 사용자 클릭 후에만 권한 요청
- HTTPS 필수 (프로덕션 환경)
- 명확한 권한 요청 메시지

### 데이터 전송
- AI 평가 시 질문과 답변만 전송
- 개인 정보 보호 고려
- CORS 설정 (Cloudflare Workers)

---

## 향후 개선 사항

1. **오프라인 지원**: Service Worker 추가
2. **데이터 저장**: 로컬 스토리지 또는 백엔드 연동
3. **다중 질문**: 여러 질문 연속 진행
4. **통계 기능**: 과거 점수 통계 표시
5. **다국어 지원**: i18n 추가

---

## 참고 자료

- [MediaPipe 문서](https://mediapipe.dev/)
- [Web Speech API 문서](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Web Audio API 문서](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Cloudflare Workers 문서](https://developers.cloudflare.com/workers/)
- [Zustand 문서](https://github.com/pmndrs/zustand)
