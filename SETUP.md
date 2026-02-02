# 프로젝트 설정 가이드

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/mhojune/judge-me.git
cd judge-me
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요:

```bash
cp .env.example .env
```

`.env` 파일에 Cloudflare Workers API URL을 설정합니다:

```
VITE_AI_JUDGE_API_URL=https://your-worker.your-subdomain.workers.dev
```

> **참고**: AI 평가 기능을 사용하지 않으려면 이 단계를 건너뛸 수 있습니다. 단, AI 평가 점수는 0점으로 처리됩니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 열어 확인하세요.

---

## 📦 설치되는 라이브러리 목록

### 프로덕션 의존성

```bash
npm install react react-dom
npm install @mediapipe/face_mesh @mediapipe/camera_utils @mediapipe/drawing_utils
npm install react-use zustand framer-motion classnames
```

### 개발 의존성

```bash
npm install -D vite @vitejs/plugin-react
npm install -D typescript @types/react @types/react-dom
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eslint-plugin-react-hooks eslint-plugin-react-refresh
```

---

## 🔧 각 라이브러리 역할 요약

| 라이브러리 | 역할 | 주요 사용처 |
|-----------|------|-----------|
| `@mediapipe/face_mesh` | 얼굴 인식 및 랜드마크 추출 | CameraView 컴포넌트 |
| `@mediapipe/camera_utils` | 카메라 스트림 관리 | CameraView 컴포넌트 |
| `@mediapipe/drawing_utils` | 얼굴 메시 시각화 | CameraView 컴포넌트 |
| `react-use` | 유용한 React 훅 모음 | 전역 사용 |
| `zustand` | 경량 상태 관리 | gameStore |
| `framer-motion` | 애니메이션 라이브러리 | QuestionOverlay, ResultPage |
| `classnames` | 조건부 CSS 클래스 | 전역 사용 |

---

## 📁 프로젝트 구조

```
judge-me/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── CameraView/      # 카메라 및 얼굴 인식
│   │   ├── MicAnalyzer/     # 마이크 및 음성 분석
│   │   ├── QuestionOverlay/ # 질문 오버레이
│   │   ├── ScoreBreakdown/  # 점수 배점 표시
│   │   └── JudgePanel/      # 심사관 패널 (미사용)
│   ├── hooks/               # 커스텀 훅
│   │   ├── useCamera.ts    # 카메라 스트림 관리
│   │   ├── useMic.ts       # 마이크 스트림 관리
│   │   ├── useTimer.ts     # 타이머 관리
│   │   └── useSpeechRecognition.ts # 음성 인식
│   ├── store/               # 상태 관리
│   │   └── gameStore.ts    # 게임 전역 상태
│   ├── utils/               # 유틸리티 함수
│   │   ├── scoreCalculator.ts # 점수 계산 로직
│   │   └── aiJudge.ts      # AI 평가 API 연동
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── ReadyPage.tsx   # 게임 준비 페이지
│   │   ├── GamePage.tsx    # 게임 메인 페이지
│   │   └── ResultPage.tsx  # 결과 페이지
│   ├── App.tsx             # 루트 컴포넌트
│   └── main.tsx            # 진입점
├── workers/                 # Cloudflare Workers
│   ├── ai-judge.js         # AI 평가 Worker
│   └── README.md           # Worker 문서
├── public/                  # 정적 파일
├── package.json             # 프로젝트 설정
├── vite.config.ts          # Vite 설정
├── tsconfig.json           # TypeScript 설정
├── wrangler.toml           # Cloudflare Workers 설정
├── .env.example            # 환경 변수 예시
├── README.md               # 프로젝트 문서
├── LIBRARIES.md            # 라이브러리 상세 설명
└── SETUP.md                # 이 파일
```

---

## ✅ 다음 단계

### 1. 개발 환경 확인
- [ ] Node.js 18+ 설치 확인
- [ ] npm 또는 yarn 설치 확인
- [ ] Git 저장소 연결 확인

### 2. 프로젝트 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 3. 브라우저 테스트
- [ ] Chrome/Edge에서 카메라/마이크 권한 테스트
- [ ] 모바일 Safari에서 테스트 (HTTPS 필요)
- [ ] 다양한 화면 크기에서 반응형 확인

### 4. Cloudflare Workers 설정 (선택사항)

AI 평가 기능을 사용하려면 Cloudflare Workers를 배포해야 합니다. 자세한 내용은 [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)를 참고하세요.

```bash
# Wrangler CLI 설치
npm install -g wrangler

# Cloudflare 로그인
wrangler login

# Workers 배포
cd workers
wrangler deploy
```

배포 후 받은 URL을 `.env` 파일에 설정하세요.

---

## 🐛 문제 해결

### 카메라/마이크 권한 오류
- **문제**: `NotAllowedError` 발생
- **해결**: 
  - 브라우저 설정에서 권한 허용
  - HTTPS 사용 (localhost는 예외)
  - 사용자 클릭 후 권한 요청 확인

### MediaPipe 로드 오류
- **문제**: CDN에서 파일을 불러올 수 없음
- **해결**: 
  - 네트워크 연결 확인
  - CDN URL 확인
  - 로컬 파일 사용 고려

### TypeScript 오류
- **문제**: 타입 에러 발생
- **해결**: 
  - `npm install` 재실행
  - 타입 정의 확인
  - `node_modules` 삭제 후 재설치

### 환경 변수 인식 안 됨
- **문제**: `.env` 파일의 변수가 인식되지 않음
- **해결**: 
  - `.env` 파일이 프로젝트 루트에 있는지 확인
  - 변수명이 `VITE_`로 시작하는지 확인
  - 개발 서버 재시작

### Cloudflare Workers 배포 오류
- **문제**: `wrangler deploy` 실패
- **해결**: 
  - `wrangler login` 확인
  - `wrangler.toml` 설정 확인
  - Cloudflare 대시보드에서 Workers AI 활성화 확인

---

## 📝 참고사항

### 필수 요구사항
- **Node.js**: 18.0.0 이상
- **npm**: 9.0.0 이상
- **브라우저**: Chrome, Edge, Safari (최신 버전)

### 권장사항
- **HTTPS**: 프로덕션 환경에서는 HTTPS 필수 (카메라/마이크 접근)
- **모바일 테스트**: 실제 모바일 기기에서 테스트 권장
- **성능 최적화**: FPS 제한 및 메모리 관리 중요

### 개발 팁
- 개발 서버는 `http://localhost:5173`에서 실행됩니다
- 핫 리로드가 자동으로 작동합니다
- 브라우저 개발자 도구에서 콘솔 확인 권장

---

## 🔗 관련 문서

- [README.md](./README.md) - 프로젝트 개요 및 사용법
- [LIBRARIES.md](./LIBRARIES.md) - 라이브러리 상세 설명
- [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) - Cloudflare Workers 설정 가이드
