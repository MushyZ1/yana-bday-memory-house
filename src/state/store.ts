import { create } from "zustand";
import { tracks } from "../data/tracks";

type State = {
  musicStarted: boolean;
  trackIndex: number;
  videoPlaying: boolean;
  diaryOpen: boolean;
  tvOpen: boolean;

  startMusic: () => void;
  pressPlayer: () => void;
  nextTrack: () => void;
  setVideoPlaying: (playing: boolean) => void;
  openDiary: () => void;
  closeDiary: () => void;
  openTV: () => void;
  closeTV: () => void;
};

export const useStore = create<State>()((set, get) => ({
  musicStarted: false,
  trackIndex: 0,
  videoPlaying: false,
  diaryOpen: false,
  tvOpen: false,

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
}));
