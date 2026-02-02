# Cloudflare Workers AI Judge

이 디렉토리는 Cloudflare Workers AI를 사용한 답변 평가 API를 포함합니다.

## 설정 방법

1. Cloudflare 계정 생성 및 로그인
2. `wrangler login` 실행
3. `wrangler deploy` 실행하여 배포

## API 사용법

### 엔드포인트
POST https://ai-judge.your-subdomain.workers.dev

### 요청 형식
```json
{
  "question": "자기소개를 해주세요.",
  "answer": "안녕하세요. 저는...",
  "faceScore": 75.5,
  "audioScore": 80.0
}
```

### 응답 형식
```json
{
  "success": true,
  "aiScore": 85,
  "aiFeedback": "구체적인 예시가 포함된 좋은 답변입니다.",
  "faceScore": 75.5,
  "audioScore": 80.0,
  "finalScore": 82
}
```
