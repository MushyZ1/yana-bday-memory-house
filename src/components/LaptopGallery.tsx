import { useState } from "react";
import galleryData from "../data/galleryData";
import GalleryExplorer from "./GalleryExplorer";

export default function LaptopGallery() {
  const [hasOpened, setHasOpened] = useState(false);

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
        type="button"
        onClick={() => setHasOpened(true)}
        aria-label="Open My Pictures"
      >
        <img src="/media/gallery/gallery_icon.ico" alt="" draggable={false} />
        <span>My Pictures</span>
      </button>

      {/* Explorer is a window layered over the desktop */}
      {hasOpened && (
        <GalleryExplorer
          hasOpened={hasOpened}
          images={galleryData}
          onClose={() => setHasOpened(false)}
        />
      )}
    </div>
  );
}
