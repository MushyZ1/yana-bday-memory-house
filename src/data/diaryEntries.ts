// One entry = one diary page. Add, edit or reorder entries here and the diary updates by itself.
// Entries sit two per spread (left page, right page), in the order of this list.
// Written to "you" (her). To change the voice, just edit the text below.

export type DiaryEntry = {
  id: string;
  date: string; // shown exactly as written. No years are invented. May be "" to hide it.
  title: string; // short heading
  text?: string; // the diary writing itself
  images?: { src: string; caption?: string }[]; // screenshots / photos (optional)
  mediaHint?: string; // shows a dashed "photo goes here" box until you add real images
};

export const diaryEntries: DiaryEntry[] = [
  {
    id: "jul-08",
    date: "July 8",
    title: "How we first met",
    text: "Day one of this whole story. I had no idea what I was getting myself into, and honestly, I would do it all over again.",
  },
  {
    id: "jul-15",
    date: "July 15",
    title: "The first time you texted me",
    text: "You texted me. First time ever. I'd like to say I played it cool, but I have the screenshot, so let's not pretend.",
    mediaHint: "screenshot",
  },
  {
    id: "jul-23",
    date: "July 23",
    title: "The inauguration of our tissue boats",
    text: "We had a full, official inauguration for our tissue boats. Very serious ceremony. Seaworthiness not guaranteed.",
  },
  {
    id: "jul-26",
    date: "July 26",
    title: "The first time we really talked",
    text: "This was the day we finally had a proper conversation, and obviously it came with the Great Orange Tic Tac Debate. I still have strong feelings about it. Evidence below.",
    mediaHint: "screenshots",
  },
  {
    id: "indep-practice",
    date: "(bonus memory)",
    title: "Independence Day practice and the typing competition",
    text: "Independence Day practice somehow turned into a typing competition on Srabani ma'am's laptop. Was it productive? No. Was it fun? Extremely.",
  },
  {
    id: "aug-15",
    date: "August 15",
    title: "Independence Day",
    text: "The actual big day. We were there, we were patriotic, and there is a photo to prove it.",
    mediaHint: "photo",
  },
  {
    id: "tuck-shop",
    date: "(bonus memory)",
    title: "The tuck shop struggle",
    text: "The tuck shop struggle with Vidhya ma'am. A real test of character, and somehow we both survived it.",
  },
  {
    id: "oct-18",
    date: "October 18–22",
    title: "The Diwali call",
    text: "The Diwali call, spread across October 18 to 22. Festival of lights, and apparently also the festival of not hanging up.",
    mediaHint: "screenshot",
  },
  {
    id: "dec-06",
    date: "December 6",
    title: "Our first meetup",
    text: "We went from texting to being actual real-life humans in the same place. Exciting, a little terrifying, 10/10.",
  },
  {
    id: "dec-hols",
    date: "December holidays",
    title: "Our first Hyperbeam show: OBX",
    text: "Our very first Hyperbeam show, and it was OBX. The beginning of a long and proud tradition of watching things together.",
  },
  {
    id: "jan-17",
    date: "January 17",
    title: "Our second meetup",
    text: "Meetup number two, which officially proved that the first one wasn't a fluke.",
  },
  {
    id: "jan-23",
    date: "January 23",
    title: "The random call with the muffled talking",
    text: "A completely random call, in which you scared me with your muffled talking. I want to be clear that I did not scream. (I screamed a little.)",
  },
  {
    id: "mar-14",
    date: "March 14",
    title: "The day I slipped",
    text: "The day I slipped. I would love to say it was graceful. I would also love to say it never happened.",
  },
  {
    id: "apr-08",
    date: "April 8",
    title: "Druggie",
    text: "Druggie. If you know, you know. If you don't, you are not getting an explanation.",
  },
  {
    id: "apr-17",
    date: "April 17",
    title: "Teeth on video call",
    text: "We showed each other our teeth and were completely goofy on a video call. No dignity was kept, and none was missed.",
  },
  {
    id: "apr-20",
    date: "April 20",
    title: "Among Us and Find the Markers",
    text: "Video call, Among Us, and Find the Markers. A lot of trust issues, a lot of laughing.",
  },
  {
    id: "apr-21",
    date: "April 21",
    title: "The laughing incident",
    text: "The laughing incident with you, your sister and dadi. I can't explain it any better than that, but I can tell you that it was a lot.",
  },
  {
    id: "apr-22",
    date: "April 22",
    title: "Hanuman faces and the disappearing moon",
    text: "Hanuman faces, Flee the Facility, and the disappearing moon. A very normal day with very normal activities.",
  },
  {
    id: "apr-23",
    date: "April 23",
    title: "Deep conversations",
    text: "Deep conversations about love, tails, and life-changing moments. Yes, tails. We contain multitudes.",
  },
  {
    id: "apr-24",
    date: "April 24",
    title: "The quick call that wasn't",
    text: "It was supposed to be a quick call. It turned into a long one, with a lot of being goofy and singing songs. Our neighbours are probably still recovering.",
  },
  {
    id: "may-14",
    date: "May 14",
    title: "First KFC meetup",
    text: "Our first KFC meetup, featuring some paranoia, plenty of hugs, and kissies in the basement. Peak romance, if you ask me.",
  },
  {
    id: "may-22",
    date: "May 22",
    title: "Frenchie and lap",
    text: "Frenchie, lap, and many other things that stay between us and this diary.",
  },
  {
    id: "may-30",
    date: "May 30",
    title: "Among Us and Sherlock",
    text: "An Among Us call, and then we tried to watch Sherlock. Emphasis on tried.",
  },
  {
    id: "jun-03",
    date: "June 3",
    title: "KFC, a movie and clay",
    text: "KFC, a movie, and a clay date, all after the class hangout with Pranav. A very full day, and a very good one.",
  },
  {
    id: "jun-27",
    date: "June 27",
    title: "The private screening",
    text: "Our first private screening, with a forged ID (allegedly) and a very memorable kissies session. It's a lot to pack into one day, but we managed.",
  },
  {
    id: "jul-05",
    date: "July 5",
    title: "Temple time and Scoot Boy",
    text: "A temple-time call, Leon's lunch with Uppin, and Scoot Boy videos. Spiritual, delicious, and slightly chaotic, all in one day.",
  },
  {
    id: "jul-07",
    date: "July 7",
    title: "Hamstrings and feelings",
    text: "Hamstring stretches with Flexy Dude, some deep talks, and me getting a little emotional. Flexibility on both fronts.",
  },
  {
    id: "jul-11",
    date: "July 11",
    title: "The KFC basement, again",
    text: "A KFC basement meetup, because you missed me (I'm not letting that go). Kissies were had, and then there was the detour home.",
  },
  {
    id: "jul-18",
    date: "July 18",
    title: "Private screening, round two",
    text: "Another private screening, plus Uno, Jenga, dancing, singing, kissies, and college talks. A very full schedule.",
  },
  {
    id: "aug-07",
    date: "August 7",
    title: "Avenue and Village parking",
    text: "Avenue meetup with Mocavo, and some adventures at Village parking.",
  },
  {
    id: "aug-08",
    date: "August 8",
    title: "Plants, pots and Obsession",
    text: "Plant and pot shopping, a private theatre watching Obsession, and McDonald's afterwards. Culture, gardening, and fries.",
  },
  {
    id: "aug-12",
    date: "August 12",
    title: "Mocavo and bubble tea",
    text: "A Mocavo meetup after Karthik, followed by bubble tea in HSR.",
  },
  {
    id: "aug-30",
    date: "August 30",
    title: "Basement attempts",
    text: "Village and Fashion Factory basement attempts. Attempts were made. Then, KFC, and kisses.",
  },
  {
    id: "sep-13",
    date: "September 13",
    title: "Sols, driving and the lake",
    text: "Sols games, driving practice, and the lake at Park Bingipura. After that came the KFC and Forty Six Ounces attempts, which also counted as attempts.",
  },
  {
    id: "oct-06",
    date: "October 6",
    title: "Village basement, again",
    text: "A Village basement kissies session, followed by dropping you off at Village Marketfresh.",
  },
  {
    id: "oct-09",
    date: "October 9",
    title: "More basement adventures",
    text: "Village basement adventures involving the guy with glasses and the family, plus some sneaky kissies that lasted 45 to 50 minutes. Very sneaky. Very long.",
  },
];
