import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import IPodPlayer from './components/iPodPlayer'
import ContentEditor from './components/ContentEditor'
import BirthdayCake from './components/BirthdayCake'
import { loadGreetingData, getDefaultGreetingData, saveToLocalStorage, loadFromLocalStorage } from './utils/dataLoader'
import type { GreetingData } from './data/models'
import './App.css'

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; errorMsg: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, errorMsg: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message }
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#F0DCC8' }}>
          <p>Что-то пошло не так</p>
          <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.5rem' }}>{this.state.errorMsg}</p>
          <button onClick={() => this.setState({ hasError: false, errorMsg: '' })} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Попробовать снова
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function ThemeSync({ theme }: { theme: string }) {
  useEffect(() => {
    document.body.className = `theme-${theme}`
  }, [theme])
  return null
}

function App() {
  const [greetingData, setGreetingData] = useState<GreetingData | null>(null)
  const [currentView, setCurrentView] = useState<'player' | 'editor' | 'cake'>('player')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true)
        const data = await loadGreetingData()
        // Если в localStorage есть сохранённые настройки (тема) — применяем их
        const localData = loadFromLocalStorage()
        if (localData?.settings?.theme) {
          data.settings.theme = localData.settings.theme
        }
        setGreetingData(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load greeting data:', err)
        setError('Не удалось загрузить данные поздравления. Используем демо-версию.')
        setGreetingData(getDefaultGreetingData())
      } finally {
        setIsLoading(false)
      }
    }

    initApp()
  }, [])

  const handleModeToggle = () => {
    // Не нужно, управление внутри iPod
  }

  const handleEditSave = (data: GreetingData) => {
    setGreetingData(data)
    saveToLocalStorage(data)
    setCurrentView('player')
  }

  const handleEditCancel = () => {
    setCurrentView('player')
  }

  if (isLoading) {
    return (
      <div className="app-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Zorigma FM
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Загружаем музыкальное поздравление...
        </motion.p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Ошибка загрузки</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    )
  }

  if (!greetingData) {
    return (
      <div className="app-error">
        <h2>Данные не найдены</h2>
        <p>Не удалось загрузить данные поздравления.</p>
        <button onClick={() => setGreetingData(getDefaultGreetingData())}>
          Использовать демо-версию
        </button>
      </div>
    )
  }

  return (
    <div className={`app theme-${greetingData.settings.theme || 'baddie'}`}>
      <ThemeSync theme={greetingData.settings.theme || 'baddie'} />
      <nav className="app-navbar">
        <span className="navbar-title" onClick={() => setCurrentView('player')} role="button" tabIndex={0} style={{ cursor: 'pointer' }}>Zorigma FM</span>
        <div className="navbar-actions">
          <button className="navbar-cake" title="Торт" onClick={() => setCurrentView(currentView === 'cake' ? 'player' : 'cake')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>
          </button>
          <button className="navbar-settings" title="Настройки" onClick={() => setCurrentView(currentView === 'editor' ? 'player' : 'editor')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </nav>
      {currentView === 'player' ? (
        <>
          <ErrorBoundary>
          <IPodPlayer
            tracks={greetingData.tracks}
            compliments={greetingData.compliments}
            friendName={greetingData.friendName}
            gallery={(greetingData as any).gallery || []}
          />
          </ErrorBoundary>
        </>
      ) : currentView === 'cake' ? (
        <BirthdayCake
          friendName={greetingData.friendName}
          onBack={() => setCurrentView('player')}
        />
      ) : (
        <div className="editor-wrapper">
          <ContentEditor
            initialData={greetingData}
            onSave={handleEditSave}
            onCancel={handleEditCancel}
          />
        </div>
      )}
    </div>
  )
}

export default App