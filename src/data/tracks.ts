export type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
};

// "Tear in My Heart" (our song) is deliberately NOT first: it sits in the
// middle of the list (7th of 13), so the magic shows up partway through.
export const tracks: Track[] = [
  {
    id: "out-of-my-league",
    title: "Out of My League",
    artist: "Fitz and The Tantrums",
    src: "/audio/music/out-of-my-league.mp3",
  },
  {
    id: "sun-and-moon",
    title: "Sun and Moon",
    artist: "Anees",
    src: "/audio/music/sun-and-moon.mp3",
  },
  {
    id: "talk-too-much",
    title: "Talk Too Much",
    artist: "COIN",
    src: "/audio/music/talk-too-much.mp3",
  },
  {
    id: "can-i-call-you-tonight",
    title: "Can I Call You Tonight?",
    artist: "Dayglow",
    src: "/audio/music/can-i-call-you-tonight.mp3",
  },
  {
    id: "iris",
    title: "Iris",
    artist: "Goo Goo Dolls",
    src: "/audio/music/iris.mp3",
  },
  {
    id: "sweet-child-o-mine",
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    src: "/audio/music/sweet-child-o-mine.mp3",
  },
  {
    id: "tear-in-my-heart",
    title: "Tear in My Heart",
    artist: "Twenty One Pilots",
    src: "/audio/music/tear-in-my-heart.mp3",
  },
  {
    id: "isabelle",
    title: "Isabelle",
    artist: "Zach Hood",
    src: "/audio/music/isabelle.mp3",
  },
  {
    id: "everybody-talks",
    title: "Everybody Talks",
    artist: "Neon Trees",
    src: "/audio/music/everybody-talks.mp3",
  },
  {
    id: "hey-there-delilah",
    title: "Hey There Delilah",
    artist: "Plain White T's",
    src: "/audio/music/hey-there-delilah.mp3",
  },
  {
    id: "here-comes-the-sun",
    title: "Here Comes the Sun",
    artist: "The Beatles",
    src: "/audio/music/here-comes-the-sun.mp3",
  },
  {
    id: "mr-brightside",
    title: "Mr. Brightside",
    artist: "The Killers",
    src: "/audio/music/mr-brightside.mp3",
  },
  {
    id: "she-takes-me-high",
    title: "She Takes Me High",
    artist: "We The Kings",
    src: "/audio/music/she-takes-me-high.mp3",
  },
];
