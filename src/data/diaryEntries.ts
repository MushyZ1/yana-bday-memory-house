export type DiaryEntry = {
  id: string;
  date: string;
  title: string;
  text?: string;
  images?: { src: string; caption?: string }[];
  mediaHint?: string;
};

export const diaryEntries: DiaryEntry[] = [
  {
    id: "jul-08",
    date: "July 8",
    title: "How we first met",
    text: "Day one of this whole story. I was being bombarded by the kids in the hallway during campaigning, and I saw you by the turn with your brows raised. You took that opportunity to ask me to vote for you, and we both lied through our teeth, saying we would vote for each other! Still can't believe how vivid this memory is, considering you were a stranger back then.",
  },
  {
    id: "jul-15",
    date: "July 15",
    title: "The first time you texted me",
    text: "You texted me. First time ever. One hell of a way to enter someone's DMs... You played it cool? But I have the screenshot, so let's not pretend.",
    mediaHint: "screenshot",
  },
  {
    id: "jul-23",
    date: "July 23",
    title: "The inauguration of our tissue boats",
    text: "We had a full, official inauguration for the student council. Very serious ceremony. Yet, we were playing with the tissue paper they gave us to wipe our sweat off with and tried making tissue boats. Oh! Don't forget how you couldn't read those huge banners hung up on the ceiling of the stage, you half-blind Vice President.",
  },
  {
    id: "jul-26",
    date: "July 26",
    title: "The first time we really talked",
    text: "This was the day we finally had a proper conversation over text, and obviously it came with the Great Orange Tic Tac vs. Kinderjoy Debate. It started off with me asking about the Apollo medical thing after I had gone for a football tournament, and God knows how we branched off onto so many different topics and kept talking for hours. We were just meant to be?",
    mediaHint: "screenshots",
  },
  {
    id: "indep-practice",
    date: "(bonus memory)",
    title: "Independence Day practice and the typing competition",
    text: "Independence Day practice somehow turned into a typing competition on Srabani ma'am's laptop. Was it productive? No. Was it fun? Extremely. Remember how we played Bus and Marshmellow game during rehearsals? We never are bored when we are together. It really is a blessing looking back at it.",
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
    text: "The tuck shop struggle with Vidhya ma'am. A real test of character, and somehow we both survived it. Okay, I was being dramatic. But it was a good excuse to keep seeing each other, wasn't it?",
  },
  {
    id: "oct-18",
    date: "October 18–22",
    title: "The Diwali call",
    text: "The Diwali call, spread across October 18 to 22. Festival of lights, and apparently also the festival of not hanging up (HAHAHAHAHAHA IM SO FUNNY). Can't believe I had songs in my ears to shut out the noise of those loud fireworks... But it was still one of the most memorable moments I've had.",
    mediaHint: "screenshot",
  },
  {
    id: "dec-06",
    date: "December 6",
    title: "Our first meetup",
    text: "We went from texting to being actual real-life humans in the same place. Exciting, a little terrifying (definitely wasn't sweating my ahh off). I reached first, met Orbi, introduced you to Orbi (yes, the distinction is important), played some tennis, went to Ajfan for a drink, then to La Pino Pizza. The boy baby clearly loved you and you taught him how to bring his tongue out... At least, the girl baby loved me and only stared at me hehe. Remember how you couldn't handle the spice and started feeding me? And as revenge, I fed you! We played two-player games by the stairs where I beat you so bad that you had to cheat to start winning (still lost in the end). And we gave our first awkward hug before we left!",
  },
  {
    id: "dec-hols",
    date: "December holidays",
    title: "Our first Hyperbeam show: OBX",
    text: "Our very first Hyperbeam show, and it was OBX. The beginning of a long and proud tradition of watching things together. And I take complete credit for this.",
  },
  {
    id: "jan-17",
    date: "January 17",
    title: "Our second meetup",
    text: "Meetup number two, which officially proved that the first one wasn't a fluke. You'd think the nervousness would fly away after all that, but NO! We played tennis again and then went to Ajfan for drinks.\n\nWe sat down on the stairs beside the alley to finish our drinks. Played two-player games briefly. Then we started walking along the alley when you started talking about your grad experience. Remember that pet cat threatening to jump down?\n\nAnyways, after all the talking I realized my pockets were empty. My phone was lost... Fully panicking and checking everywhere, even asking the hospital staff if they had found any phones or if we could check the CCTV, it was all to no avail.\n\nFinally, I logged into my mail account on your phone and used Google's lost device feature to keep ringing my phone. A delivery guy picked up, and since my Hindi was still improving (IMPROVING OKAY), you decided to talk to him. Luckily, he said he would come to us and give us the phone.\n\nWhile we waited, you looked like you were about to cry (genuinely, your expression was worrying me), and I tried everything to make you laugh but to no avail. I also thought about hugging you, but I was way too nervous for all that.\n\nWhen he reached us, we showered him with gratitude and had a good sigh of relief. After that, we had the auto ride with the side hug OMG. LAKSDJFLSKDAJFLKAJSFLK YEAH IDK HOW THAT HAPPENED. WE WERE JS COVERING OURSELVES SO PEOPLE WOULDN'T SEE US.\n\nIt ended so soon man. We had our KFCs and then made the videos. Ended with an awkward hug. Again.",
  },
  {
    id: "jan-23",
    date: "January 23",
    title: "The random call with the muffled talking",
    text: "A completely random call in which you scared me with your muffled talking acting injured. I want to be clear that I was not worried (I was so worried). Then we just went on for so long, talking about God knows what.",
  },
  {
    id: "mar-14",
    date: "March 14",
    title: "The day I slipped",
    text: "The day I slipped. I would love to say it was graceful. I would also love to say it never happened.\n\nI JUST BLURTED IT OUT WITH SO MUCH FLUFF BEFORE IT? IT WAS SUCH A RANDOM CONFESSION OMG. I DIDNT THINK IT WOULD HAPPEN.\n\nBut to be fair, after playing tennis and lying down under that tree in the park beside the tennis ground, with the sunset light glimmering on us, and you on my lap after I tried tying your hair and stuff, I really can't blame myself for letting it slip out like that (I shouldn't have let it slip like that omg).\n\nWe had our first kiss then, in that magical moment beneath the stars.",
  },
  {
    id: "apr-08",
    date: "April 8",
    title: "Druggie",
    text: "Druggie. If you know, you know. If you don't, you are not getting an explanation.\n\nOkay, just kidding. Briefly, it was our usual tennis and snacking on things. You tried chikoo shake hehehehehehehe. AND YOU DRANK THAT MORE THAN THE POMEGRANATE JUICE, DONT FORGET. Oh, also had kathi roll, which you didn't complete.\n\nSome stupid people (an adult and a child) were smoking weed under our tree, so we had to be sneaky and lie down under the foliage of the small trees. But the mosquitoes were killing us.\n\nLater, after they left, we went under the tree, set out a mat, and started cuddling. Stupid scooter noises came back, and they kept coming back. At one point, he asked me if I wanted some, told me it was private property, told me not to tell anyone about the weed, and said we should leave soon.\n\nWe didn't want our moment to end, so we stayed. Later, when it was completely dark, we heard footsteps and saw a flashlight hitting the wall in front of us. It was a lady threatening to complain about us. The idiotic druggie from before also started lecturing us, but you hurting yourself to make it look like you were about to cry worked charms.\n\nThey let us go, luckily, and didn't take a pic. But still, a salty end to such a good day. So many stories to tell the kids, huh?",
  },
  {
    id: "apr-17",
    date: "April 17",
    title: "Teeth on video call",
    text: "We showed each other our teeth and were completely goofy on a video call. No dignity was kept, and none was missed. It was when I was in Pathanamthitta and we had gaming sessions and calls so many nights.",
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
    text: "The laughing incident with you, your sister, and dadi. I can't explain it any better than that, but I can tell you it was A LOT of laughing.",
  },
  {
    id: "apr-22",
    date: "April 22",
    title: "Hanuman faces and the disappearing moon",
    text: "Hanuman faces, Flee the Facility, and the disappearing moon. A very normal day with very normal activities (activities that are rare to us).",
  },
  {
    id: "apr-23",
    date: "April 23",
    title: "Deep conversations",
    text: 'Deep conversations about why love is there, how tails of a normal distribution result in the greatest changes in life, and life-changing moments. Yes, we talked about "tails".',
  },
  {
    id: "apr-24",
    date: "April 24",
    title: "The quick call that wasn't",
    text: "It was supposed to be a quick call since your dad was returning home. But it turned into a long one, with a lot of being goofy and singing songs. Our neighbours are probably still recovering. (yeah idont know what im yapping about anymore)",
  },
  {
    id: "may-14",
    date: "May 14",
    title: "First KFC meetup",
    text: "Our first KFC meetup, featuring some paranoia, plenty of hugs, and kissies in the basement. Peak sneakiness, if you ask me. Oh, and throwing chicken popcorns around and into each others mouths.",
  },
  {
    id: "may-22",
    date: "May 22",
    title: "Frenchie and lap",
    text: "Remember Frenchie (im disguising it as a person/animal to keep it PG-friendly)? And lap, and many other things that stay between us and this diary.",
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
    text: "KFC, a movie, and a clay date, all after the class hangout with Pranav. A very full day, and a very good one. My clays were definitely better HAHAHAHAHAHAAH IMAGINE SUCKING AT CLAY MAKING AND BEING WORSE THAN ME.",
  },
  {
    id: "jun-27",
    date: "June 27",
    title: "The private screening",
    text: "Our first private screening, with a forged ID (allegedly duh) and a very memorable kissies session. You struggled with putting the pin in and unlocking the key. But since I'm the smartie, I saved the day.\n\nWe both struggled with opening the door, but once we were in, it was pretty cozy. A little paranoid at first, thinking someone would come in, but that faded away so fast.\n\nIt's a lot to pack into one day, but we managed.",
  },
  {
    id: "jul-07",
    date: "July 7",
    title: "Hamstrings and feelings",
    text: "Hamstring stretches with Flexy Dude, some deep talks, and you getting a little emotional (JS A TEENSY BIT). Flexibility on both fronts from your side!",
  },
  {
    id: "jul-11",
    date: "July 11",
    title: "The KFC basement, again",
    text: "A KFC basement meetup, because you missed me (I'm not letting that go). Kissies were had, and then there was the detour home. You were more like a kid excited to be in my car than anything, according to my memory! (very reliable memory)",
  },
  {
    id: "jul-18",
    date: "July 18",
    title: "Private screening, round two",
    text: "Another private screening, plus Uno, Jenga, dancing, singing, kissies, and college talks. A very full schedule. One of the best days for sure.",
  },
  {
    id: "aug-07",
    date: "August 7",
    title: "Avenue and Village parking",
    text: "Avenue meetup where you got me Mocavo, and some adventures at Village parking (yeah, let's keep it at that).",
  },
  {
    id: "aug-08",
    date: "August 8",
    title: "Plants, pots and Obsession",
    text: "You pulled up in a kurta and went to the stationary shop where I popped up. We went to the garden to get gifts for your mum, then to the private theatre to watch Obsession (where I had an irresistible urge to just keep kissing you) and do the usual makeout.\n\nAfter that, we went to McDonald's while watching Obsession. Culture, gardening, movies, and fries. A very diverse experience, I must say.",
  },
  {
    id: "aug-12",
    date: "August 12",
    title: "Mocavo and bubble tea",
    text: "A Mocavo meetup after Karthik, followed by bubble tea in HSR. You were paranoid before you met me and refused to try my blueberry coffee.",
  },
  {
    id: "aug-30",
    date: "August 30",
    title: "Basement attempts",
    text: "Village and Fashion Factory basement attempts. Attempts were made. Then we decided none of 'em were good enough and went to KFC, and... kisses.",
  },
  {
    id: "sep-13",
    date: "September 13",
    title: "Sols, driving and the lake",
    text: "Met at Sols since the private theatre had no slots. Played and goofed around for one hour... Then we went to the driving field where she practices, and we practiced with first and second gear.\n\nThen we went to Park Bingipura, where there was a pretty lake, and then went to KFC. The security bhaiya said we couldn't park in the basement. We went to Forty Six Ounces, which also didn't work out...\n\nSo we just shared brief kisses and held hands, and it was all mostly driving.",
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
    text: "Met in the Village basement again. Some guy with glasses was always coming and going in the basement. A family had their car parked and stayed in the basement. But I went to the back, and we made out whenever we could.\n\nIt lasted for maybe 45–50 minutes before I went to pick Hrithu up.",
  },
  {
    id: "oct-15",
    date: "October 15",
    title: "October 15",
    text: "We had to meet at 4, but Nana got a cavity, so there was a delay. I picked you up from Westside because you had to buy a sweater for your Manali trip. It was raining, so we had to stay in the car for 10 minutes for the downpour to reduce.\n\nThen we went to the theatre and played the game where one person has to spook the other by moving quickly in the dark. We started watching a friends compilation on YouTube since Netflix wasn't working.\n\nThen we 180'd the front sofa and made a big bed-type area. We tried different cuddling positions, made out, kissed while standing, jump-hugged, tried reaching me Odissi, made a handshake, and made out for the remaining few minutes we had.",
  },
];
