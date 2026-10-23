import { selectIsMagic, useStore } from "../state/store";
import { INTERACTABLE_TOTAL } from "../data/interactables";

// Things drawn on top of the 3D room:
//  - a soft golden glow while our favourite song plays
//  - the little hint messages at the bottom of the screen
//  - the counter at the side: how many things have been interacted with
//
// The glow and hints fade by themselves with CSS (see .magic-glow and
// .hint-toast in app.css).
export function Overlay() {
  const hint = useStore((s) => s.hint);
  const isMagic = useStore(selectIsMagic);
  const found = useStore((s) => s.interactedCount);

  return (
    <>
      <div
        className={`magic-glow${isMagic ? " is-on" : ""}`}
        aria-hidden="true"
      />

      <div
        className={`found-counter${found >= INTERACTABLE_TOTAL ? " is-complete" : ""}`}
        aria-label={`${found} of ${INTERACTABLE_TOTAL} things found`}
      >
        <span className="found-counter-label">Found</span>
        <span className="found-counter-count">
          {found}
          <span className="found-counter-total"> / {INTERACTABLE_TOTAL}</span>
        </span>
      </div>

      {hint && (
        <div className="hint-layer" aria-live="polite">
          {/* The key makes the browser restart the animation for each new hint. */}
          <div
            key={hint.id}
            className="hint-toast"
            style={{ animationDuration: `${hint.duration}ms` }}
          >
            {hint.text}
          </div>
        </div>
      )}
    </>
  );
}
