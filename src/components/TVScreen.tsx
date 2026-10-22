import { useEffect, useRef, useState } from "react";
import { useStore } from "../state/store";

const videos = [
  {
    name: "HOPE",
    src: "/media/edits/HOPE%20The%20Shawshank%20Redemption.mp4",
  },
  {
    name: "Lose My Mind",
    src: "/media/edits/Lose%20My%20Mind%20-%20F1%20The%20Movie.mp4",
  },
  {
    name: "Sign of the Times",
    src: "/media/edits/project-hail-mary-sign-of-the-times-4k-edit-720-ytshorts.savetube.me.mp4",
  },
  {
    name: "Sherlock",
    src: "/media/edits/sherlock-thrift-shop-720-ytshorts.savetube.me.mp4",
  },
  {
    name: "STAY",
    src: "/media/edits/STAY%20Interstellar%204K.mkv",
  },
  {
    name: "Game of Thrones",
    src: "/media/edits/the-beauty-of-game-of-thrones-season-1-720-ytshorts.savetube.me.mp4",
  },
  {
    name: "True Love",
    src: "/media/edits/the-pogues-true-love-outer-banks-ytmp4.savetube.vip.mp4",
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
        preload="auto"
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
          objectFit: "cover",
          display: "block",
          background: "#000",
        }}
      />

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
    </div>
  );
}
