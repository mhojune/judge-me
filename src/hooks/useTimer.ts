import { useState, useEffect, useRef } from 'react'

/**
 * useTimer 훅
 * 
 * 역할:
 * - 카운트다운 타이머 관리
 * - 시간 만료 시 콜백 실행
 * - 정확한 시간 추적
 */
export function useTimer(initialTime: number, onExpire?: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isExpired, setIsExpired] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onExpireRef = useRef(onExpire)

  // onExpire 콜백을 ref에 저장
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  // initialTime이 변경되면 타이머 리셋
  useEffect(() => {
    setTimeLeft(initialTime)
    setIsExpired(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [initialTime])

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true)
      if (onExpireRef.current) {
        onExpireRef.current()
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true)
          if (onExpireRef.current) {
            onExpireRef.current()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timeLeft])

  const reset = () => {
    setTimeLeft(initialTime)
    setIsExpired(false)
  }

  return {
    timeLeft,
    isExpired,
    reset,
  }
}
