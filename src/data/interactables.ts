// Names of the objects in the 3D model (yana-bday-room-textures.glb) that you
// can interact with. These must match the model's node names exactly, so don't
// rename things in Blender without changing them here too.
//
// This lives in its own file (not in Room.tsx) so that the store can know how
// many things there are to find without importing the whole 3D scene.

// Big things you step up to or press.
export const bigObjectNames = [
  "Gaming_Monitor",
  "Laptop_Model",
  "Music_Player",
  "TV_Model",
  "Laptop_Diary",
];

// Things you can pick up and hold: photos, polaroids and sticky notes.
export const holdableNames = new Set<string>([
  "Polaroid_Landscape",
  "Polaroid_Portrait",
  ...Array.from({ length: 11 }, (_, i) => `Photo_${i + 1}`),
  ...Array.from(
    { length: 38 },
    (_, i) => `Polaroid_Portrait${String(i + 1).padStart(3, "0")}`,
  ),
  ...Array.from(
    { length: 18 },
    (_, i) => `Polaroid_Landscape${String(i + 1).padStart(3, "0")}`,
  ),
  // The sticky notes are held up close so you can read them.
  ...Array.from({ length: 12 }, (_, i) => `Sticky_Var_${i + 1}`),
]);

// Everything that glows when you look at it. Finding all of these unlocks the
// ending (see the store).
export const interactableNames = new Set<string>([
  ...bigObjectNames,
  ...holdableNames,
]);

// Objects you can interact with that do NOT count toward the ending. Empty
// for now. If something turns out to be unreachable in the room (hidden behind
// something, say), add its name here so the counter can still reach its total.
export const uncountedNames = new Set<string>([]);

// What actually counts: every interactable except the ones above.
export const countedNames = new Set<string>(
  [...interactableNames].filter((name) => !uncountedNames.has(name)),
);

// How many things there are to find.
export const INTERACTABLE_TOTAL = countedNames.size;

// Sticky notes are small, so they are held closer to the camera than the
// polaroids (which are held 3 units away) to make the handwriting readable.
export const STICKY_NOTE_PATTERN = /^Sticky_Var_\d+$/;
export const STICKY_HOLD_DISTANCE = 1.5;
