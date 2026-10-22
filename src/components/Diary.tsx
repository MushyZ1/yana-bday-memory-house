import { useCallback, useEffect, useState } from "react";
import { useStore } from "../state/store";
import { diaryEntries, type DiaryEntry } from "../data/diaryEntries";

// Must match the CSS: how long the book takes to open / close (see diary.css).
const BOOK_MS = 1000;

// A "spread" is two facing pages. Spread 0 = entries 0 and 1, spread 1 = entries 2 and 3, ...
const spreadCount = Math.ceil(diaryEntries.length / 2);
const leftOf = (spread: number) => diaryEntries[spread * 2];
const rightOf = (spread: number) => diaryEntries[spread * 2 + 1];

// A page turn: the leaf flips from spread `from` to spread `to`.
type Turn = { dir: "next" | "prev"; from: number; to: number };

const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

export default function Diary() {
  // The store says whether the diary SHOULD be open (set by clicking the model).
  const wantsOpen = useStore((s) => s.diaryOpen);
  const closeDiary = useStore((s) => s.closeDiary);

  // Local state: the overlay stays in the page while the closing animation plays.
  const [mounted, setMounted] = useState(false); // is the overlay in the page?
  const [isOpen, setIsOpen] = useState(false); // is the book drawn open?
  const [spread, setSpread] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);

  useEffect(() => {
    if (wantsOpen) {
      setMounted(true);
      // Wait two frames so the closed book is painted first, then open it.
      // (Without this the browser would skip the animation.)
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setIsOpen(true));
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }

    // Closing: play the animation, then remove the overlay.
    setIsOpen(false);
    setTurn(null);
    const timer = setTimeout(() => setMounted(false), BOOK_MS);
    return () => clearTimeout(timer);
  }, [wantsOpen]);

  const go = useCallback(
    (dir: "next" | "prev") => {
      if (turn) return; // ignore clicks while a page is already turning
      const to = spread + (dir === "next" ? 1 : -1);
      if (to < 0 || to >= spreadCount) return;
      setTurn({ dir, from: spread, to });
    },
    [spread, turn],
  );

  const finishTurn = () => {
    if (!turn) return;
    setSpread(turn.to);
    setTurn(null);
  };

  // Arrow keys turn pages, Escape closes.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go("next");
      if (e.key === "ArrowLeft") go("prev");
      if (e.key === "Escape") closeDiary();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, go, closeDiary]);

  if (!mounted) return null;

  // While a page turns, the pages underneath already show their FINAL content,
  // and the flipping leaf covers the rest. When the leaf lands, nothing visibly changes.
  const leftSpread = turn?.dir === "prev" ? turn.to : spread;
  const rightSpread = turn?.dir === "next" ? turn.to : spread;

  const totalPages = diaryEntries.length;

  return (
    // Clicking the dark area outside the book closes it.
    <div
      className={`diary-backdrop${isOpen ? " is-open" : ""}`}
      data-object-ui
      onPointerDown={stop}
      onDoubleClick={stop}
      onClick={(e) => {
        e.stopPropagation();
        closeDiary();
      }}
    >
      {/* Clicks on the book itself must not close it. */}
      <div className="diary-stage" onClick={stop}>
        <div className={`diary-book${isOpen ? " is-open" : ""}`}>
          <div className="diary-page diary-page--left">
            <PageFace
              entry={leftOf(leftSpread)}
              number={leftSpread * 2 + 1}
              side="left"
            />
          </div>
          <div className="diary-page diary-page--right">
            <PageFace
              entry={rightOf(rightSpread)}
              number={rightSpread * 2 + 2}
              side="right"
            />
          </div>

          {/* The cover is hinged at the spine and swings open. */}
          <div className="diary-cover">
            <div className="diary-cover-front">
              <span>Our Diary</span>
            </div>
            <div className="diary-cover-back" />
          </div>

          {/* The page that is currently turning */}
          {turn && (
            <div
              className={`diary-leaf diary-leaf--${turn.dir}`}
              onAnimationEnd={finishTurn}
            >
              <div className="diary-leaf-face">
                <PageFace
                  entry={
                    turn.dir === "next" ? rightOf(turn.from) : leftOf(turn.from)
                  }
                  number={
                    turn.dir === "next" ? turn.from * 2 + 2 : turn.from * 2 + 1
                  }
                  side={turn.dir === "next" ? "right" : "left"}
                />
              </div>
              <div className="diary-leaf-face diary-leaf-face--back">
                <PageFace
                  entry={turn.dir === "next" ? leftOf(turn.to) : rightOf(turn.to)}
                  number={
                    turn.dir === "next" ? turn.to * 2 + 1 : turn.to * 2 + 2
                  }
                  side={turn.dir === "next" ? "left" : "right"}
                />
              </div>
            </div>
          )}
        </div>

        <div className="diary-nav">
          <button
            type="button"
            onClick={() => go("prev")}
            disabled={!!turn || spread === 0}
            aria-label="Previous pages"
          >
            ‹
          </button>
          <span>
            {spread * 2 + 1}–{Math.min(spread * 2 + 2, totalPages)} of{" "}
            {totalPages}
          </span>
          <button
            type="button"
            onClick={() => go("next")}
            disabled={!!turn || spread >= spreadCount - 1}
            aria-label="Next pages"
          >
            ›
          </button>
        </div>
      </div>

      <p className="diary-hint">
        ← → turn pages · Esc or click outside to close
      </p>
    </div>
  );
}

type PageFaceProps = {
  entry: DiaryEntry | undefined; // undefined = a blank page (end of the book)
  number: number;
  side: "left" | "right";
};

// One page of paper. Used for the resting pages AND both sides of the turning leaf,
// so an entry always looks the same everywhere.
function PageFace({ entry, number, side }: PageFaceProps) {
  return (
    <div className={`diary-paper diary-paper--${side}`}>
      {entry && (
        <>
          {entry.date && <p className="diary-date">{entry.date}</p>}
          <h3 className="diary-entry-title">{entry.title}</h3>
          {entry.text && <p className="diary-text">{entry.text}</p>}

          {entry.images && entry.images.length > 0 ? (
            <div className="diary-photos">
              {entry.images.map((img, i) => (
                <figure key={img.src} className={`diary-photo tilt-${i % 3}`}>
                  <img src={img.src} alt={img.caption ?? entry.title} draggable={false} />
                  {img.caption && <figcaption>{img.caption}</figcaption>}
                </figure>
              ))}
            </div>
          ) : (
            entry.mediaHint && (
              <div className="diary-photo-placeholder">
                {entry.mediaHint} goes here
              </div>
            )
          )}

          <span className="diary-pageno">{number}</span>
        </>
      )}
    </div>
  );
}
