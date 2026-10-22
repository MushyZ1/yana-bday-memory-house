# Our House of Memories

Happy birthday, Yana.

This is a little house I built for you. It's a room you can walk around in, full of the stuff that makes up us: our photos, our videos, the games we play, the songs that are ours, and a diary that remembers every day worth remembering. None of it is perfect, and I loved making all of it.

Take your time. Look around. Click on everything.

## What's in the room

- **The laptop.** An old Windows XP desktop with a *My Pictures* folder. All our photos and videos live in there.
- **The gaming monitor.** Every game we've played together, with screenshots from the good ones.
- **The TV.** Edits I made, playing one after another.
- **The diary.** Our story, page by page, from the very beginning.
- **The music player.** Our songs. Click it to change the song.
- **The polaroids and photos on the walls.** Pick them up and have a closer look.
- **The sunset coming through the window.** Because it felt right.

## How to explore

| Do this | To get this |
| --- | --- |
| Move the mouse | Look around |
| Click something that glows | Interact with it |
| Click a polaroid or photo | Hold it (click again to put it back) |
| `Esc` | Step back from the laptop, monitor or TV |
| `←` `→` | Flip through photos, videos or diary pages |
| `Space` (at the TV) | Pause or play |

The room also whispers a little hint the first time you try something new.

---

## For the curious (how it's built)

React, TypeScript, Vite, and Three.js (through react-three-fiber). Zustand keeps track of what's open, and Howler plays the music.

```bash
npm install
npm run dev      # start the room locally
npm run build    # make a production build
```

The big photo, video and screenshot files are not stored in git (see `.gitignore`), so copy them into `public/media` before running it.

Easy places to add more memories:

- `src/data/diaryEntries.ts` for diary pages
- `src/data/tracks.ts` for songs
- `src/data/games.ts` for the games on the monitor
- `src/data/galleryData.ts` for laptop photos and videos
- `src/components/TVScreen.tsx` for the TV clips

With all my love. ❤️
