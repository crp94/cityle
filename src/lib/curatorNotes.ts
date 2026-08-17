// Curator's Notes (Phase 7, Workstream NN): the one place in Cityle written
// in a single first-person editorial voice instead of neutral game-UI copy
// or cited per-city data. English-only by design — like `urban_fact` and
// `educational_debrief` in curated-cities.json, this is authored content,
// not translated UI chrome (see the "Curator's Notes" comment block in
// i18n.ts's Translations interface for the same reasoning applied there;
// the page-chrome labels around these notes on /notes still run through
// the normal es/it translation everything else in the app gets).
//
// Same non-negotiable rule carried through every phase of this project
// since Phase 2 Workstream B: no invented precision, no unhedged prediction
// about a named city's specific future, and any real hedge gets delivered
// sharper here, never softer. Every number quoted below is pulled straight
// from src/data/curated-cities.json (verified by hand against the bundled
// dataset while writing these) or from the header comments in
// src/scripts/buildCuratedCities.ts — nothing here is invented for effect.

export interface CuratorNote {
  id: string;
  title: string;
  paragraphs: string[];
}

export const CURATOR_NOTES: CuratorNote[] = [
  {
    id: 'why-a-guessing-game',
    title: 'Why a guessing game, and not a dashboard',
    paragraphs: [
      "There's no shortage of climate dashboards. Most of them are accurate, and almost nobody spends more than a few seconds on them, because a grid of stats has no reason to hold your attention past the first glance. I wanted something that would make someone sit with a city's numbers long enough to actually notice their shape — which a guessing game forces in a way a dashboard doesn't.",
      "The tradeoff is real. Turning a city's profile into clues means simplifying it, gamifying it, occasionally making a serious number feel like a puzzle piece instead of a fact about somewhere people actually live. I've tried to keep that tension visible rather than paper over it — the disclaimers scattered through this game aren't legal boilerplate, they're the caveats I'd want attached if I were reading these numbers cold, from someone else.",
      "If this game gets one thing right, I'd want it to be this: a city you correctly identified after four guesses sticks with you differently than a city you just read about.",
    ],
  },
  {
    id: 'why-255-not-72',
    title: 'Why 255, and not the 72 I started with',
    paragraphs: [
      "Cityle launched with 72 cities. Phase 2 expanded that to 255 across eight authoring batches, and every batch meant staring at a shortlist and cutting most of it.",
      "The cut I remember clearest: Hamilton, New Zealand, dropped from the very last batch for missing this game's 250,000-population floor. Nothing personal in it — a fixed rule applied evenly is the only kind of rule that doesn't quietly turn into favoritism. But it still meant one specific city, with its own specific reasons to be interesting, didn't make it in.",
      "255 isn't a number I'd defend as objectively correct. It's roughly where each new batch stopped adding real variety and started feeling like padding. A bigger pool would mean longer stretches between repeats in Daily mode; it would also mean thinner research behind each city. I picked depth.",
    ],
  },
  {
    id: 'the-average-that-hides-the-city',
    title: 'The average that hides the city',
    paragraphs: [
      "Every city in this game gets one tree-canopy number, one transit share, one median age. Antofagasta's canopy reads 1%; Libreville's reads 55%. Both numbers are true, and both are also, individually, a kind of lie — a metro-wide average can't tell you whether that shade or that transit line reaches the neighborhood that needs it, or stops at the edge of the one that already has everything.",
      "This is the same problem this game's own walkability note already flags, wearing different clothes. An \"average\" improvement — a new tram line, a canopy target, a park — can lift a citywide number while changing almost nothing for the people it was ostensibly for, if it lands where land is already expensive and political attention already flows.",
      "I don't have a neighborhood-level dataset that would let this game score that distinction, and I'm not going to dress up a metro-wide figure as more honest than it is. Read every stat here as \"this city, on average\" — then ask, for whichever city's in front of you, who that average is actually describing.",
    ],
  },
  {
    id: 'transit-share-is-a-choice',
    title: 'Transit share is a policy, not a climate',
    paragraphs: [
      "Anchorage's active-and-transit commute share sits at 8% in this dataset. Hong Kong's sits at 88%. That's an enormous gap, and it's tempting to read it as geography — cold, sprawling Alaska against dense, subtropical Hong Kong — and stop there.",
      "Geography is real, but it isn't the whole story, and treating it as the whole story lets the actual decisions off the hook: parking minimums, zoning that separates housing from everything else, decades of budget choices about what gets built next and what gets left to cars. Those are choices, made by named institutions, revisable by other choices.",
      "I'm not claiming any single city in this pool could flip that number by some fixed date — that's not a claim this dataset, or honestly anyone's, can responsibly make about a specific place. I am claiming the number isn't fate.",
    ],
  },
  {
    id: 'a-2050-number-is-not-a-forecast',
    title: 'A 2050 number is not a forecast',
    paragraphs: [
      "Every city here carries a 2050 Köppen class, a temperature anomaly, a precipitation shift. They're the backbone of half this game's clues, and I want to be direct about what they are: scenario-based, directional estimates, built to be plausible and internally consistent — not a prediction of what will actually happen to any one named city in 2050.",
      "The distinction matters more than it sounds like it should. \"Directional estimate\" means the shape of the change — warmer, drier, a Köppen boundary crossed — is worth taking seriously. It does not mean the specific decimal is a number you should ever repeat as settled fact about a real place.",
      'The Climate Time Machine mode leans on these numbers harder than anywhere else in the game, and if there is one place I\'d most want a player to have read this note first, it\'s there.',
    ],
  },
  {
    id: 'the-photo-you-didnt-take',
    title: "The photo you didn't take",
    paragraphs: [
      "Every image in this game is real, sourced from Wikimedia Commons, credited to whoever actually took it and licensed however they chose to release it — CC BY, CC BY-SA, CC0, a handful of flat public domain. I didn't commission a single one.",
      "That has a real cost. The pool of available photos on an open-license platform skews toward whatever's already been photographed and uploaded that way, which skews toward wealthier cities, more-visited cities, more-online photographers. A city that's stunning but under-documented on Commons gets a thinner slice of that visual record than a city that's merely popular.",
      "One photo was never going to represent a whole metropolitan area honestly anyway. I'd rather be upfront about the selection bias baked into what's available than let the single image you see pass as a neutral sample of the place.",
    ],
  },
  {
    id: 'gini-is-a-tier-not-a-decimal',
    title: 'Gini is a tier, not a decimal',
    paragraphs: [
      "133 of this game's 255 cities land in the \"Moderate (0.30–0.40)\" Gini tier. That's a wide bucket doing a lot of work — a city near the top of it and a city near the bottom of it can have meaningfully different lived inequality, and this game's clue system has no way to tell them apart.",
      "I chose tiers over a raw decimal for the same reason the rest of this game leans on ranges and directional language rather than false precision: inequality estimates vary by source, by year, by whether income or wealth is being measured, and pretending to more precision than the underlying data supports would be worse than admitting the bucket is coarse.",
      "Coarse is still worth showing. Even a wide tier says something about how unevenly a city's climate burdens are likely to land — just not exactly how unevenly, and never who specifically carries it.",
    ],
  },
  {
    id: 'carbon-per-capita-hides-the-supply-chain',
    title: 'Carbon per capita hides the supply chain',
    paragraphs: [
      "Bangui and Blantyre sit near 0.2 tonnes of CO2-equivalent per person a year in this dataset. Dubai sits at 18.2. That gap is real — but per-capita territorial carbon accounting counts emissions where they're produced, not where the goods and flights consumed by that population were actually made.",
      "A low per-capita number can mean genuinely low-carbon daily life. It can also mean a city that outsourced its heaviest industry and now imports the products of somebody else's emissions. This dataset can't tell those two stories apart, and I'd rather say that plainly than let a low figure read as a clean bill of health.",
      "None of this is an argument for ignoring the number — it's real, it's cited, it's worth knowing. It's an argument for treating \"per capita\" as the start of a harder question, not the end of the accounting.",
    ],
  },
  {
    id: 'small-cities-get-a-harder-deal',
    title: 'Small cities get a harder deal in this game, on purpose',
    paragraphs: [
      "Hobart, Geelong, and Anchorage — the three smallest metro populations in this pool, each just past the 250,000-person floor — are objectively harder to place than Tokyo or Jakarta. Fewer players have visited, fewer carry a mental map of them, fewer pop-culture reference points to lean on for a guess.",
      "I kept them in anyway, and I'd add more like them if the research pipeline could support it. A guessing game built only from the fifty most-famous cities on Earth would be an easier game and a much smaller one — it would mostly be re-testing which cities you already knew existed, not teaching you anything new about how they actually differ.",
      "This is the honest tradeoff, not a hidden one: some daily puzzles will feel unfair in the specific way \"I've genuinely never heard of this place\" feels unfair. That's not a bug I'm interested in patching out.",
    ],
  },
  {
    id: 'the-generic-line-is-a-confession',
    title: 'The generic line is a small confession',
    paragraphs: [
      "69 of this game's 255 city profiles carry the same fallback sentence where a hand-written debrief should be — a placeholder that says, essentially, \"I haven't gotten to this one yet.\" The other 186 got a specific paragraph tying that city's urban form or history to whatever risk or pattern its own numbers actually show.",
      "I could have hidden that gap behind slightly-better-than-nothing text tuned per city so it read as intentional everywhere. I decided the flat, repeated fallback was more honest than fake specificity — it's obvious the moment you hit one, which is the point.",
      "Closing that gap is ongoing, not finished. If you keep playing and keep noticing which cities get the deeper writeup and which don't, that pattern is real information about where my attention has and hasn't gone yet — not a ranking of which cities matter more.",
    ],
  },
  {
    id: 'who-gets-planned-for',
    title: 'Median age is a proxy for who gets planned for',
    paragraphs: [
      "Kampala's median age in this dataset is 16. Sapporo's is 49. That's not a demographic footnote — a city planning heat response, transit, or housing around a median-16 population is solving a genuinely different problem than one planning around a median-49 population, and the budgets, workforce, and political urgency behind climate adaptation follow that split unevenly around the world.",
      "The cities skewing youngest here are disproportionately the ones with the least fiscal room to act on the very risks this game's own 2050 fields flag for them. I can't fully explain that pattern with this dataset alone, and a single soapbox paragraph won't either — but it's worth sitting with rather than scrolling past as trivia.",
      "I'm not telling you which city will handle its own future well. I don't know, and no one repeating a number confidently enough to sound certain does either. I'm telling you the starting conditions aren't equally hard everywhere, and the game's numbers alone won't show you that unless you go looking for it.",
    ],
  },
  {
    id: 'why-everyone-gets-the-same-city-today',
    title: 'Why everyone gets the same city today',
    paragraphs: [
      "Unlimited mode exists, and I reach for it more than Daily most weeks myself. But Daily is the mode I actually built this game around, and it's a deliberately unpersonalized one: no adaptive difficulty, no algorithm nudging you toward cities you're more likely to know, the same target for every player on Earth on a given date.",
      "That's a limitation dressed up as a feature, and I want to be honest that it's both. Some days will feel too easy and some too hard, with no tuning knob to smooth that out for you specifically. It also means the shared result grid people compare actually means something — everyone solved, or didn't solve, the same problem.",
      "I picked the shared, unadjusted version on purpose. A puzzle that quietly reshapes itself around each player stops being something you can compare notes on, and comparing notes is most of why I wanted to build this in the first place.",
    ],
  },
  {
    id: 'the-one-place-allowed-to-be-literary',
    title: 'The one place in this game allowed to be literary',
    paragraphs: [
      "Every clue elsewhere in Cityle is a real, cited number or a plainly modelled estimate labelled as such. The cryptic clues are the deliberate exception — wordplay and allusion instead of a stat, built to point at a city without naming it outright.",
      "That doesn't mean they're allowed to be wrong. Every riddle is still built on real, well-established facts about the specific city it names — a landmark, a documented etymology, a well-known piece of history. What changes isn't the truth underneath, it's the form: a riddle gets to be evocative and indirect in a way a PM2.5 reading never should be.",
      "If a riddle in this game ever states something about a city that's flatly false, that's a mistake, not a style choice. Poetic license covers phrasing, not facts.",
    ],
  },
];

/**
 * Deterministic by day — every player sees the same "featured" note on the
 * same date, cycling through the pool once before repeating. Mirrors the
 * simple `(dailyNumber - 1) % poolSize` cadence `getCycleInfo` already uses
 * in gameLogic.ts, just applied to this pool instead of the city list.
 * Callers resolve `dailyNumber` themselves (typically via
 * `getDailyGameNumber` from gameLogic.ts) rather than this function
 * importing it directly, keeping this module decoupled from the calendar.
 */
export function getCuratorNoteForDay(dailyNumber: number, notes: CuratorNote[]): CuratorNote {
  if (!notes.length) throw new Error('Curator notes pool is empty');
  const safeDay = Math.max(1, Math.floor(dailyNumber));
  return notes[(safeDay - 1) % notes.length];
}
