import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import './ScoreBreakdown.css'

/**
 * ScoreBreakdown 컴포넌트
 * 
 * 역할:
 * - 점수 배점 정보 표시
 * - 얼굴 평가 및 음성 평가 세부 항목 표시
 * - 실시간 피드백 표시
 */
export default function ScoreBreakdown() {
  const { faceScore, feedback } = useGameStore()
  const [showBreakdown, setShowBreakdown] = useState(false)
  const prevFeedbackRef = useRef(feedback)
  const [displayFeedback, setDisplayFeedback] = useState(feedback)

  // 피드백 업데이트 최적화: 실제로 변경되었을 때만 업데이트
  useEffect(() => {
    if (feedback !== prevFeedbackRef.current) {
      prevFeedbackRef.current = feedback
      setDisplayFeedback(feedback)
    }
  }, [feedback])

  return (
    <div className="score-breakdown-panel">
      {/* 실시간 피드백 섹션 - 항상 표시 */}
      <div className="feedback-section">
        <div className="feedback-label">💡 실시간 피드백</div>
        <div className="feedback-message">
          {displayFeedback || '카메라를 켜주세요'}
        </div>
      </div>
      
      <button 
        className="breakdown-toggle"
        onClick={() => setShowBreakdown(!showBreakdown)}
      >
        {showBreakdown ? '▼' : '▶'} 점수 배점 보기
      </button>
      
      {showBreakdown && (
        <div className="breakdown-content">
          <div className="breakdown-section">
            <div className="breakdown-header">
              <span>📷 얼굴 평가</span>
              <span className="breakdown-score">{faceScore.toFixed(1)}점</span>
            </div>
            <div className="breakdown-weight">가중치: 10% (최종 점수 기준)</div>
            <div className="breakdown-items">
              <div className="breakdown-item">
                <span>시선 접촉</span>
                <span>40%</span>
              </div>
              <div className="breakdown-item">
                <span>표정 안정성</span>
                <span>30%</span>
              </div>
              <div className="breakdown-item">
                <span>자세</span>
                <span>30%</span>
              </div>
            </div>
          </div>
          
          <div className="breakdown-section">
            <div className="breakdown-header">
              <span>🤖 AI 평가</span>
              <span className="breakdown-score">-</span>
            </div>
            <div className="breakdown-weight">가중치: 90% (최종 점수 기준)</div>
            <div className="breakdown-items">
              <div className="breakdown-item">
                <span>답변의 적절성</span>
                <span>40%</span>
              </div>
              <div className="breakdown-item">
                <span>답변의 구체성</span>
                <span>30%</span>
              </div>
              <div className="breakdown-item">
                <span>답변의 논리성</span>
                <span>30%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
