// Модели данных для Zorigma FM

export interface Track {
  id: string
  title: string
  description: string
  order: number
  mediaUrl?: string
  audioUrl?: string
  artist?: string
  realTitle?: string
}

export interface Compliment {
  id: string
  text: string
  category: 'tender' | 'funny' | 'personal'
  isSuperCompliment: boolean
}

export interface GreetingSettings {
  colorScheme: 'dark' | 'light' | 'pastel'
  fontFamily: 'monospace' | 'grotesque'
  autoPlay: boolean
  showTutorial: boolean
  theme?: 'baddie' | 'батя' | 'барби'
}

export interface GreetingData {
  friendName: string
  title: string
  settings: GreetingSettings
  tracks: Track[]
  compliments: Compliment[]
  createdAt?: string
  version?: string
}

// Функции для создания данных по умолчанию

export function createDefaultTracks(): Track[] {
  return [
    {
      id: 'track-1',
      title: 'Песня про то, как мы познакомились',
      description: 'Помнишь тот дождливый день в кафе? Мы сидели за одним столиком, и ты предложила поделиться зонтиком.',
      order: 1,
      mediaUrl: 'images/meetup.jpg'
    },
    {
      id: 'track-2',
      title: 'Хит того самого лета 202X',
      description: 'Наше первое совместное путешествие. Солнце, море, и бесконечные разговоры до утра.',
      order: 2,
      mediaUrl: 'images/summer.jpg'
    },
    {
      id: 'track-3',
      title: 'Саундтрек к нашим глупым приключениям',
      description: 'Помнишь, как мы заблудились в городе и нашли ту самую кондитерскую?',
      order: 3,
      mediaUrl: 'images/adventure.jpg'
    },
    {
      id: 'track-4',
      title: 'Баллада о поддержке в трудные времена',
      description: 'Спасибо, что всегда была рядом, когда было тяжело. Твоя поддержка значит для меня всё.',
      order: 4,
      mediaUrl: 'images/support.jpg'
    },
    {
      id: 'track-5',
      title: 'Ремикс наших смешных моментов',
      description: 'Все эти глупые фото, видео с танцами и моменты, когда мы смеялись до слёз.',
      order: 5,
      mediaUrl: 'images/funny.jpg'
    },
    {
      id: 'track-6',
      title: 'Финал: наша дружба навсегда',
      description: 'Это не конец, а только начало. Наша дружба - лучшая песня в моём плейлисте жизни.',
      order: 6,
      mediaUrl: 'images/friendship.jpg'
    }
  ]
}

export function createDefaultCompliments(): Compliment[] {
  return [
    // Нежные комплименты
    { id: 'comp-1', text: 'У тебя самый заразительный смех', category: 'tender', isSuperCompliment: false },
    { id: 'comp-2', text: 'С тобой я чувствую себя в безопасности', category: 'tender', isSuperCompliment: false },
    { id: 'comp-3', text: 'Ты умеешь слушать и слышать', category: 'tender', isSuperCompliment: false },
    { id: 'comp-4', text: 'Твоя улыбка делает мир ярче', category: 'tender', isSuperCompliment: false },
    { id: 'comp-5', text: 'Ты вдохновляешь меня быть лучше', category: 'tender', isSuperCompliment: false },
    { id: 'comp-6', text: 'У тебя доброе и чуткое сердце', category: 'tender', isSuperCompliment: false },
    { id: 'comp-7', text: 'Ты умеешь находить красоту в простом', category: 'tender', isSuperCompliment: false },
    { id: 'comp-8', text: 'С тобой легко и комфортно', category: 'tender', isSuperCompliment: false },
    
    // Смешные комплименты
    { id: 'comp-9', text: 'За то, что мы можем молчать вместе, и это не бесит', category: 'funny', isSuperCompliment: false },
    { id: 'comp-10', text: 'Ты мастер находить оправдания для поедания десерта', category: 'funny', isSuperCompliment: false },
    { id: 'comp-11', text: 'Твои шутки спасают от любой хандры', category: 'funny', isSuperCompliment: false },
    { id: 'comp-12', text: 'За совместные просмотры сериалов вместо важных дел', category: 'funny', isSuperCompliment: false },
    { id: 'comp-13', text: 'Ты умеешь превращать скучный день в приключение', category: 'funny', isSuperCompliment: false },
    { id: 'comp-14', text: 'За наши глупые фото, которые стыдно показывать другим', category: 'funny', isSuperCompliment: false },
    
    // Личные комплименты
    { id: 'comp-15', text: 'Ты помнишь все важные для меня мелочи', category: 'personal', isSuperCompliment: false },
    { id: 'comp-16', text: 'Ты знаешь меня лучше, чем я сама себя', category: 'personal', isSuperCompliment: false },
    { id: 'comp-17', text: 'За то, что принимаешь меня со всеми странностями', category: 'personal', isSuperCompliment: false },
    { id: 'comp-18', text: 'Ты всегда знаешь, что сказать в нужный момент', category: 'personal', isSuperCompliment: false },
    { id: 'comp-19', text: 'Наши разговоры - лучшая терапия', category: 'personal', isSuperCompliment: false },
    { id: 'comp-20', text: 'Ты делаешь мою жизнь интереснее и насыщеннее', category: 'personal', isSuperCompliment: false },
    
    // Супер-комплимент
    { id: 'super-comp', text: 'Ты - лучшая подруга на свете! Спасибо, что ты есть в моей жизни!', category: 'tender', isSuperCompliment: true }
  ]
}

export function createDefaultSettings(): GreetingSettings {
  return {
    colorScheme: 'pastel',
    fontFamily: 'monospace',
    autoPlay: true,
    showTutorial: true
  }
}

export function createDefaultGreetingData(friendName: string = 'Подруга'): GreetingData {
  return {
    friendName,
    title: `С Днем Рождения, ${friendName}!`,
    settings: createDefaultSettings(),
    tracks: createDefaultTracks(),
    compliments: createDefaultCompliments(),
    createdAt: new Date().toISOString(),
    version: '1.0'
  }
}

// Валидация данных

export function validateTrack(track: any): track is Track {
  return (
    typeof track === 'object' &&
    typeof track.id === 'string' &&
    typeof track.title === 'string' &&
    typeof track.description === 'string' &&
    typeof track.order === 'number' &&
    (track.mediaUrl === undefined || typeof track.mediaUrl === 'string')
  )
}

export function validateCompliment(compliment: any): compliment is Compliment {
  return (
    typeof compliment === 'object' &&
    typeof compliment.id === 'string' &&
    typeof compliment.text === 'string' &&
    ['tender', 'funny', 'personal'].includes(compliment.category) &&
    typeof compliment.isSuperCompliment === 'boolean'
  )
}

export function validateSettings(settings: any): settings is GreetingSettings {
  return (
    typeof settings === 'object' &&
    ['dark', 'light', 'pastel'].includes(settings.colorScheme) &&
    ['monospace', 'grotesque'].includes(settings.fontFamily) &&
    typeof settings.autoPlay === 'boolean' &&
    typeof settings.showTutorial === 'boolean'
  )
}

export function validateGreetingData(data: any): data is GreetingData {
  return (
    typeof data === 'object' &&
    typeof data.friendName === 'string' &&
    typeof data.title === 'string' &&
    validateSettings(data.settings) &&
    Array.isArray(data.tracks) &&
    data.tracks.every(validateTrack) &&
    Array.isArray(data.compliments) &&
    data.compliments.every(validateCompliment)
  )
}