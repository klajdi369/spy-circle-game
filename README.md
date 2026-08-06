# Spy Circle

A mobile-first, pass-the-phone social deduction party game that runs entirely in the browser.

## What It Does

Spy Circle is a local multiplayer word game. Most players receive the same secret word. One or more randomly selected players are spies who do not know the word. Players reveal their role privately by passing the device around, then discuss to identify the spy without making the secret word obvious.

## Technology

- **React 19** — UI framework
- **TypeScript** — type safety
- **Vite** — build tool and dev server
- **lucide-react** — open-source icon library (MIT)
- **vite-plugin-pwa** — Progressive Web App with offline support
- **Vitest + React Testing Library** — automated testing
- **CSS Modules** — component-scoped styling
- **localStorage** — data persistence

No backend, no user accounts, no cloud database required.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at **http://localhost:5173/**

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Running Tests

```bash
npm test
```

### Watch Mode (Tests)

```bash
npm run test:watch
```

## How to Play

1. **Configure the game** — choose players, spies, timer, and category
2. **Pass the device** — each player takes a turn privately
3. **Reveal your role** — press and hold the card to see your identity
4. **Discuss** — ask questions without saying the word directly
5. **Identify the spy** — the group votes on who they suspect
6. **Spy's last chance** — if caught, the spy may guess the word
7. **Reveal results** — the app shows the word and all spies

## Word Library

Users can manage every word without editing source code:

- View, search, and browse categories
- Create, rename, enable/disable, and delete categories
- Add, edit, and delete individual words
- Bulk import words by pasting one word per line
- Remove duplicate words
- Restore predefined categories to their original words
- Restore all defaults (removes custom data)
- Export the entire library as JSON
- Import a previously exported JSON file

All changes persist in localStorage.

## How Custom Words Are Stored

All word data is stored in your browser's `localStorage` under the key `spy-circle-word-library`. The data is versioned (currently v1) so future migrations are possible. Predefined categories are seeded on first launch from the built-in TypeScript data file. Custom categories have `isPredefined: false` and can be deleted.

## How to Restore Default Words

1. Open the Word Library
2. Expand a predefined category
3. Tap "Restore Defaults" to reset that category only
4. Or tap "Restore All" in the top toolbar to reset everything

You can also go to Settings → Reset All Data to wipe everything back to defaults.

## How to Import and Export Words

**Export:** Open Word Library → tap "Export". Downloads a `spy-circle-words.json` file.

**Import:** Open Word Library → tap "Import". Select a previously exported JSON file. The import validates the file structure before replacing existing data — if the file is invalid, your current library is preserved.

## PWA Installation

After loading the app once in your browser:

- **Android/Chrome:** Tap the "Add to Home Screen" prompt, or use the menu → Install App
- **iOS/Safari:** Tap the Share button → Add to Home Screen
- **Desktop Chrome/Edge:** Click the install icon in the address bar

The installed app works fully offline after the first load.

## Settings

- **Show category to spies** — when on, spies see the word's category
- **Sound** — enable/disable sound effects
- **Vibration** — enable/disable vibration on timer expiry
- **Theme** — dark, light, or follow system preference
- **Prevent screen sleep** — keeps screen on during active games
- **Confirm before leaving** — warns when navigating away during a game
- **Reset all data** — restores everything to factory defaults

## Current Limitations

- Sound effects are not yet implemented (sound toggle is a placeholder)
- No multi-language support
- No online multiplayer — pass-the-phone only
- Timer uses visual feedback only (no audio alarm)
- Word library version migration logic is scaffolded for v1 only

## License

MIT
