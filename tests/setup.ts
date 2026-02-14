// Настройка тестовой среды

import '@testing-library/jest-dom'

// Моки для fetch
global.fetch = jest.fn()

// Моки для localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Моки для URL.createObjectURL и URL.revokeObjectURL
global.URL.createObjectURL = jest.fn()
global.URL.revokeObjectURL = jest.fn()

// Моки для document.createElement и appendChild/removeChild
const mockAnchorElement = {
  href: '',
  download: '',
  click: jest.fn()
}

const originalCreateElement = document.createElement
document.createElement = jest.fn((tagName) => {
  if (tagName === 'a') {
    return mockAnchorElement as any
  }
  return originalCreateElement.call(document, tagName)
})

// Сброс всех моков перед каждым тестом
beforeEach(() => {
  jest.clearAllMocks()
  
  // Сбрасываем мок anchor элемента
  mockAnchorElement.href = ''
  mockAnchorElement.download = ''
  mockAnchorElement.click.mockClear()
  
  // Сбрасываем моки localStorage
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  
  // Сбрасываем моки URL
  ;(global.URL.createObjectURL as jest.Mock).mockClear()
  ;(global.URL.revokeObjectURL as jest.Mock).mockClear()
})

// Глобальные тестовые данные
export const testGreetingData = {
  friendName: 'Test Friend',
  title: 'Test Greeting',
  settings: {
    colorScheme: 'pastel' as const,
    fontFamily: 'monospace' as const,
    autoPlay: true,
    showTutorial: true
  },
  tracks: [
    {
      id: 'test-track-1',
      title: 'Test Track 1',
      description: 'Test description 1',
      order: 1,
      mediaUrl: 'test-image-1.jpg'
    },
    {
      id: 'test-track-2',
      title: 'Test Track 2',
      description: 'Test description 2',
      order: 2
    }
  ],
  compliments: [
    {
      id: 'test-comp-1',
      text: 'Test compliment 1',
      category: 'tender' as const,
      isSuperCompliment: false
    },
    {
      id: 'test-comp-2',
      text: 'Test compliment 2',
      category: 'funny' as const,
      isSuperCompliment: false
    },
    {
      id: 'test-super-comp',
      text: 'Super test compliment',
      category: 'tender' as const,
      isSuperCompliment: true
    }
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  version: '1.0'
}

export const testInvalidData = {
  friendName: 123, // Неправильный тип
  title: 'Test',
  settings: {
    colorScheme: 'invalid', // Неправильное значение
    fontFamily: 'monospace',
    autoPlay: true,
    showTutorial: true
  },
  tracks: 'not an array', // Неправильный тип
  compliments: []
}