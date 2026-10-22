// One entry = one diary page. Add, edit or reorder entries here and the diary updates by itself.
// Entries sit two per spread (left page, right page), in the order of this list.

export type DiaryEntry = {
  id: string;
  date: string; // shown exactly as written. No years are invented. May be "" if undated.
  title: string;
  text?: string; // your own words (optional)
  images?: { src: string; caption?: string }[]; // screenshots / photos (optional)
  mediaHint?: string; // shows a dashed "photo goes here" box until you add real images
};

export const diaryEntries: DiaryEntry[] = [
  { id: "jul-08", date: "July 8", title: "How we first met" },
  {
    id: "jul-15",
    date: "July 15",
    title: "The first time she texted me",
    mediaHint: "screenshot",
  },
  { id: "jul-23", date: "July 23", title: "The inauguration with our tissue boats" },
  {
    id: "jul-26",
    date: "July 26",
    title: "The first time we really talked",
    text: "Including the orange Tic Tac debate.",
    mediaHint: "screenshots",
  },
  // No date given for this one yet
  {
    id: "indep-practice",
    date: "",
    title: "Independence Day practice and the typing competition on Srabani ma'am's laptop",
  },
  { id: "aug-15", date: "August 15", title: "Independence Day", mediaHint: "photo" },
  // No date given for this one yet
  { id: "tuck-shop", date: "", title: "The tuck shop struggle with Vidhya ma'am" },
  { id: "oct-18", date: "October 18–22", title: "Diwali call", mediaHint: "screenshot" },
  { id: "dec-06", date: "December 6", title: "Our first meetup" },
  { id: "dec-hols", date: "December holidays", title: "Our first Hyperbeam show, OBX" },
  { id: "jan-17", date: "January 17", title: "Our second meetup" },
  {
    id: "jan-23",
    date: "January 23",
    title: "The random call where she scared me with her muffled talking",
  },
  { id: "mar-14", date: "March 14", title: "The day I slipped" },
  { id: "apr-08", date: "April 8", title: "Druggie" },
  {
    id: "apr-17",
    date: "April 17",
    title: "Showing our teeth and being goofy on video call",
  },
  { id: "apr-20", date: "April 20", title: "Among Us and Find the Markers video call" },
  {
    id: "apr-21",
    date: "April 21",
    title: "The laughing incident involving Yana, her sister and dadi",
  },
  {
    id: "apr-22",
    date: "April 22",
    title: "Hanuman faces, Flee the Facility and the disappearing moon",
  },
  {
    id: "apr-23",
    date: "April 23",
    title: "Deep conversations about love, tails and life-changing moments",
  },
  {
    id: "apr-24",
    date: "April 24",
    title: "The quick call that turned into a long one, being goofy and singing songs",
  },
  {
    id: "may-14",
    date: "May 14",
    title: "First KFC meetup, paranoia, hugs and kisses in the basement",
  },
  { id: "may-22", date: "May 22", title: "Frenchie, lap and other memories" },
  { id: "may-30", date: "May 30", title: "Among Us call and trying to watch Sherlock" },
  {
    id: "jun-03",
    date: "June 3",
    title: "KFC, a movie and a clay date after the class hangout with Pranav",
  },
  {
    id: "jun-27",
    date: "June 27",
    title: "Private screening, forged ID and a memorable makeout session",
  },
  {
    id: "jul-05",
    date: "July 5",
    title: "Temple-time call, Leon's lunch with Uppin and Scoot Boy videos",
  },
  {
    id: "jul-07",
    date: "July 7",
    title: "Hamstring stretches with Flexy Dude, deep talks and getting a little emotional",
  },
  {
    id: "jul-11",
    date: "July 11",
    title: "KFC basement meetup because she missed me, making out and the detour home",
  },
  {
    id: "jul-18",
    date: "July 18",
    title: "Private screening, Uno, Jenga, dancing, singing, making out and college talks",
  },
  { id: "aug-07", date: "August 7", title: "Avenue meetup with Mocavo and Village parking" },
  {
    id: "aug-08",
    date: "August 8",
    title: "Plant and pot shopping, private theatre watching Obsession, and McDonald's",
  },
  {
    id: "aug-12",
    date: "August 12",
    title: "Mocavo meetup after Karthik and bubble tea in HSR",
  },
  {
    id: "aug-30",
    date: "August 30",
    title: "Village and Fashion Factory basement attempts, followed by kisses at KFC",
  },
  {
    id: "sep-13",
    date: "September 13",
    title:
      "Sols games, driving practice, the lake at Park Bingipura, and the KFC and Forty Six Ounces attempts",
  },
  {
    id: "oct-06",
    date: "October 6",
    title: "Village basement makeout before dropping her at Village Marketfresh",
  },
  {
    id: "oct-09",
    date: "October 9",
    title:
      "Village basement adventures involving the guy with glasses and the family, and sneaky makeouts",
  },
];
