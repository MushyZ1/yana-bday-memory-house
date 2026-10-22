export type GalleryItem = {
  id: number;
  name: string;
  type: "image" | "video";
  src: string;
  thumbnail?: string;
};

const imageExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".avif",
];

const videoExtensions = [
  ".mp4",
  ".mkv",
  ".mov",
  ".webm",
  ".avi",
  ".m4v",
  ".wmv",
];

// One table matching public/media/gallery:
// [first number, last number, extension].
// Every number from 1 to the last number must be covered exactly once.
const fileRanges: [number, number, string][] = [
  [1, 4, ".jpg"],
  [5, 12, ".mp4"],
  [13, 65, ".jpg"],
  [66, 66, ".mp4"],
  [67, 67, ".jpeg"],
  [68, 68, ".mp4"],
  [69, 78, ".jpg"],
  [79, 79, ".mp4"],
  [80, 81, ".jpg"],
  [82, 87, ".mp4"],
  [88, 90, ".jpg"],
  [91, 92, ".mp4"],
  [93, 111, ".jpg"],
  [112, 113, ".mp4"],
  [114, 121, ".jpg"],
  [122, 122, ".mp4"],
  [123, 126, ".jpg"],
  [127, 127, ".mp4"],
  [128, 129, ".jpg"],
  [130, 130, ".mp4"],
  [131, 131, ".jpg"],
  [132, 132, ".mp4"],
  [133, 216, ".jpg"],
  [217, 221, ".mp4"],
  [222, 228, ".jpg"],
  [229, 232, ".mp4"],
  [233, 258, ".png"],
  [259, 263, ".mkv"],
  [264, 274, ".mp4"],
];

// Build a lookup: file number -> extension.
const extensionByNumber: Record<number, string> = {};

for (const [start, end, extension] of fileRanges) {
  if (start < 1 || end < start) {
    throw new Error(`[galleryData] Invalid file range: ${start}-${end}`);
  }

  for (let i = start; i <= end; i++) {
    if (extensionByNumber[i]) {
      throw new Error(`[galleryData] Duplicate file number: ${i}`);
    }

    extensionByNumber[i] = extension;
  }
}

const totalFiles = Math.max(...fileRanges.map(([, end]) => end));

// Generate gallery data.
const galleryData: GalleryItem[] = Array.from(
  { length: totalFiles },
  (_, index): GalleryItem | null => {
    const id = index + 1;
    const extension = extensionByNumber[id];

    // Don't silently skip a missing number.
    if (!extension) {
      console.warn(`[galleryData] No extension set for file number ${id}`);
      return null;
    }

    const filename = `${String(id).padStart(3, "0")}${extension}`;
    const src = `/media/gallery/${filename}`;

    let type: GalleryItem["type"];

    if (imageExtensions.includes(extension)) {
      type = "image";
    } else if (videoExtensions.includes(extension)) {
      type = "video";
    } else {
      console.warn(
        `[galleryData] Unsupported extension "${extension}" for ${filename}`,
      );
      return null;
    }

    return {
      id,
      name: filename,
      type,
      src,
      thumbnail: src,
    };
  },
).filter((item): item is GalleryItem => item !== null);

export default galleryData;
