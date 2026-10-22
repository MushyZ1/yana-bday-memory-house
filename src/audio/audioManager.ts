import { Howl } from "howler";
import { useStore } from "../state/store";
import { tracks } from "../data/tracks";

let howl: Howl | null = null;

function play(index: number) {
  howl?.unload(); // stop and free the old track
  howl = new Howl({
    src: [tracks[index].src],
    html5: true, // streams long files instead of decoding them all first
    volume: 0.5,
    loop: tracks.length === 1,
    onend: () => useStore.getState().nextTrack(), // auto-advance
  });

  // If a video is playing right now, load the track but wait to start it.
  if (!useStore.getState().videoPlaying) howl.play();
}

useStore.subscribe((state, prev) => {
  // Music started, or the track changed: (re)start playback.
  if (
    state.musicStarted &&
    (state.musicStarted !== prev.musicStarted ||
      state.trackIndex !== prev.trackIndex)
  ) {
    play(state.trackIndex);
    return;
  }

  // A video started or stopped: pause the music, then resume it afterwards.
  if (state.videoPlaying !== prev.videoPlaying) {
    if (state.videoPlaying) howl?.pause();
    else if (state.musicStarted) howl?.play();
  }
});

// Browsers block sound until the visitor interacts with the page, so the music
// starts on their very first click or key press anywhere.
// (Listening on "click", not "pointerdown", so that a first click on the music
// player itself is handled by the player and doesn't skip a track.)
function startOnFirstGesture() {
  useStore.getState().startMusic();
  window.removeEventListener("click", startOnFirstGesture);
  window.removeEventListener("keydown", startOnFirstGesture);
}
window.addEventListener("click", startOnFirstGesture);
window.addEventListener("keydown", startOnFirstGesture);
