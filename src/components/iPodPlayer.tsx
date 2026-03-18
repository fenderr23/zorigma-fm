import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Track, Compliment } from '../data/models'
import './iPodPlayer.css'

interface IPodPlayerProps {
  tracks: Track[]
  compliments: Compliment[]
  friendName: string
  gallery?: { url: string; type: 'image' | 'video'; fit?: 'contain' | 'cover' }[]
}

type Mode = 'menu' | 'tracklist' | 'nowplaying' | 'compliments' | 'pics'

const IPodPlayer: React.FC<IPodPlayerProps> = ({ tracks, compliments, friendName, gallery = [] }) => {
  const [mode, setMode] = useState<Mode>('menu')
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0)
  const [selectedMenuItem, setSelectedMenuItem] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentCompliment, setCurrentCompliment] = useState<Compliment | null>(null)
  const [complimentCount, setComplimentCount] = useState(0)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const tracklistRef = useRef<HTMLDivElement | null>(null)
  const normalizeTrackTitle = (title: string) => {
    if (!title) return title
    return title.charAt(0).toLocaleLowerCase() + title.slice(1)
  }

  // iPod click sound via Web Audio API
  const playClick = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.03, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.04)
    } catch (_) {}
  }

  const menuItems = [
    { id: 'tracklist', label: 'Рэп воспоминаний', icon: '♫' },
    { id: 'compliments', label: 'Генератор комплиментов', icon: '♥' },
    { id: 'pics', label: 'Pics', icon: '★' }
  ]

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  // Автоскролл к выбранному треку в tracklist
  useEffect(() => {
    if (mode === 'tracklist' && tracklistRef.current) {
      const selected = tracklistRef.current.children[selectedTrackIndex] as HTMLElement
      if (selected) {
        selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedTrackIndex, mode])

  const playTrack = (index: number) => {
    const track = tracks[index]
    if (!track || !track.audioUrl) return
    if (audioRef.current) {
      audioRef.current.pause()
    }
    try {
      const audio = new Audio(track.audioUrl)
      audioRef.current = audio
      audio.play().catch(() => setIsPlaying(false))
      setIsPlaying(true)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => setIsPlaying(false)
    } catch (_) {
      setIsPlaying(false)
    }
  }

  const togglePlayPause = () => {
    playClick()
    if (!audioRef.current) {
      playTrack(selectedTrackIndex)
      return
    }
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false))
      setIsPlaying(true)
    }
  }

  const handleMenuClick = () => {
    playClick()
    if (mode === 'nowplaying') {
      setMode('tracklist')
    } else if (mode !== 'menu') {
      setMode('menu')
      setSelectedMenuItem(0)
    }
  }

  const handleSelectClick = () => {
    playClick()
    if (mode === 'menu') {
      const selected = menuItems[selectedMenuItem]
      if (selected.id === 'tracklist') {
        setMode('tracklist')
        setSelectedTrackIndex(0)
      } else if (selected.id === 'compliments') {
        setMode('compliments')
      } else if (selected.id === 'pics') {
        setMode('pics')
        setGalleryIndex(0)
      }
    } else if (mode === 'tracklist') {
      setMode('nowplaying')
      playTrack(selectedTrackIndex)
    } else if (mode === 'nowplaying') {
      // play/pause без двойного клика
      if (!audioRef.current) {
        playTrack(selectedTrackIndex)
        return
      }
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().catch(() => setIsPlaying(false))
        setIsPlaying(true)
      }
    } else if (mode === 'compliments') {
      if (complimentCount < compliments.length) {
        setCurrentCompliment(compliments[complimentCount])
        setComplimentCount(prev => prev + 1)
      }
    }
  }

  const handleNextClick = () => {
    playClick()
    if (mode === 'menu') {
      setSelectedMenuItem((prev) => (prev + 1) % menuItems.length)
    } else if (mode === 'tracklist') {
      setSelectedTrackIndex((prev) => (prev + 1) % tracks.length)
    } else if (mode === 'nowplaying') {
      const next = (selectedTrackIndex + 1) % tracks.length
      setSelectedTrackIndex(next)
      playTrack(next)
    } else if (mode === 'pics' && gallery.length > 0) {
      setGalleryIndex((prev) => (prev + 1) % gallery.length)
    } else if (mode === 'compliments') {
      if (complimentCount < compliments.length) {
        setCurrentCompliment(compliments[complimentCount])
        setComplimentCount(prev => prev + 1)
      }
    }
  }

  const handlePrevClick = () => {
    playClick()
    if (mode === 'menu') {
      setSelectedMenuItem((prev) => (prev - 1 + menuItems.length) % menuItems.length)
    } else if (mode === 'tracklist') {
      setSelectedTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
    } else if (mode === 'nowplaying') {
      const prev = (selectedTrackIndex - 1 + tracks.length) % tracks.length
      setSelectedTrackIndex(prev)
      playTrack(prev)
    } else if (mode === 'pics' && gallery.length > 0) {
      setGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length)
    } else if (mode === 'compliments') {
      if (complimentCount > 1) {
        setComplimentCount(prev => prev - 1)
        setCurrentCompliment(compliments[complimentCount - 2])
      }
    }
  }

  const renderScreen = () => {
    if (mode === 'menu') {
      return (
        <div className="ipod-screen-content">
          <div className="screen-header">
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

    if (mode === 'tracklist') {
      return (
        <div className="ipod-screen-content">
          <div className="screen-header">
            <span className="back-icon" onClick={handleMenuClick}>◀ Menu</span>
            <span className="screen-title">Рэп воспоминаний</span>
          </div>
          <div className="menu-list tracklist" ref={tracklistRef} style={{ overflow: 'auto', flex: 1 }}>
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`menu-item ${index === selectedTrackIndex ? 'selected' : ''}`}
                onClick={() => { setSelectedTrackIndex(index); setMode('nowplaying'); playTrack(index) }}
              >
                <span className="menu-icon">{index + 1}</span>
                <span className="menu-label">{normalizeTrackTitle(track.title)}</span>
                {index === selectedTrackIndex && <span className="menu-arrow">▶</span>}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (mode === 'nowplaying') {
      const currentTrack = tracks[selectedTrackIndex]
      if (!currentTrack) return null
      return (
        <div className="ipod-screen-content nowplaying-screen" style={{ padding: 0, position: 'relative' }}>
          {currentTrack.mediaUrl ? (
            <img src={currentTrack.mediaUrl} alt={currentTrack.title} style={{ width: '100%', height: '100%', objectFit: (currentTrack as any).mediaFit === 'contain' ? 'contain' : 'cover', display: 'block', background: '#000000' }} />
          ) : (
            <div className="cover-placeholder" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>♫</div>
          )}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '40px 12px 10px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>
                {currentTrack.realTitle || currentTrack.title}
              </span>
              {currentTrack.artist && (
                <span style={{ fontSize: '0.7rem', opacity: 0.7, color: '#F5F0EB' }}>
                  — {currentTrack.artist}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', opacity: 0.6, flexShrink: 0, color: '#F5F0EB' }}>
              <span>{isPlaying ? '▶' : '❚❚'}</span>
              <span>{selectedTrackIndex + 1} / {tracks.length}</span>
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
          <div
            className={`compliment-display ${currentCompliment?.isSuperCompliment ? 'has-super-text' : ''}`}
            key={currentCompliment ? currentCompliment.id : 'empty'}
          >
            {currentCompliment ? (
              <div>
                <div className="compliment-icon">♥</div>
                <div className={`compliment-text ${currentCompliment.isSuperCompliment ? 'super-text' : ''}`}>{currentCompliment.text}</div>
              </div>
            ) : (
              <div className="compliment-prompt">
                Нажми центральную кнопку<br />для комплимента
              </div>
            )}
          </div>
        </div>
      )
    }

    if (mode === 'pics') {
      if (gallery.length === 0) {
        return (
          <div className="ipod-screen-content">
            <div className="screen-header">
              <span className="back-icon" onClick={handleMenuClick}>◀ Menu</span>
              <span className="screen-title">Pics</span>
            </div>
            <div className="compliment-display">
              <div className="compliment-prompt">Нет фоток пока</div>
            </div>
          </div>
        )
      }
      const item = gallery[galleryIndex]
      if (!item) return null
      const isVideo = item.type === 'video'
      return (
        <div key={`gallery-${galleryIndex}`} className="ipod-screen-content nowplaying-screen" style={{ padding: 0, position: 'relative' }}>
          {isVideo ? (
            <div style={{ width: '100%', height: '100%' }}>
              <video
                src={item.url}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#000000' }}
                controls
                playsInline
              />
            </div>
          ) : (
            <img src={item.url} alt={`pic ${galleryIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: (item as any).fit === 'contain' ? 'contain' : 'cover', display: 'block', background: '#000000' }} />
          )}
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            padding: '6px 12px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '8px 0 0 0',
            fontSize: '0.65rem', opacity: 0.7, color: '#F5F0EB'
          }}>
            {galleryIndex + 1} / {gallery.length}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="ipod-container">
      <motion.div
        className="ipod-body"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {mode === 'nowplaying' && tracks[selectedTrackIndex] && (
          <div className="nowplaying-header">
            <span className="nowplaying-header-left">Zorigma FM</span>
            <span className={`nowplaying-header-right ${normalizeTrackTitle(tracks[selectedTrackIndex].title).length > 24 ? 'is-long' : ''}`}>
              <span className="nowplaying-header-right-text">{normalizeTrackTitle(tracks[selectedTrackIndex].title)}</span>
            </span>
          </div>
        )}
        <div className="ipod-screen">
          <div className="screen-glass">
            <div className="screen-glare" />
            <div key={`${mode}-${selectedTrackIndex}-${galleryIndex}`}>{renderScreen()}</div>
          </div>
        </div>

        <div className="click-wheel-container">
          <div className="click-wheel">
            <button className="wheel-button wheel-menu" onClick={handleMenuClick} title="Menu">
              MENU
            </button>
            <button className="wheel-button wheel-forward" onClick={handleNextClick} title="Next">
              ▶▶
            </button>
            <button className="wheel-button wheel-back" onClick={handlePrevClick} title="Previous">
              ◀◀
            </button>
            <button className="wheel-button wheel-play" onClick={togglePlayPause} title="Play/Pause">
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <button className="wheel-center" onClick={handleSelectClick} title="Select">
              <span className="center-icon">●</span>
            </button>
          </div>
        </div>

        <div className="ipod-logo">
          <span className="logo-text">Zorigma</span>
        </div>
      </motion.div>
    </div>
  )
}

export default IPodPlayer
