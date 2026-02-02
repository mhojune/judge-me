import { motion } from 'framer-motion'
import './ResultPage.css'

interface ResultPageProps {
  result: {
    totalScore: number
    questionCount: number
    averageScore: number
    faceScore?: number
    faceScoreDetails?: {
      eyeContact: number
      stability: number
      posture: number
    } | null
    aiScore?: number | null
    aiFeedback?: string | null
    question?: string
    answer?: string
  } | null
  onRestart: () => void
}

/**
 * ResultPage 컴포넌트
 * 
 * 역할:
 * - 게임 결과 표시
 * - 최종 점수 및 통계 표시
 * - 재시작 옵션 제공
 */
export default function ResultPage({ result, onRestart }: ResultPageProps) {
  if (!result) {
    return <div className="loading">결과를 불러오는 중...</div>
  }

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'S', color: '#FFD700' }
    if (score >= 80) return { grade: 'A', color: '#4CAF50' }
    if (score >= 70) return { grade: 'B', color: '#2196F3' }
    if (score >= 60) return { grade: 'C', color: '#FF9800' }
    return { grade: 'D', color: '#f44336' }
  }

  const gradeInfo = getGrade(result.averageScore)

  return (
    <motion.div
      className="result-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="result-container">
        <motion.h1
          className="result-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          게임 결과
        </motion.h1>

        <motion.div
          className="grade-display"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="grade-letter" style={{ color: gradeInfo.color }}>
            {gradeInfo.grade}
          </div>
        </motion.div>

        <motion.div
          className="score-details"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="score-item">
            <span className="score-label">총점</span>
            <span className="score-value">{result.totalScore.toFixed(1)}점</span>
          </div>
          {result.faceScore !== undefined && (
            <>
              <div className="score-item breakdown-item-result breakdown-header-item">
                <span className="score-label">📷 얼굴 평가</span>
                <span className="score-value">{result.faceScore.toFixed(1)}점</span>
              </div>
              {result.faceScoreDetails && (
                <div className="breakdown-sub-items">
                  <div className="breakdown-sub-item">
                    <span className="sub-label">시선 접촉</span>
                    <span className="sub-value">{result.faceScoreDetails.eyeContact.toFixed(1)}점</span>
                  </div>
                  <div className="breakdown-sub-item">
                    <span className="sub-label">표정 안정성</span>
                    <span className="sub-value">{result.faceScoreDetails.stability.toFixed(1)}점</span>
                  </div>
                  <div className="breakdown-sub-item">
                    <span className="sub-label">자세</span>
                    <span className="sub-value">{result.faceScoreDetails.posture.toFixed(1)}점</span>
                  </div>
                </div>
              )}
            </>
          )}
          {result.aiScore !== undefined && result.aiScore !== null && (
            <>
              <div className="score-item breakdown-item-result breakdown-header-item ai-score-item">
                <span className="score-label">🤖 AI 평가</span>
                <span className="score-value">{result.aiScore.toFixed(1)}점</span>
              </div>
              {result.aiFeedback && (
                <div className="ai-feedback-box">
                  <div className="ai-feedback-label">AI 피드백</div>
                  <div className="ai-feedback-text">{result.aiFeedback}</div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {(result.question || result.answer) && (
          <motion.div
            className="qa-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="qa-item">
              <div className="qa-label">질문</div>
              <div className="qa-content question-content">
                {result.question}
              </div>
            </div>
            <div className="qa-item">
              <div className="qa-label">나의 답변</div>
              <div className="qa-content answer-content">
                {result.answer || '답변이 없습니다.'}
              </div>
            </div>
          </motion.div>
        )}

        <motion.button
          className="restart-button"
          onClick={onRestart}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          다시 시작하기
        </motion.button>
      </div>
    </motion.div>
  )
}
