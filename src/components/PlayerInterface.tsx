import React from 'react'
import { motion } from 'framer-motion'
import './PlayerInterface.css'

interface PlayerInterfaceProps {
  currentMode: 'playlist' | 'compliments'
  onModeToggle: () => void
  friendName: string
}

const PlayerInterface: React.FC<PlayerInterfaceProps> = ({
  currentMode,
  onModeToggle,
  friendName
}) => {
  return (
    <div className="player-interface">
      <div className="player-display">
        <motion.div
          className="display-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="display-text">
            <h2 className="display-title">
              {currentMode === 'playlist' ? 'Плейлист воспоминаний' : 'Генератор комплиментов'}
            </h2>
            <p className="display-subtitle">
              {currentMode === 'playlist' 
                ? `Для ${friendName}` 
                : 'Нажми кнопку для дозы любви'}
            </p>
          </div>
          
          <div className="visualizer">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="visualizer-bar"
                animate={{
                  height: ['20%', '80%', '20%']
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
      
      <div className="player-controls">
        <button className="control-button prev-button" aria-label="Предыдущий">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>
        
        <button className="control-button play-button" aria-label="Воспроизвести">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        
        <button className="control-button next-button" aria-label="Следующий">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
        
        <button 
          className={`mode-toggle ${currentMode}`}
          onClick={onModeToggle}
          aria-label={`Переключить режим на ${currentMode === 'playlist' ? 'комплименты' : 'плейлист'}`}
        >
          <span className="toggle-label">
            {currentMode === 'playlist' ? '🎵' : '💖'}
          </span>
          <span className="toggle-text">
            {currentMode === 'playlist' ? 'Комплименты' : 'Плейлист'}
          </span>
        </button>
      </div>
      
      <div className="player-info">
        <div className="info-item">
          <span className="info-label">Режим:</span>
          <span className="info-value">
            {currentMode === 'playlist' ? 'Плейлист' : 'Комплименты'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Для:</span>
          <span className="info-value">{friendName}</span>
        </div>
      </div>
    </div>
  )
}

export default PlayerInterface