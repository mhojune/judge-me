/**
 * scoreCalculator 유틸리티
 * 
 * 역할:
 * - 얼굴 인식 데이터 기반 점수 계산
 * - 음성 분석 데이터 기반 점수 계산
 * - 종합 평가 점수 산출
 */

interface FaceData {
  landmarks: any[]
  confidence: number
  previousLandmarks?: any[] // 프레임 간 비교용
}

interface AudioData {
  volume?: number
  frequency?: number
  isSpeaking?: boolean
  speakingRatio?: number // 말하기 시간 비율
  volumeHistory?: number[] // 볼륨 히스토리
  frequencyHistory?: number[] // 주파수 히스토리
}

/**
 * 얼굴 인식 기반 점수 계산 (개선됨)
 * - 시선 접촉 (eye contact): 실제 시선 방향 분석
 * - 표정 안정성 (facial stability): 프레임 간 얼굴 위치 변화량
 * - 자세 (posture): 수직 각도 + 좌우 기울기
 */
export function calculateFaceScore(faceData: FaceData | null): number {
  if (!faceData || !faceData.landmarks) return 0

  const landmarks = faceData.landmarks
  
  // 시선 접촉 점수: 실제 시선 방향 분석
  const eyeContactScore = calculateEyeContactScore(landmarks, faceData.confidence)
  
  // 표정 안정성 점수: 프레임 간 얼굴 위치 변화량
  const stabilityScore = calculateFaceStabilityScore(landmarks, faceData.previousLandmarks, faceData.confidence)
  
  // 자세 점수: 수직 각도 + 좌우 기울기
  const postureScore = calculatePostureScore(landmarks)

  const total = (eyeContactScore * 0.4) + (stabilityScore * 0.3) + (postureScore * 0.3)
  return Math.min(100, Math.max(0, total))
}

/**
 * 얼굴 인식 기반 상세 점수 계산 (개선됨)
 */
export function calculateFaceScoreDetails(faceData: FaceData | null): {
  eyeContact: number
  stability: number
  posture: number
  total: number
} {
  if (!faceData || !faceData.landmarks) {
    return { eyeContact: 0, stability: 0, posture: 0, total: 0 }
  }

  const landmarks = faceData.landmarks
  
  // 시선 접촉 점수
  const eyeContactScore = calculateEyeContactScore(landmarks, faceData.confidence)
  const eyeContact = eyeContactScore * 0.4

  // 표정 안정성 점수
  const stabilityScore = calculateFaceStabilityScore(landmarks, faceData.previousLandmarks, faceData.confidence)
  const stability = stabilityScore * 0.3

  // 자세 점수
  const postureScore = calculatePostureScore(landmarks)
  const posture = postureScore * 0.3

  const total = Math.min(100, eyeContact + stability + posture)

  return { eyeContact, stability, posture, total }
}

/**
 * 음성 분석 기반 점수 계산 (개선됨)
 * - 말하기 시간 비율: 전체 시간 대비 말한 시간
 * - 볼륨 안정성: 사용자 평균 볼륨 대비 일정 범위 유지
 * - 주파수 안정성: 주파수 변화량의 표준편차로 측정
 */
export function calculateAudioScore(audioData: AudioData | null): number {
  if (!audioData) return 0

  // 말하기 시간 비율 점수 (0-40점)
  const speakingRatio = audioData.speakingRatio || 0
  const speakingScore = Math.min(40, speakingRatio * 40)

  // 볼륨 안정성 점수 (0-30점)
  const volumeStabilityScore = calculateVolumeStabilityScore(audioData.volumeHistory || [])

  // 주파수 안정성 점수 (0-30점)
  const frequencyStabilityScore = calculateFrequencyStabilityScore(audioData.frequencyHistory || [])

  const total = speakingScore + volumeStabilityScore + frequencyStabilityScore
  return Math.min(100, Math.max(0, total))
}

/**
 * 음성 분석 기반 상세 점수 계산 (개선됨)
 */
export function calculateAudioScoreDetails(audioData: AudioData | null): {
  speaking: number
  volume: number
  frequency: number
  total: number
} {
  if (!audioData) {
    return { speaking: 0, volume: 0, frequency: 0, total: 0 }
  }

  // 말하기 시간 비율 점수
  const speakingRatio = audioData.speakingRatio || 0
  const speaking = Math.min(40, speakingRatio * 40)

  // 볼륨 안정성 점수
  const volumeStabilityScore = calculateVolumeStabilityScore(audioData.volumeHistory || [])
  const volume = volumeStabilityScore

  // 주파수 안정성 점수
  const frequencyStabilityScore = calculateFrequencyStabilityScore(audioData.frequencyHistory || [])
  const frequency = frequencyStabilityScore

  const total = Math.min(100, speaking + volume + frequency)

  return { speaking, volume, frequency, total }
}

/**
 * 종합 점수 계산
 */
export function calculateTotalScore(
  faceScore: number,
  audioScore: number,
  weights: { face: number; audio: number } = { face: 0.6, audio: 0.4 }
): number {
  const total = faceScore * weights.face + audioScore * weights.audio
  return Math.min(100, Math.max(0, total))
}

/**
 * 평가 피드백 생성 (얼굴 평가만 사용)
 */
export function generateFeedback(
  faceScore: number,
  audioScore: number,
  faceDetails?: { eyeContact: number; stability: number; posture: number } | null
): string {
  const feedbacks: string[] = []

  // 얼굴 평가 피드백 (세부 항목 기반)
  if (faceDetails) {
    // eyeContact는 0-40 범위 (가중치 40%)
    // stability는 0-30 범위 (가중치 30%)
    // posture는 0-30 범위 (가중치 30%)
    
    if (faceDetails.eyeContact < 20) {
      feedbacks.push('카메라를 똑바로 보세요')
    } else if (faceDetails.eyeContact > 30) {
      feedbacks.push('좋은 시선 접촉입니다!')
    }

    if (faceDetails.stability < 15) {
      feedbacks.push('고개를 고정해주세요')
    }

    if (faceDetails.posture < 15) {
      feedbacks.push('자세를 바르게 해주세요')
    }
  } else {
    // 세부 정보가 없을 때는 전체 점수 기반
    if (faceScore < 50) {
      feedbacks.push('카메라를 똑바로 보세요')
    } else if (faceScore > 80) {
      feedbacks.push('좋은 시선 접촉입니다!')
    }
  }

  // 음성 평가는 제거되었지만 호환성을 위해 유지
  if (audioScore > 0 && audioScore < 50) {
    feedbacks.push('더 명확하게 말해주세요')
  } else if (audioScore > 80) {
    feedbacks.push('명확한 발음입니다!')
  }

  // 피드백이 없으면 기본 메시지
  return feedbacks.length > 0 ? feedbacks.join(', ') : '계속 잘하고 있습니다!'
}

// 헬퍼 함수들
function calculateCenter(landmarks: any[], indices: number[]): { x: number; y: number } {
  let sumX = 0
  let sumY = 0
  indices.forEach((idx) => {
    sumX += landmarks[idx].x
    sumY += landmarks[idx].y
  })
  return {
    x: sumX / indices.length,
    y: sumY / indices.length,
  }
}

/**
 * 시선 접촉 점수 계산 (개선됨)
 * 눈의 위치와 코/얼굴 중심을 비교하여 실제 시선 방향 분석
 */
function calculateEyeContactScore(landmarks: any[], confidence: number): number {
  if (!landmarks || landmarks.length === 0) return 0

  const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
  const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
  
  const leftEyeCenter = calculateCenter(landmarks, leftEyeIndices)
  const rightEyeCenter = calculateCenter(landmarks, rightEyeIndices)
  const nose = landmarks[4] // 코 끝
  const faceCenter = landmarks[10] // 얼굴 중심 (이마 중앙)
  
  if (!nose || !faceCenter) return confidence * 100

  // 눈의 중심점
  const eyeCenter = {
    x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
    y: (leftEyeCenter.y + rightEyeCenter.y) / 2,
  }

  // 얼굴 중심과의 거리 (정면을 보면 작아짐)
  const eyeToFaceCenterDistance = Math.sqrt(
    Math.pow(eyeCenter.x - faceCenter.x, 2) + Math.pow(eyeCenter.y - faceCenter.y, 2)
  )

  // 시선이 정면을 향할수록 eyeToFaceCenterDistance가 작아짐
  // 정규화된 점수 계산
  const baseScore = confidence * 100
  const eyeAlignmentBonus = Math.max(0, 30 - eyeToFaceCenterDistance * 100) // 최대 30점 보너스
  
  return Math.min(100, baseScore * 0.7 + eyeAlignmentBonus)
}

/**
 * 얼굴 안정성 점수 계산 (개선됨)
 * 프레임 간 얼굴 위치 변화량 측정
 */
function calculateFaceStabilityScore(
  currentLandmarks: any[], 
  previousLandmarks: any[] | undefined,
  confidence: number
): number {
  if (!previousLandmarks || previousLandmarks.length === 0) {
    // 이전 프레임이 없으면 confidence 기반 점수
    return confidence * 100
  }

  // 얼굴 주요 포인트들의 변화량 계산
  const keyPoints = [4, 10, 33, 152, 362] // 코, 얼굴 중심, 왼쪽 눈, 턱, 오른쪽 눈
  let totalMovement = 0
  let validPoints = 0

  for (const idx of keyPoints) {
    if (currentLandmarks[idx] && previousLandmarks[idx]) {
      const dx = currentLandmarks[idx].x - previousLandmarks[idx].x
      const dy = currentLandmarks[idx].y - previousLandmarks[idx].y
      const movement = Math.sqrt(dx * dx + dy * dy)
      totalMovement += movement
      validPoints++
    }
  }

  if (validPoints === 0) return confidence * 100

  const avgMovement = totalMovement / validPoints
  
  // 움직임이 적을수록 높은 점수 (안정적)
  // 0.01 이하의 변화는 거의 없음으로 간주
  const stabilityScore = Math.max(0, 100 - avgMovement * 2000)
  
  return Math.min(100, stabilityScore * 0.7 + confidence * 100 * 0.3)
}

/**
 * 자세 점수 계산 (개선됨)
 * 수직 각도 + 좌우 기울기 모두 고려
 */
function calculatePostureScore(landmarks: any[]): number {
  const nose = landmarks[4] // 코 끝
  const chin = landmarks[152] // 턱
  const leftEye = landmarks[33] // 왼쪽 눈
  const rightEye = landmarks[362] // 오른쪽 눈
  
  if (!nose || !chin || !leftEye || !rightEye) return 50

  // 수직 각도 (기존 로직)
  const verticalAngle = Math.abs(Math.atan2(chin.y - nose.y, chin.x - nose.x) * 180 / Math.PI)
  const verticalScore = Math.max(0, 100 - Math.abs(verticalAngle - 90) * 2)

  // 좌우 기울기 계산
  const eyeLevelDiff = Math.abs(leftEye.y - rightEye.y)
  const tiltScore = Math.max(0, 100 - eyeLevelDiff * 500) // 기울기가 적을수록 높은 점수

  // 수직 60% + 기울기 40%
  return (verticalScore * 0.6) + (tiltScore * 0.4)
}

/**
 * 볼륨 안정성 점수 계산 (개선됨)
 * 사용자의 평균 볼륨 대비 일정 범위 내 유지
 */
function calculateVolumeStabilityScore(volumeHistory: number[]): number {
  if (volumeHistory.length < 5) {
    // 히스토리가 부족하면 기본 점수
    return 15
  }

  // 평균 볼륨 계산
  const avgVolume = volumeHistory.reduce((sum, v) => sum + v, 0) / volumeHistory.length
  
  // 표준편차 계산
  const variance = volumeHistory.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumeHistory.length
  const stdDev = Math.sqrt(variance)

  // 표준편차가 작을수록 안정적 (높은 점수)
  // 평균 볼륨의 20% 이내 변화는 안정적으로 간주
  const stabilityThreshold = avgVolume * 0.2
  const stabilityRatio = Math.max(0, 1 - (stdDev / stabilityThreshold))
  
  return Math.min(30, stabilityRatio * 30)
}

/**
 * 주파수 안정성 점수 계산 (개선됨)
 * 주파수 변화량의 표준편차로 측정
 */
function calculateFrequencyStabilityScore(frequencyHistory: number[]): number {
  if (frequencyHistory.length < 5) {
    // 히스토리가 부족하면 기본 점수
    return 15
  }

  // 0이 아닌 주파수만 필터링
  const validFrequencies = frequencyHistory.filter(f => f > 0)
  if (validFrequencies.length < 3) return 10

  // 평균 주파수 계산
  const avgFrequency = validFrequencies.reduce((sum, f) => sum + f, 0) / validFrequencies.length
  
  // 표준편차 계산
  const variance = validFrequencies.reduce((sum, f) => sum + Math.pow(f - avgFrequency, 2), 0) / validFrequencies.length
  const stdDev = Math.sqrt(variance)

  // 표준편차가 작을수록 안정적 (높은 점수)
  // 평균 주파수의 15% 이내 변화는 안정적으로 간주
  const stabilityThreshold = avgFrequency * 0.15
  const stabilityRatio = Math.max(0, 1 - (stdDev / stabilityThreshold))
  
  return Math.min(30, stabilityRatio * 30)
}
