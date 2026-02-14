import * as fc from 'fast-check'
import {
  Track,
  Compliment,
  GreetingSettings,
  GreetingData,
  validateTrack,
  validateCompliment,
  validateSettings,
  validateGreetingData,
  createDefaultTracks,
  createDefaultCompliments,
  createDefaultSettings,
  createDefaultGreetingData
} from '../../src/data/models'
import { testGreetingData, testInvalidData } from '../setup'

describe('Data Models', () => {
  describe('Track validation', () => {
    it('should validate correct track', () => {
      const validTrack: Track = {
        id: 'track-1',
        title: 'Test Track',
        description: 'Test Description',
        order: 1,
        mediaUrl: 'image.jpg'
      }
      
      expect(validateTrack(validTrack)).toBe(true)
    })
    
    it('should validate track without mediaUrl', () => {
      const trackWithoutMedia: Track = {
        id: 'track-1',
        title: 'Test Track',
        description: 'Test Description',
        order: 1
      }
      
      expect(validateTrack(trackWithoutMedia)).toBe(true)
    })
    
    it('should reject invalid track', () => {
      const invalidTrack = {
        id: 123, // Неправильный тип
        title: 'Test',
        description: 'Test',
        order: '1' // Неправильный тип
      }
      
      expect(validateTrack(invalidTrack)).toBe(false)
    })
    
    it('Property: Track should have required fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.integer({ min: 1 }),
          fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          (id, title, description, order, mediaUrl) => {
            const track = { id, title, description, order, mediaUrl }
            return validateTrack(track) === true
          }
        ),
        { numRuns: 100 }
      )
    })
  })
  
  describe('Compliment validation', () => {
    it('should validate correct compliment', () => {
      const validCompliment: Compliment = {
        id: 'comp-1',
        text: 'Test compliment',
        category: 'tender',
        isSuperCompliment: false
      }
      
      expect(validateCompliment(validCompliment)).toBe(true)
    })
    
    it('should validate super compliment', () => {
      const superCompliment: Compliment = {
        id: 'super-comp',
        text: 'Super compliment',
        category: 'tender',
        isSuperCompliment: true
      }
      
      expect(validateCompliment(superCompliment)).toBe(true)
    })
    
    it('should reject invalid compliment category', () => {
      const invalidCompliment = {
        id: 'comp-1',
        text: 'Test',
        category: 'invalid', // Неправильная категория
        isSuperCompliment: false
      }
      
      expect(validateCompliment(invalidCompliment)).toBe(false)
    })
    
    it('Property: Compliment should have valid category', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.oneof(
            fc.constant('tender'),
            fc.constant('funny'),
            fc.constant('personal')
          ),
          fc.boolean(),
          (id, text, category, isSuperCompliment) => {
            const compliment = { id, text, category, isSuperCompliment }
            return validateCompliment(compliment) === true
          }
        ),
        { numRuns: 100 }
      )
    })
  })
  
  describe('Settings validation', () => {
    it('should validate correct settings', () => {
      const validSettings: GreetingSettings = {
        colorScheme: 'pastel',
        fontFamily: 'monospace',
        autoPlay: true,
        showTutorial: false
      }
      
      expect(validateSettings(validSettings)).toBe(true)
    })
    
    it('should reject invalid color scheme', () => {
      const invalidSettings = {
        colorScheme: 'invalid',
        fontFamily: 'monospace',
        autoPlay: true,
        showTutorial: true
      }
      
      expect(validateSettings(invalidSettings)).toBe(false)
    })
    
    it('Property: Settings should have valid colorScheme and fontFamily', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('dark'),
            fc.constant('light'),
            fc.constant('pastel')
          ),
          fc.oneof(
            fc.constant('monospace'),
            fc.constant('grotesque')
          ),
          fc.boolean(),
          fc.boolean(),
          (colorScheme, fontFamily, autoPlay, showTutorial) => {
            const settings = { colorScheme, fontFamily, autoPlay, showTutorial }
            return validateSettings(settings) === true
          }
        ),
        { numRuns: 100 }
      )
    })
  })
  
  describe('GreetingData validation', () => {
    it('should validate correct greeting data', () => {
      expect(validateGreetingData(testGreetingData)).toBe(true)
    })
    
    it('should reject invalid greeting data', () => {
      expect(validateGreetingData(testInvalidData)).toBe(false)
    })
    
    it('should reject greeting data with invalid tracks', () => {
      const dataWithInvalidTracks = {
        ...testGreetingData,
        tracks: [{ invalid: 'track' }]
      }
      
      expect(validateGreetingData(dataWithInvalidTracks)).toBe(false)
    })
    
    it('should reject greeting data with invalid compliments', () => {
      const dataWithInvalidCompliments = {
        ...testGreetingData,
        compliments: [{ invalid: 'compliment' }]
      }
      
      expect(validateGreetingData(dataWithInvalidCompliments)).toBe(false)
    })
    
    it('Property: GreetingData should have all required fields', () => {
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
            { minLength: 1 }
          ),
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ minLength: 1 }),
              category: fc.oneof(fc.constant('tender'), fc.constant('funny'), fc.constant('personal')),
              isSuperCompliment: fc.boolean()
            }),
            { minLength: 1 }
          ),
          (friendName, title, settings, tracks, compliments) => {
            const greetingData = { friendName, title, settings, tracks, compliments }
            return validateGreetingData(greetingData) === true
          }
        ),
        { numRuns: 50 } // Меньше итераций из-за сложности данных
      )
    })
  })
  
  describe('Default data creation', () => {
    it('should create default tracks', () => {
      const tracks = createDefaultTracks()
      
      expect(tracks).toHaveLength(6)
      expect(tracks[0]).toMatchObject({
        id: 'track-1',
        title: expect.any(String),
        description: expect.any(String),
        order: 1
      })
    })
    
    it('should create default compliments', () => {
      const compliments = createDefaultCompliments()
      
      expect(compliments.length).toBeGreaterThan(20)
      expect(compliments.some(c => c.isSuperCompliment)).toBe(true)
    })
    
    it('should create default settings', () => {
      const settings = createDefaultSettings()
      
      expect(settings).toEqual({
        colorScheme: 'pastel',
        fontFamily: 'monospace',
        autoPlay: true,
        showTutorial: true
      })
    })
    
    it('should create default greeting data', () => {
      const greetingData = createDefaultGreetingData('Test Friend')
      
      expect(greetingData.friendName).toBe('Test Friend')
      expect(greetingData.title).toBe('С Днем Рождения, Test Friend!')
      expect(greetingData.tracks).toHaveLength(6)
      expect(greetingData.compliments.length).toBeGreaterThan(20)
      expect(greetingData.settings).toEqual(createDefaultSettings())
    })
    
    it('Property: Default greeting data should be valid', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          (friendName) => {
            const greetingData = createDefaultGreetingData(friendName)
            return validateGreetingData(greetingData)
          }
        ),
        { numRuns: 20 }
      )
    })
  })
})