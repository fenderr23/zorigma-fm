# Zorigma FM

A personalized interactive birthday website styled like a retro music player.

The app is built with React + TypeScript and works as a static site.  
You can customize tracks, compliments, photos/videos, and visual theme.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Quick Start](#quick-start)
5. [Available Scripts](#available-scripts)
6. [Project Structure](#project-structure)
7. [How Data Works (`public/greeting.json`)](#how-data-works-publicgreetingjson)
8. [Customization Guide](#customization-guide)
9. [Themes and Styling](#themes-and-styling)
10. [Cake Mode (Camera + Microphone)](#cake-mode-camera--microphone)
11. [Build and Deployment](#build-and-deployment)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)
14. [License](#license)

## Overview

Zorigma FM has three main views:

- `Player` (iPod-style UI): track list, now playing screen, compliments mode, and pics mode
- `Settings`: edit friend name, greeting title, and theme
- `Cake`: interactive mini-game using camera hand tracking + microphone blowing detection

Main content is loaded from `public/greeting.json`.

## Features

- iPod-inspired player interface
- Playlist with custom track names, media, artist, and audio files
- "Now Playing" header and cover/media display
- Compliments generator mode
- Pics mode with both images and videos
- Theme switching (`baddie`, `барби`; `батя` token also exists in types)
- Settings persistence via `localStorage`
- Fallback default data if JSON loading fails
- Responsive UI for desktop and mobile
- Static build output (`dist/`) for easy hosting

## Tech Stack

- React 18
- TypeScript
- Vite 4
- Framer Motion
- Jest + Testing Library + fast-check
- ESLint + Prettier
- MediaPipe Hands (`@mediapipe/hands`, `@mediapipe/camera_utils`) for Cake mode

## Quick Start

### Requirements

- Node.js 18+ (recommended)
- npm

### Install and run

```bash
cd zorigma-fm
npm install
npm run dev
```

Vite dev server runs on `http://localhost:3000` (configured in `vite.config.ts`).

You can also use:

```bash
./start.sh
```

## Available Scripts

From project root (`zorigma-fm`):

- `npm run dev` - start development server
- `npm run build` - production build to `dist/`
- `npm run preview` - preview the production build locally
- `npm test` - run test suite once
- `npm run test:watch` - run tests in watch mode
- `npm run lint` - run ESLint for `src/`
- `npm run format` - format `src/**/*.{js,jsx,ts,tsx,css,json}`

## Project Structure

```text
zorigma-fm/
├── public/
│   ├── gallery/           # Pics mode media (images/videos)
│   ├── images/            # Track cover images
│   ├── music/             # Audio files
│   └── greeting.json      # Main editable content
├── src/
│   ├── components/
│   │   ├── iPodPlayer.tsx
│   │   ├── ContentEditor.tsx
│   │   ├── BirthdayCake.tsx
│   │   └── *.css
│   ├── data/models.ts     # TS data models + validators + defaults
│   ├── utils/dataLoader.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
├── index.html
├── vite.config.ts
└── package.json
```

## How Data Works (`public/greeting.json`)

The app fetches `/greeting.json` on startup (`loadGreetingData`).

If loading or validation fails:

1. it tries `localStorage`
2. then falls back to default generated data

Important top-level fields:

- `friendName` - displayed in UI
- `title` - greeting title
- `settings.theme` - theme key (for example `baddie` or `барби`)
- `tracks[]` - playlist data
- `compliments[]` - compliments mode data
- `gallery[]` - pics mode media list

### Track object example

```json
{
  "id": "track-1",
  "title": "my title",
  "realTitle": "real song title",
  "artist": "artist name",
  "description": "",
  "order": 1,
  "audioUrl": "music/track-01.mp3",
  "mediaUrl": "images/1.jpeg",
  "mediaFit": "contain"
}
```

### Gallery item example

```json
{ "url": "gallery/ul1.jpeg", "type": "image" }
```

or

```json
{ "url": "gallery/video-01.mp4", "type": "video" }
```

## Customization Guide

### 1) Change friend name / greeting text

Edit:

- `friendName`
- `title`

in `public/greeting.json`.

### 2) Change tracks

Edit `tracks[]` in `public/greeting.json`:

- `title` (display title)
- `realTitle` (optional alternate label in now playing area)
- `artist`
- `audioUrl` (file in `public/music`)
- `mediaUrl` (file in `public/images`)

### 3) Change compliments

Edit `compliments[]`:

- `text`
- `category` (`tender`, `funny`, `personal`)
- `isSuperCompliment` (`true` or `false`)

### 4) Change pics mode

Edit `gallery[]`:

- add/remove/reorder image/video entries
- use valid files from `public/gallery`

If an entry points to a missing file, you will get an empty/broken slide.

### 5) Change default theme

Set `settings.theme` in `public/greeting.json` to the desired theme key.

## Themes and Styling

Main style layers:

- `src/index.css` - theme variables (`--color-bg`, `--color-text`, etc.)
- `src/App.css` - app shell, navbar, editor wrapper, and theme overrides
- `src/components/iPodPlayer.css` - full player UI and theme-specific player styles
- `src/components/ContentEditor.css` - settings view styles

For `барби`, you will mostly edit:

- `.theme-барби` in `src/index.css` (base color tokens)
- `.theme-барби ...` blocks in `src/App.css` and `src/components/iPodPlayer.css`

## Cake Mode (Camera + Microphone)

Cake mode (`BirthdayCake`) can use:

- camera + MediaPipe Hands (finger tracking to light candles)
- microphone input (blowing detection to extinguish candles)

Browser may ask for permissions:

- camera access
- microphone access

If camera fails, there is a fallback path for pointer/touch interaction.

## Build and Deployment

### Production build

```bash
npm run build
```

Output goes to `dist/`.

### Preview build locally

```bash
npm run preview
```

### Deploy

Deploy `dist/` to any static hosting:

- Vercel
- Netlify
- GitHub Pages
- Nginx / Apache static folder

## Testing

Run all tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

## Troubleshooting

- App not loading custom data:
  - verify `public/greeting.json` is valid JSON
  - ensure required fields match expected model shape
- Changes not visible:
  - hard refresh browser (`Cmd/Ctrl + Shift + R`)
  - restart dev server
- Empty slide in Pics mode:
  - check `gallery[].url` points to an existing file in `public/gallery`
- Theme not applied:
  - verify `settings.theme` value and corresponding `.theme-*` styles
- Camera/mic features not working:
  - check browser permissions
  - test over `http://localhost` in dev

## License

MIT
