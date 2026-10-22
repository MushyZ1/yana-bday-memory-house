// How magical the room is right now: 0 = normal, 1 = full magic.
//
// MagicMoment (the one that watches the music) eases this number toward 0 or 1
// every frame. The lights, sunbeam, dust and bloom just read it, so they all
// fade in and out together. Nothing here re-renders React.
export const magic = { amount: 0 };
