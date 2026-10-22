import { useEffect, useState } from "react";
import { games, type Game } from "../data/games";

export default function GamingScreen() {
  // null = the grid of games, a game = that game's viewer is open on top of the grid
  const [openGame, setOpenGame] = useState<Game | null>(null);

  return (
    <div
      id="gaming-screen"
      data-object-ui
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <h2 className="gaming-title">Games we've played</h2>

      <div className="gaming-grid">
        {games.map((game) => (
          <div
            key={game.id}
            className="gaming-tile"
            style={{ background: game.color }}
            role="button"
            tabIndex={0}
            onClick={() => setOpenGame(game)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setOpenGame(game);
            }}
          >
            {game.thumbnail && (
              <img src={game.thumbnail} alt={game.name} draggable={false} />
            )}
            <span className="gaming-tile-name">{game.name}</span>

            {game.playUrl && (
              <a
                className="gaming-play"
                href={game.playUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} // don't also open the viewer
              >
                Play
              </a>
            )}
          </div>
        ))}
      </div>

      <p className="gaming-more">And more...</p>

      {/* The grid stays mounted underneath, so closing the viewer brings it straight back. */}
      {openGame && (
        <GameViewer
          key={openGame.id}
          game={openGame}
          onClose={() => setOpenGame(null)}
        />
      )}
    </div>
  );
}

function GameViewer({ game, onClose }: { game: Game; onClose: () => void }) {
  const screenshots = game.screenshots ?? [];
  const count = screenshots.length;
  const [index, setIndex] = useState(0);

  // % count wraps around: after the last image comes the first, and vice versa.
  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  // Left and right arrow keys also navigate while the viewer is open.
  useEffect(() => {
    if (count < 2) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  return (
    <div className="gaming-viewer">
      <div className="gaming-viewer-header">
        <h2 className="gaming-viewer-title">{game.name}</h2>
        {count > 0 && (
          <span className="gaming-viewer-count">
            {index + 1} / {count}
          </span>
        )}
        <button
          type="button"
          className="gaming-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {count === 0 ? (
        <p className="gaming-empty">I don't have any photos of this game :(</p>
      ) : (
        <div className="gaming-viewer-stage">
          {count > 1 && (
            <button
              type="button"
              className="gaming-arrow"
              onClick={prev}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          <img
            key={screenshots[index]}
            src={screenshots[index]}
            alt={`${game.name} ${index + 1}`}
            draggable={false}
          />

          {count > 1 && (
            <button
              type="button"
              className="gaming-arrow"
              onClick={next}
              aria-label="Next photo"
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
