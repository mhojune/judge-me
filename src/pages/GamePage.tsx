import { useEffect, useState, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { 
  calculateFaceScore, 
  generateFeedback,
  calculateFaceScoreDetails
} from '../utils/scoreCalculator'
import { evaluateAnswer } from '../utils/aiJudge'
import CameraView from '../components/CameraView/CameraView'
import MicAnalyzer from '../components/MicAnalyzer/MicAnalyzer'
import QuestionOverlay from '../components/QuestionOverlay/QuestionOverlay'
import ScoreBreakdown from '../components/ScoreBreakdown/ScoreBreakdown'
import './GamePage.css'

interface GamePageProps {
  onGameEnd: (result: any) => void
}

/**
 * GamePage 컴포넌트
 * 
 * 역할:
 * - 게임 메인 화면 구성
 * - 카메라/마이크 컴포넌트 통합
 * - 실시간 점수 계산 및 업데이트
 * - 게임 플로우 관리
 */
export default function GamePage({ onGameEnd }: GamePageProps) {
  const {
    startGame,
    endGame,
    setQuestion,
    setFeedback,
    setScores,
    setScoreDetails,
    updateFaceData,
    updateAudioData,
    updateAudioTracking,
    resetAudioTracking,
    currentQuestion,
  } = useGameStore()
  
  const previousLandmarksRef = useRef<any[] | null>(null)
  const gameStartTimeRef = useRef<number | null>(null)

  const [isInitialized, setIsInitialized] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [showQuestion, setShowQuestion] = useState(false)
  const {
    setQuestionAnswer,
  } = useGameStore()

  // 샘플 질문 목록
  const questions = [
    '자기소개를 해주세요.',
    '가장 기억에 남는 경험을 말해주세요.',
    '당신의 장점을 설명해주세요.',
    '5년 후 자신의 모습을 상상해보세요.',
    '좋아하는 취미에 대해 이야기해주세요.',
    '인생에서 가장 중요한 가치는 무엇인가요?',
    '어려움을 극복한 경험이 있다면 말해주세요.',
    '당신의 꿈은 무엇인가요?',
    '가장 감사한 사람은 누구인가요?',
    '10년 후 자신의 모습을 상상해보세요.',
  ]

  // 게임 시작 시 5초 카운트다운
  useEffect(() => {
    startGame()
    resetAudioTracking()
    gameStartTimeRef.current = Date.now()
    previousLandmarksRef.current = null
    
    // 5초 카운트다운 시작
    setCountdown(5)
    let count = 5
    
    const countdownInterval = setInterval(() => {
      count--
      setCountdown(count)
      
      if (count <= 0) {
        clearInterval(countdownInterval)
        setCountdown(null)
        
        // 랜덤 질문 선택
        const randomIndex = Math.floor(Math.random() * questions.length)
        const selectedQuestion = questions[randomIndex]
        setQuestion(selectedQuestion, 0)
        setShowQuestion(true)
        setIsInitialized(true)
        gameStartTimeRef.current = Date.now() // 질문 시작 시간
      }
    }, 1000)

    return () => {
      clearInterval(countdownInterval)
    }
  }, [])

  // 얼굴 인식 데이터 처리
  const handleFaceDetected = (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return

    const confidence = 0.8 // MediaPipe에서 제공하는 confidence 사용 가능
    
    // 이전 랜드마크와 함께 저장
    updateFaceData({ 
      landmarks, 
      confidence,
      previousLandmarks: previousLandmarksRef.current || undefined
    })
    
    // 현재 랜드마크를 다음 프레임을 위해 저장
    previousLandmarksRef.current = landmarks

    // 점수 계산 (초당 N회만 수행 - 성능 최적화)
    const faceScore = calculateFaceScore({ 
      landmarks, 
      confidence,
      previousLandmarks: previousLandmarksRef.current || undefined
    })
    
    // 음성 평가 제거됨 - 얼굴 점수만 사용 (실시간 표시용)
    const totalScore = faceScore * 0.1 // 얼굴 10%만 표시 (AI 평가는 결과 화면에서만)
    
    // 상세 점수 계산 (얼굴만)
    const faceDetails = calculateFaceScoreDetails({ 
      landmarks, 
      confidence,
      previousLandmarks: previousLandmarksRef.current || undefined
    })
    
    setScores(faceScore, 0, totalScore) // audioScore는 0으로 설정
    setScoreDetails(faceDetails, null) // audioDetails는 null
    setFeedback(generateFeedback(faceScore, 0, faceDetails))
  }

  // 음성 분석 데이터 처리 (음성 인식만, 점수 계산 제거)
  const handleAudioData = (data: { volume: number; frequency: number; isSpeaking: boolean }) => {
    updateAudioData(data)
    
    // 음성 추적 데이터 업데이트 (음성 인식용으로만 사용)
    const state = useGameStore.getState()
    const tracking = state.audioTracking
    const currentTime = Date.now()
    
    // 총 시간 업데이트
    if (tracking.startTime) {
      const totalTime = currentTime - tracking.startTime
      let speakingTime = tracking.speakingTime
      
      // 말하는 중이면 시간 추가 (약 100ms 단위로 추정)
      if (data.isSpeaking) {
        speakingTime += 100
      }
      
      updateAudioTracking({
        totalTime,
        speakingTime,
        volume: data.volume,
        frequency: data.frequency,
      })
    }

    // 음성 평가 제거됨 - 점수 계산 없음
  }

  // 게임 제출 처리 (시간 만료 또는 제출 버튼 클릭)
  const submitGame = async () => {
    // 질문과 답변 저장
    const state = useGameStore.getState()
    setQuestionAnswer(state.currentQuestion, transcript)
    
    const faceScore = state.faceScore || 0
    
    // AI 평가 시도
    try {
      const aiResult = await evaluateAnswer(
        state.currentQuestion,
        transcript,
        faceScore,
        0 // audioScore는 더 이상 사용하지 않음
      )
      
      // AI 평가 성공 시 (가중치: 얼굴 10% + AI 90%)
      const finalResult = {
        totalScore: aiResult.finalScore,
        questionCount: 1,
        averageScore: aiResult.finalScore, // 등급 계산용으로 유지
        faceScore: faceScore,
        aiScore: aiResult.aiScore,
        aiFeedback: aiResult.aiFeedback,
        faceScoreDetails: state.faceScoreDetails,
        question: state.currentQuestion,
        answer: transcript,
      }
      endGame()
      onGameEnd(finalResult)
    } catch (error) {
      // AI 평가 실패 시 기본 점수 사용
      console.error('AI 평가 실패, 기본 점수 사용:', error)
      // 얼굴 점수만으로 기본 점수 계산 (얼굴 10% + AI 기본값 50점 * 90%)
      const defaultScore = Math.round((faceScore * 0.1) + (50 * 0.9))
      
      const finalResult = {
        totalScore: defaultScore,
        questionCount: 1,
        averageScore: defaultScore,
        faceScore: faceScore,
        aiScore: null,
        aiFeedback: null,
        faceScoreDetails: state.faceScoreDetails,
        question: state.currentQuestion,
        answer: transcript,
      }
      endGame()
      onGameEnd(finalResult)
    }
  }

  // 시간 만료 처리
  const handleTimeUp = () => {
    submitGame()
  }

  // 카운트다운 표시
  if (countdown !== null) {
    return (
      <div className="countdown-overlay">
        <div className="countdown-content">
          <div className="countdown-number">{countdown}</div>
          <div className="countdown-text">게임 시작까지</div>
        </div>
      </div>
    )
  }

  if (!isInitialized || !showQuestion) {
    return <div className="loading">게임을 준비하는 중...</div>
  }

  return (
    <div className="game-page">
      <QuestionOverlay 
        question={currentQuestion} 
        timeLimit={60}
        onTimeUp={handleTimeUp}
      />
      
      <div className="game-content">
        <div className="media-section">
          <ScoreBreakdown />
          <CameraView 
            onFaceDetected={handleFaceDetected}
            fps={30}
            transcript={transcript}
          />
          <div className="right-panel">
            <MicAnalyzer 
              onAudioData={handleAudioData}
              onTranscript={setTranscript}
              sensitivity={0.35}
            />
            <button 
              className="submit-button"
              onClick={submitGame}
            >
              제출하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
