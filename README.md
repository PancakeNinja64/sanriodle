# Sanriodle

A pastel, Sanrio-inspired daily character guessing game built with React + Tailwind CSS.

## Features

- Daily landing page with date + live countdown to next reset
- Deterministic daily puzzle (same character for all users each day)
- LocalStorage resume support for in-progress daily games
- Searchable guess input with autocomplete
- Comparison grid with feedback for:
  - Name
  - Gender
  - Species
  - Release year (with newer/older hint)
  - Signature color
  - Franchise/group
- Image thumbnails with graceful fallback UI
- Cute, mobile-first pastel design system

## Tech Stack

- React (Vite)
- Tailwind CSS
- React Router
- Local mock data (no backend yet)

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run development server

```bash
npm run dev
```

### 3) Build for production

```bash
npm run build
```

## Project Structure

```txt
src/
  components/
    HomePage.jsx
    GamePage.jsx
    CountdownTimer.jsx
    Modal.jsx
  data/
    characters.ts
    constants.ts
  utils/
    dailyPuzzle.ts
    storage.ts
  App.jsx
  main.jsx
```

## Daily Puzzle Logic

- Date key format: `YYYY-MM-DD`
- Daily selection is deterministic via hash of date key
- Game state saved in localStorage:
  - `dateKey`
  - `guessedCharacterIds`
  - `status` (`playing`, `won`, `lost`)
- At midnight, puzzle resets to a new daily character

## Character Data + Images

- Dataset lives in `src/data/characters.ts`
- Character IDs use slug format (example: `hello-kitty`)
- Image path convention:
  - `/characters/<slug>.<ext>`
  - Supported extensions in this project: `.png`, `.jpg`, `.webp`
- Image assets live in `public/characters/`

If an image is missing or fails to load, the UI shows a fallback placeholder.

## Notes

- This is a fan-made prototype for learning/portfolio purposes.
- Add your own credits/disclaimer content in the landing page Credits modal.

## Scripts

- `npm run dev` - start local development
- `npm run build` - create production build
- `npm run preview` - preview production build locally
