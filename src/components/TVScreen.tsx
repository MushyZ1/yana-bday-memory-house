import { useEffect, useRef, useState } from "react";
import { useStore } from "../state/store";

const videos = [
  {
    name: "HOPE",
    src: "/media/edits/clip1.mp4",
  },
  {
    name: "Lose My Mind",
    src: "/media/edits/clip2.mp4",
  },
  {
    name: "Sign of the Times",
    src: "/media/edits/clip3.mp4",
  },
  {
    name: "Sherlock",
    src: "/media/edits/clip4.mp4",
  },
  {
    name: "STAY",
    // NOTE: .mkv usually will NOT play in browsers. Convert it to .mp4, e.g.
    //   ffmpeg -i "STAY Interstellar 4K.mkv" -c:v libx264 -c:a aac stay.mp4
    // then change this path to "/media/edits/stay.mp4".
    src: "/media/edits/clip5.mp4",
  },
  {
    name: "Game of Thrones",
    src: "/media/edits/clip6.mp4",
  },
  {
    name: "True Love",
    src: "/media/edits/clip7.mp4",
  },
];

type TVScreenProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TVScreen({ isOpen, onClose }: TVScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pick a random video only once when this component is first mounted.
  const [videoIndex, setVideoIndex] = useState(() =>
    Math.floor(Math.random() * videos.length),
  );

  const currentVideo = videos[videoIndex];

  // Pause while the TV view is closed. Do not reset currentTime.
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (!isOpen) {
      video.pause();
      useStore.getState().setVideoPlaying(false);
      return;
    }

    // Only reload the media when switching to a different video.
    if (video.dataset.loadedSrc !== currentVideo.src) {
      video.dataset.loadedSrc = currentVideo.src;
      video.load();
    }

    video.play().then(
      () => {
        useStore.getState().setVideoPlaying(true);
      },
      (error: unknown) => {
        useStore.getState().setVideoPlaying(false);
        console.warn("TV video could not play:", error);
      },
    );
  }, [isOpen, currentVideo.src]);

  // Keep the global playback state correct if this component is removed.
  useEffect(() => {
    return () => {
      videoRef.current?.pause();
      useStore.getState().setVideoPlaying(false);
    };
  }, []);

  // Keyboard while the TV is open: left/right switch video, Space pauses/plays.
  // (Escape to leave the TV is handled by the room in InteractionSystem.)
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setVideoIndex((current) => (current + 1) % videos.length);
      } else if (event.key === "ArrowLeft") {
        setVideoIndex((current) => (current - 1 + videos.length) % videos.length);
      } else if (event.key === " ") {
        event.preventDefault(); // don't also "click" a focused button

        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
          video.play().then(
            () => useStore.getState().setVideoPlaying(true),
            () => useStore.getState().setVideoPlaying(false),
          );
        } else {
          video.pause();
          // Paused on purpose, so let the music come back.
          useStore.getState().setVideoPlaying(false);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  function nextVideo() {
    setVideoIndex((current) => (current + 1) % videos.length);
  }

  function handleClose() {
    videoRef.current?.pause();
    useStore.getState().setVideoPlaying(false);
    onClose();
  }

  return (
    <div
      id="tv-screen"
      data-object-ui
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#000",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <video
        ref={videoRef}
        src={currentVideo.src}
        playsInline
        // "none": the TV stays mounted while hidden, so "auto" would download a
        // video at page load that the visitor may never watch. play() still
        // works fine when the TV is opened.
        preload="none"
        onEnded={nextVideo}
        onClick={nextVideo}
        onError={() => {
          console.error(
            `TV video failed to load: ${currentVideo.name}`,
            currentVideo.src,
          );
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          // The TV's glass is 4:3. "contain" shows the whole video with black
          // bars (like a real CRT); "cover" would fill it but crop the sides.
          objectFit: "contain",
          display: "block",
          background: "#000",
        }}
      />

      {/* The title and close button only show while you're at the TV, so the
          screen looks like a plain paused video when you step away. */}
      {isOpen && (
        <>
          <div
            style={{
              position: "absolute",
              left: 12,
              bottom: 10,
              color: "white",
              fontSize: 12,
              fontFamily: "monospace",
              textShadow: "0 1px 4px black",
              pointerEvents: "none",
              opacity: 0.8,
              zIndex: 1,
            }}
          >
            {currentVideo.name} · {videoIndex + 1}/{videos.length}
          </div>

          <button
            type="button"
            data-object-ui
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              handleClose();
            }}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 2,
              width: 28,
              height: 28,
              border: "1px solid #aaa",
              borderRadius: 3,
              background: "rgba(20,20,20,0.8)",
              color: "white",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: "20px",
            }}
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}
