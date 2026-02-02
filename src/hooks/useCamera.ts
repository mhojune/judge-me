import { useState, useCallback } from 'react'

/**
 * useCamera 훅
 * 
 * 역할:
 * - 카메라 스트림 관리
 * - 권한 요청 및 에러 처리
 * - 모바일 Safari 환경 고려
 */
export function useCamera() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    try {
      // 모바일 Safari를 위한 옵션
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setIsStreaming(true)
      setError(null)
      return mediaStream
    } catch (err: any) {
      const errorMessage = 
        err.name === 'NotAllowedError' 
          ? '카메라 권한이 거부되었습니다.'
          : err.name === 'NotFoundError'
          ? '카메라를 찾을 수 없습니다.'
          : '카메라를 시작할 수 없습니다.'
      
      setError(errorMessage)
      setIsStreaming(false)
      throw err
    }
  }, [])

  const stopCamera = useCallback(() => {
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
    startCamera,
    stopCamera,
  }
}
