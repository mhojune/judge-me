import { motion } from 'framer-motion'
import { useTimer } from '../../hooks/useTimer'
import './QuestionOverlay.css'

interface QuestionOverlayProps {
  question: string
  timeLimit?: number
  onTimeUp?: () => void
}

/**
 * QuestionOverlay 컴포넌트
 * 
 * 역할:
 * - 현재 질문을 화면에 오버레이로 표시
 * - 타이머 표시 및 시간 제한 관리
 * - 애니메이션 효과로 사용자 주의 집중
 */
export default function QuestionOverlay({ 
  question, 
  timeLimit = 60,
  onTimeUp 
}: QuestionOverlayProps) {
  // 질문이 표시될 때 타이머 시작
  const { timeLeft, isExpired } = useTimer(question ? timeLimit : 0, onTimeUp)

  return (
    <motion.div
      className="question-overlay"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="question-content">
        <h2 className="question-text">{question}</h2>
        <div className={`timer ${isExpired ? 'expired' : ''}`}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>
    </motion.div>
  )
}
