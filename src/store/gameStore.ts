import { create } from 'zustand'

interface GameState {
  // 게임 상태
  isPlaying: boolean
  currentQuestion: string
  questionIndex: number
  
  // 점수 및 평가
  currentScore: number
  totalScore: number
  feedback: string | null
  faceScore: number
  audioScore: number
  faceScoreDetails: {
    eyeContact: number
    stability: number
    posture: number
  } | null
  audioScoreDetails: {
    speaking: number
    volume: number
    frequency: number
  } | null
  
  // 질문과 답변
  questionAnswer: {
    question: string
    answer: string
  } | null
  
  // 얼굴 인식 데이터
  faceData: {
    landmarks: any[]
    confidence: number
    previousLandmarks?: any[]
  } | null
  
  // 음성 분석 데이터
  audioData: {
    volume: number
    frequency: number
    isSpeaking: boolean
  } | null
  
  // 음성 평가 추적 데이터
  audioTracking: {
    speakingTime: number // 말한 시간 (밀리초)
    totalTime: number // 총 시간 (밀리초)
    volumeHistory: number[] // 볼륨 히스토리
    frequencyHistory: number[] // 주파수 히스토리
    startTime: number | null // 게임 시작 시간
  }
  
  // 액션
  startGame: () => void
  endGame: () => void
  setQuestion: (question: string, index: number) => void
  updateScore: (score: number) => void
  setFeedback: (feedback: string) => void
  setQuestionAnswer: (question: string, answer: string) => void
  setScores: (faceScore: number, audioScore: number, totalScore: number) => void
  setScoreDetails: (
    faceDetails: { eyeContact: number; stability: number; posture: number } | null,
    audioDetails: { speaking: number; volume: number; frequency: number } | null
  ) => void
  updateFaceData: (data: { landmarks: any[]; confidence: number; previousLandmarks?: any[] }) => void
  updateAudioData: (data: { volume: number; frequency: number; isSpeaking: boolean }) => void
  updateAudioTracking: (data: { speakingTime?: number; totalTime?: number; volume?: number; frequency?: number }) => void
  resetAudioTracking: () => void
  reset: () => void
}

/**
 * gameStore (Zustand)
 * 
 * 역할:
 * - 전역 게임 상태 관리
 * - 점수 및 평가 데이터 저장
 * - 얼굴 인식 및 음성 분석 데이터 저장
 * - 게임 플로우 제어
 */
export const useGameStore = create<GameState>((set) => ({
  // 초기 상태
  isPlaying: false,
  currentQuestion: '',
  questionIndex: 0,
  currentScore: 0,
  totalScore: 0,
  feedback: null,
  faceScore: 0,
  audioScore: 0,
  faceScoreDetails: null,
  audioScoreDetails: null,
  questionAnswer: null,
  faceData: null,
  audioData: null,
  audioTracking: {
    speakingTime: 0,
    totalTime: 0,
    volumeHistory: [],
    frequencyHistory: [],
    startTime: null,
  },

  // 액션
  startGame: () => set({ 
    isPlaying: true, 
    currentScore: 0, 
    totalScore: 0, 
    faceScore: 0, 
    audioScore: 0,
    faceScoreDetails: null,
    audioScoreDetails: null,
    questionAnswer: null,
    audioTracking: {
      speakingTime: 0,
      totalTime: 0,
      volumeHistory: [],
      frequencyHistory: [],
      startTime: Date.now(),
    },
  }),
  
  endGame: () => set({ isPlaying: false }),
  
  setQuestion: (question, index) => 
    set({ currentQuestion: question, questionIndex: index }),
  
  updateScore: (score) => 
    set((state) => ({ 
      currentScore: score,
      totalScore: state.totalScore + score 
    })),
  
  setFeedback: (feedback) => set({ feedback }),
  
  setQuestionAnswer: (question, answer) => 
    set({ questionAnswer: { question, answer } }),
  
  setScores: (faceScore, audioScore, totalScore) => 
    set({ faceScore, audioScore, currentScore: totalScore }),
  
  setScoreDetails: (faceDetails, audioDetails) =>
    set({ faceScoreDetails: faceDetails, audioScoreDetails: audioDetails }),
  
  updateFaceData: (data) => set({ faceData: data }),
  
  updateAudioData: (data) => set({ audioData: data }),
  
  updateAudioTracking: (data) => 
    set((state) => {
      const tracking = { ...state.audioTracking }
      if (data.speakingTime !== undefined) tracking.speakingTime = data.speakingTime
      if (data.totalTime !== undefined) tracking.totalTime = data.totalTime
      if (data.volume !== undefined) {
        tracking.volumeHistory = [...tracking.volumeHistory, data.volume].slice(-100) // 최근 100개만 유지
      }
      if (data.frequency !== undefined) {
        tracking.frequencyHistory = [...tracking.frequencyHistory, data.frequency].slice(-100)
      }
      return { audioTracking: tracking }
    }),
  
  resetAudioTracking: () => 
    set({ 
      audioTracking: {
        speakingTime: 0,
        totalTime: 0,
        volumeHistory: [],
        frequencyHistory: [],
        startTime: Date.now(),
      }
    }),
  
  reset: () => set({
    isPlaying: false,
    currentQuestion: '',
    questionIndex: 0,
    currentScore: 0,
    totalScore: 0,
    feedback: null,
    faceScore: 0,
    audioScore: 0,
    faceScoreDetails: null,
    audioScoreDetails: null,
    questionAnswer: null,
    faceData: null,
    audioData: null,
    audioTracking: {
      speakingTime: 0,
      totalTime: 0,
      volumeHistory: [],
      frequencyHistory: [],
      startTime: null,
    },
  }),
}))
