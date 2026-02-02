import { useEffect, useRef, useState } from 'react'
import { useMic } from '../../hooks/useMic'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import './MicAnalyzer.css'

interface MicAnalyzerProps {
  onAudioData?: (data: {
    volume: number
    frequency: number
    isSpeaking: boolean
  }) => void
  onTranscript?: (transcript: string) => void
  sensitivity?: number
}

/**
 * MicAnalyzer 컴포넌트
 * 
 * 역할:
 * - 사용자 마이크 입력을 실시간으로 분석
 * - 음성 볼륨 및 주파수 분석
 * - 말하기 상태 감지
 * - Web Audio API를 사용한 오디오 처리
 */
export default function MicAnalyzer({ 
  onAudioData,
  onTranscript,
  sensitivity = 0.4 // 더 덜 민감하게 조정
}: MicAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [volume, setVolume] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { startMic, stopMic, isStreaming, stream } = useMic()
  const { transcript, isListening, isSupported, error: speechError, startListening, stopListening } = useSpeechRecognition('ko-KR')
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const onAudioDataRef = useRef(onAudioData)
  const streamRef = useRef<MediaStream | null>(null)
  const lastVolumeRef = useRef(0)
  const lastSpeakingRef = useRef(false)
  const updateCounterRef = useRef(0)
  const noiseLevelRef = useRef<number | null>(null) // 기본 노이즈 레벨
  const noiseSamplesRef = useRef<number[]>([]) // 노이즈 샘플 수집
  const calibrationFramesRef = useRef(0) // 캘리브레이션 프레임 카운터

  // onAudioData 콜백을 ref에 저장하여 의존성 배열 문제 해결
  useEffect(() => {
    onAudioDataRef.current = onAudioData
  }, [onAudioData])

  // stream을 ref에 저장
  useEffect(() => {
    streamRef.current = stream
  }, [stream])

  useEffect(() => {
    // 스트림이 없거나 분석 중이 아니면 정리
    if (!stream || !isAnalyzing || stream.getTracks().length === 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error)
        audioContextRef.current = null
      }
      lastVolumeRef.current = 0
      lastSpeakingRef.current = false
      setVolume(0)
      setIsSpeaking(false)
      updateCounterRef.current = 0
      // 노이즈 레벨 리셋
      noiseLevelRef.current = null
      noiseSamplesRef.current = []
      calibrationFramesRef.current = 0
      return
    }

    const initializeAudio = () => {
      try {
        // 기존 컨텍스트가 있으면 정리
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(console.error)
          audioContextRef.current = null
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const analyser = audioContext.createAnalyser()
        
        // 스트림이 활성화되어 있는지 확인
        const audioTracks = stream.getAudioTracks()
        if (audioTracks.length === 0 || !audioTracks[0].enabled) {
          console.warn('No active audio tracks')
          audioContext.close().catch(console.error)
          return
        }

        const microphone = audioContext.createMediaStreamSource(stream)
        
        analyser.fftSize = 2048 // 더 높은 해상도로 변경
        analyser.smoothingTimeConstant = 0.3 // 더 빠른 반응
        analyser.minDecibels = -100
        analyser.maxDecibels = 0
        microphone.connect(analyser)
        
        audioContextRef.current = audioContext
        analyserRef.current = analyser
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
        
        analyzeAudio()
      } catch (err) {
        console.error('Audio initialization error:', err)
        setIsAnalyzing(false)
      }
    }

    const analyzeAudio = () => {
      if (!analyserRef.current || !dataArrayRef.current || !streamRef.current) {
        return
      }

      // 스트림이 여전히 활성화되어 있는지 확인
      const tracks = streamRef.current.getAudioTracks()
      if (tracks.length === 0 || !tracks[0].enabled || tracks[0].readyState !== 'live') {
        animationFrameRef.current = requestAnimationFrame(analyzeAudio)
        return
      }

      try {
        // getByteFrequencyData를 사용하여 볼륨 측정
        analyserRef.current.getByteFrequencyData(dataArrayRef.current)
        
        // 볼륨 계산 - 최대값과 평균을 모두 활용
        let sum = 0
        let maxValue = 0
        let nonZeroCount = 0
        
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          const value = dataArrayRef.current[i]
          sum += value
          if (value > maxValue) {
            maxValue = value
          }
          if (value > 0) {
            nonZeroCount++
          }
        }
        
        // 평균 계산
        const average = sum / dataArrayRef.current.length
        
        // 최대값과 평균을 조합하여 볼륨 계산
        const maxNormalized = maxValue / 255
        const avgNormalized = average / 255
        
        // 볼륨 = 최대값(70%) + 평균값(30%) + 활성 주파수 비율(보너스)
        const activeRatio = nonZeroCount / dataArrayRef.current.length
        const rawVolume = Math.min(1, 
          (maxNormalized * 0.7 + avgNormalized * 0.3) * 3 + activeRatio * 0.08
        )
        
        // 기본 노이즈 레벨 캘리브레이션 (처음 2초 동안)
        if (noiseLevelRef.current === null) {
          calibrationFramesRef.current++
          noiseSamplesRef.current.push(rawVolume)
          
          // 약 2초 후 (60프레임 기준) 평균 노이즈 레벨 계산
          if (calibrationFramesRef.current >= 60) {
            const noiseSum = noiseSamplesRef.current.reduce((a, b) => a + b, 0)
            noiseLevelRef.current = noiseSum / noiseSamplesRef.current.length
            console.log('기본 노이즈 레벨:', noiseLevelRef.current)
          }
        }
        
        // 노이즈 레벨을 빼서 실제 볼륨 계산
        let normalizedVolume = rawVolume
        if (noiseLevelRef.current !== null) {
          normalizedVolume = Math.max(0, rawVolume - noiseLevelRef.current)
          // 노이즈 제거 후 볼륨을 다시 정규화 (0-1 범위)
          const maxPossibleVolume = 1 - noiseLevelRef.current
          if (maxPossibleVolume > 0) {
            normalizedVolume = normalizedVolume / maxPossibleVolume
          }
        }
        
        // 말하기 상태 감지 (노이즈 레벨을 고려한 threshold)
        const baseThreshold = noiseLevelRef.current !== null 
          ? noiseLevelRef.current + (sensitivity * 0.3)
          : sensitivity * 0.5
        const speakingThreshold = Math.min(0.8, baseThreshold)
        const speaking = normalizedVolume > speakingThreshold || (noiseLevelRef.current !== null && maxValue > noiseLevelRef.current * 255 + 20)
        
        // 상태 업데이트 최적화: 값이 실제로 변경되었을 때만 업데이트
        // 볼륨은 0.01 이상 차이날 때만 업데이트
        const volumeDiff = Math.abs(normalizedVolume - lastVolumeRef.current)
        if (volumeDiff > 0.01) {
          lastVolumeRef.current = normalizedVolume
          setVolume(normalizedVolume)
        }
        
        // 말하기 상태는 실제로 변경되었을 때만 업데이트
        if (speaking !== lastSpeakingRef.current) {
          lastSpeakingRef.current = speaking
          setIsSpeaking(speaking)
        }
        
        // 주파수 분석
        let maxIndex = 0
        let frequencyMaxValue = 0
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          if (dataArrayRef.current[i] > frequencyMaxValue) {
            frequencyMaxValue = dataArrayRef.current[i]
            maxIndex = i
          }
        }
        const frequency = (maxIndex * audioContextRef.current!.sampleRate) / (2 * analyserRef.current.fftSize)
        
        // onAudioData 콜백은 10프레임마다 한 번만 호출 (약 60fps 기준으로 6fps)
        updateCounterRef.current++
        if (updateCounterRef.current >= 10) {
          updateCounterRef.current = 0
          onAudioDataRef.current?.({
            volume: normalizedVolume,
            frequency,
            isSpeaking: speaking,
          })
        }

        animationFrameRef.current = requestAnimationFrame(analyzeAudio)
      } catch (err) {
        console.error('Audio analysis error:', err)
        animationFrameRef.current = requestAnimationFrame(analyzeAudio)
      }
    }

    initializeAudio()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error)
        audioContextRef.current = null
      }
      analyserRef.current = null
      dataArrayRef.current = null
    }
  }, [stream, isAnalyzing, sensitivity])

  // 음성 인식 텍스트를 부모 컴포넌트에 전달
  useEffect(() => {
    if (transcript && onTranscript) {
      onTranscript(transcript)
    }
  }, [transcript, onTranscript])

  const handleStart = async () => {
    try {
      setIsAnalyzing(true)
      await startMic()
      
      // 음성 인식 시작 (지원되는 경우)
      if (isSupported) {
        startListening()
      }
    } catch (err) {
      console.error('Failed to start mic:', err)
      setIsAnalyzing(false)
    }
  }

  const handleStop = () => {
    setIsAnalyzing(false)
    stopMic()
    
    // 음성 인식 중지
    if (isListening) {
      stopListening()
    }
  }

  return (
    <div className="mic-analyzer">
      <div className="mic-visualizer">
        <div 
          className="volume-bar"
          style={{ 
            width: `${volume * 100}%`,
            backgroundColor: isSpeaking ? '#4CAF50' : '#2196F3'
          }}
        />
        <div className="volume-indicator">
          {isSpeaking ? '🎤 말하는 중' : '🔇 조용함'}
        </div>
      </div>
      
      {speechError && (
        <div className="speech-error">
          {speechError}
        </div>
      )}
      
      {!isSupported && (
        <div className="speech-warning">
          ⚠️ 음성 인식은 Chrome 또는 Edge에서만 지원됩니다.
        </div>
      )}
      
      <div className="mic-controls">
        {!isAnalyzing ? (
          <button onClick={handleStart} className="btn-primary">
            마이크 시작
          </button>
        ) : (
          <button onClick={handleStop} className="btn-secondary">
            마이크 중지
          </button>
        )}
      </div>
    </div>
  )
}
