export type Game = {
  id: string;
  name: string;
  color: string; // tile colour, shown behind the name (and when there's no thumbnail)
  thumbnail?: string; // the picture on the tile
  screenshots?: string[]; // shown in the viewer; leave empty if you have none
  playUrl?: string; // optional "Play" button that opens in a new tab
};

// Builds full URLs from a folder name and file names. encodeURIComponent makes
// filenames with spaces (like "bloxd house 3.PNG") safe to use in a URL.
// Names must match the real files exactly, including upper/lower case,
// because most web hosts are case-sensitive even though Windows is not.
const shots = (folder: string, files: string[]) =>
  files.map((file) => `/media/games/${folder}/${encodeURIComponent(file)}`);

export const games: Game[] = [
  {
    id: "roblox",
    name: "Roblox",
    color: "#c0392b",
    thumbnail: "/media/games/roblox/thumbnail.webp",
    screenshots: shots("roblox", [
      "RobloxScreenShot20250802_214342700.png",
      "RobloxScreenShot20250802_214349325.png",
      "RobloxScreenShot20260804_195236384.png",
      "10220134707_110125451314286_1785854498382.png",
    ]),
  },
  {
    id: "plato",
    name: "Plato",
    color: "#2e86de",
    thumbnail: "/media/games/plato/thumbnail.webp",
    screenshots: shots("plato", [
      "Screenshot_2026-01-31-11-14-06-437_com.plato.android.jpg",
      "Screenshot_2026-01-31-11-14-23-932_com.plato.android.jpg",
    ]),
  },
  // No thumbnail or screenshots yet
  {
    id: "scribble",
    name: "Scribble.io",
    color: "#8e44ad",
    thumbnail: "/media/games/skribblio/thumbnail.webp",
  },
  {
    id: "crazygames",
    name: "CrazyGames",
    color: "#16a085",
    thumbnail: "/media/games/crazygames/thumbnail.webp",
    screenshots: shots("crazygames", [
      "bloxd house.PNG",
      "bloxd house 1.PNG",
      "bloxd house 2.PNG",
      "bloxd house 3.PNG",
      "bloxd house 4.PNG",
      "bloxd house 5.PNG",
      "bloxd house 6.PNG",
    ]),
  },
  {
    id: "among-us",
    name: "Among Us",
    color: "#d35400",
    thumbnail: "/media/games/amongus/thumbnail.jpg", // this one is a .jpg
  },
  {
    id: "find-the-markers",
    name: "Find the Markers",
    color: "#27ae60",
    thumbnail: "/media/games/findthemarkers/thumbnail.webp",
  },
  {
    id: "flee-the-facility",
    name: "Flee the Facility",
    color: "#34495e",
    thumbnail: "/media/games/fleethefacility/thumbnail.webp",
  },
  {
    id: "drift-boss",
    name: "Drift Boss",
    color: "#f39c12",
    thumbnail: "/media/games/driftboss/thumbnail.webp",
    playUrl: "https://www.coolmathgames.com/0-drift-boss",
  },
];
