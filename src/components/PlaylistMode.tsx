import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Track } from '../data/models'
import './PlaylistMode.css'

interface PlaylistModeProps {
  tracks: Track[]
}

const PlaylistMode: React.FC<PlaylistModeProps> = ({ tracks }) => {
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0)
  const [displayMode, setDisplayMode] = useState<'list' | 'detail'>('list')
  const normalizeTrackTitle = (title: string) => {
    if (!title) return title
    return title.charAt(0).toLocaleLowerCase() + title.slice(1)
  }

  const selectedTrack = tracks[selectedTrackIndex]

  const handleTrackSelect = (index: number) => {
    setSelectedTrackIndex(index)
    setDisplayMode('detail')
  }

  const handleBackToList = () => {
    setDisplayMode('list')
  }

  const handleNextTrack = () => {
    setSelectedTrackIndex((prev) => (prev + 1) % tracks.length)
  }

  const handlePrevTrack = () => {
    setSelectedTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
  }

  return (
    <div className="playlist-mode">
      <AnimatePresence mode="wait">
        {displayMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="track-list-container"
          >
            <h3 className="playlist-title">Плейлист воспоминаний</h3>
            <p className="playlist-subtitle">Выбери трек, чтобы послушать историю</p>
            
            <div className="track-list">
              {tracks.map((track, index) => (
                <motion.button
                  key={track.id}
                  className={`track-item ${index === selectedTrackIndex ? 'selected' : ''}`}
                  onClick={() => handleTrackSelect(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="track-number">{track.order}</div>
                  <div className="track-info">
                    <h4 className="track-title">{normalizeTrackTitle(track.title)}</h4>
                    <p className="track-preview">
                      {track.description.length > 60 
                        ? `${track.description.substring(0, 60)}...` 
                        : track.description}
                    </p>
                  </div>
                  {track.mediaUrl && (
                    <div className="track-media-indicator">
                      <span className="media-icon">🖼️</span>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
            
            <div className="playlist-stats">
              <span className="stat-item">
                <strong>{tracks.length}</strong> треков
              </span>
              <span className="stat-item">
                <strong>{tracks.filter(t => t.mediaUrl).length}</strong> с медиа
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="track-detail-container"
          >
            <button className="back-button" onClick={handleBackToList}>
              ← Назад к списку
            </button>
            
            <div className="track-detail">
              <div className="track-header">
                <div className="track-number-large">{selectedTrack.order}</div>
                <div className="track-header-info">
                  <h3 className="track-detail-title">{normalizeTrackTitle(selectedTrack.title)}</h3>
                  <p className="track-position">
                    Трек {selectedTrackIndex + 1} из {tracks.length}
                  </p>
                </div>
              </div>
              
              <div className="track-description">
                <p>{selectedTrack.description}</p>
              </div>
              
              {selectedTrack.mediaUrl && (
                <div className="track-media">
                  <div className="media-placeholder">
                    <span className="media-icon-large">🖼️</span>
                    <p className="media-hint">
                      Здесь будет фото или видео: {selectedTrack.mediaUrl}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="track-navigation">
                <button 
                  className="nav-button prev-button"
                  onClick={handlePrevTrack}
                  disabled={selectedTrackIndex === 0}
                >
                  ← Предыдущий
                </button>
                
                <button 
                  className="nav-button next-button"
                  onClick={handleNextTrack}
                  disabled={selectedTrackIndex === tracks.length - 1}
                >
                  Следующий →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PlaylistMode
