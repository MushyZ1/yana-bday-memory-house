import { useEffect, useRef, useState } from "react";
import { useStore } from "../state/store";

// The ending: the "from me to you" video.
// Drop the video at public/media/from-me-to-you.mp4 (or change this path).
export const FROM_ME_TO_YOU_SRC = "/media/from-me-to-you.mp4";

type FromMeToYouProps = {
  onClose: () => void;
};

// An XP-style window (same look as the picture/video viewer in My Pictures)
// that plays the video. The music pauses while it plays, like every other
// video in the room (see audioManager).
export default function FromMeToYou({ onClose }: FromMeToYouProps) {
  const setVideoPlaying = useStore((s) => s.setVideoPlaying);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);

  // Escape closes this window. Handled here (capture phase + preventDefault),
  // so the room doesn't ALSO treat the same Escape as "step away from the
  // laptop".
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

  // Whenever this window goes away, make sure the music is allowed to resume.
  useEffect(() => {
    const video = videoRef.current;

    return () => {
      video?.pause();
      setVideoPlaying(false);
    };
  }, [setVideoPlaying]);

  return (
    <div className="xp-viewer-overlay">
      <div
        className="xp-window xp-image-window"
        role="dialog"
        aria-modal="true"
        aria-label="from me to you"
      >
        <div className="xp-titlebar">
          <div className="xp-title">
            <span>💌</span>
            <span>from me to you</span>
          </div>

          <div className="xp-window-buttons">
            <button
              type="button"
              className="xp-close"
              onClick={onClose}
              aria-label="Close"
              title="Close"
            >
              X
            </button>
          </div>
        </div>

        <div className="xp-image-stage">
          {failed ? (
            <p className="finale-missing">
              The video isn’t here yet.
              <br />
              (Add it at public{FROM_ME_TO_YOU_SRC})
            </p>
          ) : (
            <video
              ref={videoRef}
              className="xp-video-player"
              src={FROM_ME_TO_YOU_SRC}
              controls
              autoPlay
              playsInline
              onPlay={() => setVideoPlaying(true)} // pauses the music
              onPause={() => setVideoPlaying(false)} // music resumes
              onEnded={() => setVideoPlaying(false)}
              onError={() => {
                setVideoPlaying(false);
                setFailed(true);
              }}
            >
              Your browser cannot play this video format.
            </video>
          )}
        </div>

        <div className="xp-statusbar">Video — Esc to close</div>
      </div>
    </div>
  );
}
