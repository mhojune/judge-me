# Judge Me - AI 면접 평가 게임

PC와 모바일에서 실행 가능한 웹 게임으로, 카메라와 마이크를 사용하여 AI 심사관이 면접 답변을 평가합니다.

## ✨ 주요 기능

- 📷 **실시간 얼굴 인식**: MediaPipe를 활용한 얼굴 분석 및 시선 접촉 평가
- 🎤 **음성 인식**: Web Speech API를 통한 실시간 음성-텍스트 변환
- 🤖 **AI 평가**: Cloudflare Workers AI를 활용한 답변 적절성 평가
- 📊 **상세 점수 분석**: 얼굴 평가와 AI 평가의 세부 점수 제공
- 💡 **실시간 피드백**: 게임 중 실시간으로 자세 및 시선 피드백 제공
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화

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

### 4. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 5. Cloudflare Workers 배포 (선택사항)

AI 평가 기능을 사용하려면 Cloudflare Workers를 배포해야 합니다. 자세한 내용은 [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)를 참고하세요.

```bash
cd workers
npm install -g wrangler
wrangler login
wrangler deploy
```

## 📦 기술 스택

### 프론트엔드
- **React 18** + **Vite** - 빠른 개발 환경
- **TypeScript** - 타입 안정성
- **MediaPipe** - 얼굴 인식 및 분석
- **Web Speech API** - 음성 인식
- **Web Audio API** - 음성 분석
- **Zustand** - 상태 관리
- **Framer Motion** - 애니메이션

### 백엔드
- **Cloudflare Workers** - 서버리스 API
- **Cloudflare Workers AI** - AI 평가 (Llama-3-8b-instruct)

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
├── package.json
├── vite.config.ts          # Vite 설정
├── tsconfig.json           # TypeScript 설정
├── wrangler.toml           # Cloudflare Workers 설정
└── .env.example            # 환경 변수 예시
```

## 🎯 평가 시스템

### 점수 구성

최종 점수는 다음 가중치로 계산됩니다:

- **얼굴 평가 (10%)**
  - 시선 접촉 (40%)
  - 표정 안정성 (30%)
  - 자세 (30%)

- **AI 평가 (90%)**
  - 답변의 적절성 (40%)
  - 답변의 구체성 (30%)
  - 답변의 논리성 (30%)

### 평가 기준

#### 얼굴 평가
- **시선 접촉**: 카메라를 정면으로 바라보는 정도
- **표정 안정성**: 얼굴 위치의 일관성
- **자세**: 수직 각도 및 좌우 기울기

#### AI 평가
- **답변의 적절성**: 질문에 대한 답변이 적절한가?
- **답변의 구체성**: 구체적인 예시나 경험이 포함되어 있는가?
- **답변의 논리성**: 논리적으로 일관된 답변인가?

## 🔐 브라우저 권한

### 카메라/마이크 권한
- **사용자 클릭 후 요청**: 보안을 위해 자동 요청 금지
- **HTTPS 필수**: 프로덕션 환경에서는 HTTPS 필요 (localhost 예외)
- **모바일 Safari**: 사용자 제스처(클릭, 터치) 후에만 작동

## ⚡ 성능 최적화

- **카메라 FPS 제한**: 기본 30fps로 설정
- **얼굴 인식 최적화**: MediaPipe 내부 최적화 활용
- **상태 업데이트 최적화**: 스로틀링 및 디바운싱 적용
- **메모리 관리**: 컴포넌트 언마운트 시 스트림 정리

## 🚀 배포

### Cloudflare Pages

1. Cloudflare Pages에 저장소 연결
2. 빌드 명령: `npm run build`
3. 빌드 출력 디렉토리: `dist`
4. 환경 변수 설정: `VITE_AI_JUDGE_API_URL`

### GitHub Pages

1. `vite.config.ts`에서 `base` 설정 확인
2. 빌드: `npm run build`
3. GitHub Actions 또는 수동으로 `dist` 폴더 배포

## 📚 문서

- [라이브러리 상세 설명](./LIBRARIES.md) - 사용된 라이브러리 상세 정보
- [프로젝트 설정 가이드](./SETUP.md) - 개발 환경 설정
- [Cloudflare Workers 설정](./CLOUDFLARE_SETUP.md) - AI 평가 API 설정

## 🛠️ 개발

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### 미리보기
```bash
npm run preview
```

### 린트
```bash
npm run lint
```

## 📝 라이선스

MIT

## 🔗 링크

- [GitHub 저장소](https://github.com/mhojune/judge-me)
- [Cloudflare Workers 문서](https://developers.cloudflare.com/workers/)
- [MediaPipe 문서](https://mediapipe.dev/)
