/**
 * Cloudflare Workers AI Judge API
 * 
 * 역할:
 * - 질문과 답변을 받아서 AI로 평가
 * - 얼굴 점수와 음성 점수와 함께 종합 점수 계산
 */

export default {
  async fetch(request, env) {
    // CORS 헤더 설정
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    // OPTIONS 요청 처리 (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // POST 요청만 허용
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    try {
      // 요청 본문 파싱
      const body = await request.json()
      const { question, answer, faceScore, audioScore } = body

      // 필수 파라미터 검증
      if (!question || !answer) {
        return new Response(
          JSON.stringify({ error: 'question and answer are required' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // 기본값 설정
      const finalFaceScore = faceScore || 0
      const finalAudioScore = audioScore || 0

      // AI 프롬프트 구성
      const systemPrompt = `당신은 면접 평가 전문가입니다. 주어진 질문과 답변을 평가하여 0-100점 사이의 점수를 주세요.

평가 기준:
1. 답변의 적절성 (40점): 질문에 대한 답변이 적절한가?
2. 답변의 구체성 (30점): 구체적인 예시나 경험이 포함되어 있는가?
3. 답변의 논리성 (30점): 논리적으로 일관된 답변인가?

반드시 다음 JSON 형식으로만 응답하세요:
{"score": 숫자, "feedback": "한국어로 된 피드백 메시지"}`

      const userPrompt = `질문: ${question}

답변: ${answer}

위 질문과 답변을 평가하여 점수와 피드백을 제공해주세요.`

      // Workers AI 호출
      // @cf/meta/llama-3-8b-instruct 모델 사용 (한국어 지원)
      const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      })

      // AI 응답 파싱
      let aiScore = 50 // 기본값
      let aiFeedback = '평가를 진행했습니다.'

      try {
        // AI 응답에서 JSON 추출 시도
        const responseText = aiResponse.response || aiResponse.text || ''
        
        // JSON 부분 찾기
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          aiScore = Math.max(0, Math.min(100, parsed.score || 50))
          aiFeedback = parsed.feedback || '평가를 진행했습니다.'
        } else {
          // JSON이 없으면 점수만 추출 시도
          const scoreMatch = responseText.match(/\d+/)
          if (scoreMatch) {
            aiScore = Math.max(0, Math.min(100, parseInt(scoreMatch[0])))
          }
          aiFeedback = responseText.substring(0, 100) // 처음 100자만 사용
        }
      } catch (parseError) {
        console.error('AI 응답 파싱 실패:', parseError)
        // 파싱 실패 시 기본값 사용
        aiScore = 50
        aiFeedback = 'AI 평가를 진행했습니다.'
      }

      // 종합 점수 계산
      // 얼굴 10%, AI 평가 90% (음성 평가 제거)
      const finalScore = Math.round(
        (finalFaceScore * 0.1) + 
        (aiScore * 0.9)
      )

      // 응답 반환
      return new Response(
        JSON.stringify({
          success: true,
          aiScore: Math.round(aiScore),
          aiFeedback: aiFeedback,
          faceScore: finalFaceScore,
          finalScore: finalScore,
        }),
        {
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          }
        }
      )

    } catch (error) {
      console.error('에러 발생:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          message: error.message 
        }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          }
        }
      )
    }
  }
}
