import { useState } from 'react'
import { motion } from 'framer-motion'
import CameraView from '../components/CameraView/CameraView'
import MicAnalyzer from '../components/MicAnalyzer/MicAnalyzer'
import './ReadyPage.css'

interface ReadyPageProps {
  onStart: () => void
}

/**
 * ReadyPage 컴포넌트
 * 
 * 역할:
 * - 게임 시작 전 마이크/카메라 조정
 * - 사용자가 준비되면 게임 시작
 */
export default function ReadyPage({ onStart }: ReadyPageProps) {
  const [cameraStarted, setCameraStarted] = useState(false)
  const [micStarted, setMicStarted] = useState(false)

  return (
    <div className="ready-page">
      <div className="ready-background">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>
      
      <motion.div 
        className="ready-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="ready-header">
          <motion.div 
            className="ready-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            🎮
          </motion.div>
          <h1 className="ready-title">게임 준비</h1>
          <p className="ready-description">
            마이크와 카메라를 시작하고 조정해주세요.<br />
            준비가 되면 게임 시작 버튼을 눌러주세요.
          </p>
        </div>

        <div className="ready-media-section">
          <motion.div 
            className="media-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="media-header">
              <span className="media-icon">📷</span>
              <h3>카메라</h3>
            </div>
            <div className="media-content">
              <CameraView 
                onFaceDetected={() => setCameraStarted(true)}
                fps={30}
              />
            </div>
            {cameraStarted && (
              <motion.div 
                className="ready-indicator"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="check-icon">✓</span> 카메라 작동 중
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            className="media-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="media-header">
              <span className="media-icon">🎤</span>
              <h3>마이크</h3>
            </div>
            <div className="media-content">
              <MicAnalyzer 
                onAudioData={() => setMicStarted(true)}
                sensitivity={0.35}
              />
            </div>
            {micStarted && (
              <motion.div 
                className="ready-indicator"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="check-icon">✓</span> 마이크 작동 중
              </motion.div>
            )}
          </motion.div>
        </div>

        <motion.div 
          className="ready-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="ready-info">
            <span className="info-icon">💡</span>
            <p>카메라와 마이크를 켜야 AI 심사관이 정확한 평가를 할 수 있습니다.</p>
          </div>

          <motion.button 
            className="start-button"
            onClick={onStart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="button-text">게임 시작</span>
            <span className="button-arrow">→</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
