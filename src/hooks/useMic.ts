import { useState, useCallback } from 'react'

/**
 * useMic 훅
 * 
 * 역할:
 * - 마이크 스트림 관리
 * - 권한 요청 및 에러 처리
 * - 모바일 Safari 환경 고려
 */
export function useMic() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startMic = useCallback(async () => {
    try {
      // 모바일 Safari를 위한 옵션
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setIsStreaming(true)
      setError(null)
      return mediaStream
    } catch (err: any) {
      const errorMessage = 
        err.name === 'NotAllowedError' 
          ? '마이크 권한이 거부되었습니다.'
          : err.name === 'NotFoundError'
          ? '마이크를 찾을 수 없습니다.'
          : '마이크를 시작할 수 없습니다.'
      
      setError(errorMessage)
      setIsStreaming(false)
      throw err
    }
  }, [])

  const stopMic = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsStreaming(false)
  }, [stream])

  return {
    isStreaming,
    stream,
    error,
    startMic,
    stopMic,
  }
}
