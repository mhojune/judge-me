# Cloudflare Workers AI 설정 가이드

## 📋 전체 설정 단계

### 1단계: Cloudflare 계정 생성
1. https://dash.cloudflare.com/sign-up 접속
2. 이메일로 가입
3. 이메일 인증 완료

### 2단계: Wrangler CLI 설치
터미널에서 실행:
```bash
npm install -g wrangler
```

설치 확인:
```bash
wrangler --version
```

### 3단계: Cloudflare 로그인
```bash
wrangler login
```
브라우저가 열리면 Cloudflare 계정으로 로그인하세요.

### 4단계: Workers AI 활성화
1. Cloudflare 대시보드 접속: https://dash.cloudflare.com
2. 왼쪽 메뉴에서 **"Workers & Pages"** 클릭
3. 상단 탭에서 **"Workers AI"** 클릭
4. **"Enable Workers AI"** 버튼 클릭하여 활성화

### 5단계: Workers 배포
프로젝트 루트 디렉토리에서 실행:
```bash
wrangler deploy
```

배포가 완료되면 다음과 같은 메시지가 표시됩니다:
```
✨  Deployed successfully!
   https://ai-judge.your-subdomain.workers.dev
```

### 6단계: 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 배포된 URL을 입력:

```env
VITE_AI_JUDGE_API_URL=https://ai-judge.your-subdomain.workers.dev
```

**중요**: `.env` 파일은 Git에 커밋하지 마세요! (이미 .gitignore에 추가됨)

### 7단계: 개발 서버 재시작
환경 변수를 적용하려면 개발 서버를 재시작하세요:
```bash
npm run dev
```

## 🧪 테스트 방법

### 로컬 테스트 (선택사항)
```bash
wrangler dev
```

### API 테스트
배포 후 다음 명령어로 테스트할 수 있습니다:

```bash
curl -X POST https://ai-judge.your-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "question": "자기소개를 해주세요.",
    "answer": "안녕하세요. 저는 개발자입니다.",
    "faceScore": 75.5,
    "audioScore": 80.0
  }'
```

## 📝 파일 구조

```
judge-me/
├── workers/
│   ├── ai-judge.js          # Workers API 코드
│   └── README.md            # Workers 설명서
├── wrangler.toml            # Workers 설정 파일
├── .env                     # 환경 변수 (직접 생성)
├── .env.example             # 환경 변수 예시
└── src/
    └── utils/
        └── aiJudge.ts       # 프론트엔드 API 호출 코드
```

## 🔧 문제 해결

### 문제 1: "Workers AI is not enabled"
- Cloudflare 대시보드에서 Workers AI를 활성화했는지 확인
- 계정이 무료 플랜인지 확인 (무료 플랜에서도 사용 가능)

### 문제 2: "Binding 'AI' not found"
- `wrangler.toml` 파일에 `[ai]` 섹션이 있는지 확인
- `wrangler deploy` 명령어를 다시 실행

### 문제 3: CORS 에러
- `workers/ai-judge.js` 파일에 CORS 헤더가 설정되어 있는지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 문제 4: API 호출 실패
- `.env` 파일의 URL이 올바른지 확인
- Workers가 정상적으로 배포되었는지 확인
- 브라우저 개발자 도구의 Network 탭에서 요청 확인

## 💰 비용

- **Cloudflare Workers**: 무료 (일일 100,000 요청)
- **Workers AI**: 무료 티어 제공
- **총 비용**: $0

## 📚 참고 자료

- [Cloudflare Workers 문서](https://developers.cloudflare.com/workers/)
- [Workers AI 문서](https://developers.cloudflare.com/workers-ai/)
- [Wrangler CLI 문서](https://developers.cloudflare.com/workers/wrangler/)
