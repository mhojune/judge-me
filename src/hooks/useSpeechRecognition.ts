import { useEffect, useRef, useState } from 'react'

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: Event) => void
  onend: () => void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

/**
 * useSpeechRecognition 훅
 * 
 * 역할:
 * - Web Speech API를 사용한 음성 인식
 * - 실시간 텍스트 변환
 * - 브라우저 호환성 처리 (Chrome, Edge)
 */
export function useSpeechRecognition(lang: string = 'ko-KR') {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isListeningRef = useRef(false)
  const finalTranscriptRef = useRef('')

  useEffect(() => {
    // 브라우저 지원 확인
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      setError('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge를 사용해주세요.')
      return
    }

    setIsSupported(true)
    
    const recognition = new SpeechRecognition()
    recognition.continuous = true // 연속 인식
    recognition.interimResults = true // 중간 결과도 표시
    recognition.lang = lang

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      // 최종 결과는 누적
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript
        setTranscript(finalTranscriptRef.current + interimTranscript)
      } else {
        // 중간 결과는 최종 텍스트에 추가해서 표시
        setTranscript(finalTranscriptRef.current + interimTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'no-speech') {
        // no-speech는 정상적인 경우이므로 에러로 표시하지 않음
        return
      } else if (event.error === 'not-allowed') {
        setError('마이크 권한이 필요합니다.')
      } else {
        setError(`음성 인식 오류: ${event.error}`)
      }
      setIsListening(false)
      isListeningRef.current = false
    }

    recognition.onend = () => {
      setIsListening(false)
      // 연속 인식을 위해 자동 재시작 (isListening이 true인 경우만)
      if (isListeningRef.current) {
        try {
          recognition.start()
        } catch (err) {
          console.error('Failed to restart recognition:', err)
        }
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current.abort()
      }
    }
  }, [lang])

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      setError('음성 인식을 시작할 수 없습니다.')
      return
    }

    try {
      finalTranscriptRef.current = '' // 새로 시작할 때 텍스트 초기화
      setTranscript('')
      setError(null)
      isListeningRef.current = true
      recognitionRef.current.start()
      setIsListening(true)
    } catch (err: any) {
      console.error('Failed to start recognition:', err)
      setError('음성 인식을 시작할 수 없습니다.')
      isListeningRef.current = false
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      isListeningRef.current = false
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const clearTranscript = () => {
    finalTranscriptRef.current = ''
    setTranscript('')
  }

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    clearTranscript,
  }
}
