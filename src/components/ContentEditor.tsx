import React, { useState, useEffect } from 'react'
import type { GreetingData } from '../data/models'
import './ContentEditor.css'

type ThemeType = 'baddie' | 'барби'

interface ContentEditorProps {
  initialData: GreetingData
  onSave: (data: GreetingData) => void
  onCancel: () => void
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const [friendName, setFriendName] = useState(initialData.friendName)
  const [title, setTitle] = useState(initialData.title)
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(
    (initialData.settings.theme as ThemeType) || 'baddie'
  )
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    const hasChanges = 
      friendName !== initialData.friendName || 
      title !== initialData.title ||
      selectedTheme !== ((initialData.settings.theme as ThemeType) || 'baddie')
    setIsDirty(hasChanges)
  }, [friendName, title, selectedTheme, initialData])

  const themes = {
    baddie: {
      name: 'Baddie',
      description: 'Эмо стиль с неоновым розовым',
      colors: {
        bg: '#0D0D0D',
        surface: '#1A1A1A', 
        primary: '#FF69B4',
        text: '#F0E6F0'
      }
    },
    барби: {
      name: 'Барби',
      description: 'Гламурный розовый с блёстками и золотом',
      colors: {
        bg: '#FFF0F5',
        surface: '#FFFFFF',
        primary: '#FF69B4',
        text: '#FF1493'
      }
    }
  }

  const handleSave = () => {
    const updatedData: GreetingData = {
      ...initialData,
      friendName,
      title,
      // Применяем выбранную тему к настройкам
      settings: {
        ...initialData.settings,
        theme: selectedTheme
      }
    }
    
    onSave(updatedData)
  }

  return (
    <div className="content-editor">
      <div className="editor-header">
        <h2 className="editor-title">Настройки</h2>
      </div>

      <div className="editor-content">
        <div className="simple-form">
          <div className="form-group">
            <label htmlFor="friendName" className="form-label">
              Имя
            </label>
            <input
              id="friendName"
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              className="form-input"
              placeholder="Введите имя"
            />
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Поздравление
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="Например: С Днем Рождения!"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Стиль сайта</label>
            <div className="theme-selector">
              {Object.entries(themes).map(([key, theme]) => (
                <div
                  key={key}
                  className={`theme-option ${selectedTheme === key ? 'selected' : ''}`}
                  onClick={() => setSelectedTheme(key as ThemeType)}
                >
                  <div className="theme-preview" style={{ backgroundColor: theme.colors.bg }}>
                    <div className="theme-surface" style={{ backgroundColor: theme.colors.surface }}>
                      <div className="theme-accent" style={{ backgroundColor: theme.colors.primary }}></div>
                    </div>
                  </div>
                  <div className="theme-info">
                    <h4 className="theme-name">{theme.name}</h4>
                    <p className="theme-description">{theme.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="editor-footer">
        <div className="footer-actions">
          <button 
            className="action-button secondary"
            onClick={onCancel}
          >
            Отмена
          </button>
          
          <button 
            className="action-button primary"
            onClick={handleSave}
            disabled={!isDirty}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContentEditor
