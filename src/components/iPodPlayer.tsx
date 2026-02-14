import React, { useState } from 'react'
import { motion } from 'framer-motion'
import type { Track, Compliment } from '../data/models'
import './iPodPlayer.css'

interface IPodPlayerProps {
  tracks: Track[]
  compliments: Compliment[]
  friendName: string
}

type Mode = 'menu' | 'playlist' | 'compliments'

const IPodPlayer: React.FC<IPodPlayerProps> = ({ tracks, compliments, friendName }) => {
  const [mode, setMode] = useState<Mode>('menu')
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0)
  const [selectedMenuItem, setSelectedMenuItem] = useState(0)
  const [currentCompliment, setCurrentCompliment] = useState<Compliment | null>(null)
  const [complimentCount, setComplimentCount] = useState(0)

  const menuItems = [
    { id: 'playlist', label: 'Плейлист воспоминаний', icon: '♫' },
    { id: 'compliments', label: 'Генератор комплиментов', icon: '♥' },
    { id: 'about', label: `Для ${friendName}`, icon: '★' }
  ]

  const handleMenuClick = () => {
    if (mode !== 'menu') {
      setMode('menu')
      setSelectedMenuItem(0)
    }
  }

  const handleSelectClick = () => {
    if (mode === 'menu') {
      const selected = menuItems[selectedMenuItem]
      if (selected.id === 'playlist') {
        setMode('playlist')
      } else if (selected.id === 'compliments') {
        setMode('compliments')
      }
    } else if (mode === 'compliments') {
      // Генерируем комплимент
      const regularCompliments = compliments.filter(c => !c.isSuperCompliment)
      const superCompliment = compliments.find(c => c.isSuperCompliment)
      
      setComplimentCount(prev => prev + 1)
      
      if (complimentCount >= 9 && superCompliment) {
        setCurrentCompliment(superCompliment)
      } else {
        const randomIndex = Math.floor(Math.random() * regularCompliments.length)
        setCurrentCompliment(regularCompliments[randomIndex])
      }
    }
  }

  const handleNextClick = () => {
    if (mode === 'menu') {
      setSelectedMenuItem((prev) => (prev + 1) % menuItems.length)
    } else if (mode === 'playlist') {
      setSelectedTrackIndex((prev) => (prev + 1) % tracks.length)
    }
  }

  const handlePrevClick = () => {
    if (mode === 'menu') {
      setSelectedMenuItem((prev) => (prev - 1 + menuItems.length) % menuItems.length)
    } else if (mode === 'playlist') {
      setSelectedTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
    }
  }

  const handlePlayPauseClick = () => {
    // Для будущего функционала
  }

  const renderScreen = () => {
    if (mode === 'menu') {
      return (
        <div className="ipod-screen-content">
          <div className="screen-header">
            <span className="battery-icon">🔋</span>
            <span className="screen-title">Zorigma FM</span>
          </div>
          <div className="menu-list">
            {menuItems.map((item, index) => (
              <div
                key={item.id}
                className={`menu-item ${index === selectedMenuItem ? 'selected' : ''}`}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                {index === selectedMenuItem && <span className="menu-arrow">▶</span>}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (mode === 'playlist') {
      const currentTrack = tracks[selectedTrackIndex]
      return (
        <div className="ipod-screen-content">
          <div className="screen-header">
            <span className="back-icon" onClick={handleMenuClick}>◀ Menu</span>
            <span className="screen-title">Now Playing</span>
          </div>
          <div className="track-display">
            <div className="track-icon">♫</div>
            <div className="track-info">
              <div className="track-title">{currentTrack.title}</div>
              <div className="track-description">{currentTrack.description}</div>
              <div className="track-counter">
                {selectedTrackIndex + 1} / {tracks.length}
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (mode === 'compliments') {
      return (
        <div className="ipod-screen-content">
          <div className="screen-header">
            <span className="back-icon" onClick={handleMenuClick}>◀ Menu</span>
            <span className="screen-title">Комплименты</span>
          </div>
          <div className="compliment-display">
            {currentCompliment ? (
              <>
                <div className="compliment-icon">
                  {currentCompliment.isSuperCompliment ? '✨' : '♥'}
                </div>
                <div className="compliment-text">
                  {currentCompliment.text}
                </div>
                {currentCompliment.isSuperCompliment && (
                  <div className="super-badge">СУПЕР!</div>
                )}
                <div className="compliment-counter">
                  Нажато: {complimentCount}
                </div>
              </>
            ) : (
              <div className="compliment-prompt">
                Нажми центральную кнопку
                <br />
                для комплимента
              </div>
            )}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="ipod-container">
      <motion.div
        className="ipod-body"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Экран */}
        <div className="ipod-screen">
          <div className="screen-glass">
            <div className="screen-glare" />
            {renderScreen()}
          </div>
        </div>

        {/* Click Wheel */}
        <div className="click-wheel-container">
          <div className="click-wheel">
            {/* Кнопки по кругу */}
            <button
              className="wheel-button wheel-menu"
              onClick={handleMenuClick}
              title="Menu"
            >
              MENU
            </button>
            
            <button
              className="wheel-button wheel-forward"
              onClick={handleNextClick}
              title="Next"
            >
              ▶||
            </button>
            
            <button
              className="wheel-button wheel-back"
              onClick={handlePrevClick}
              title="Previous"
            >
              ||◀
            </button>
            
            <button
              className="wheel-button wheel-play"
              onClick={handlePlayPauseClick}
              title="Play/Pause"
            >
              ||
            </button>

            {/* Центральная кнопка */}
            <button
              className="wheel-center"
              onClick={handleSelectClick}
              title="Select"
            >
              <span className="center-icon">●</span>
            </button>
          </div>
        </div>

        {/* Логотип */}
        <div className="ipod-logo">
          <span className="logo-text">Zorigma</span>
        </div>
      </motion.div>
    </div>
  )
}

export default IPodPlayer