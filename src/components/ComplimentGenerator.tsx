import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Compliment } from '../data/models'
import './ComplimentGenerator.css'

interface ComplimentGeneratorProps {
  compliments: Compliment[]
}

const ComplimentGenerator: React.FC<ComplimentGeneratorProps> = ({ compliments }) => {
  const [currentCompliment, setCurrentCompliment] = useState<Compliment | null>(null)
  const [complimentHistory, setComplimentHistory] = useState<Compliment[]>([])
  const [complimentCount, setComplimentCount] = useState(0)
  const [animationState, setAnimationState] = useState<'idle' | 'generating' | 'showing'>('idle')
  const [showSuperCompliment, setShowSuperCompliment] = useState(false)

  // Фильтруем обычные комплименты (без супер-комплиментов)
  const regularCompliments = compliments.filter(c => !c.isSuperCompliment)
  const superCompliment = compliments.find(c => c.isSuperCompliment)

  const getRandomCompliment = (): Compliment => {
    // Исключаем последние 3 комплимента из истории, чтобы избежать повторений
    const recentIds = complimentHistory.slice(-3).map(c => c.id)
    const availableCompliments = regularCompliments.filter(c => !recentIds.includes(c.id))
    
    // Если все комплименты были недавно показаны, используем все
    const pool = availableCompliments.length > 0 ? availableCompliments : regularCompliments
    
    const randomIndex = Math.floor(Math.random() * pool.length)
    return pool[randomIndex]
  }

  const handleGenerateCompliment = () => {
    if (animationState !== 'idle') return
    
    setAnimationState('generating')
    setComplimentCount(prev => prev + 1)
    
    // Проверяем, нужно ли показать супер-комплимент
    if (complimentCount >= 9 && superCompliment && !showSuperCompliment) {
      setShowSuperCompliment(true)
      setCurrentCompliment(superCompliment)
    } else {
      const newCompliment = getRandomCompliment()
      setCurrentCompliment(newCompliment)
      setComplimentHistory(prev => [...prev.slice(-9), newCompliment]) // Храним последние 10
    }
    
    // Анимация генерации
    setTimeout(() => {
      setAnimationState('showing')
    }, 500)
    
    // Сбрасываем состояние показа
    setTimeout(() => {
      setAnimationState('idle')
    }, 3000)
  }

  const handleResetCounter = () => {
    setComplimentCount(0)
    setShowSuperCompliment(false)
    setComplimentHistory([])
    setCurrentCompliment(null)
  }

  // Показываем первый комплимент при загрузке
  useEffect(() => {
    if (regularCompliments.length > 0 && !currentCompliment) {
      const firstCompliment = getRandomCompliment()
      setCurrentCompliment(firstCompliment)
      setComplimentHistory([firstCompliment])
    }
  }, [regularCompliments])

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'tender': return '💖'
      case 'funny': return '😂'
      case 'personal': return '🌟'
      default: return '✨'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'tender': return 'Нежный'
      case 'funny': return 'Смешной'
      case 'personal': return 'Личный'
      default: return category
    }
  }

  return (
    <div className="compliment-generator">
      <div className="generator-header">
        <h3 className="generator-title">Генератор комплиментов</h3>
        <p className="generator-subtitle">
          Нажми кнопку, чтобы получить дозу любви
          {showSuperCompliment && ' 🎉 Ты получила супер-комплимент!'}
        </p>
      </div>

      <div className="generator-content">
        <div className="compliment-display">
          <AnimatePresence mode="wait">
            {animationState === 'generating' ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="generating-animation"
              >
                <div className="spinner" />
                <p className="generating-text">Генерируем комплимент...</p>
              </motion.div>
            ) : currentCompliment ? (
              <motion.div
                key={currentCompliment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`compliment-card ${currentCompliment.isSuperCompliment ? 'super' : currentCompliment.category}`}
              >
                {currentCompliment.isSuperCompliment && (
                  <div className="super-badge">✨ СУПЕР-КОМПЛИМЕНТ ✨</div>
                )}
                
                <div className="compliment-text">
                  "{currentCompliment.text}"
                </div>
                
                <div className="compliment-meta">
                  <span className="category-tag">
                    {getCategoryEmoji(currentCompliment.category)} 
                    {getCategoryName(currentCompliment.category)}
                  </span>
                  {!currentCompliment.isSuperCompliment && (
                    <span className="compliment-number">
                      #{complimentHistory.findIndex(c => c.id === currentCompliment.id) + 1}
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-compliment"
              >
                <p>Нажми кнопку, чтобы получить первый комплимент!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="generator-controls">
          <motion.button
            className={`generate-button ${showSuperCompliment ? 'super-active' : ''}`}
            onClick={handleGenerateCompliment}
            disabled={animationState !== 'idle'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={showSuperCompliment ? { 
              scale: [1, 1.1, 1],
              transition: { repeat: Infinity, duration: 2 }
            } : {}}
          >
            <span className="button-icon">💖</span>
            <span className="button-text">
              {showSuperCompliment ? 'ТЫ КРУТАЯ!' : 'ПОЛУЧИТЬ ДОЗУ ЛЮБВИ'}
            </span>
          </motion.button>

          <button 
            className="reset-button"
            onClick={handleResetCounter}
            title="Сбросить счетчик"
          >
            Сбросить
          </button>
        </div>

        <div className="generator-stats">
          <div className="stat-item">
            <span className="stat-label">Получено комплиментов:</span>
            <span className="stat-value">{complimentCount}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">До супер-комплимента:</span>
            <span className="stat-value">
              {showSuperCompliment ? '🎉 Получен!' : `${10 - complimentCount} нажатий`}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Категории:</span>
            <div className="category-stats">
              <span className="category-stat tender">
                💖 {complimentHistory.filter(c => c.category === 'tender').length}
              </span>
              <span className="category-stat funny">
                😂 {complimentHistory.filter(c => c.category === 'funny').length}
              </span>
              <span className="category-stat personal">
                🌟 {complimentHistory.filter(c => c.category === 'personal').length}
              </span>
            </div>
          </div>
        </div>

        {complimentHistory.length > 0 && (
          <div className="compliment-history">
            <h4 className="history-title">Недавние комплименты:</h4>
            <div className="history-list">
              {[...complimentHistory].reverse().map((compliment, index) => (
                <motion.div
                  key={`${compliment.id}-${index}`}
                  className="history-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="history-emoji">
                    {getCategoryEmoji(compliment.category)}
                  </span>
                  <span className="history-text">
                    {compliment.text.length > 40 
                      ? `${compliment.text.substring(0, 40)}...` 
                      : compliment.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplimentGenerator