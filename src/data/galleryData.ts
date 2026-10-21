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

// File extensions for all numbered files in public/media/gallery
const extensionByNumber: Record<number, string> = {};

function addRange(extension: string, start: number, end: number) {
  for (let i = start; i <= end; i++) {
    extensionByNumber[i] = extension;
  }
}

// JPG files
[
  [1, 4],
  [13, 65],
  [69, 78],
  [80, 81],
  [88, 90],
  [93, 111],
  [114, 121],
  [123, 126],
  [128, 129],
  [131, 131],
  [133, 216],
  [222, 228],
].forEach(([start, end]) => addRange(".jpg", start, end));

// JPEG files
addRange(".jpeg", 67, 67);
addRange(".mp4", 267, 267);

// MP4 files
[
  [5, 12],
  [66, 66],
  [68, 68],
  [79, 79],
  [82, 87],
  [91, 92],
  [112, 113],
  [122, 122],
  [127, 127],
  [130, 130],
  [132, 132],
  [217, 221],
  [229, 232],
  [264, 266],
  [268, 268],
].forEach(([start, end]) => addRange(".mp4", start, end));

// PNG files
addRange(".png", 233, 258);

// MKV files
addRange(".mkv", 259, 263);

// Generate all numbered filenames
const mediaFiles = Array.from({ length: 268 }, (_, index) => {
  const id = index + 1;
  const number = String(id).padStart(3, "0");
  const extension = extensionByNumber[id];

  return `${number}${extension}`;
});

// Generate gallery data
const galleryData: GalleryItem[] = mediaFiles.flatMap((filename) => {
  const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();

  let type: GalleryItem["type"];

  if (imageExtensions.includes(extension)) {
    type = "image";
  } else if (videoExtensions.includes(extension)) {
    type = "video";
  } else {
    return [];
  }

  const id = Number(filename.slice(0, 3));
  const src = `/media/gallery/${filename}`;

  return [
    {
      id,
      name: filename,
      type,
      src,
      thumbnail: src,
    },
  ];
});

export default galleryData;
