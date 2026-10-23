import type * as THREE from "three";

// The picture, polaroid or sticky note you are holding right now (null when
// you are not holding anything).
//
// InteractionSystem sets this when you pick something up and clears it once it
// is back in place. The laptop / monitor / TV screens only read it, to fade
// themselves out while the held thing is in front of them (see useScreenFade).
// It is plain data, like magic.ts, so reading it never re-renders React.
export const held: { object: THREE.Object3D | null } = { object: null };
