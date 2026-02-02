import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useMemo, useRef, useEffect, useState } from 'react'
import './JudgePanel.css'

interface JudgePanelProps {
  judgeName?: string
  avatar?: string
}

/**
 * JudgePanel 컴포넌트
 * 
 * 역할:
 * - AI 심사관 캐릭터 표시
 * - 실시간 평가 점수 표시
 * - 평가 피드백 메시지 표시
 * - 애니메이션으로 생동감 있는 UI 제공
 */
export default function JudgePanel({ 
  judgeName = 'AI 심사관',
  avatar = '👨‍⚖️'
}: JudgePanelProps) {
  const { currentScore, feedback } = useGameStore()
  const prevScoreRef = useRef(currentScore)
  const prevFeedbackRef = useRef(feedback)
  const [displayScore, setDisplayScore] = useState(currentScore)
  const [displayFeedback, setDisplayFeedback] = useState(feedback)

  // 점수 업데이트 최적화: 0.5 이상 차이날 때만 업데이트
  useEffect(() => {
    if (Math.abs(currentScore - prevScoreRef.current) >= 0.5) {
      prevScoreRef.current = currentScore
      setDisplayScore(currentScore)
    }
  }, [currentScore])

  // 피드백 업데이트 최적화: 실제로 변경되었을 때만 업데이트
  useEffect(() => {
    if (feedback !== prevFeedbackRef.current) {
      prevFeedbackRef.current = feedback
      setDisplayFeedback(feedback)
    }
  }, [feedback])

  // 점수가 변경되었는지 확인 (애니메이션용)
  const scoreChanged = useMemo(() => {
    return Math.abs(currentScore - displayScore) >= 0.5
  }, [currentScore, displayScore])

  return (
    <div className="judge-panel">
      <div className="judge-avatar">
        <div className="avatar-icon">{avatar}</div>
        <div className="judge-name">{judgeName}</div>
      </div>
      
      <div className="score-display">
        <div className="score-label">현재 점수</div>
        <motion.div
          className="score-value"
          key={Math.floor(displayScore)} // 정수 부분만 key로 사용하여 과도한 재생성 방지
          animate={scoreChanged ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {displayScore.toFixed(1)}
        </motion.div>
      </div>
      
      <div className="feedback-container">
        {displayFeedback ? (
          <div className="feedback-message">
            {displayFeedback}
          </div>
        ) : (
          <div className="feedback-placeholder"></div>
        )}
      </div>
    </div>
  )
}
