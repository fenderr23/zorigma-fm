import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import IPodPlayer from './components/iPodPlayer'
import ContentEditor from './components/ContentEditor'
import { loadGreetingData, getDefaultGreetingData } from './utils/dataLoader'
import type { GreetingData } from './data/models'
import './App.css'

function App() {
  const [greetingData, setGreetingData] = useState<GreetingData | null>(null)
  const [currentView, setCurrentView] = useState<'player' | 'editor'>('player')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true)
        const data = await loadGreetingData()
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
    <div className={`app theme-${greetingData.settings.colorScheme}`}>
      {currentView === 'player' ? (
        <>
          <button
            onClick={() => setCurrentView('editor')}
            className="floating-edit-button"
            title="Редактировать"
          >
            ⚙️
          </button>
          
          <IPodPlayer
            tracks={greetingData.tracks}
            compliments={greetingData.compliments}
            friendName={greetingData.friendName}
          />
        </>
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