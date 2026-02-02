import { useState } from 'react'
import ReadyPage from './pages/ReadyPage'
import GamePage from './pages/GamePage'
import ResultPage from './pages/ResultPage'
import './App.css'

function App() {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result'>('ready')
  const [result, setResult] = useState<any>(null)

  const handleGameStart = () => {
    setGameState('playing')
  }

  const handleGameEnd = (gameResult: any) => {
    setResult(gameResult)
    setGameState('result')
  }

  const handleRestart = () => {
    setGameState('ready')
    setResult(null)
  }

  return (
    <div className="app">
      {gameState === 'ready' ? (
        <ReadyPage onStart={handleGameStart} />
      ) : gameState === 'playing' ? (
        <GamePage onGameEnd={handleGameEnd} />
      ) : (
        <ResultPage result={result} onRestart={handleRestart} />
      )}
    </div>
  )
}

export default App
