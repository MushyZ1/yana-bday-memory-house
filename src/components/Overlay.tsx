import { selectIsMagic, useStore } from "../state/store";

// Things drawn on top of the 3D room:
//  - a soft golden glow while our favourite song plays
//  - the little hint messages at the bottom of the screen
//
// Both fade by themselves with CSS (see .magic-glow and .hint-toast in app.css).
export function Overlay() {
  const hint = useStore((s) => s.hint);
  const isMagic = useStore(selectIsMagic);

  return (
    <>
      <div
        className={`magic-glow${isMagic ? " is-on" : ""}`}
        aria-hidden="true"
      />

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
