// Утилиты для загрузки и управления данными

import { 
  GreetingData, 
  createDefaultGreetingData, 
  validateGreetingData,
  createDefaultTracks,
  createDefaultCompliments,
  createDefaultSettings
} from '../data/models'

const GREETING_DATA_KEY = 'zorigma-fm-greeting-data'
const GREETING_DATA_VERSION = '1.0'

/**
 * Загружает данные поздравления из greeting.json файла
 */
export async function loadGreetingData(): Promise<GreetingData> {
  try {
    // Пробуем загрузить из файла
    const response = await fetch('/greeting.json')
    
    if (!response.ok) {
      throw new Error(`Failed to load greeting.json: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Валидируем данные
    if (!validateGreetingData(data)) {
      console.warn('Invalid greeting data format, using defaults')
      return getDefaultGreetingData()
    }
    
    // Обновляем версию если нужно
    const validatedData: GreetingData = {
      ...data,
      version: data.version || GREETING_DATA_VERSION
    }
    
    return validatedData
    
  } catch (error) {
    console.error('Error loading greeting data:', error)
    
    // Пробуем загрузить из localStorage
    const localStorageData = loadFromLocalStorage()
    if (localStorageData) {
      console.log('Loaded data from localStorage')
      return localStorageData
    }
    
    // Возвращаем данные по умолчанию
    console.log('Using default greeting data')
    return getDefaultGreetingData()
  }
}

/**
 * Возвращает данные по умолчанию
 */
export function getDefaultGreetingData(): GreetingData {
  return createDefaultGreetingData('Подруга')
}

/**
 * Сохраняет данные в localStorage
 */
export function saveToLocalStorage(data: GreetingData): void {
  try {
    const dataToSave = {
      ...data,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(GREETING_DATA_KEY, JSON.stringify(dataToSave))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

/**
 * Загружает данные из localStorage
 */
export function loadFromLocalStorage(): GreetingData | null {
  try {
    const data = localStorage.getItem(GREETING_DATA_KEY)
    if (!data) return null
    
    const parsedData = JSON.parse(data)
    
    if (!validateGreetingData(parsedData)) {
      console.warn('Invalid data in localStorage')
      return null
    }
    
    return parsedData
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return null
  }
}

/**
 * Очищает данные из localStorage
 */
export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(GREETING_DATA_KEY)
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

/**
 * Экспортирует данные в JSON файл
 */
export function exportGreetingData(data: GreetingData): void {
  try {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'greeting.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting greeting data:', error)
    throw error
  }
}

/**
 * Импортирует данные из JSON файла
 */
export function importGreetingData(file: File): Promise<GreetingData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const data = JSON.parse(content)
        
        if (!validateGreetingData(data)) {
          reject(new Error('Invalid greeting data format'))
          return
        }
        
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * Проверяет, есть ли сохраненные данные
 */
export function hasSavedData(): boolean {
  return localStorage.getItem(GREETING_DATA_KEY) !== null
}

/**
 * Создает URL для шаринга (опционально, для будущего расширения)
 */
export function createShareUrl(data: GreetingData): string {
  const baseUrl = window.location.origin
  const encodedData = btoa(JSON.stringify(data))
  return `${baseUrl}/?data=${encodedData}`
}

/**
 * Парсит данные из URL (опционально, для будущего расширения)
 */
export function parseShareUrl(): GreetingData | null {
  const urlParams = new URLSearchParams(window.location.search)
  const encodedData = urlParams.get('data')
  
  if (!encodedData) return null
  
  try {
    const data = JSON.parse(atob(encodedData))
    return validateGreetingData(data) ? data : null
  } catch (error) {
    console.error('Error parsing share URL:', error)
    return null
  }
}