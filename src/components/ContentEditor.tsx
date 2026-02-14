import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { GreetingData, Track, Compliment, GreetingSettings } from '../data/models'
import { exportGreetingData } from '../utils/dataLoader'
import './ContentEditor.css'

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
  const [formData, setFormData] = useState<GreetingData>(initialData)
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'tracks' | 'compliments' | 'design'>('basic')

  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData)
    setIsDirty(hasChanges)
  }, [formData, initialData])

  const handleBasicChange = (field: keyof GreetingData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSettingsChange = (field: keyof GreetingSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }))
  }

  const handleTrackChange = (index: number, field: keyof Track, value: string) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.map((track, i) => 
        i === index ? { ...track, [field]: value } : track
      )
    }))
  }

  const handleComplimentChange = (index: number, field: keyof Compliment, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      compliments: prev.compliments.map((compliment, i) => 
        i === index ? { ...compliment, [field]: value } : compliment
      )
    }))
  }

  const handleAddTrack = () => {
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      title: 'Новый трек',
      description: 'Описание трека',
      order: formData.tracks.length + 1
    }
    
    setFormData(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack]
    }))
  }

  const handleRemoveTrack = (index: number) => {
    if (formData.tracks.length <= 1) return
    
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.filter((_, i) => i !== index).map((track, i) => ({
        ...track,
        order: i + 1
      }))
    }))
  }

  const handleAddCompliment = () => {
    const newCompliment: Compliment = {
      id: `comp-${Date.now()}`,
      text: 'Новый комплимент',
      category: 'tender',
      isSuperCompliment: false
    }
    
    setFormData(prev => ({
      ...prev,
      compliments: [...prev.compliments, newCompliment]
    }))
  }

  const handleRemoveCompliment = (index: number) => {
    if (formData.compliments.length <= 1) return
    
    setFormData(prev => ({
      ...prev,
      compliments: prev.compliments.filter((_, i) => i !== index)
    }))
  }

  const handleSave = () => {
    const dataToSave: GreetingData = {
      ...formData,
      createdAt: new Date().toISOString(),
      version: '1.0'
    }
    
    onSave(dataToSave)
  }

  const handleExport = () => {
    try {
      exportGreetingData(formData)
    } catch (error) {
      alert('Ошибка при экспорте данных. Проверьте консоль для подробностей.')
      console.error('Export error:', error)
    }
  }

  const handleReset = () => {
    if (window.confirm('Вы уверены? Все изменения будут потеряны.')) {
      setFormData(initialData)
    }
  }

  return (
    <div className="content-editor">
      <div className="editor-header">
        <h2 className="editor-title">Редактор поздравления</h2>
        <p className="editor-subtitle">
          Настройте поздравление для {formData.friendName}
          {isDirty && ' • Есть несохраненные изменения'}
        </p>
      </div>

      <div className="editor-tabs">
        <button 
          className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Основное
        </button>
        <button 
          className={`tab-button ${activeTab === 'tracks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracks')}
        >
          Треки ({formData.tracks.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'compliments' ? 'active' : ''}`}
          onClick={() => setActiveTab('compliments')}
        >
          Комплименты ({formData.compliments.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'design' ? 'active' : ''}`}
          onClick={() => setActiveTab('design')}
        >
          Дизайн
        </button>
      </div>

      <div className="editor-content">
        <AnimatePresence mode="wait">
          {activeTab === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="tab-content"
            >
              <div className="form-group">
                <label htmlFor="friendName" className="form-label">
                  Имя подруги *
                </label>
                <input
                  id="friendName"
                  type="text"
                  value={formData.friendName}
                  onChange={(e) => handleBasicChange('friendName', e.target.value)}
                  className="form-input"
                  placeholder="Введите имя подруги"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Заголовок поздравления *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleBasicChange('title', e.target.value)}
                  className="form-input"
                  placeholder="Например: С Днем Рождения!"
                  required
                />
              </div>

              <div className="form-hint">
                <p>💡 <strong>Совет:</strong> Используйте имя подруги в заголовке для персонализации.</p>
                <p>Например: "С Днем Рождения, {formData.friendName}!"</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'tracks' && (
            <motion.div
              key="tracks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="tab-content"
            >
              <div className="section-header">
                <h3>Треки-воспоминания</h3>
                <p>Минимум 6 треков, каждый с названием и описанием</p>
                <button 
                  className="add-button"
                  onClick={handleAddTrack}
                >
                  + Добавить трек
                </button>
              </div>

              <div className="tracks-list">
                {formData.tracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="track-editor"
                  >
                    <div className="track-header">
                      <span className="track-number">Трек {track.order}</span>
                      {formData.tracks.length > 1 && (
                        <button 
                          className="remove-button"
                          onClick={() => handleRemoveTrack(index)}
                          title="Удалить трек"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="track-fields">
                      <div className="form-group">
                        <label className="form-label">Название трека *</label>
                        <input
                          type="text"
                          value={track.title}
                          onChange={(e) => handleTrackChange(index, 'title', e.target.value)}
                          className="form-input"
                          placeholder="Например: Песня про наше знакомство"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Описание *</label>
                        <textarea
                          value={track.description}
                          onChange={(e) => handleTrackChange(index, 'description', e.target.value)}
                          className="form-textarea"
                          placeholder="Опишите историю или эмоцию, связанную с этим треком"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Ссылка на медиа (опционально)</label>
                        <input
                          type="text"
                          value={track.mediaUrl || ''}
                          onChange={(e) => handleTrackChange(index, 'mediaUrl', e.target.value)}
                          className="form-input"
                          placeholder="images/photo.jpg или URL"
                        />
                        <small className="form-hint-small">
                          Относительный путь к файлу в папке images/ или полный URL
                        </small>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="section-footer">
                <p className="track-count">
                  Всего треков: <strong>{formData.tracks.length}</strong> 
                  {formData.tracks.length < 6 && ' (нужно минимум 6)'}
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'compliments' && (
            <motion.div
              key="compliments"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="tab-content"
            >
              <div className="section-header">
                <h3>Комплименты</h3>
                <p>Минимум 20 комплиментов разных категорий</p>
                <button 
                  className="add-button"
                  onClick={handleAddCompliment}
                >
                  + Добавить комплимент
                </button>
              </div>

              <div className="compliments-list">
                {formData.compliments.map((compliment, index) => (
                  <motion.div
                    key={compliment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`compliment-editor ${compliment.isSuperCompliment ? 'super' : compliment.category}`}
                  >
                    <div className="compliment-header">
                      <div className="compliment-meta">
                        <span className="compliment-category">
                          {compliment.category === 'tender' ? '💖 Нежный' : 
                           compliment.category === 'funny' ? '😂 Смешной' : '🌟 Личный'}
                        </span>
                        {compliment.isSuperCompliment && (
                          <span className="super-badge">✨ СУПЕР</span>
                        )}
                      </div>
                      
                      <div className="compliment-actions">
                        <label className="super-toggle">
                          <input
                            type="checkbox"
                            checked={compliment.isSuperCompliment}
                            onChange={(e) => handleComplimentChange(index, 'isSuperCompliment', e.target.checked)}
                          />
                          Супер-комплимент
                        </label>
                        
                        {formData.compliments.length > 1 && (
                          <button 
                            className="remove-button"
                            onClick={() => handleRemoveCompliment(index)}
                            title="Удалить комплимент"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Текст комплимента *</label>
                      <textarea
                        value={compliment.text}
                        onChange={(e) => handleComplimentChange(index, 'text', e.target.value)}
                        className="form-textarea"
                        placeholder="Напишите теплый, смешной или личный комплимент"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Категория</label>
                      <div className="category-buttons">
                        {(['tender', 'funny', 'personal'] as const).map(category => (
                          <button
                            key={category}
                            type="button"
                            className={`category-button ${compliment.category === category ? 'active' : ''}`}
                            onClick={() => handleComplimentChange(index, 'category', category)}
                          >
                            {category === 'tender' ? '💖 Нежный' : 
                             category === 'funny' ? '😂 Смешной' : '🌟 Личный'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="section-footer">
                <div className="compliment-stats">
                  <p>
                    Всего комплиментов: <strong>{formData.compliments.length}</strong>
                    {formData.compliments.length < 20 && ' (нужно минимум 20)'}
                  </p>
                  <p>
                    Супер-комплиментов: <strong>{formData.compliments.filter(c => c.isSuperCompliment).length}</strong>
                  </p>
                  <div className="category-counts">
                    <span className="category-count tender">
                      💖 {formData.compliments.filter(c => c.category === 'tender').length}
                    </span>
                    <span className="category-count funny">
                      😂 {formData.compliments.filter(c => c.category === 'funny').length}
                    </span>
                    <span className="category-count personal">
                      🌟 {formData.compliments.filter(c => c.category === 'personal').length}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'design' && (
            <motion.div
              key="design"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="tab-content"
            >
              <div className="section-header">
                <h3>Настройки дизайна</h3>
                <p>Выберите внешний вид сайта-поздравления</p>
              </div>

              <div className="design-options">
                <div className="form-group">
                  <label className="form-label">Цветовая схема</label>
                  <div className="color-schemes">
                    {(['dark', 'light', 'pastel'] as const).map(scheme => (
                      <button
                        key={scheme}
                        type="button"
                        className={`color-scheme ${scheme} ${formData.settings.colorScheme === scheme ? 'active' : ''}`}
                        onClick={() => handleSettingsChange('colorScheme', scheme)}
                      >
                        <div className="scheme-preview">
                          <div className="scheme-sample" />
                          <div className="scheme-sample" />
                          <div className="scheme-sample" />
                        </div>
                        <span className="scheme-name">
                          {scheme === 'dark' ? '🌙 Тёмная' : 
                           scheme === 'light' ? '☀️ Светлая' : '🎀 Пастельная'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Шрифт</label>
                  <div className="font-options">
                    {(['monospace', 'grotesque'] as const).map(font => (
                      <button
                        key={font}
                        type="button"
                        className={`font-option ${font} ${formData.settings.fontFamily === font ? 'active' : ''}`}
                        onClick={() => handleSettingsChange('fontFamily', font)}
                        style={{ fontFamily: font === 'monospace' ? 'JetBrains Mono, monospace' : 'Space Grotesk, sans-serif' }}
                      >
                        {font === 'monospace' ? 'Monospace' : 'Grotesque'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={formData.settings.autoPlay}
                      onChange={(e) => handleSettingsChange('autoPlay', e.target.checked)}
                    />
                    <span>Автовоспроизведение анимаций</span>
                  </label>
                  <small className="form-hint-small">
                    Показывать анимации при загрузке страницы
                  </small>
                </div>

                <div className="form-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={formData.settings.showTutorial}
                      onChange={(e) => handleSettingsChange('showTutorial', e.target.checked)}
                    />
                    <span>Показывать подсказки</span>
                  </label>
                  <small className="form-hint-small">
                    Показывать всплывающие подсказки для новых пользователей
                  </small>
                </div>
              </div>

              <div className="design-preview">
                <h4>Предпросмотр:</h4>
                <div className={`preview-container theme-${formData.settings.colorScheme}`}>
                  <div className="preview-header">
                    <h5>{formData.title}</h5>
                    <p>Для {formData.friendName}</p>
                  </div>
                  <div className="preview-content">
                    <div className="preview-player" />
                    <div className="preview-controls">
                      <div className="preview-button" />
                      <div className="preview-button large" />
                      <div className="preview-button" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
            className="action-button secondary"
            onClick={handleReset}
            disabled={!isDirty}
          >
            Сбросить
          </button>
          
          <button 
            className="action-button primary"
            onClick={handleSave}
            disabled={!isDirty}
          >
            Сохранить
          </button>
          
          <button 
            className="action-button export"
            onClick={handleExport}
          >
            Экспорт в JSON
          </button>
        </div>

        <div className="footer-hint">
          <p>💡 <strong>Совет:</strong> После настройки нажмите "Сохранить", а затем "Экспорт в JSON" чтобы скачать файл greeting.json</p>
          <p>Загрузите этот файл в папку public/ вашего проекта.</p>
        </div>
      </div>
    </div>
  )
}

// Временный компонент AnimatePresence пока не установлен framer-motion
const AnimatePresence: React.FC<{ children: React.ReactNode; mode?: 'wait' | 'sync' }> = ({ children }) => {
  return <>{children}</>
}

export default ContentEditor