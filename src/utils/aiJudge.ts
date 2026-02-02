/**
 * AI Judge 유틸리티
 * 
 * 역할:
 * - Cloudflare Workers AI API와 통신
 * - 질문과 답변을 AI로 평가받기
 * - 종합 점수 계산
 */

interface AIJudgeRequest {
  question: string
  answer: string
  faceScore: number
  audioScore?: number // 선택사항 (호환성 유지)
}

interface AIJudgeResponse {
  success: boolean
  aiScore: number
  aiFeedback: string
  faceScore: number
  finalScore: number
  error?: string
  message?: string
}

/**
 * AI로 답변 평가하기
 * 
 * @param question 질문 내용
 * @param answer 사용자의 답변
 * @param faceScore 얼굴 평가 점수
 * @param audioScore 음성 평가 점수
 * @returns AI 평가 결과
 */
export async function evaluateAnswer(
  question: string,
  answer: string,
  faceScore: number,
  audioScore: number
): Promise<AIJudgeResponse> {
  // Workers API 엔드포인트 (배포 후 실제 URL로 변경 필요)
  const API_URL = import.meta.env.VITE_AI_JUDGE_API_URL || 
    'https://ai-judge.your-subdomain.workers.dev'

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        answer,
        faceScore,
        audioScore,
      } as AIJudgeRequest),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
        message: `HTTP ${response.status}`,
      }))
      
      throw new Error(errorData.error || errorData.message || 'AI 평가 실패')
    }

    const data: AIJudgeResponse = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'AI 평가 실패')
    }

    return data
  } catch (error) {
    console.error('AI 평가 에러:', error)
    
    // 에러 발생 시 기본 응답 반환
    return {
      success: false,
      aiScore: 50,
      aiFeedback: 'AI 평가를 사용할 수 없습니다. 기본 점수를 사용합니다.',
      faceScore,
      finalScore: Math.round((faceScore * 0.1) + (50 * 0.9)), // 얼굴 10% + AI 기본값 90%
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * AI 평가가 가능한지 확인
 */
export async function checkAIAvailability(): Promise<boolean> {
  const API_URL = import.meta.env.VITE_AI_JUDGE_API_URL || 
    'https://ai-judge.your-subdomain.workers.dev'

  try {
    const response = await fetch(API_URL, {
      method: 'OPTIONS',
    })
    return response.ok
  } catch {
    return false
  }
}
