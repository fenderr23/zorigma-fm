import React, { useState, useRef, useEffect, useCallback } from 'react'
import './BirthdayCake.css'

type GameState = 'idle' | 'loading' | 'lighting' | 'blowing' | 'celebration'

const CANDLE_COUNT = 5
const LIGHT_DISTANCE = 70 // px — зона зажигания
const LIGHT_TIME = 300 // ms — время удержания
const BLOW_THRESHOLD = 0.12 // порог громкости
const MEDIAPIPE_HANDS_VERSION = '0.4.1675469240'
const CONFETTI_CHARS = ['★', '✦', '♥', '✿', '◆', '●', '♪', '✧', '♡', '⚝']
const CONFETTI_COLORS = ['#FF69B4', '#FFD700', '#87CEEB', '#98FB98', '#DDA0DD', '#FF6347', '#00CED1']

interface BirthdayCakeProps {
  friendName: string
  onBack: () => void
}

const BirthdayCake: React.FC<BirthdayCakeProps> = ({ friendName, onBack }) => {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [litCandles, setLitCandles] = useState<boolean[]>(new Array(CANDLE_COUNT).fill(false))
  const [blowingOut, setBlowingOut] = useState<boolean[]>(new Array(CANDLE_COUNT).fill(false))
  const [lighterPos, setLighterPos] = useState({ x: -100, y: -100 })
  const [handDetected, setHandDetected] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; char: string; color: string; left: number; delay: number; duration: number }>>([])
  const [showCelebration, setShowCelebration] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const candleRefs = useRef<(HTMLDivElement | null)[]>([])
  const handsRef = useRef<any>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const cameraFrameRef = useRef<number>(0)
  const isSendingFrameRef = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const hoverTimerRef = useRef<{ [key: number]: number }>({})
  const litRef = useRef<boolean[]>(new Array(CANDLE_COUNT).fill(false))
  const gameStateRef = useRef<GameState>('idle')
  const lighterPosRef = useRef({ x: -100, y: -100 })

  const updateLighterPos = useCallback((x: number, y: number) => {
    lighterPosRef.current = { x, y }
    setLighterPos({ x, y })
  }, [])

  useEffect(() => { litRef.current = litCandles }, [litCandles])
  useEffect(() => { gameStateRef.current = gameState }, [gameState])

  const allLit = litCandles.every(Boolean)

  // Чередующиеся подсказки
  const [hintIndex, setHintIndex] = useState(0)
  const hints = [

    'если ты с компа то помаши рукой плиз чтобы камера тебя увидела',
    'сверху палец над свечками наводи чтобы зажечь фитиль'
  ]

  useEffect(() => {
    if (gameState !== 'lighting') return
    const interval = setInterval(() => {
      setHintIndex(prev => (prev + 1) % 2)
    }, 5000)
    return () => clearInterval(interval)
  }, [gameState])

  // Запуск MediaPipe Hands
  const startCamera = useCallback(async () => {
    setGameState('loading')
    try {
      const handsModule = await import('@mediapipe/hands')
      const HandsCtor =
        (handsModule as any).Hands ??
        (handsModule as any).default?.Hands ??
        (handsModule as any).default

      if (typeof HandsCtor !== 'function') {
        throw new Error('MediaPipe Hands constructor is unavailable')
      }

      const hands = new HandsCtor({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MEDIAPIPE_HANDS_VERSION}/${file}`
      })

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0]
          const tip = landmarks[8] // кончик указательного пальца
          // Зеркалим по X, маппим на экран
          const x = (1 - tip.x) * window.innerWidth
          const y = tip.y * window.innerHeight
          updateLighterPos(x, y)
          setHandDetected(true)

          if (gameStateRef.current === 'loading') {
            setGameState('lighting')
          }
        } else {
          setHandDetected(false)
        }
      })

      handsRef.current = hands

      if (videoRef.current) {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera API is unavailable in this browser')
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        })

        cameraStreamRef.current = stream
        videoRef.current.srcObject = stream
        await videoRef.current.play()

        const processFrame = async () => {
          if (!videoRef.current || !handsRef.current || isSendingFrameRef.current) {
            cameraFrameRef.current = requestAnimationFrame(processFrame)
            return
          }

          try {
            isSendingFrameRef.current = true
            await handsRef.current.send({ image: videoRef.current })
          } catch (frameError) {
            console.error('MediaPipe frame processing error:', frameError)
          } finally {
            isSendingFrameRef.current = false
            cameraFrameRef.current = requestAnimationFrame(processFrame)
          }
        }

        cameraFrameRef.current = requestAnimationFrame(processFrame)

        // Если через 3 сек рука не обнаружена — всё равно переходим в lighting
        setTimeout(() => {
          if (gameStateRef.current === 'loading') {
            setGameState('lighting')
          }
        }, 3000)
      }
    } catch (err) {
      console.error('MediaPipe init error:', err)
      // Фоллбэк — управление мышью
      setGameState('lighting')
    }
  }, [])

  // Фоллбэк: управление мышью если камера не работает
  useEffect(() => {
    if (gameState !== 'lighting' && gameState !== 'loading') return

    const handleMouseMove = (e: MouseEvent) => {
      if (!handDetected) {
        updateLighterPos(e.clientX, e.clientY)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!handDetected && e.touches.length > 0) {
        updateLighterPos(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [gameState, handDetected])

  // Проверяем расстояние зажигалки до свечей
  useEffect(() => {
    if (gameState !== 'lighting') return

    const checkProximity = () => {
      const pos = lighterPosRef.current
      candleRefs.current.forEach((ref, i) => {
        if (!ref || litRef.current[i]) return
        const rect = ref.getBoundingClientRect()
        const wickX = rect.left + rect.width / 2
        const wickY = rect.top + 10
        const dist = Math.hypot(pos.x - wickX, pos.y - wickY)

        if (dist < LIGHT_DISTANCE) {
          if (!hoverTimerRef.current[i]) {
            hoverTimerRef.current[i] = Date.now()
          } else if (Date.now() - hoverTimerRef.current[i] > LIGHT_TIME) {
            setLitCandles(prev => {
              const next = [...prev]
              next[i] = true
              return next
            })
            delete hoverTimerRef.current[i]
          }
        } else {
          delete hoverTimerRef.current[i]
        }
      })
    }

    const interval = setInterval(checkProximity, 80)
    return () => clearInterval(interval)
  }, [gameState])

  // Когда все свечи зажжены — включаем микрофон
  useEffect(() => {
    if (!allLit || gameState !== 'lighting') return
    setGameState('blowing')
    startMicrophone()
  }, [allLit, gameState])

  // Запуск микрофона
  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream
      const ctx = new AudioContext()
      audioContextRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      let blownCount = 0

      const checkVolume = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255
        setMicLevel(avg)

        if (avg > BLOW_THRESHOLD) {
          blownCount++
          if (blownCount > 8) {
            blowOutCandles()
            return
          }
        } else {
          blownCount = Math.max(0, blownCount - 1)
        }

        animFrameRef.current = requestAnimationFrame(checkVolume)
      }

      animFrameRef.current = requestAnimationFrame(checkVolume)
    } catch (err) {
      console.error('Microphone error:', err)
    }
  }

  const blowOutCandles = () => {
    cancelAnimationFrame(animFrameRef.current)
    const indices = Array.from({ length: CANDLE_COUNT }, (_, i) => i)
    indices.sort(() => Math.random() - 0.5)

    indices.forEach((idx, i) => {
      setTimeout(() => {
        setBlowingOut(prev => {
          const next = [...prev]
          next[idx] = true
          return next
        })
        if (i === CANDLE_COUNT - 1) {
          setTimeout(() => {
            setGameState('celebration')
            launchConfetti()
          }, 600)
        }
      }, i * 300)
    })
  }

  const launchConfetti = () => {
    const pieces: typeof confettiPieces = []
    for (let i = 0; i < 60; i++) {
      pieces.push({
        id: i,
        char: CONFETTI_CHARS[Math.floor(Math.random() * CONFETTI_CHARS.length)],
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 3
      })
    }
    setConfettiPieces(pieces)
    setTimeout(() => setShowCelebration(true), 1500)
  }

  const handleStart = () => {
    startCamera()
  }

  // Очистка
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      cancelAnimationFrame(cameraFrameRef.current)
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop())
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <div className="cake-page">
      <button className="back-button" onClick={onBack}>← назад</button>

      <video ref={videoRef} className="camera-feed" autoPlay playsInline muted />

      {gameState === 'idle' && (
        <div className="cake-start-screen">
          <h2>Задуй свечи!</h2>
          <p>
            Зажги свечи на торте пальцем, а потом подуй в микрофон чтобы их задуть
          </p>
          <p className="cake-hint">если камера не работает — можно мышкой</p>
          <button className="start-btn" onClick={handleStart}>
            Начать
          </button>
        </div>
      )}

      {gameState === 'loading' && (
        <div className="cake-start-screen">
          <h2>Загружаю камеру...</h2>
          <p>Разреши доступ к камере и покажи руку</p>
          <div className="loading-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
      )}

      {(gameState === 'lighting' || gameState === 'blowing') && (
        <div className="cake-scene">
          <div className="cake-instruction">
            {gameState === 'lighting'
              ? hints[hintIndex]
              : 'Подуй в микрофон чтобы задуть свечи!'}
          </div>

          <div className="cake-container">
            <div className="candles-row">
              {Array.from({ length: CANDLE_COUNT }).map((_, i) => (
                <div
                  key={i}
                  ref={el => { candleRefs.current[i] = el }}
                  className={`candle ${litCandles[i] ? 'lit' : ''} ${blowingOut[i] ? 'blowing-out' : ''}`}
                >
                  <div className="flame-wrapper">
                    <div className="flame" />
                  </div>
                  <div className="candle-wick" />
                  <div className="candle-body" />
                </div>
              ))}
            </div>

            <div className="cake-body">
              <div className="cake-layer-top" />
              <div className="cake-frosting">
                <svg viewBox="0 0 290 20" preserveAspectRatio="none">
                  <path
                    d="M0,0 Q15,18 30,0 Q45,18 60,0 Q75,18 90,0 Q105,18 120,0 Q135,18 150,0 Q165,18 180,0 Q195,18 210,0 Q225,18 240,0 Q255,18 270,0 Q285,18 290,0 L290,20 L0,20 Z"
                    fill="#FFFFFF"
                    opacity="0.9"
                  />
                </svg>
              </div>
              <div className="cake-layer-bottom" />
              <div className="cake-plate" />
            </div>
          </div>

          <div className="candle-counter">
            {litCandles.filter(Boolean).length} / {CANDLE_COUNT} свечей зажжено
          </div>

          {gameState === 'blowing' && (
            <div className="mic-indicator">
              <span>Микрофон:</span>
              <div className="mic-bar">
                <div className="mic-bar-fill" style={{ width: `${micLevel * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Зажигалка */}
      {(gameState === 'lighting') && lighterPos.x > 0 && (
        <div
          className="lighter"
          style={{ left: lighterPos.x - 14, top: lighterPos.y - 80 }}
        >
          <div className="lighter-flame-tip" />
          <div className="lighter-body" />
        </div>
      )}

      {/* Конфетти */}
      {gameState === 'celebration' && (
        <>
          <div className="confetti-container">
            {confettiPieces.map(p => (
              <span
                key={p.id}
                className="confetti-char"
                style={{
                  left: `${p.left}%`,
                  color: p.color,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`
                }}
              >
                {p.char}
              </span>
            ))}
          </div>
          {showCelebration && (
            <div className="celebration-text">
              <h1>с днем рождения, ребёныш💋💋</h1>
              <p>пусть твои желания сбудутся ♥</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default BirthdayCake
