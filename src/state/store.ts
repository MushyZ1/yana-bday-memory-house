import { create } from "zustand";
import { tracks } from "../data/tracks";

// A little message shown at the bottom of the screen (see Overlay.tsx).
// `id` changes every time, so showing the same text twice still replays it.
export type Hint = {
  id: number;
  text: string;
  duration: number; // milliseconds on screen
};

const DEFAULT_HINT_MS = 5500;
let nextHintId = 1;

export type State = {
  musicStarted: boolean;
  trackIndex: number;
  videoPlaying: boolean;
  diaryOpen: boolean;
  tvOpen: boolean;

  // True while the room still shows any "magic" (including the slow fade-out
  // after the song ends). Set by MagicMoment; used to mount the Bloom effect.
  magicVisible: boolean;

  hint: Hint | null;
  seenHints: Record<string, boolean>;

  startMusic: () => void;
  pressPlayer: () => void;
  nextTrack: () => void;
  setVideoPlaying: (playing: boolean) => void;
  openDiary: () => void;
  closeDiary: () => void;
  openTV: () => void;
  closeTV: () => void;

  showHint: (text: string, duration?: number) => void;
  // Shows the hint only the first time this `key` is used (per page visit).
  showHintOnce: (key: string, text: string, duration?: number) => void;
};

export const useStore = create<State>()((set, get) => ({
  musicStarted: false,
  trackIndex: 0,
  videoPlaying: false,
  diaryOpen: false,
  tvOpen: false,

  magicVisible: false,

  hint: null,
  seenHints: {},

  startMusic: () => {
    if (!get().musicStarted) {
      set({ musicStarted: true });
    }
  },

  pressPlayer: () => {
    if (!get().musicStarted) {
      set({ musicStarted: true });
    } else {
      get().nextTrack();
    }
  },

  nextTrack: () =>
    set((state) => ({
      trackIndex: (state.trackIndex + 1) % tracks.length,
    })),

  setVideoPlaying: (playing) => set({ videoPlaying: playing }),

  openDiary: () => set({ diaryOpen: true }),

  closeDiary: () => set({ diaryOpen: false }),

  openTV: () => set({ tvOpen: true }),

  closeTV: () => set({ tvOpen: false }),

  showHint: (text, duration = DEFAULT_HINT_MS) =>
    set({ hint: { id: nextHintId++, text, duration } }),

  showHintOnce: (key, text, duration = DEFAULT_HINT_MS) => {
    if (get().seenHints[key]) return;

    set((state) => ({
      seenHints: { ...state.seenHints, [key]: true },
      hint: { id: nextHintId++, text, duration },
    }));
  },
}));

// Our favourite song. While it is playing, the room turns golden and magical.
export const FAVOURITE_TRACK_ID = "tear-in-my-heart";

// True while the favourite song is actually playing (the music pauses while a
// video plays, and the magic pauses with it).
export const selectIsMagic = (state: State) =>
  state.musicStarted &&
  !state.videoPlaying &&
  tracks[state.trackIndex].id === FAVOURITE_TRACK_ID;
