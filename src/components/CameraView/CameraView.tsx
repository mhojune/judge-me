import { useEffect, useRef, useState } from 'react'
import { Camera } from '@mediapipe/camera_utils'
import { FaceMesh } from '@mediapipe/face_mesh'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { FACEMESH_TESSELATION } from '@mediapipe/face_mesh'
import { useCamera } from '../../hooks/useCamera'
import './CameraView.css'

interface CameraViewProps {
  onFaceDetected?: (landmarks: any) => void
  fps?: number
  transcript?: string // 음성 인식 텍스트
}

/**
 * CameraView 컴포넌트
 * 
 * 역할:
 * - 사용자 카메라 스트림을 가져와 화면에 표시
 * - MediaPipe Face Mesh를 사용한 얼굴 인식
 * - 얼굴 랜드마크를 캔버스에 그리기
 * - FPS 제한을 통한 성능 최적화
 */
export default function CameraView({ onFaceDetected, fps = 30, transcript = '' }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { startCamera, stopCamera, isStreaming } = useCamera()

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    let faceMesh: FaceMesh | null = null
    let camera: Camera | null = null

    const initializeFaceMesh = async () => {
      faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        },
      })

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      faceMesh.onResults((results) => {
        if (ctx && canvas) {
          ctx.save()
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0]
            
            // 얼굴 메시 그리기
            drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
              color: '#C0C0C070',
              lineWidth: 1,
            })
            
            // 랜드마크 그리기
            drawLandmarks(ctx, landmarks, {
              color: '#FF0000',
              radius: 1,
            })

            // 부모 컴포넌트에 얼굴 감지 정보 전달
            onFaceDetected?.(landmarks)
          }
        }
      })

      // 카메라 초기화
      camera = new Camera(video, {
        onFrame: async () => {
          if (faceMesh) {
            await faceMesh.send({ image: video })
          }
        },
        width: 1280,
        height: 720,
      })

      try {
        await camera.start()
        setIsActive(true)
        setError(null)
      } catch (err) {
        setError('카메라 접근 권한이 필요합니다.')
        console.error('Camera initialization error:', err)
      }
    }

    if (isStreaming) {
      initializeFaceMesh()
    }

    // 캔버스 크기 조정
    const resizeCanvas = () => {
      if (canvas && video) {
        canvas.width = video.videoWidth || 1280
        canvas.height = video.videoHeight || 720
      }
    }

    video.addEventListener('loadedmetadata', resizeCanvas)
    resizeCanvas()

    return () => {
      video.removeEventListener('loadedmetadata', resizeCanvas)
      if (camera) {
        camera.stop()
      }
      if (faceMesh) {
        faceMesh.close()
      }
      setIsActive(false)
    }
  }, [isStreaming, fps, onFaceDetected])

  const handleStart = async () => {
    try {
      await startCamera()
    } catch (err) {
      setError('카메라를 시작할 수 없습니다.')
      console.error(err)
    }
  }

  const handleStop = () => {
    stopCamera()
    setIsActive(false)
  }

  return (
    <div className="camera-view">
      <div className="camera-container">
        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="camera-canvas" />
        
        {/* 음성 인식 텍스트 표시 영역 */}
        {transcript && (
          <div className="speech-transcript">
            <div className="transcript-label">🎤 인식된 말:</div>
            <div className="transcript-text">{transcript}</div>
          </div>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="camera-controls">
        {!isActive ? (
          <button onClick={handleStart} className="btn-primary">
            카메라 시작
          </button>
        ) : (
          <button onClick={handleStop} className="btn-secondary">
            카메라 중지
          </button>
        )}
      </div>
    </div>
  )
}
