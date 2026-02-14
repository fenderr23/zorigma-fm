import {
  loadGreetingData,
  getDefaultGreetingData,
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  exportGreetingData,
  importGreetingData,
  hasSavedData,
  createShareUrl,
  parseShareUrl
} from '../../src/utils/dataLoader'
import { testGreetingData } from '../setup'

// Моки
const mockFetch = global.fetch as jest.Mock
const mockCreateObjectURL = global.URL.createObjectURL as jest.Mock
const mockRevokeObjectURL = global.URL.revokeObjectURL as jest.Mock

describe('Data Loader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearLocalStorage()
  })
  
  describe('loadGreetingData', () => {
    it('should load data from greeting.json', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => testGreetingData
      })
      
      const data = await loadGreetingData()
      
      expect(mockFetch).toHaveBeenCalledWith('/greeting.json')
      expect(data).toEqual(testGreetingData)
    })
    
    it('should handle fetch error and use localStorage', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      // Сохраняем данные в localStorage
      saveToLocalStorage(testGreetingData)
      
      const data = await loadGreetingData()
      
      expect(data).toEqual(testGreetingData)
    })
    
    it('should handle invalid data and use defaults', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'data' })
      })
      
      const data = await loadGreetingData()
      
      expect(data.friendName).toBe('Подруга')
      expect(data.title).toBe('С Днем Рождения, Подруга!')
    })
    
    it('should use defaults when all else fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      const data = await loadGreetingData()
      
      expect(data).toEqual(getDefaultGreetingData())
    })
    
    it('Property: Should always return valid GreetingData', async () => {
      // Тестируем разные сценарии
      const scenarios = [
        // Успешная загрузка
        () => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => testGreetingData
          })
        },
        // Ошибка сети, есть localStorage
        () => {
          mockFetch.mockRejectedValueOnce(new Error('Network error'))
          saveToLocalStorage(testGreetingData)
        },
        // Все ошибки, используем defaults
        () => {
          mockFetch.mockRejectedValueOnce(new Error('Network error'))
        }
      ]
      
      for (const setupScenario of scenarios) {
        setupScenario()
        const data = await loadGreetingData()
        
        // Проверяем, что данные валидны
        expect(data).toHaveProperty('friendName')
        expect(data).toHaveProperty('title')
        expect(data).toHaveProperty('settings')
        expect(data).toHaveProperty('tracks')
        expect(data).toHaveProperty('compliments')
        
        // Проверяем типы
        expect(typeof data.friendName).toBe('string')
        expect(typeof data.title).toBe('string')
        expect(Array.isArray(data.tracks)).toBe(true)
        expect(Array.isArray(data.compliments)).toBe(true)
        
        // Очищаем моки
        jest.clearAllMocks()
        clearLocalStorage()
      }
    })
  })
  
  describe('LocalStorage operations', () => {
    it('should save and load from localStorage', () => {
      saveToLocalStorage(testGreetingData)
      const loadedData = loadFromLocalStorage()
      
      expect(loadedData).toEqual(testGreetingData)
    })
    
    it('should return null for invalid localStorage data', () => {
      localStorage.setItem('zorigma-fm-greeting-data', 'invalid json')
      
      const loadedData = loadFromLocalStorage()
      
      expect(loadedData).toBeNull()
    })
    
    it('should clear localStorage', () => {
      saveToLocalStorage(testGreetingData)
      expect(hasSavedData()).toBe(true)
      
      clearLocalStorage()
      expect(hasSavedData()).toBe(false)
    })
    
    it('Property: Round-trip through localStorage should preserve data', () => {
      // Используем fast-check для генерации тестовых данных
      const fc = require('fast-check')
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.record({
            colorScheme: fc.oneof(fc.constant('dark'), fc.constant('light'), fc.constant('pastel')),
            fontFamily: fc.oneof(fc.constant('monospace'), fc.constant('grotesque')),
            autoPlay: fc.boolean(),
            showTutorial: fc.boolean()
          }),
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              title: fc.string({ minLength: 1 }),
              description: fc.string({ minLength: 1 }),
              order: fc.integer({ min: 1 }),
              mediaUrl: fc.option(fc.string({ minLength: 1 }), { nil: undefined })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ minLength: 1 }),
              category: fc.oneof(fc.constant('tender'), fc.constant('funny'), fc.constant('personal')),
              isSuperCompliment: fc.boolean()
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (friendName, title, settings, tracks, compliments) => {
            const testData = {
              friendName,
              title,
              settings,
              tracks,
              compliments,
              createdAt: new Date().toISOString(),
              version: '1.0'
            }
            
            // Сохраняем
            saveToLocalStorage(testData)
            
            // Загружаем
            const loadedData = loadFromLocalStorage()
            
            // Очищаем для следующей итерации
            clearLocalStorage()
            
            // Проверяем, что данные сохранились
            return loadedData !== null &&
                   loadedData.friendName === friendName &&
                   loadedData.title === title &&
                   JSON.stringify(loadedData.settings) === JSON.stringify(settings) &&
                   loadedData.tracks.length === tracks.length &&
                   loadedData.compliments.length === compliments.length
          }
        ),
        { numRuns: 20 }
      )
    })
  })
  
  describe('exportGreetingData', () => {
    it('should export data as JSON file', () => {
      const mockClick = jest.fn()
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick
      }
      
      // Мокаем document.createElement
      const originalCreateElement = document.createElement
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'a') {
          return mockAnchor as any
        }
        return originalCreateElement.call(document, tagName)
      })
      
      mockCreateObjectURL.mockReturnValue('blob:test-url')
      
      exportGreetingData(testGreetingData)
      
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockAnchor.href).toBe('blob:test-url')
      expect(mockAnchor.download).toBe('greeting.json')
      expect(mockAnchor.click).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
      
      // Восстанавливаем
      document.createElement = originalCreateElement
    })
    
    it('Property: Export should create valid JSON', () => {
      const fc = require('fast-check')
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.record({
            colorScheme: fc.oneof(fc.constant('dark'), fc.constant('light'), fc.constant('pastel')),
            fontFamily: fc.oneof(fc.constant('monospace'), fc.constant('grotesque')),
            autoPlay: fc.boolean(),
            showTutorial: fc.boolean()
          }),
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              title: fc.string({ minLength: 1 }),
              description: fc.string({ minLength: 1 }),
              order: fc.integer({ min: 1 }),
              mediaUrl: fc.option(fc.string({ minLength: 1 }), { nil: undefined })
            }),
            { minLength: 1, maxLength: 5 }
          ),
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ minLength: 1 }),
              category: fc.oneof(fc.constant('tender'), fc.constant('funny'), fc.constant('personal')),
              isSuperCompliment: fc.boolean()
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (friendName, title, settings, tracks, compliments) => {
            const testData = {
              friendName,
              title,
              settings,
              tracks,
              compliments,
              createdAt: new Date().toISOString(),
              version: '1.0'
            }
            
            try {
              exportGreetingData(testData)
              return true
            } catch (error) {
              return false
            }
          }
        ),
        { numRuns: 10 }
      )
    })
  })
  
  describe('importGreetingData', () => {
    it('should import data from JSON file', async () => {
      const jsonString = JSON.stringify(testGreetingData)
      const file = new File([jsonString], 'greeting.json', { type: 'application/json' })
      
      const data = await importGreetingData(file)
      
      expect(data).toEqual(testGreetingData)
    })
    
    it('should reject invalid JSON file', async () => {
      const invalidFile = new File(['invalid json'], 'greeting.json', { type: 'application/json' })
      
      await expect(importGreetingData(invalidFile)).rejects.toThrow()
    })
    
    it('should reject file with invalid data format', async () => {
      const invalidData = { invalid: 'data' }
      const file = new File([JSON.stringify(invalidData)], 'greeting.json', { type: 'application/json' })
      
      await expect(importGreetingData(file)).rejects.toThrow('Invalid greeting data format')
    })
  })
  
  describe('Share URL functions', () => {
    beforeEach(() => {
      // Мокаем window.location
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'http://localhost:3000'
        },
        writable: true
      })
    })
    
    it('should create share URL', () => {
      const url = createShareUrl(testGreetingData)
      
      expect(url).toContain('http://localhost:3000/?data=')
      expect(url).toContain(btoa(JSON.stringify(testGreetingData)))
    })
    
    it('should parse share URL', () => {
      const encodedData = btoa(JSON.stringify(testGreetingData))
      
      // Мокаем URLSearchParams
      const mockGet = jest.fn().mockReturnValue(encodedData)
      Object.defineProperty(window, 'URLSearchParams', {
        value: jest.fn(() => ({
          get: mockGet
        }))
      })
      
      const data = parseShareUrl()
      
      expect(data).toEqual(testGreetingData)
      expect(mockGet).toHaveBeenCalledWith('data')
    })
    
    it('should return null for invalid share URL data', () => {
      // Мокаем URLSearchParams с невалидными данными
      const mockGet = jest.fn().mockReturnValue('invalid-base64')
      Object.defineProperty(window, 'URLSearchParams', {
        value: jest.fn(() => ({
          get: mockGet
        }))
      })
      
      const data = parseShareUrl()
      
      expect(data).toBeNull()
    })
    
    it('should return null when no data in URL', () => {
      const mockGet = jest.fn().mockReturnValue(null)
      Object.defineProperty(window, 'URLSearchParams', {
        value: jest.fn(() => ({
          get: mockGet
        }))
      })
      
      const data = parseShareUrl()
      
      expect(data).toBeNull()
    })
  })
})