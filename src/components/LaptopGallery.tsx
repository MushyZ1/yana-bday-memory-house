import { useState } from "react";
import galleryData from "../data/galleryData";
import GalleryExplorer from "./GalleryExplorer";
import FromMeToYou from "./FromMeToYou";
import { useStore } from "../state/store";

export default function LaptopGallery() {
  const [hasOpened, setHasOpened] = useState(false);
  // Minimized = the window is hidden but still "running" (it keeps its place
  // in the folder). Clicking the desktop icon brings it back.
  const [isMinimized, setIsMinimized] = useState(false);

  // The ending: once everything in the room has been found, a second desktop
  // icon, "from me to you", appears and plays a video.
  const finaleReady = useStore((s) => s.finaleReady);
  const openFinale = useStore((s) => s.openFinale);
  const [finaleWindowOpen, setFinaleWindowOpen] = useState(false);

  const handleIconClick = () => {
    setHasOpened(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setHasOpened(false);
    setIsMinimized(false);
  };

  const handleFinaleIconClick = () => {
    openFinale(); // stops the laptop outline
    setFinaleWindowOpen(true);
  };

  return (
    <div
      id="laptop-screen"
      data-object-ui
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      {/* Desktop stays visible all the time */}
      <img
        id="laptop-background"
        src="/media/gallery/windows_xp.jpg"
        alt="Windows XP desktop"
        draggable={false}
      />

      {/* Desktop icon stays on the desktop */}
      <button
        id="gallery-desktop-icon"
        className={hasOpened && isMinimized ? "has-minimized" : undefined}
        type="button"
        onClick={handleIconClick}
        aria-label={
          hasOpened && isMinimized ? "Restore My Pictures" : "Open My Pictures"
        }
      >
        <img src="/media/gallery/gallery_icon.ico" alt="" draggable={false} />
        <span>My Pictures</span>
      </button>

      {/* Only appears once everything in the room has been found */}
      {finaleReady && (
        <button
          id="finale-desktop-icon"
          type="button"
          onClick={handleFinaleIconClick}
          aria-label="Open from me to you"
        >
          <span className="finale-icon-glyph" aria-hidden="true">
            💌
          </span>
          <span>from me to you</span>
        </button>
      )}

      {/* Explorer is a window layered over the desktop */}
      {hasOpened && (
        <GalleryExplorer
          hasOpened={hasOpened}
          isMinimized={isMinimized}
          images={galleryData}
          onMinimize={() => setIsMinimized(true)}
          onClose={handleClose}
        />
      )}

      {finaleWindowOpen && (
        <FromMeToYou onClose={() => setFinaleWindowOpen(false)} />
      )}
    </div>
  );
}
