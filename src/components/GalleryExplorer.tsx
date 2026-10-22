import { useState, useEffect, useRef } from "react";
import type { SyntheticEvent } from "react";
import { useStore } from "../state/store";

type GalleryItem = {
  id: number | string;
  name: string;
  type: "image" | "video";
  src: string;
  thumbnail?: string;
};

type GalleryExplorerProps = {
  hasOpened: boolean;
  isMinimized: boolean;
  images: GalleryItem[];
  onMinimize: () => void;
  onClose: () => void;
};

export default function GalleryExplorer({
  hasOpened,
  isMinimized,
  images,
  onMinimize,
  onClose,
}: GalleryExplorerProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const setVideoPlaying = useStore((s) => s.setVideoPlaying);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const current = selected === null ? null : (images[selected] ?? null);

  const isVideo = (item: GalleryItem): boolean =>
    item.type === "video" ||
    /\.(mp4|mkv|webm|mov|avi|m4v|wmv)$/i.test(item.src);

  const closeViewer = () => {
    videoRef.current?.pause();
    setSelected(null);
    setZoom(1);
    setPlaying(false);
  };

  const openItem = (index: number) => {
    setSelected(index);
    setZoom(1);
    setPlaying(false);
    setMuted(false);
  };

  const navigate = (direction: number) => {
    if (!images.length) return;

    videoRef.current?.pause();

    setSelected((index) => {
      if (index === null) return index;
      return (index + direction + images.length) % images.length;
    });

    setZoom(1);
    setPlaying(false);
    setMuted(false);
  };

  useEffect(() => {
    if (selected === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      if (event.key === "Escape") {
        // Handled here, so the room doesn't ALSO treat this Escape as
        // "step away from the laptop". (Capture phase + preventDefault.)
        event.preventDefault();
        closeViewer();
      }
      if (event.key === "ArrowRight") navigate(1);
      if (event.key === "ArrowLeft") navigate(-1);
    };

    // Capture phase: runs before the room's own Escape handler.
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [selected, images.length]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.pause();
    setPlaying(false);
    video.load();
  }, [selected]);

  // Safety net: whenever the viewer changes item or closes, tell the music
  // player that no video is playing, so the music can never stay paused by mistake.
  useEffect(() => {
    return () => setVideoPlaying(false);
  }, [selected, setVideoPlaying]);

  if (!hasOpened) return null;

  const handleVolumeChange = (event: SyntheticEvent<HTMLVideoElement>) => {
    setMuted(event.currentTarget.muted);
  };

  return (
    <>
      {/* Windows XP Explorer window */}
      <div
        className={`xp-window ${isMaximized ? "is-maximized" : ""} ${
          isMinimized ? "is-minimized" : ""
        }`}
        id="gallery-folder"
      >
        <div className="xp-titlebar">
          <div className="xp-title">
            <span>📁</span>
            <span>My Pictures</span>
          </div>

          <div className="xp-window-buttons">
            <button
              type="button"
              title="Minimize"
              aria-label="Minimize window"
              onClick={() => {
                // Close any open picture/video first (this also stops video
                // sound and lets the music resume), then hide the window.
                // Click the My Pictures desktop icon to bring it back.
                closeViewer();
                onMinimize();
              }}
            >
              _
            </button>

            <button
              type="button"
              title={isMaximized ? "Restore" : "Maximize"}
              aria-label={isMaximized ? "Restore window" : "Maximize window"}
              aria-pressed={isMaximized}
              onClick={() => setIsMaximized((prev) => !prev)}
            >
              {isMaximized ? "❐" : "□"}
            </button>

            <button
              type="button"
              className="xp-close"
              onClick={onClose}
              title="Close viewer"
            >
              X
            </button>
          </div>
        </div>

        <div className="xp-menubar">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Favorites</span>
          <span>Tools</span>
          <span>Help</span>
        </div>

        <div className="xp-toolbar">
          <button type="button" onClick={() => navigate(-1)}>
            ⬅ Back
          </button>
          <button type="button" onClick={() => navigate(1)}>
            ➡ Forward
          </button>
          <span className="xp-toolbar-separator" />
          <button
            type="button"
            onClick={() => {
              videoRef.current?.pause();
              setSelected(null);
              setZoom(1);
              setPlaying(false);
            }}
          >
            ⬆ Up
          </button>
        </div>

        <div className="xp-addressbar">
          <span>Address</span>
          <div className="xp-address">
            📁 C:\Documents and Settings\Pictures
          </div>
          <button type="button">Go</button>
        </div>

        <div className="xp-explorer-body">
          <aside className="xp-sidebar">
            <div className="xp-side-panel">
              <div className="xp-side-heading">Picture Tasks</div>
              <div className="xp-side-content">
                <div>🖼️ View pictures</div>
                <div>🎬 Play videos</div>
              </div>
            </div>

            <div className="xp-side-panel">
              <div className="xp-side-heading">Other Places</div>
              <div className="xp-side-content">
                <div>🖥️ My Computer</div>
                <div>📁 My Documents</div>
              </div>
            </div>

            <div className="xp-side-panel">
              <div className="xp-side-heading">Details</div>
              <div className="xp-side-content">
                {current ? current.name : `${images.length} items`}
              </div>
            </div>
          </aside>

          <main className="xp-gallery">
            {images.length === 0 ? (
              <div className="xp-empty">This folder is empty.</div>
            ) : (
              <div className="xp-thumbnail-grid">
                {images.map((item, index) => (
                  <button
                    className="xp-thumbnail"
                    key={item.id}
                    type="button"
                    onClick={() => openItem(index)}
                    title={`Open ${item.name}`}
                  >
                    <div className="xp-thumbnail-image">
                      {isVideo(item) ? (
                        <>
                          <video
                            src={item.src}
                            muted
                            preload="metadata"
                            tabIndex={-1}
                            aria-label={item.name}
                          />
                          <span className="xp-video-badge">▶ VIDEO</span>
                        </>
                      ) : (
                        <img
                          src={item.thumbnail || item.src}
                          alt={item.name}
                          loading="lazy"
                        />
                      )}
                    </div>

                    <span className="xp-thumbnail-name">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>

        <div className="xp-statusbar">{images.length} object(s)</div>
      </div>

      {/* Image or video viewer */}
      {current && selected !== null && (
        <div className="xp-viewer-overlay">
          <div
            className="xp-window xp-image-window"
            role="dialog"
            aria-modal="true"
            aria-label={current.name}
          >
            <div className="xp-titlebar">
              <div className="xp-title">
                <span>{isVideo(current) ? "🎬" : "🖼️"}</span>
                <span>{current.name}</span>
              </div>

              <div className="xp-window-buttons">
                <button
                  type="button"
                  onClick={closeViewer}
                  aria-label="Close viewer"
                  title="Close"
                >
                  X
                </button>
              </div>
            </div>

            <div className="xp-viewer-toolbar">
              <button type="button" onClick={() => navigate(-1)}>
                ◀ Previous
              </button>

              <button type="button" onClick={() => navigate(1)}>
                Next ▶
              </button>

              {!isVideo(current) && (
                <>
                  <span className="xp-toolbar-separator" />

                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.25, z / 1.25))}
                  >
                    − Zoom Out
                  </button>

                  <span className="xp-zoom-label">
                    {Math.round(zoom * 100)}%
                  </span>

                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(5, z * 1.25))}
                  >
                    + Zoom In
                  </button>

                  <button type="button" onClick={() => setZoom(1)}>
                    Reset
                  </button>
                </>
              )}
            </div>

            <div className="xp-image-stage">
              {isVideo(current) ? (
                <video
                  key={current.src}
                  ref={videoRef}
                  className="xp-video-player"
                  src={current.src}
                  controls
                  playsInline
                  preload="metadata"
                  onPlay={() => {
                    setPlaying(true);
                    setVideoPlaying(true); // pauses the background music
                  }}
                  onPause={() => {
                    setPlaying(false);
                    setVideoPlaying(false); // music resumes
                  }}
                  onEnded={() => {
                    setPlaying(false);
                    setVideoPlaying(false);
                  }}
                  onVolumeChange={handleVolumeChange}
                >
                  Your browser cannot play this video format.
                </video>
              ) : (
                <img
                  key={current.src}
                  src={current.src}
                  alt={current.name}
                  draggable={false}
                  style={{
                    transform: `scale(${zoom})`,
                  }}
                />
              )}
            </div>

            <div className="xp-statusbar">
              {isVideo(current) ? "Video" : "Picture"} {selected + 1} of{" "}
              {images.length}
              {playing ? " — Playing" : ""}
              {isVideo(current) && muted ? " — Muted" : ""}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
