export type Locale = 'en' | 'es' | 'it';

export interface Translations {
  appName: string;
  tagline: string;
  subTagline: string;
  daily: string;
  unlimited: string;
  nextRandom: string;
  streak: string;
  urbanDossier: string;
  guesses: string;
  submitGuess: string;
  searchPlaceholder: string;
  gameFinished: string;
  viewResults: string;
  guessHistory: string;
  distanceAndFeedback: string;
  targetFound: string;
  waitingForGuess: string;
  tooLow: string;
  tooHigh: string;
  sameCountry: string;
  region: string;
  metroPop: string;
  pm25Aqi: string;
  koppenClass: string;
  sameGroup: string;
  different: string;
  whyTheseStats: string;
  cityIdentified: string;
  mysteryRevealed: string;
  solvedInGuesses: string;
  completedAttempts: string;
  planningFact: string;
  shareGrid: string;
  shareResultCard: string;
  challengeAFriend: string;
  getPostcard: string;
  copied: string;
  playNextRandom: string;
  nextDailyIn: string;
  statsTitle: string;
  played: string;
  winRate: string;
  currentStreak: string;
  maxStreak: string;
  guessDistribution: string;
  helpTitle: string;
  howToPlay: string;
  objectiveText: string;
  clueUnlocks: string;
  clueStart: string;
  clueG1: string;
  clueG2: string;
  clueG3: string;
  clueG4: string;
  clueG5: string;
  tilesAndDirection: string;
  exactTileDesc: string;
  sameGroupTileDesc: string;
  distanceTileDesc: string;
  glossaryTitle: string;
  glossaryKoppen: string;
  glossaryPm25: string;
  glossaryUhi: string;
  glossaryTransit: string;
  dataSourcesTitle: string;
  dataSourcesDesc: string;
  sourceKoppen: string;
  sourceAir: string;
  sourceSocio: string;
  sourceWater: string;
  sourceAnalogues: string;
  sourceClim: string;
  panel1Title: string;
  panel2Title: string;
  panel3Title: string;
  panel4Title: string;
  mapTitle: string;
  panel6Title: string;
  visualClueTitle: string;
  briefingTitle: string;
  briefingObjective: string;
  briefingStep1: string;
  briefingStep2: string;
  briefingStep3: string;
  briefingDismiss: string;
  briefingToggle: string;
  currentKoppenLabel: string;
  meanTempLabel: string;
  annualRainLabel: string;
  elevationLabel: string;
  pm25Label: string;
  smogSeasonLabel: string;
  densityLabel: string;
  gdpLabel: string;
  giniLabel: string;
  medianAgeLabel: string;
  modalShareLabel: string;
  canopyLabel: string;
  uhiLabel: string;
  koppen2050Label: string;
  tempAnomalyLabel: string;
  rainShiftLabel: string;
  coastalRiskLabel: string;
  waterStressLabel: string;
  heatwaveLabel: string;
  warmingRateLabel: string;
  aridityLabel: string;
  carbonLabel: string;
  cddLabel: string;
  currentClimateTwin: string;
  futureClimateAnalogue: string;
  unlockPromptDemo: string;
  unlockPromptMobility: string;
  unlockPromptRisk: string;
  unlockPromptMap: string;
  mapLockedTitle: string;
  mapLockedDesc: string;
  mapUnlocked: string;
  scaleKm: string;
  urbanFabric: string;
  water: string;
  annualCycle: string;
  tempLine: string;
  rainBars: string;
  congrats: string;
  debrief: string;
  dataSources: string;
  moreGames: string;
  climatleLink: string;

  // Everyday Access & Morphology
  everydayAccessTitle: string;
  everydayAccessDesc: string;
  builtFormContext: string;
  formContextRadial: string;
  formContextLinear: string;
  formContextCoastal: string;
  formContextIsland: string;
  formContextGrid: string;
  formContextValley: string;
  formContextDelta: string;
  socialInfrastructureTitle: string;
  socialInfrastructureDesc: string;
  accessUnscoredNote: string;
  collectiveLeversTitle: string;
  collectiveLeversDesc: string;

  // Mission Briefing
  missionBriefingTitle: string;
  missionBriefingSubtitle: string;
  briefingRead: string;
  briefingReadDesc: string;
  briefingGuess: string;
  briefingGuessDesc: string;
  briefingUnlock: string;
  briefingUnlockDesc: string;
  missionBriefingFootnote: string;

  // Map & Controls
  fifteenMinWalkBadge: string;
  urbanMapLocked: string;
  urbanMapLockedDesc: string;
  readyBadge: string;
  unlocksOnGuessN: string;
  zoomIn: string;
  zoomOut: string;
  resetView: string;

  // Victory Modal & Debrief
  theSharedCity: string;
  sharedCityDesc: string;
  gameplayDisclaimer: string;
  statClimate: string;
  statMeanTemp: string;
  statMetro: string;
  statElevation: string;
  educationalDebrief: string;
  cityPhoto: string;
  photoCreditLabel: string;

  // Help Modal & Editorial Guide
  howToReadCity: string;
  readCityPoint1Title: string;
  readCityPoint1Desc: string;
  readCityPoint2Title: string;
  readCityPoint2Desc: string;
  readCityPoint3Title: string;
  readCityPoint3Desc: string;
  readCityPoint4Title: string;
  readCityPoint4Desc: string;
  readCityPoint5Title: string;
  readCityPoint5Desc: string;
  dataStatusTitle: string;
  dataStatusP1: string;
  dataStatusP2: string;
  dataStatusP3: string;
  referencesAndAttribution: string;
  osmCartoAttribution: string;
  whoTransportGuidance: string;

  // Dossier & Page Layout
  cluesUnlockedBanner: string;
  makeAnotherGuess: string;
  futureEstimatesDisclaimer: string;
  directionalInequality: string;
  footerTagline: string;
  madeByLabel: string;
  methodologySources: string;
  guessMap: string;
  cluesFraction: string;
  bothModesPoolDesc: string;
  guessesLeft: string;

  // Robinson Map
  mapPlottedCount: string;

  // Sparkline
  baselineLabel: string;
  estimate2050Label: string;
  overlayLabel: string;
  touchHoverHint: string;
  presentLabel: string;
  future2050ArrowLabel: string;

  // Köppen Modal
  koppenCurrentClassHeader: string;
  koppenProjected2050Header: string;
  koppenCodeBreakdownHeader: string;
  koppenLetter1Label: string;
  koppenLetter2Label: string;
  koppenLetter3Label: string;
  closeExplanationLabel: string;
  closeLabel: string;

  // Comparison Matrix
  otherRegion: string;
  populationLabel: string;
  matchLabel: string;
  higherLabel: string;
  lowerLabel: string;
  comparisonEmptyState: string;

  // Stats Modal — Unlimited & Badges tabs (Workstream 4.1 / 4.5)
  badgesTabLabel: string;
  currentRunLabel: string;
  bestRunLabel: string;
  bestGuessLabel: string;
  wonLabel: string;
  badgeFirstFlightName: string;
  badgeFirstFlightDesc: string;
  badgeContinentalHopName: string;
  badgeContinentalHopDesc: string;
  badgeClimateCartographerName: string;
  badgeClimateCartographerDesc: string;
  badgeFirstGuessAceName: string;
  badgeFirstGuessAceDesc: string;
  badgeStreakKeeperName: string;
  badgeStreakKeeperDesc: string;
  badgeMarathonerName: string;
  badgeMarathonerDesc: string;
  badgeDeepDiverName: string;
  badgeDeepDiverDesc: string;
  badgeHardModeCartographerName: string;
  badgeHardModeCartographerDesc: string;
  badgeUnlockedOn: string;
  badgeLockedLabel: string;
  newBadgeUnlocked: string;

  // Daily Archive modal (Workstream 4.2)
  archiveTitle: string;
  archiveCycleLabel: string;
  closeArchive: string;
  previousMonth: string;
  nextMonth: string;
  archiveDayLabel: string;
  archiveTodayLabel: string;
  archiveStatusWon: string;
  archiveStatusLost: string;
  archiveStatusInProgress: string;
  archiveStatusUnplayed: string;

  // Share failure fallback (Workstream 4.3)
  shareErrorTitle: string;
  shareErrorHint: string;
  retry: string;

  // Header wiring (Wave 2): Archive button + Hard Mode toggle
  openArchiveLabel: string;
  // Header wiring (Phase 3, Workstream I): Atlas mode nav entry
  openAtlasLabel: string;
  // Header wiring (Phase 4, Workstream Y): Explore menu consolidating
  // Atlas/Almanac/Marathon behind a single trigger icon.
  exploreMenuLabel: string;
  openAlmanacLabel: string;
  openMarathonLabel: string;
  // Header wiring (Phase 5, Workstream AA): Explore menu's 4th link.
  openPlaylistsLabel: string;
  // Header wiring (Phase 7, Workstream OO): Explore menu's 5th-7th links.
  openTimeMachineLabel: string;
  openQuickfireLabel: string;
  openNotesLabel: string;
  difficultyStandard: string;
  difficultyHard: string;
  difficultyToggleHint: string;
  difficultyLockedHint: string;
  hardModeSectionLockedDesc: string;

  // Win/loss reaction ladder (Workstream B, Phase 2) — keyed off guess count
  // (1-6) on a win, plus a distinct loss state and a streak-aware loss
  // variant. Rendered as the new large display headline in VictoryModal.
  winHeadline1: string;
  winSubline1: string;
  winHeadline2: string;
  winSubline2: string;
  winHeadline3: string;
  winSubline3: string;
  winHeadline4: string;
  winSubline4: string;
  winHeadline5: string;
  winSubline5: string;
  winHeadline6: string;
  winSubline6: string;
  lossHeadline: string;
  lossSubline: string;
  lossStreakSubline: string;

  // Comparison Matrix — near-miss micro-reaction (Workstream B, Phase 2)
  soCloseFlag: string;
  // Köppen 4th comparison tier (Workstream A adds 'same-subtype' to
  // koppenComp.status; this is its display label in ComparisonMatrix.tsx).
  sameSubtype: string;

  // "Choose Your Clue" token economy (Workstream A.2, Phase 2) — new keys
  // only, added alongside the existing Dossier/clue strings above rather
  // than replacing them (the fixed-threshold copy stays in place for any
  // other caller, unused by the new Dossier.tsx).
  clueTabClimateAir: string;
  clueTabPeopleEconomy: string;
  clueTabMobilityForm: string;
  clueTabOutlook2050: string;
  clueTabPlaceMap: string;
  clueTabBonusInsight: string;
  clueTabsAriaLabel: string;
  chooseYourClueBanner: string;
  spendTokenCta: string;
  bankedTokensStatus: string;
  lockedTabTooltipNextToken: string;
  lockedTabTooltipSpendNow: string;
  bonusInsightLockedTooltip: string;
  bonusInsightDisclaimer: string;

  // Phase 4 — Almanac (Workstream U): browsable grid of all curated cities,
  // client-side filters, and search. Deliberately spoiler-safe — only the
  // photo/name/country/Köppen headline stat ever renders on a card.
  almanacTitle: string;
  almanacSubtitle: string;
  almanacFilterContinentLabel: string;
  almanacFilterKoppenLabel: string;
  almanacFilterPopulationLabel: string;
  almanacTierMegacity: string;
  almanacTierLarge: string;
  almanacTierMid: string;
  almanacTierSmallMid: string;
  almanacSearchPlaceholder: string;
  almanacCompareCta: string;
  almanacClearFilters: string;
  almanacResultsCount: string;
  almanacEmptyState: string;

  // Phase 4 — Photo mode (Workstream V): header pill label (mirrors
  // `daily`/`unlimited` above — a later, separate workstream wires the
  // actual header pill using this key) plus one short pinned-photo caption.
  photo: string;
  photoModePinnedHint: string;

  // Phase 4 — Marathon mode (Workstream T): /marathon, a shared daily
  // 5-city sequence built from MarathonRound. Keys prefixed `marathon` to
  // stay collision-safe while i18n.ts is being edited concurrently by other
  // Phase 4 workstreams.
  marathonEyebrow: string;
  marathonPageTitle: string;
  marathonIntro: string;
  marathonRoundProgress: string;
  marathonSummaryEyebrow: string;
  marathonSummaryTitle: string;
  marathonSummarySubtitle: string;
  marathonTotalScoreLabel: string;
  marathonTableCity: string;
  marathonTableGuesses: string;
  marathonTableResult: string;
  marathonResultWon: string;
  marathonResultLost: string;
  marathonShareCta: string;
  marathonComeBackTomorrow: string;
  marathonBackToCityle: string;

  // Phase 5 — Onboarding (Workstream BB): first-run Welcome modal, shown
  // automatically once (storage.ts's hasSeenWelcome/markWelcomeSeen) and
  // replayable afterward via a link in HelpModal.
  welcomeTitle: string;
  welcomeIntro: string;
  welcomeGuessFeedback: string;
  welcomeClueMechanic: string;
  welcomeDismissCta: string;
  replayWelcomeGuide: string;

  // Phase 5 — Playlists (Workstream AA): /playlists picker +
  // /playlists/[playlistId] play-through, reusing MarathonRound as the
  // per-round leaf (see src/lib/playlists.ts). Not day-locked — freely
  // repeatable anytime, like Unlimited mode, not compared across players
  // like the daily Marathon. Playlist name/blurb strings themselves live in
  // playlists.ts (data, not UI chrome) and are intentionally not
  // per-locale, matching how city urban_fact/educational_debrief already
  // aren't translated either.
  playlistsPageTitle: string;
  playlistsPageIntro: string;
  playlistCityCount: string;
  playlistPlayCta: string;
  playlistPageEyebrow: string;
  playlistNotFoundTitle: string;
  playlistNotFoundMessage: string;
  playlistSummaryEyebrow: string;
  playlistSummarySubtitle: string;
  playlistShareCta: string;
  playlistComeBackAnytime: string;

  // Phase 7 — Climate Time Machine (Workstream II): /time-machine, a
  // freely-repeatable practice mode. Feeds a synthetic "2050" City object
  // (see buildSyntheticFutureTarget in timeMachineLogic.ts) straight into
  // the existing evaluateGuess/ComparisonMatrix pipeline, unchanged — no day
  // lock, no saved state, a fresh random target on every visit or replay.
  // Reuses several existing keys as-is for the reveal state (cityIdentified,
  // mysteryRevealed, solvedInGuesses, completedAttempts, the winHeadline/
  // winSubline ladder, lossHeadline/lossSubline) and for two of the three
  // profile stats (koppen2050Label, rainShiftLabel) — only genuinely new
  // copy is declared here.
  timeMachineEyebrow: string;
  timeMachinePageTitle: string;
  timeMachineIntro: string;
  timeMachineHookTitle: string;
  timeMachineHookSubtitle: string;
  timeMachineProjectedTempLabel: string;
  timeMachineRevealIntro: string;
  timeMachinePlayAgain: string;
  timeMachineLoading: string;

  // Phase 7 — Cryptic clue (Workstream LL): free bonus flavor text label,
  // rendered near the Dossier's pinned header whenever city.cryptic_clue is
  // present (Workstream KK's riddle-authoring batches). No token cost, no
  // interaction with the "Choose Your Clue" economy above.
  crypticClueLabel: string;

  // Phase 7 — Sixty-Second Cityle / Quickfire (Workstream MM): a 60-second
  // timed "which city is highest/lowest on this stat" session. Freely
  // repeatable, session-based, not day-locked.
  quickfireEyebrow: string;
  quickfireTitle: string;
  quickfireIntro: string;
  quickfireBestScoreLabel: string;
  quickfireStartCta: string;
  quickfireTimeLeftLabel: string;
  quickfireScoreLabel: string;
  quickfireQuestionHighest: string;
  quickfireQuestionLowest: string;
  quickfireFieldPopulation: string;
  quickfireFieldPm25: string;
  quickfireFieldElevation: string;
  quickfireFieldTemp: string;
  quickfireFieldTreeCanopy: string;
  quickfireFieldTransit: string;
  quickfireFieldEquatorDistance: string;
  quickfireCorrectAnnounce: string;
  quickfireIncorrectAnnounce: string;
  quickfireFinishedEyebrow: string;
  quickfireFinishedTitle: string;
  quickfireFinalScoreLabel: string;
  quickfireNewBestBadge: string;
  quickfirePlayAgainCta: string;

  // Phase 7 — Curator's Notes (Workstream NN): /notes lists short,
  // first-person essays with the day's featured one pinned at the top. The
  // essays themselves live in curatorNotes.ts as English-only authored
  // content (matching how city urban_fact/educational_debrief are already
  // English-only, not translated) — these are just the page-chrome labels
  // wrapped around them, which do get the normal es/it treatment.
  notesPageEyebrow: string;
  notesPageTitle: string;
  notesPageIntro: string;
  notesFeaturedBadge: string;
  notesMoreHeading: string;
}

export const TRANSLATIONS: Record<Locale, Translations> = {
  en: {
    appName: 'CITYLE',
    tagline: 'URBAN & CLIMATE',
    subTagline: 'CURATED URBAN-CLIMATE DEDUCTION',
    daily: 'DAILY',
    unlimited: 'UNLIMITED',
    nextRandom: 'Next Random City',
    streak: 'STREAK',
    urbanDossier: 'Urban Dossier',
    guesses: 'Guesses',
    submitGuess: 'SUBMIT GUESS',
    searchPlaceholder: 'Search a city (e.g. Madrid, Tokyo, Nairobi, Vancouver...)',
    gameFinished: 'Game finished — see your results below',
    viewResults: 'View Results',
    guessHistory: 'GUESS HISTORY',
    distanceAndFeedback: 'DISTANCE & STAT FEEDBACK',
    targetFound: 'TARGET FOUND',
    waitingForGuess: 'Waiting for guess...',
    tooLow: '(Too low)',
    tooHigh: '(Too high)',
    sameCountry: 'Same Country',
    region: 'REGION',
    metroPop: 'METRO POP',
    pm25Aqi: 'PM2.5 AQI',
    koppenClass: 'KÖPPEN CLASS',
    sameGroup: 'Same Group',
    different: 'Different',
    whyTheseStats: 'WHY DOES THIS CITY HAVE THESE STATS?',
    cityIdentified: 'CITY LOCKED IN.',
    mysteryRevealed: "OUT OF GUESSES. HERE'S THE CITY.",
    solvedInGuesses: 'Solved in {n}/6 guesses',
    completedAttempts: 'Completed all 6 attempts',
    planningFact: 'Planning Fact',
    shareGrid: 'SHARE SCORE GRID',
    shareResultCard: 'SHARE RESULT',
    challengeAFriend: 'CHALLENGE A FRIEND',
    getPostcard: 'GET POSTCARD',
    copied: 'COPIED TO CLIPBOARD!',
    playNextRandom: 'PLAY NEXT RANDOM CITY',
    nextDailyIn: 'Next Daily Cityle releases in 24 hours',
    statsTitle: 'PLAYER STATISTICS',
    played: 'PLAYED',
    winRate: 'WIN RATE',
    currentStreak: 'STREAK',
    maxStreak: 'MAX',
    guessDistribution: 'GUESS DISTRIBUTION',
    helpTitle: 'HOW TO PLAY & DATA SOURCES',
    howToPlay: 'How to Play',
    objectiveText: 'Identify the mystery global city in 6 attempts using its climate trajectories, air quality telemetry, economics, demographics, and urban form.',
    clueUnlocks: 'PROGRESSIVE CLUE UNLOCKS',
    clueStart: 'Climate & Air Baseline (Köppen, Temp, Rain, PM2.5, Elevation, Climatogram)',
    clueG1: 'People & Inequality (Population, Density, Gini, Age)',
    clueG2: 'Mobility, Care & Shared Infrastructure',
    clueG3: '2050 Climate Projections & Future Analogue',
    clueG4: 'Label-Free Street Map & Urban Footprint',
    clueG5: 'Curated Urban Planning Clue (Geography / historic trivia)',
    tilesAndDirection: 'FEEDBACK TILES & DIRECTION',
    exactTileDesc: 'Value is within ±10-15% of the mystery city.',
    sameGroupTileDesc: 'Same continent or Köppen climate group (e.g. Temperate C).',
    distanceTileDesc: 'Great-circle distance and compass direction to the target city.',
    glossaryTitle: 'INDICATORS GLOSSARY',
    glossaryKoppen: 'Köppen Climate Classes: A: Tropical, B: Arid, C: Temperate (Mediterranean Csa, Oceanic Cfb), D: Continental.',
    glossaryPm25: 'PM2.5 Air Quality: Fine particulate matter (<2.5µm). WHO annual guideline limit is 5 µg/m³.',
    glossaryUhi: 'UHI (Urban Heat Island): Excess temperature in the city core vs surrounding countryside due to asphalt/concrete.',
    glossaryTransit: 'Non-Car Modal Share: % of daily commuter trips made by public transit, walking, or cycling.',
    dataSourcesTitle: 'SCIENTIFIC CITATIONS & DATA SOURCES',
    dataSourcesDesc: 'Cityle uses curated city profiles and directional modelled estimates for gameplay. References inform the schema, not every individual value:',
    sourceKoppen: 'Climate & Köppen Projections: Beck et al. (2018) "Present and future Köppen-Geiger climate classification maps at 1-km resolution", Scientific Data (CMIP6 / IPCC SSP2-4.5).',
    sourceAir: 'Air Quality & PM2.5: World Health Organization (WHO) Global Air Quality Database (2021) & Copernicus Atmosphere Monitoring Service (CAMS).',
    sourceSocio: 'Urban Demographics & Mobility: European Commission Joint Research Centre (GHSL-FUA), UN-Habitat World Cities Report (2022), and Brookings Global Metro Monitor.',
    sourceWater: 'Water Stress & Coastal Flooding: World Resources Institute (WRI Aqueduct 4.0, 2023) and NOAA / Climate Central Coastal Risk Screening.',
    sourceAnalogues: 'City Climate Analogues: Bastin, J. F., et al. (2019) "Understanding climate change from a global analysis of city analogues", PLOS ONE / Crowther Lab ETH Zurich.',
    sourceClim: 'Climate Extremes & Warming Rates: ECMWF ERA5 Climate Reanalysis & IPCC Sixth Assessment Report (AR6 Working Group I).',
    panel1Title: '1. Climate Baseline & Air Quality',
    panel2Title: '2. People, Inequality & Shared Resources',
    panel3Title: '3. Mobility, Care & Shared Infrastructure',
    panel4Title: '4. 2050 Climate Shifts, Heatwaves & Future Analogue',
    mapTitle: 'ROBINSON PROJECTION GUESS RADAR',
    panel6Title: 'URBAN PLANNING & GEOGRAPHY CLUE',
    visualClueTitle: 'LABEL-FREE URBAN MAP',
    briefingTitle: 'MISSION BRIEFING // HOW TO PLAY',
    briefingObjective: 'Identify the mystery global city in 6 guesses using curated urban and climate clues.',
    briefingStep1: 'Analyze the base climate (Köppen class, Walter-Lieth 12-month temp/rain curves), elevation, and WHO air quality telemetry.',
    briefingStep2: 'Type and submit any global city in the search box to receive great-circle distance (km), 16-wind compass bearing (🧭 ↗️ NE), and higher/lower feedback.',
    briefingStep3: 'Every guess unlocks deeper layers: demographics, mobility, directional 2050 estimates, a label-free street map, and a final planning clue.',
    briefingDismiss: 'DISMISS BRIEFING',
    briefingToggle: 'Show Briefing',
    currentKoppenLabel: 'Current Köppen',
    meanTempLabel: 'Mean Annual Temp',
    annualRainLabel: 'Annual Rainfall',
    elevationLabel: 'Elevation',
    pm25Label: 'Annual PM2.5',
    smogSeasonLabel: 'Peak Smog Season',
    densityLabel: 'Urban Density',
    gdpLabel: 'GDP per Capita',
    giniLabel: 'Urban Gini Tier',
    medianAgeLabel: 'Median Age',
    modalShareLabel: 'Non-Car Modal Share',
    canopyLabel: 'Tree Canopy Cover',
    uhiLabel: 'Heat Island (UHI)',
    koppen2050Label: '2050 Projected Köppen',
    tempAnomalyLabel: '2050 Temp Anomaly',
    rainShiftLabel: '2050 Rainfall Shift',
    coastalRiskLabel: 'Coastal Flood Risk',
    waterStressLabel: '2050 Water Stress',
    heatwaveLabel: 'Days >35°C / Year',
    warmingRateLabel: 'Warming Velocity',
    aridityLabel: 'UNEP Aridity Index',
    carbonLabel: 'Carbon Footprint',
    cddLabel: 'Cooling Demand (CDD)',
    currentClimateTwin: 'Current Climate Twin',
    futureClimateAnalogue: '2050 Climate Analogue',
    unlockPromptDemo: 'Submit 1 guess to unlock demographics & economic output',
    unlockPromptMobility: 'Submit 2 guesses to unlock modal split, carbon footprint & green infrastructure',
    unlockPromptRisk: 'Submit 3 guesses to unlock 2050 Köppen projections, heatwave trends & future climate analogue city',
    unlockPromptMap: 'Unlocks on Guess 4',
    mapLockedTitle: 'Robinson Radar Locked',
    mapLockedDesc: 'Visualizes the spatial positions and trajectory of all player guesses on the world Robinson projection.',
    mapUnlocked: 'UNLOCKED',
    scaleKm: '5 km',
    urbanFabric: 'Urban Fabric',
    water: 'Water',
    annualCycle: '12-Month Annual Cycle',
    tempLine: 'Temp (°C)',
    rainBars: 'Rain (mm)',
    congrats: '🎉 CONGRATULATIONS!',
    debrief: 'DEBRIEF',
    dataSources: 'Data Sources & Citations',
    moreGames: 'Games & Projects',
    climatleLink: 'Climatle',

    // Everyday Access
    everydayAccessTitle: 'Everyday access · proximity and care',
    everydayAccessDesc: 'Everyone should be able to reach daily necessities without being forced to own a car or surrender hours to travel. The 1.2 km circle is a spatial lens—not a city score or a restriction on movement.',
    builtFormContext: 'Built-form context',
    formContextRadial: 'Central access can be strong while outer districts face longer cross-city trips.',
    formContextLinear: 'Bridges and linear corridors can make nearby destinations slower to reach than they appear.',
    formContextCoastal: 'Water, coastlines and fragmented corridors can make straight-line distance misleading.',
    formContextIsland: 'Water crossings make network travel time more meaningful than a simple radius.',
    formContextGrid: 'Connected blocks can support walking locally, but separated land uses can lengthen daily trips.',
    formContextValley: 'Topography and concentrated corridors can produce sharply different access between neighbourhoods.',
    formContextDelta: 'Waterways, bridges and flood-prone land can interrupt otherwise short local journeys.',
    socialInfrastructureTitle: 'Essential social infrastructure',
    socialInfrastructureDesc: 'Affordable food · public health · schools and childcare · libraries · parks · transit · care and civic services',
    accessUnscoredNote: "We're not scoring this city's walkability. A number can't say if nearby care is affordable, safe, or open when needed — or who disability access and inequality shut out.",
    collectiveLeversTitle: 'Collective levers',
    collectiveLeversDesc: 'Frequent public transit · social and affordable housing near services · publicly funded care, health and education · safe streets · shade and public space · democratic neighbourhood planning',

    // Mission Briefing
    missionBriefingTitle: 'Six guesses. One city on Earth. Find it.',
    missionBriefingSubtitle: 'Every miss cracks it open — how climate, public money and urban form shape daily life there.',
    briefingRead: 'Read.',
    briefingReadDesc: 'Start with the present-day climate profile.',
    briefingGuess: 'Guess.',
    briefingGuessDesc: 'Distance, direction, region and comparison hints guide you.',
    briefingUnlock: 'Unlock.',
    briefingUnlockDesc: 'People, urban form, 2050 estimates, a no-label map, then one final fact.',
    missionBriefingFootnote: 'Averages lie by omission. Ask who actually reaches housing, care, work, shade and safety near this city—and whose time, health and labour cover the shortfall.',

    // Map & Controls
    fifteenMinWalkBadge: '≈ 15 min walk · 1.2 km radius',
    urbanMapLocked: 'Urban Sprawl Map Locked',
    urbanMapLockedDesc: 'Reveals the high-contrast built-up morphology, road grid, and coastline footprint of the mystery city without labels.',
    readyBadge: 'Ready',
    unlocksOnGuessN: 'Unlocks on Guess {n}',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetView: 'Reset view',

    // Victory Modal & Debrief
    theSharedCity: 'The shared city',
    sharedCityDesc: 'Urban outcomes reflect public budgets, land rules, ownership and collective power — not individual choices alone. Improvement should expand access without pricing people out.',
    gameplayDisclaimer: 'Values are directional game estimates. See Methodology & sources for limitations.',
    statClimate: 'Climate',
    statMeanTemp: 'Mean temp',
    statMetro: 'Metro',
    statElevation: 'Elevation',
    educationalDebrief: 'Educational debrief',
    cityPhoto: 'City photo',
    photoCreditLabel: 'Photo:',

    // Help Modal
    howToReadCity: 'How to read a city',
    readCityPoint1Title: 'Start with distribution.',
    readCityPoint1Desc: 'Big gaps in exposure, time, wealth and access — hidden behind one average.',
    readCityPoint2Title: 'Treat essentials as shared infrastructure.',
    readCityPoint2Desc: 'Housing, care, health, education, water, mobility, shade, public space.',
    readCityPoint3Title: 'Look beyond personal choice.',
    readCityPoint3Desc: 'Travel and spending, shaped by wages, hours, rents, service location, street safety, public investment.',
    readCityPoint4Title: 'Ask who decides.',
    readCityPoint4Desc: 'Land ownership, budgets, labour conditions, democratic participation — whose needs planning serves.',
    readCityPoint5Title: 'Avoid green displacement.',
    readCityPoint5Desc: 'Climate upgrades that help residents without pricing them out.',
    dataStatusTitle: 'Data status',
    dataStatusP1: "Cityle is a game, not a database — profiles are curated for play. Climate, air quality, mobility, economy, heat-risk and 2050 figures are directional estimates, not verified point data.",
    dataStatusP2: 'Population figures use metropolitan or functional urban-area definitions, not a single harmonized census series.',
    dataStatusP3: "Scientific citations shaped the schema and plausible ranges but certify no single figure — don't use Cityle for research, policy, health, investment or planning.",
    referencesAndAttribution: 'References and map attribution',
    osmCartoAttribution: 'The Guess 4 basemap uses © OpenStreetMap contributors and © CARTO. It is a label-free street map, not satellite imagery.',
    whoTransportGuidance: 'WHO urban transport guidance',

    // Dossier & Page Layout
    cluesUnlockedBanner: 'Curated city profiles with directional modelled indicators. Not a research or planning dataset.',
    makeAnotherGuess: 'Make another guess to unlock the next clue group.',
    futureEstimatesDisclaimer: '2050 fields are scenario-based, directional estimates used to create clues; they are not city forecasts.',
    directionalInequality: 'Directional inequality context',
    footerTagline: 'CITYLE · a curated urban-climate deduction game',
    madeByLabel: 'Made by',
    methodologySources: 'Methodology & sources',
    guessMap: 'Guess map',
    cluesFraction: 'Clues',
    bothModesPoolDesc: 'Both modes use the same curated pool of {count} cities.',
    guessesLeft: '{n} LEFT',

    // Robinson Map
    mapPlottedCount: '{n} PLOTTED',

    // Sparkline
    baselineLabel: 'Baseline',
    estimate2050Label: '2050 estimate',
    overlayLabel: 'Overlay',
    touchHoverHint: 'Touch or hover any month',
    presentLabel: 'Present:',
    future2050ArrowLabel: '→ 2050:',

    // Köppen Modal
    koppenCurrentClassHeader: 'CURRENT KÖPPEN-GEIGER CLASS',
    koppenProjected2050Header: 'PROJECTED 2050 KÖPPEN-GEIGER',
    koppenCodeBreakdownHeader: '3-LETTER CLIMATE CODE BREAKDOWN',
    koppenLetter1Label: '1st Letter:',
    koppenLetter2Label: '2nd Letter:',
    koppenLetter3Label: '3rd Letter:',
    closeExplanationLabel: 'Close Explanation',
    closeLabel: 'Close',

    // Comparison Matrix
    otherRegion: 'Other Region',
    populationLabel: 'Population',
    matchLabel: 'Match',
    higherLabel: 'Higher',
    lowerLabel: 'Lower',
    comparisonEmptyState: 'Make a guess. Distance, direction and comparison hints land right here.',

    // Stats Modal — Unlimited & Badges tabs
    badgesTabLabel: 'BADGES',
    currentRunLabel: 'CURRENT RUN',
    bestRunLabel: 'BEST RUN',
    bestGuessLabel: 'BEST GUESS',
    wonLabel: 'WON',
    badgeFirstFlightName: 'First Flight',
    badgeFirstFlightDesc: 'Win your first Cityle round, in any mode.',
    badgeContinentalHopName: 'Continental Hop',
    badgeContinentalHopDesc: 'Win at least once with a target city on each of the 6 continents.',
    badgeClimateCartographerName: 'Climate Cartographer',
    badgeClimateCartographerDesc: 'Win at least once in each of the 5 Köppen climate groups (A–E).',
    badgeFirstGuessAceName: 'First-Guess Ace',
    badgeFirstGuessAceDesc: 'Identify the mystery city correctly on your very first guess.',
    badgeStreakKeeperName: 'Streak Keeper',
    badgeStreakKeeperDesc: 'Reach a 7-day winning streak in Daily mode.',
    badgeMarathonerName: 'Marathoner',
    badgeMarathonerDesc: 'Play 50 combined games across Daily and Unlimited.',
    badgeDeepDiverName: 'Deep Diver',
    badgeDeepDiverDesc: 'Pull off a win on your final, sixth guess.',
    badgeHardModeCartographerName: 'Hard Mode Cartographer',
    badgeHardModeCartographerDesc: 'Win a round played on Hard difficulty.',
    badgeUnlockedOn: 'Unlocked {date}',
    badgeLockedLabel: 'Locked',
    newBadgeUnlocked: 'New badge unlocked!',

    // Daily Archive modal
    archiveTitle: 'DAILY ARCHIVE',
    archiveCycleLabel: 'Cycle {cycle} · Puzzles {start}–{end}',
    closeArchive: 'Close archive',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    archiveDayLabel: 'Puzzle #{n}',
    archiveTodayLabel: 'Today',
    archiveStatusWon: 'Won',
    archiveStatusLost: 'Lost',
    archiveStatusInProgress: 'In progress',
    archiveStatusUnplayed: 'Unplayed',

    // Share failure fallback
    shareErrorTitle: "Couldn't share automatically",
    shareErrorHint: 'Copy the text below by hand, or give it another try.',
    retry: 'Retry',

    // Header wiring: Archive button + Hard Mode toggle
    openArchiveLabel: 'Open Daily Archive',
    openAtlasLabel: 'Open Atlas mode',
    exploreMenuLabel: 'Explore',
    openAlmanacLabel: 'Open City Almanac',
    openMarathonLabel: 'Open Marathon of the Day',
    openPlaylistsLabel: 'Open Curated Playlists',
    openTimeMachineLabel: 'Open Climate Time Machine',
    openQuickfireLabel: 'Open Sixty-Second Cityle',
    openNotesLabel: "Open Curator's Notes",
    difficultyStandard: 'Standard',
    difficultyHard: 'Hard',
    difficultyToggleHint: 'Hard Mode: every clue group arrives one guess later',
    difficultyLockedHint: 'Difficulty locks once you start guessing',
    hardModeSectionLockedDesc: 'Hard Mode delays even the baseline climate and air quality clues by one guess.',

    // Win/loss reaction ladder
    winHeadline1: 'UNREAL.',
    winSubline1: 'One guess, one city, zero hesitation. Screenshot this.',
    winHeadline2: 'SHARP.',
    winSubline2: 'Two guesses to pin a city on the whole map.',
    winHeadline3: 'SOLID READ.',
    winSubline3: 'You triangulated that like you meant it.',
    winHeadline4: 'GOT THERE.',
    winSubline4: 'Took some circling. The pin still dropped.',
    winHeadline5: 'DOWN TO THE WIRE.',
    winSubline5: 'One guess left and you found it anyway.',
    winHeadline6: 'PHEW.',
    winSubline6: 'Last guess. Heart rate: elevated. City: identified.',
    lossHeadline: 'NO DICE.',
    lossSubline: "Six guesses, zero hits. Here's the city — go see what you missed.",
    lossStreakSubline: "That's a {n}-day streak gone. New one starts the second you hit play.",

    // Comparison Matrix near-miss
    soCloseFlag: 'SO CLOSE',
    sameSubtype: 'Similar',

    // "Choose Your Clue" token economy
    clueTabClimateAir: 'Climate & Air',
    clueTabPeopleEconomy: 'People & Economy',
    clueTabMobilityForm: 'Mobility & Form',
    clueTabOutlook2050: '2050 Outlook',
    clueTabPlaceMap: 'Place & Map',
    clueTabBonusInsight: 'Bonus Insight',
    clueTabsAriaLabel: 'Choose a clue category',
    chooseYourClueBanner: 'Each guess earns an Intel Token — spend it now, or bank it for later.',
    spendTokenCta: 'Spend token',
    bankedTokensStatus: '{n} banked — spend anytime',
    lockedTabTooltipNextToken: 'Unlocks with your next token',
    lockedTabTooltipSpendNow: 'Spend a token to unlock',
    bonusInsightLockedTooltip: 'Unlocks on your final guess, or with a leftover token',
    bonusInsightDisclaimer: 'Bonus data for players who like to dig deeper — not required to win, just extra context.',

    // Phase 4 — Almanac (Workstream U)
    almanacTitle: 'City Almanac',
    almanacSubtitle: 'Browse the whole curated pool — photo, flag, and Köppen class only. No spoilers, no stats.',
    almanacFilterContinentLabel: 'Continent',
    almanacFilterKoppenLabel: 'Köppen group',
    almanacFilterPopulationLabel: 'Population',
    almanacTierMegacity: 'Megacity (10M+)',
    almanacTierLarge: 'Large (3–10M)',
    almanacTierMid: 'Mid (1–3M)',
    almanacTierSmallMid: 'Small-mid (250K–1M)',
    almanacSearchPlaceholder: 'Search by city or country...',
    almanacCompareCta: 'Compare',
    almanacClearFilters: 'Clear filters',
    almanacResultsCount: '{n} of {total} cities',
    almanacEmptyState: 'No cities match these filters. Try clearing one.',

    // Phase 4 — Photo mode (Workstream V)
    photo: 'PHOTO',
    photoModePinnedHint: 'Your only free clue — everything else costs a token.',

    // Phase 4 — Marathon mode (Workstream T)
    marathonEyebrow: 'MARATHON #{n}',
    marathonPageTitle: 'Marathon of the Day',
    marathonIntro:
      'Five curated cities, one guess sequence, the same order for every player today. Solve as many as you can — your total score is directly comparable to anyone else who runs it.',
    marathonRoundProgress: 'City {current} of {total}',
    marathonSummaryEyebrow: 'MARATHON COMPLETE',
    marathonSummaryTitle: 'Run Complete',
    marathonSummarySubtitle: "Here's how today's five-city run went.",
    marathonTotalScoreLabel: 'Total Score',
    marathonTableCity: 'City',
    marathonTableGuesses: 'Guesses',
    marathonTableResult: 'Result',
    marathonResultWon: 'Solved',
    marathonResultLost: 'Unsolved',
    marathonShareCta: 'Share Marathon Result',
    marathonComeBackTomorrow: "Tomorrow's Marathon is a fresh five-city sequence.",
    marathonBackToCityle: '← Back to Cityle',

    // Phase 5 — Onboarding (Workstream BB)
    welcomeTitle: 'WELCOME TO CITYLE',
    welcomeIntro: 'Somewhere on Earth, a real city is waiting to be identified. You have six guesses to find it.',
    welcomeGuessFeedback: 'Each guess reveals distance, direction, and whether the population and climate roughly match.',
    welcomeClueMechanic: 'Every guess also earns an Intel Token — spend it to unlock one category of clues about the city, or bank it for later.',
    welcomeDismissCta: "Let's Play",
    replayWelcomeGuide: 'New here? Replay the welcome guide',

    // Phase 5 — Playlists (Workstream AA)
    playlistsPageTitle: 'Curated Playlists',
    playlistsPageIntro:
      'Themed runs through the city pool — same guess-and-clue mechanics as Marathon, built around one climate or urban angle at a time. Play any playlist, in any order, whenever you like.',
    playlistCityCount: '{n} cities',
    playlistPlayCta: 'Play',
    playlistPageEyebrow: 'CURATED PLAYLIST',
    playlistNotFoundTitle: "This playlist doesn't exist.",
    playlistNotFoundMessage:
      "It may have been mistyped or removed. Head back to see every playlist that's actually live.",
    playlistSummaryEyebrow: 'PLAYLIST COMPLETE',
    playlistSummarySubtitle: "Here's how your run through {name} went.",
    playlistShareCta: 'Share Playlist Result',
    playlistComeBackAnytime: "Playlists aren't day-locked — play this one again anytime.",

    // Phase 7 — Climate Time Machine (Workstream II)
    timeMachineEyebrow: 'CLIMATE TIME MACHINE',
    timeMachinePageTitle: 'Climate Time Machine',
    timeMachineIntro: 'Every city already has a projected 2050 climate — we fast-forward one at random.',
    timeMachineHookTitle: 'In 2050, somewhere on Earth, the climate will feel like this.',
    timeMachineHookSubtitle: 'Which real city feels like that right now?',
    timeMachineProjectedTempLabel: '2050 Projected Temp',
    timeMachineRevealIntro: 'The real city living that future today:',
    timeMachinePlayAgain: 'Play Again',
    timeMachineLoading: 'Fast-forwarding a random city to 2050…',

    crypticClueLabel: 'Cryptic Clue',

    // Phase 7 — Quickfire (Workstream MM)
    quickfireEyebrow: 'QUICKFIRE',
    quickfireTitle: 'Sixty-Second Cityle',
    quickfireIntro: 'Four cities, one stat, sixty seconds on the clock. Tap the city that wins each round.',
    quickfireBestScoreLabel: 'Best score',
    quickfireStartCta: 'Start',
    quickfireTimeLeftLabel: 'Time left',
    quickfireScoreLabel: 'Score',
    quickfireQuestionHighest: 'Which of these cities has the highest {field}?',
    quickfireQuestionLowest: 'Which of these cities has the lowest {field}?',
    quickfireFieldPopulation: 'metro population',
    quickfireFieldPm25: 'annual PM2.5 pollution',
    quickfireFieldElevation: 'elevation',
    quickfireFieldTemp: 'average annual temperature',
    quickfireFieldTreeCanopy: 'tree canopy cover',
    quickfireFieldTransit: 'transit & active-travel commuting share',
    quickfireFieldEquatorDistance: 'distance from the equator',
    quickfireCorrectAnnounce: 'Correct!',
    quickfireIncorrectAnnounce: 'Incorrect — it was {city}.',
    quickfireFinishedEyebrow: "TIME'S UP",
    quickfireFinishedTitle: 'Session Complete',
    quickfireFinalScoreLabel: 'Final score',
    quickfireNewBestBadge: 'New best!',
    quickfirePlayAgainCta: 'Play Again',

    notesPageEyebrow: "CURATOR'S NOTES",
    notesPageTitle: "Curator's Notes",
    notesPageIntro:
      "Short, first-person essays on why specific cities earned a spot in this pool, what the data can't tell you, and a few opinions I'm not hiding.",
    notesFeaturedBadge: "Today's featured note",
    notesMoreHeading: 'More notes',
  },
  es: {
    appName: 'CITYLE',
    tagline: 'URBANO Y CLIMA',
    subTagline: 'DEDUCCIÓN URBANA Y CLIMÁTICA CURADA',
    daily: 'DIARIO',
    unlimited: 'ILIMITADO',
    nextRandom: 'Siguiente Ciudad',
    streak: 'RACHA',
    urbanDossier: 'Dossier Urbano',
    guesses: 'Intentos',
    submitGuess: 'ENVIAR INTENTO',
    searchPlaceholder: 'Buscar una ciudad (ej. Madrid, Tokio, Nairobi, Vancouver...)',
    gameFinished: 'Juego terminado — mira tus resultados abajo',
    viewResults: 'Ver Resultados',
    guessHistory: 'HISTORIAL DE INTENTOS',
    distanceAndFeedback: 'DISTANCIA Y COMPARATIVA',
    targetFound: '¡CIUDAD ENCONTRADA!',
    waitingForGuess: 'Esperando intento...',
    tooLow: '(Más alto)',
    tooHigh: '(Más bajo)',
    sameCountry: 'Mismo País',
    region: 'REGIÓN',
    metroPop: 'POB. METRO',
    pm25Aqi: 'PM2.5 AQI',
    koppenClass: 'CLASE KÖPPEN',
    sameGroup: 'Mismo Grupo',
    different: 'Diferente',
    whyTheseStats: '¿POR QUÉ TIENE ESTA CIUDAD ESTAS ESTADÍSTICAS?',
    cityIdentified: 'CIUDAD LOCALIZADA.',
    mysteryRevealed: 'SIN INTENTOS. AQUÍ TIENES LA CIUDAD.',
    solvedInGuesses: 'Resuelto en {n}/6 intentos',
    completedAttempts: 'Completados los 6 intentos',
    planningFact: 'Dato Urbanístico',
    shareGrid: 'COMPARTIR RESULTADOS',
    shareResultCard: 'COMPARTIR RESULTADO',
    challengeAFriend: 'RETAR A UN AMIGO',
    getPostcard: 'OBTENER POSTAL',
    copied: '¡COPIADO AL PORTAPAPELES!',
    playNextRandom: 'JUGAR OTRA CIUDAD ALEATORIA',
    nextDailyIn: 'El próximo Cityle diario sale en 24 horas',
    statsTitle: 'ESTADÍSTICAS DEL JUGADOR',
    played: 'JUGADAS',
    winRate: '% VICTORIAS',
    currentStreak: 'RACHA',
    maxStreak: 'MÁXIMA',
    guessDistribution: 'DISTRIBUCIÓN DE INTENTOS',
    helpTitle: 'CÓMO JUGAR Y FUENTES DE DATOS',
    howToPlay: 'Cómo Jugar',
    objectiveText: 'Adivina la ciudad global misteriosa en 6 intentos usando sus trayectorias climáticas, calidad del aire, economía, demografía y forma urbana.',
    clueUnlocks: 'DESBLOQUEO PROGRESIVO DE PISTAS',
    clueStart: 'Base Climática y Aire (Köppen, Temp, Lluvia, PM2.5, Elevación, Climograma)',
    clueG1: 'Personas y Desigualdad (Población, Densidad, Gini, Edad)',
    clueG2: 'Movilidad, Cuidados e Infraestructura Compartida',
    clueG3: 'Proyecciones 2050 y Ciudad Análoga 2050',
    clueG4: 'Mapa Urbano sin Etiquetas',
    clueG5: 'Pista de Planificación Urbana (Geografía / historia urbana)',
    tilesAndDirection: 'CASILLAS Y DIRECCIÓN',
    exactTileDesc: 'El valor está dentro del ±10-15% de la ciudad misteriosa.',
    sameGroupTileDesc: 'Mismo continente o grupo climático Köppen (ej. Templado C).',
    distanceTileDesc: 'Distancia ortodrómica y rumbo de brújula hacia la ciudad objetivo.',
    glossaryTitle: 'GLOSARIO DE INDICADORES',
    glossaryKoppen: 'Clasificación Köppen: A: Tropical, B: Árido, C: Templado (Mediterráneo Csa, Oceánico Cfb), D: Continental.',
    glossaryPm25: 'Calidad del Aire PM2.5: Partículas finas (<2.5µm). Límite guía OMS anual: 5 µg/m³.',
    glossaryUhi: 'Isla de Calor Urbana (UHI): Exceso de temperatura en el centro urbano respecto al entorno rural.',
    glossaryTransit: 'Cuota No Motorizada: % de desplazamientos diarios en transporte público, a pie o en bicicleta.',
    dataSourcesTitle: 'CITAS CIENTÍFICAS Y FUENTES DE DATOS',
    dataSourcesDesc: 'Cityle agrega datos de literatura científica revisada por pares, agencias meteorológicas internacionales y observatorios urbanos globales:',
    sourceKoppen: 'Clima y Proyecciones Köppen: Beck et al. (2018) "Present and future Köppen-Geiger climate classification maps at 1-km resolution", Scientific Data (CMIP6 / IPCC SSP2-4.5).',
    sourceAir: 'Calidad del Aire y PM2.5: Organización Mundial de la Salud (OMS) Global Air Quality Database (2021) y Servicio de Vigilancia Atmosférica Copernicus (CAMS).',
    sourceSocio: 'Demografía Urbana y Movilidad: Centro Común de Investigación de la Comisión Europea (GHSL-FUA), ONU-Hábitat World Cities Report (2022) y Brookings Global Metro Monitor.',
    sourceWater: 'Estrés Hídrico e Inundaciones: Instituto de Recursos Mundiales (WRI Aqueduct 4.0, 2023) y NOAA / Climate Central Coastal Risk Screening Tool.',
    sourceAnalogues: 'Ciudades Análogas Climáticas: Bastin et al. (2019) "Understanding climate change from a global analysis of city analogues", PLOS ONE / Crowther Lab ETH Zurich.',
    sourceClim: 'Extremos Climáticos y Calentamiento: Reanálisis Climático ERA5 de ECMWF e IPCC AR6 Grupo de Trabajo I.',
    panel1Title: '1. Clima Base y Calidad del Aire',
    panel2Title: '2. Personas, Desigualdad y Recursos Compartidos',
    panel3Title: '3. Movilidad, Cuidados e Infraestructura Compartida',
    panel4Title: '4. Cambios Climáticos 2050, Olas de Calor y Ciudad Análoga',
    mapTitle: 'RADAR DE INTENTOS EN PROYECCIÓN ROBINSON',
    panel6Title: 'PISTA DE URBANISMO Y GEOGRAFÍA',
    visualClueTitle: 'MAPA URBANO SIN ETIQUETAS',
    briefingTitle: 'INSTRUCCIONES DE MISIÓN // CÓMO JUGAR',
    briefingObjective: 'Adivina la ciudad global misteriosa en 6 intentos usando pistas urbanas y climáticas curadas.',
    briefingStep1: 'Analiza el clima base (clase Köppen, climograma Walter-Lieth de 12 meses), elevación y calidad del aire de la OMS.',
    briefingStep2: 'Busca y envía cualquier ciudad global para recibir la distancia en kilómetros, la dirección de la brújula (🧭 ↗️ NE) y pistas de mayor/menor.',
    briefingStep3: 'Cada intento desbloquea demografía, movilidad, estimaciones orientativas para 2050, un mapa urbano sin etiquetas y una pista final.',
    briefingDismiss: 'ENTENDIDO // CERRAR',
    briefingToggle: 'Ver Instrucciones',
    currentKoppenLabel: 'Köppen Actual',
    meanTempLabel: 'Temp. Media Anual',
    annualRainLabel: 'Precipitación Anual',
    elevationLabel: 'Elevación',
    pm25Label: 'PM2.5 Anual',
    smogSeasonLabel: 'Pico de Contaminación',
    densityLabel: 'Densidad Urbana',
    gdpLabel: 'PIB per Cápita',
    giniLabel: 'Nivel Gini Urbano',
    medianAgeLabel: 'Edad Mediana',
    modalShareLabel: 'Cuota No Motorizada',
    canopyLabel: 'Cobertura Arbórea',
    uhiLabel: 'Isla de Calor (UHI)',
    koppen2050Label: 'Köppen Proyectado 2050',
    tempAnomalyLabel: 'Anomalía Térmica 2050',
    rainShiftLabel: 'Variación Lluvia 2050',
    coastalRiskLabel: 'Riesgo Inundación Costera',
    waterStressLabel: 'Estrés Hídrico 2050',
    heatwaveLabel: 'Días >35°C / Año',
    warmingRateLabel: 'Velocidad de Calentamiento',
    aridityLabel: 'Índice de Aridez P/PET',
    carbonLabel: 'Huella de Carbono',
    cddLabel: 'Demanda Refrigeración (CDD)',
    currentClimateTwin: 'Gemela Climática Actual',
    futureClimateAnalogue: 'Ciudad Análoga en 2050',
    unlockPromptDemo: 'Envía 1 intento para desbloquear demografía y economía',
    unlockPromptMobility: 'Envía 2 intentos para desbloquear movilidad, huella de carbono e infraestructura verde',
    unlockPromptRisk: 'Envía 3 intentos para desbloquear proyecciones Köppen 2050, olas de calor y la ciudad análoga futura',
    unlockPromptMap: 'Se desbloquea en el Intento 4',
    mapLockedTitle: 'Radar Robinson Bloqueado',
    mapLockedDesc: 'Visualiza las posiciones espaciales de todos los intentos del jugador.',
    mapUnlocked: 'DESBLOQUEADO',
    scaleKm: '5 km',
    urbanFabric: 'Tejido Urbano',
    water: 'Agua',
    annualCycle: 'Ciclo Anual de 12 Meses',
    tempLine: 'Temp (°C)',
    rainBars: 'Lluvia (mm)',
    congrats: '¡ENHORABUENA!',
    debrief: 'ANÁLISIS',
    dataSources: 'Fuentes de Datos y Citas',
    moreGames: 'Juegos y Proyectos',
    climatleLink: 'Climatle',

    // Everyday Access
    everydayAccessTitle: 'Acceso cotidiano · proximidad y cuidados',
    everydayAccessDesc: 'Toda persona debería poder satisfacer sus necesidades cotidianas sin verse obligada a depender del coche ni perder horas en desplazamientos. El círculo de 1,2 km es una lente espacial, no una puntuación ni una restricción.',
    builtFormContext: 'Contexto morfológico',
    formContextRadial: 'El acceso central suele ser elevado mientras la periferia asume trayectos largos y radiales.',
    formContextLinear: 'Los puentes y corredores lineales pueden hacer que destinos cercanos requieran rodeos considerables.',
    formContextCoastal: 'La costa y la fragmentación geográfica hacen que la distancia en línea recta sea engañosa.',
    formContextIsland: 'Los pasos marítimos hacen que los tiempos reales de red sean más relevantes que un simple radio.',
    formContextGrid: 'Una cuadrícula conectada favorece la caminabilidad local, pero la zonificación dispersa puede alargar viajes.',
    formContextValley: 'La topografía y los corredores encajonados producen accesos muy desiguales entre barrios.',
    formContextDelta: 'Canales fluviales, puentes y áreas inundables pueden interrumpir trayectos de proximidad.',
    socialInfrastructureTitle: 'Infraestructura social esencial',
    socialInfrastructureDesc: 'Alimentación asequible · salud pública · escuelas e infantil · bibliotecas · parques · transporte público · cuidados y servicios cívicos',
    accessUnscoredNote: 'Esta ciudad no tiene nota de caminabilidad: un número no dice si el cuidado cercano es asequible, seguro o abre a tiempo, ni a quién excluye la falta de accesibilidad universal y la desigualdad.',
    collectiveLeversTitle: 'Palancas colectivas',
    collectiveLeversDesc: 'Transporte público frecuente · vivienda social y asequible junto a servicios · sanidad, cuidados y educación públicas · calles seguras · sombra y espacio público · planificación democrática de barrio',

    // Mission Briefing
    missionBriefingTitle: 'Seis intentos para dar con una ciudad del planeta.',
    missionBriefingSubtitle: 'Cada fallo abre otra capa—cómo el clima, el dinero público y la forma urbana moldean la vida diaria allí.',
    briefingRead: 'Lee.',
    briefingReadDesc: 'Comienza con el perfil climático actual.',
    briefingGuess: 'Intenta.',
    briefingGuessDesc: 'Oriéntate con la distancia, el rumbo y las comparaciones relativas.',
    briefingUnlock: 'Desbloquea.',
    briefingUnlockDesc: 'Población, forma urbana, proyecciones 2050, un mapa mudo y una pista final.',
    missionBriefingFootnote: 'Las medias mienten por omisión. Pregúntate quién llega de verdad a la vivienda, los cuidados, el trabajo, la sombra y la seguridad de esta ciudad—y de quién es el tiempo, la salud y el trabajo que cubren la diferencia.',

    // Map & Controls
    fifteenMinWalkBadge: '≈ 15 min a pie · radio de 1,2 km',
    urbanMapLocked: 'Mapa Urbano Bloqueado',
    urbanMapLockedDesc: 'Muestra la morfología urbana, la trama viaria y la línea de costa de la ciudad misteriosa sin etiquetas.',
    readyBadge: 'Listo',
    unlocksOnGuessN: 'Se desbloquea en el Intento {n}',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    resetView: 'Restablecer vista',

    // Victory Modal & Debrief
    theSharedCity: 'La ciudad compartida',
    sharedCityDesc: 'Los resultados urbanos son fruto de presupuestos públicos, régimen del suelo y poder colectivo—no solo de decisiones individuales. La mejora debe ensanchar el acceso sin expulsar a la población.',
    gameplayDisclaimer: 'Los valores son estimaciones orientativas para el juego. Consulta metodología y fuentes.',
    statClimate: 'Clima',
    statMeanTemp: 'Temp. media',
    statMetro: 'Población',
    statElevation: 'Elevación',
    educationalDebrief: 'Resumen educativo',
    cityPhoto: 'Foto de la ciudad',
    photoCreditLabel: 'Foto:',

    // Help Modal
    howToReadCity: 'Cómo leer una ciudad',
    readCityPoint1Title: 'Comienza por la distribución.',
    readCityPoint1Desc: 'Grandes diferencias en exposición, tiempo, renta y acceso — ocultas tras un solo promedio.',
    readCityPoint2Title: 'Trata lo esencial como infraestructura compartida.',
    readCityPoint2Desc: 'Vivienda, cuidados, salud, educación, agua, movilidad, sombra, espacio público.',
    readCityPoint3Title: 'Mira más allá de la elección individual.',
    readCityPoint3Desc: 'Consumo y movilidad, condicionados por salarios, jornadas, alquileres, ubicación de servicios, diseño viario.',
    readCityPoint4Title: 'Pregúntate quién decide.',
    readCityPoint4Desc: 'Propiedad del suelo, presupuestos, condiciones laborales, participación democrática — a quién sirve el urbanismo.',
    readCityPoint5Title: 'Evita el desplazamiento verde.',
    readCityPoint5Desc: 'Mejoras climáticas que benefician a quien ya vive ahí, sin encarecer sus casas.',
    dataStatusTitle: 'Estado de los datos',
    dataStatusP1: 'Cityle es un juego, no una base de datos — cada perfil está curado para jugar. Clima, calidad del aire, movilidad, economía, riesgo de calor y cifras de 2050 son estimaciones orientativas, no datos verificados al detalle.',
    dataStatusP2: 'Las cifras de población usan definiciones de área metropolitana o funcional, con años de referencia variables: son comparaciones orientativas.',
    dataStatusP3: 'Las citas científicas dieron forma al esquema y sus rangos plausibles, pero no certifican ninguna cifra—no uses Cityle para investigación, políticas públicas, salud, inversión ni planificación.',
    referencesAndAttribution: 'Referencias y atribución cartográfica',
    osmCartoAttribution: 'El mapa base del Intento 4 utiliza © OpenStreetMap contributors y © CARTO. Es un mapa viario mudo, no fotografía satelital.',
    whoTransportGuidance: 'Guía de transporte urbano saludable de la OMS',

    // Dossier & Page Layout
    cluesUnlockedBanner: 'Perfiles urbanos curados con indicadores modelados orientativos. No es un dataset para investigación o planificación.',
    makeAnotherGuess: 'Haz otro intento para desbloquear el siguiente grupo de pistas.',
    futureEstimatesDisclaimer: 'Los campos de 2050 son estimaciones orientativas basadas en escenarios; no son previsiones puntuales.',
    directionalInequality: 'Contexto orientativo de desigualdad',
    footerTagline: 'CITYLE · juego de deducción urbana y climática curado',
    madeByLabel: 'Hecho por',
    methodologySources: 'Metodología y fuentes',
    guessMap: 'Mapa de intentos',
    cluesFraction: 'Pistas',
    bothModesPoolDesc: 'Ambos modos utilizan el mismo conjunto curado de {count} ciudades.',
    guessesLeft: 'QUEDAN {n}',

    // Robinson Map
    mapPlottedCount: '{n} TRAZADAS',

    // Sparkline
    baselineLabel: 'Referencia',
    estimate2050Label: 'Estimación 2050',
    overlayLabel: 'Superposición',
    touchHoverHint: 'Toca o pasa el cursor sobre un mes',
    presentLabel: 'Actual:',
    future2050ArrowLabel: '→ 2050:',

    // Köppen Modal
    koppenCurrentClassHeader: 'CLASE KÖPPEN-GEIGER ACTUAL',
    koppenProjected2050Header: 'KÖPPEN-GEIGER PROYECTADO 2050',
    koppenCodeBreakdownHeader: 'DESGLOSE DEL CÓDIGO CLIMÁTICO DE 3 LETRAS',
    koppenLetter1Label: '1ª Letra:',
    koppenLetter2Label: '2ª Letra:',
    koppenLetter3Label: '3ª Letra:',
    closeExplanationLabel: 'Cerrar Explicación',
    closeLabel: 'Cerrar',

    // Comparison Matrix
    otherRegion: 'Otra Región',
    populationLabel: 'Población',
    matchLabel: 'Coincide',
    higherLabel: 'Más alto',
    lowerLabel: 'Más bajo',
    comparisonEmptyState: 'Haz un intento. La distancia, dirección y comparativas aparecen aquí mismo.',

    // Stats Modal — pestañas Ilimitado e Insignias
    badgesTabLabel: 'INSIGNIAS',
    currentRunLabel: 'RACHA ACTUAL',
    bestRunLabel: 'MEJOR RACHA',
    bestGuessLabel: 'MEJOR INTENTO',
    wonLabel: 'GANADAS',
    badgeFirstFlightName: 'Primer Vuelo',
    badgeFirstFlightDesc: 'Gana tu primera partida de Cityle, en cualquier modo.',
    badgeContinentalHopName: 'Salto Continental',
    badgeContinentalHopDesc: 'Gana al menos una vez con una ciudad objetivo en cada uno de los 6 continentes.',
    badgeClimateCartographerName: 'Cartógrafo Climático',
    badgeClimateCartographerDesc: 'Gana al menos una vez en cada uno de los 5 grupos climáticos Köppen (A-E).',
    badgeFirstGuessAceName: 'As al Primer Intento',
    badgeFirstGuessAceDesc: 'Acierta la ciudad misteriosa a la primera.',
    badgeStreakKeeperName: 'Guardián de la Racha',
    badgeStreakKeeperDesc: 'Consigue una racha de 7 días ganados seguidos en el modo Diario.',
    badgeMarathonerName: 'Maratoniano',
    badgeMarathonerDesc: 'Juega 50 partidas combinadas entre Diario e Ilimitado.',
    badgeDeepDiverName: 'Buceador Profundo',
    badgeDeepDiverDesc: 'Gana justo en tu sexto y último intento.',
    badgeHardModeCartographerName: 'Cartógrafo Modo Difícil',
    badgeHardModeCartographerDesc: 'Gana una partida jugada en dificultad difícil.',
    badgeUnlockedOn: 'Desbloqueada el {date}',
    badgeLockedLabel: 'Bloqueada',
    newBadgeUnlocked: '¡Nueva insignia desbloqueada!',

    // Modal de Archivo Diario
    archiveTitle: 'ARCHIVO DIARIO',
    archiveCycleLabel: 'Ciclo {cycle} · Retos {start}–{end}',
    closeArchive: 'Cerrar archivo',
    previousMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    archiveDayLabel: 'Reto #{n}',
    archiveTodayLabel: 'Hoy',
    archiveStatusWon: 'Ganado',
    archiveStatusLost: 'Perdido',
    archiveStatusInProgress: 'En curso',
    archiveStatusUnplayed: 'Sin jugar',

    // Aviso de fallo al compartir
    shareErrorTitle: 'No se pudo compartir automáticamente',
    shareErrorHint: 'Copia el texto de abajo a mano, o inténtalo de nuevo.',
    retry: 'Reintentar',

    // Cabecera: botón de Archivo + interruptor de Modo Difícil
    openArchiveLabel: 'Abrir archivo diario',
    openAtlasLabel: 'Abrir modo Atlas',
    exploreMenuLabel: 'Explorar',
    openAlmanacLabel: 'Abrir Almanaque de Ciudades',
    openMarathonLabel: 'Abrir Maratón del Día',
    openPlaylistsLabel: 'Abrir Listas Seleccionadas',
    openTimeMachineLabel: 'Abrir Máquina del Tiempo Climática',
    openQuickfireLabel: 'Abrir Cityle en 60 Segundos',
    openNotesLabel: 'Abrir Notas del Curador',
    difficultyStandard: 'Estándar',
    difficultyHard: 'Difícil',
    difficultyToggleHint: 'Modo Difícil: cada grupo de pistas llega un intento más tarde',
    difficultyLockedHint: 'La dificultad se bloquea al empezar a jugar',
    hardModeSectionLockedDesc: 'El Modo Difícil retrasa incluso las pistas básicas de clima y calidad del aire un intento.',

    // Escalera de reacciones de victoria/derrota
    winHeadline1: 'IRREAL.',
    winSubline1: 'Un intento, una ciudad, cero dudas. Captura de pantalla ya.',
    winHeadline2: 'AFILADO.',
    winSubline2: 'Dos intentos para clavar una ciudad en el mapa entero.',
    winHeadline3: 'LECTURA SÓLIDA.',
    winSubline3: 'Triangulaste eso como si lo llevaras claro.',
    winHeadline4: 'AHÍ ESTÁ.',
    winSubline4: 'Diste vueltas, pero el pin cayó igual.',
    winHeadline5: 'AL LÍMITE.',
    winSubline5: 'Un intento de margen y aun así la encontraste.',
    winHeadline6: 'UF.',
    winSubline6: 'Último intento. Pulso a mil. Ciudad identificada.',
    lossHeadline: 'NADA.',
    lossSubline: 'Seis intentos, cero aciertos. Aquí tienes la ciudad—a ver qué se te escapó.',
    lossStreakSubline: 'Se te fue una racha de {n} días. La próxima empieza en cuanto le des a jugar.',

    // Comparativa: casi acierto
    soCloseFlag: 'CASI',
    sameSubtype: 'Similar',

    // Economía de tokens de "Elige tu Pista"
    clueTabClimateAir: 'Clima y Aire',
    clueTabPeopleEconomy: 'Personas y Economía',
    clueTabMobilityForm: 'Movilidad y Forma',
    clueTabOutlook2050: 'Perspectiva 2050',
    clueTabPlaceMap: 'Lugar y Mapa',
    clueTabBonusInsight: 'Dato Extra',
    clueTabsAriaLabel: 'Elige una categoría de pista',
    chooseYourClueBanner: 'Cada intento genera un Token de Inteligencia — gástalo ahora o guárdalo para después.',
    spendTokenCta: 'Gastar token',
    bankedTokensStatus: '{n} en reserva — gástalos cuando quieras',
    lockedTabTooltipNextToken: 'Se desbloquea con tu próximo token',
    lockedTabTooltipSpendNow: 'Gasta un token para desbloquear',
    bonusInsightLockedTooltip: 'Se desbloquea en tu último intento, o con un token sobrante',
    bonusInsightDisclaimer: 'Datos extra para quienes quieren profundizar — no hacen falta para ganar, solo dan más contexto.',

    // Fase 4 — Almanaque (Workstream U)
    almanacTitle: 'Almanaque de Ciudades',
    almanacSubtitle: 'Explora todo el catálogo curado — foto, bandera y clase Köppen, nada más. Sin pistas de más.',
    almanacFilterContinentLabel: 'Continente',
    almanacFilterKoppenLabel: 'Grupo Köppen',
    almanacFilterPopulationLabel: 'Población',
    almanacTierMegacity: 'Megaciudad (10M+)',
    almanacTierLarge: 'Grande (3-10M)',
    almanacTierMid: 'Media (1-3M)',
    almanacTierSmallMid: 'Media-pequeña (250K-1M)',
    almanacSearchPlaceholder: 'Busca por ciudad o país...',
    almanacCompareCta: 'Comparar',
    almanacClearFilters: 'Quitar filtros',
    almanacResultsCount: '{n} de {total} ciudades',
    almanacEmptyState: 'Ningún resultado con estos filtros. Prueba a quitar alguno.',

    // Fase 4 — Modo Foto (Workstream V)
    photo: 'FOTO',
    photoModePinnedHint: 'Tu única pista gratis — el resto cuesta un token.',

    // Fase 4 — Modo Maratón (Workstream T)
    marathonEyebrow: 'MARATÓN #{n}',
    marathonPageTitle: 'Maratón del Día',
    marathonIntro:
      'Cinco ciudades curadas, una secuencia de intentos, el mismo orden para todos hoy. Resuelve las que puedas — tu puntuación total es directamente comparable con la de cualquier otro jugador.',
    marathonRoundProgress: 'Ciudad {current} de {total}',
    marathonSummaryEyebrow: 'MARATÓN COMPLETADO',
    marathonSummaryTitle: 'Recorrido Completado',
    marathonSummarySubtitle: 'Así te fue en el recorrido de cinco ciudades de hoy.',
    marathonTotalScoreLabel: 'Puntuación Total',
    marathonTableCity: 'Ciudad',
    marathonTableGuesses: 'Intentos',
    marathonTableResult: 'Resultado',
    marathonResultWon: 'Resuelta',
    marathonResultLost: 'Sin resolver',
    marathonShareCta: 'Compartir Resultado del Maratón',
    marathonComeBackTomorrow: 'Mañana llega una secuencia de cinco ciudades totalmente nueva.',
    marathonBackToCityle: '← Volver a Cityle',

    // Fase 5 — Onboarding (Workstream BB)
    welcomeTitle: 'BIENVENIDO A CITYLE',
    welcomeIntro: 'En algún lugar del mundo te espera una ciudad real. Tienes seis intentos para identificarla.',
    welcomeGuessFeedback: 'Cada intento te da distancia, dirección, y si la población y el clima se parecen a los de la ciudad misteriosa.',
    welcomeClueMechanic: 'Además, cada intento genera un Token de Inteligencia — gástalo para desbloquear una categoría de datos sobre la ciudad, o guárdalo para más adelante.',
    welcomeDismissCta: 'A Jugar',
    replayWelcomeGuide: '¿Nuevo por aquí? Repasa la guía de bienvenida',

    // Fase 5 — Listas seleccionadas (Workstream AA)
    playlistsPageTitle: 'Listas Seleccionadas',
    playlistsPageIntro:
      'Recorridos temáticos por el catálogo de ciudades — la misma mecánica de intentos y pistas que el Maratón, centrada cada vez en un ángulo climático o urbano distinto. Juega cualquier lista, en cualquier orden, cuando quieras.',
    playlistCityCount: '{n} ciudades',
    playlistPlayCta: 'Jugar',
    playlistPageEyebrow: 'LISTA SELECCIONADA',
    playlistNotFoundTitle: 'Esta lista no existe.',
    playlistNotFoundMessage:
      'Puede que el enlace esté mal escrito o que se haya eliminado. Vuelve para ver todas las listas disponibles.',
    playlistSummaryEyebrow: 'LISTA COMPLETADA',
    playlistSummarySubtitle: 'Así te fue en tu recorrido por {name}.',
    playlistShareCta: 'Compartir Resultado de la Lista',
    playlistComeBackAnytime: 'Las listas no están ligadas a un día — juega esta de nuevo cuando quieras.',

    // Fase 7 — Máquina del Tiempo Climática (Workstream II)
    timeMachineEyebrow: 'MÁQUINA DEL TIEMPO CLIMÁTICA',
    timeMachinePageTitle: 'Máquina del Tiempo Climática',
    timeMachineIntro: 'Cada ciudad ya tiene un clima proyectado para 2050 — adelantamos una al azar.',
    timeMachineHookTitle: 'En 2050, en algún lugar del mundo, el clima se sentirá así.',
    timeMachineHookSubtitle: '¿Qué ciudad real se siente así ahora mismo?',
    timeMachineProjectedTempLabel: 'Temp. Proyectada 2050',
    timeMachineRevealIntro: 'La ciudad real que ya vive ese futuro:',
    timeMachinePlayAgain: 'Jugar de Nuevo',
    timeMachineLoading: 'Adelantando una ciudad al azar hasta 2050…',

    crypticClueLabel: 'Pista Críptica',

    // Fase 7 — Quickfire (Workstream MM)
    quickfireEyebrow: 'PARTIDA RÁPIDA',
    quickfireTitle: 'Cityle en 60 Segundos',
    quickfireIntro: 'Cuatro ciudades, un dato, sesenta segundos en el reloj. Toca la ciudad ganadora de cada ronda.',
    quickfireBestScoreLabel: 'Mejor puntuación',
    quickfireStartCta: 'Empezar',
    quickfireTimeLeftLabel: 'Tiempo restante',
    quickfireScoreLabel: 'Puntuación',
    quickfireQuestionHighest: '¿Cuál de estas ciudades tiene el valor más alto en {field}?',
    quickfireQuestionLowest: '¿Cuál de estas ciudades tiene el valor más bajo en {field}?',
    quickfireFieldPopulation: 'población metropolitana',
    quickfireFieldPm25: 'contaminación anual por PM2.5',
    quickfireFieldElevation: 'elevación',
    quickfireFieldTemp: 'temperatura media anual',
    quickfireFieldTreeCanopy: 'cobertura de copa arbórea',
    quickfireFieldTransit: 'porcentaje de desplazamientos en transporte público o activo',
    quickfireFieldEquatorDistance: 'distancia al ecuador',
    quickfireCorrectAnnounce: '¡Correcto!',
    quickfireIncorrectAnnounce: 'Incorrecto — era {city}.',
    quickfireFinishedEyebrow: 'SE ACABÓ EL TIEMPO',
    quickfireFinishedTitle: 'Partida Terminada',
    quickfireFinalScoreLabel: 'Puntuación final',
    quickfireNewBestBadge: '¡Nuevo récord!',
    quickfirePlayAgainCta: 'Jugar de Nuevo',

    notesPageEyebrow: 'NOTAS DEL CURADOR',
    notesPageTitle: 'Notas del Curador',
    notesPageIntro:
      'Ensayos breves en primera persona sobre por qué ciertas ciudades entraron en este catálogo, lo que los datos no pueden contarte, y algunas opiniones que no escondo.',
    notesFeaturedBadge: 'Nota destacada de hoy',
    notesMoreHeading: 'Más notas',
  },
  it: {
    appName: 'CITYLE',
    tagline: 'URBANO E CLIMA',
    subTagline: 'DEDUZIONE URBANA E CLIMATICA CURATA',
    daily: 'GIORNALIERO',
    unlimited: 'ILLIMITATO',
    nextRandom: 'Prossima Città',
    streak: 'SERIE',
    urbanDossier: 'Dossier Urbano',
    guesses: 'Tentativi',
    submitGuess: 'INVIA TENTATIVO',
    searchPlaceholder: 'Cerca una città (es. Madrid, Tokyo, Nairobi, Vancouver...)',
    gameFinished: 'Partita finita — vedi i risultati qui sotto',
    viewResults: 'Vedi Risultati',
    guessHistory: 'CRONOLOGIA TENTATIVI',
    distanceAndFeedback: 'DISTANZA E FEEDBACK METRICHE',
    targetFound: 'CITTÀ TROVATA!',
    waitingForGuess: 'In attesa di tentativo...',
    tooLow: '(Troppo basso)',
    tooHigh: '(Troppo alto)',
    sameCountry: 'Stesso Paese',
    region: 'REGIONE',
    metroPop: 'POP. METRO',
    pm25Aqi: 'PM2.5 AQI',
    koppenClass: 'CLASSE KÖPPEN',
    sameGroup: 'Stesso Gruppo',
    different: 'Diverso',
    whyTheseStats: 'PERCHÉ QUESTA CITTÀ HA QUESTI DATI?',
    cityIdentified: 'CITTÀ INDIVIDUATA.',
    mysteryRevealed: 'TENTATIVI FINITI. ECCO LA CITTÀ.',
    solvedInGuesses: 'Risolto in {n}/6 tentativi',
    completedAttempts: 'Completati tutti i 6 tentativi',
    planningFact: 'Dato Urbanistico',
    shareGrid: 'CONDIVIDI RISULTATO',
    shareResultCard: 'CONDIVIDI SCHEDA RISULTATO',
    challengeAFriend: 'SFIDA UN AMICO',
    getPostcard: 'OTTIENI CARTOLINA',
    copied: 'COPIATO NEGLI APPUNTI!',
    playNextRandom: 'GIOCA UN\'ALTRA CITTÀ CASUALE',
    nextDailyIn: 'Il prossimo Cityle giornaliero esce tra 24 ore',
    statsTitle: 'STATISTICHE GIOCATORE',
    played: 'GIOCATE',
    winRate: '% VITTORIE',
    currentStreak: 'SERIE',
    maxStreak: 'MASSIMA',
    guessDistribution: 'DISTRIBUZIONE TENTATIVI',
    helpTitle: 'COME GIOCARE E FONTI DEI DATI',
    howToPlay: 'Come Giocare',
    objectiveText: 'Indovina la città misteriosa in 6 tentativi utilizzando traiettorie climatiche, qualità dell\'aria, economia, demografia e forma urbana.',
    clueUnlocks: 'SBLOCCO PROGRESSIVO DEGLI INDIZI',
    clueStart: 'Base Climatica e Aria (Köppen, Temp, Pioggia, PM2.5, Elevazione, Climogramma)',
    clueG1: 'Persone e Disuguaglianza (Popolazione, Densità, Gini, Età)',
    clueG2: 'Mobilità, Cura e Infrastrutture Condivise',
    clueG3: 'Proiezioni 2050 e Città Analoga 2050',
    clueG4: 'Mappa Urbana Senza Etichette',
    clueG5: 'Curiosità Urbanistica e Geografica',
    tilesAndDirection: 'CASELLE E DIREZIONE',
    exactTileDesc: 'Il valore rientra nel ±10-15% della città misteriosa.',
    sameGroupTileDesc: 'Stesso continente o gruppo climatico Köppen (es. Temperato C).',
    distanceTileDesc: 'Distanza ortodromica e direzione della bussola verso la città obiettivo.',
    glossaryTitle: 'GLOSSARIO INDICATORI',
    glossaryKoppen: 'Classificazione Köppen: A: Tropicale, B: Arido, C: Temperato (Mediterraneo Csa, Oceanico Cfb), D: Continentale.',
    glossaryPm25: 'Qualità dell\'Aria PM2.5: Polveri sottili (<2.5µm). Limite guida annuale OMS: 5 µg/m³.',
    glossaryUhi: 'Isola di Calore Urbana (UHI): Differenza termica tra centro urbano compatto e aree rurali.',
    glossaryTransit: 'Quota Non Automobilistica: % di spostamenti quotidiani con mezzi pubblici, a piedi o in bici.',
    dataSourcesTitle: 'CITAZIONI SCIENTIFICHE E FONTI DEI DATI',
    dataSourcesDesc: 'Cityle usa profili urbani curati e stime modellate indicative per il gioco. Le fonti informano lo schema, non ogni singolo valore:',
    sourceKoppen: 'Clima e Proiezioni Köppen: Beck et al. (2018) "Present and future Köppen-Geiger climate classification maps at 1-km resolution", Scientific Data (CMIP6 / IPCC SSP2-4.5).',
    sourceAir: 'Qualità dell\'Aria e PM2.5: Organizzazione Mondiale della Sanità (OMS) Global Air Quality Database (2021) e Copernicus Atmosphere Monitoring Service (CAMS).',
    sourceSocio: 'Demografia Urbana e Mobilità: Centro Comune di Ricerca della Commissione Europea (GHSL-FUA), UN-Habitat World Cities Report (2022) e Brookings Global Metro Monitor.',
    sourceWater: 'Stress Idrico e Rischio Costiero: World Resources Institute (WRI Aqueduct 4.0, 2023) e NOAA / Climate Central Coastal Risk Screening Tool.',
    sourceAnalogues: 'Città Analoghe Climatiche: Bastin et al. (2019) "Understanding climate change from a global analysis of city analogues", PLOS ONE / Crowther Lab ETH Zurich.',
    sourceClim: 'Estremi Climatici e Velocità di Riscaldamento: Rianalisi Climatica ECMWF ERA5 e Report IPCC AR6 Gruppo di Lavoro I.',
    panel1Title: '1. Clima di Base e Qualità dell\'Aria',
    panel2Title: '2. Persone, Disuguaglianza e Risorse Condivise',
    panel3Title: '3. Mobilità, Cura e Infrastrutture Condivise',
    panel4Title: '4. Cambiamenti Climatici 2050, Ondate di Calore e Città Analoga',
    mapTitle: 'RADAR TENTATIVI IN PROIEZIONE ROBINSON',
    panel6Title: 'INDIZIO URBANISTICO E GEOGRAFICO',
    visualClueTitle: 'MAPPA URBANA SENZA ETICHETTE',
    briefingTitle: 'BRIEFING DI MISSIONE // COME GIOCARE',
    briefingObjective: 'Indovina la città misteriosa in 6 tentativi usando indizi urbani e climatici curati.',
    briefingStep1: 'Esamina il clima di base (classe Köppen, climogramma Walter-Lieth di 12 mesi), elevazione e qualità dell\'aria OMS.',
    briefingStep2: 'Digita e invia qualsiasi città per ricevere la distanza in chilometri, la direzione della bussola (🧭 ↗️ NE) e indicazioni di valore superiore/inferiore.',
    briefingStep3: 'Ogni tentativo sblocca demografia, mobilità, stime indicative per il 2050, una mappa urbana senza etichette e un indizio finale.',
    briefingDismiss: 'RICEVUTO // CHIUDI',
    briefingToggle: 'Mostra Istruzioni',
    currentKoppenLabel: 'Köppen Attuale',
    meanTempLabel: 'Temp. Media Annuale',
    annualRainLabel: 'Precipitazioni Annuali',
    elevationLabel: 'Elevazione',
    pm25Label: 'PM2.5 Annuale',
    smogSeasonLabel: 'Picco Smog',
    densityLabel: 'Densità Urbana',
    gdpLabel: 'PIL pro Capite',
    giniLabel: 'Indice Gini Urbano',
    medianAgeLabel: 'Età Mediana',
    modalShareLabel: 'Quota Mobilità Sostenibile',
    canopyLabel: 'Copertura Arborea',
    uhiLabel: 'Isola di Calore (UHI)',
    koppen2050Label: 'Köppen Proiettato 2050',
    tempAnomalyLabel: 'Anomalia Termica 2050',
    rainShiftLabel: 'Variazione Piogge 2050',
    coastalRiskLabel: 'Rischio Alluvione Costiera',
    waterStressLabel: 'Stress Idrico 2050',
    heatwaveLabel: 'Giorni >35°C / Anno',
    warmingRateLabel: 'Velocità di Riscaldamento',
    aridityLabel: 'Indice di Aridità P/PET',
    carbonLabel: 'Impronta di Carbonio',
    cddLabel: 'Domanda Raffrescamento (CDD)',
    currentClimateTwin: 'Gemella Climatica Attuale',
    futureClimateAnalogue: 'Città Analoga nel 2050',
    unlockPromptDemo: 'Invia 1 tentativo per sbloccare demografia ed economia',
    unlockPromptMobility: 'Invia 2 tentativi per sbloccare mobilità, impronta di carbonio e verde urbano',
    unlockPromptRisk: 'Invia 3 tentativi per sbloccare proiezioni Köppen 2050, ondate di calore e la città analoga futura',
    unlockPromptMap: 'Si sblocca al Tentativo 4',
    mapLockedTitle: 'Radar Robinson Bloccato',
    mapLockedDesc: 'Visualizza le posizioni spaziali dei tentativi del giocatore sulla proiezione Robinson.',
    mapUnlocked: 'SBLOCCATO',
    scaleKm: '5 km',
    urbanFabric: 'Tessuto Urbano',
    water: 'Acqua',
    annualCycle: 'Ciclo Annuale di 12 Mesi',
    tempLine: 'Temp (°C)',
    rainBars: 'Pioggia (mm)',
    congrats: 'CONGRATULAZIONI!',
    debrief: 'ANALISI',
    dataSources: 'Fonti dei Dati e Citazioni',
    moreGames: 'Giochi e Progetti',
    climatleLink: 'Climatle',

    // Everyday Access
    everydayAccessTitle: 'Accesso quotidiano · prossimità e cura',
    everydayAccessDesc: 'Tutti dovrebbero poter accedere alle necessità quotidiane senza essere costretti a possedere un\'auto o sprecare ore nei tragitti. Il cerchio di 1,2 km è una lente spaziale, non un voto né una restrizione di movimento.',
    builtFormContext: 'Contesto morfologico',
    formContextRadial: 'L\'accesso centrale può essere elevato, mentre i quartieri esterni affrontano tragitti lunghi e radiali.',
    formContextLinear: 'Ponti e corridoi lineari possono rendere le destinazioni vicine più lente da raggiungere del previsto.',
    formContextCoastal: 'La costa e la frammentazione geografica rendono la distanza in linea d\'aria fuorviante.',
    formContextIsland: 'I collegamenti via acqua rendono i tempi di rete effettivi più significativi di un semplice raggio.',
    formContextGrid: 'Una griglia connessa favorisce la camminabilità locale, ma la separazione delle funzioni può allungare i viaggi.',
    formContextValley: 'La topografia e i corridoi montani possono generare accessibilità nettamente disuguali tra quartieri.',
    formContextDelta: 'Canali fluviali, ponti e terreni alluvionali possono interrompere tragitti di prossimità altrimenti brevi.',
    socialInfrastructureTitle: 'Infrastruttura sociale essenziale',
    socialInfrastructureDesc: 'Cibo accessibile · sanità pubblica · scuole e asili · biblioteche · parchi · trasporto pubblico · cura e servizi civici',
    accessUnscoredNote: "Questa città non ha un punteggio di camminabilità: un numero non dice se i servizi vicini sono accessibili, sicuri o aperti quando serve, né chi esclude la mancanza di accessibilità per disabili e la disuguaglianza.",
    collectiveLeversTitle: 'Leve collettive',
    collectiveLeversDesc: 'Trasporto pubblico frequente · edilizia residenziale sociale vicina ai servizi · sanità, cura e istruzione pubbliche · strade sicure · ombra e spazio pubblico · pianificazione democratica di quartiere',

    // Mission Briefing
    missionBriefingTitle: 'Sei tentativi per scovare una città del pianeta.',
    missionBriefingSubtitle: 'Ogni errore apre un altro strato—come clima, fondi pubblici e forma urbana plasmano la vita quotidiana lì.',
    briefingRead: 'Leggi.',
    briefingReadDesc: 'Inizia dal profilo climatico attuale.',
    briefingGuess: 'Indovina.',
    briefingGuessDesc: 'Orientati con distanza, direzione, regione e indizi comparativi.',
    briefingUnlock: 'Sblocca.',
    briefingUnlockDesc: 'Popolazione, forma urbana, stime 2050, una mappa muta e un indizio finale.',
    missionBriefingFootnote: 'Le medie mentono per omissione. Chiediti chi raggiunge davvero casa, cura, lavoro, ombra e sicurezza in questa città—e di chi sono il tempo, la salute e il lavoro che coprono il divario.',

    // Map & Controls
    fifteenMinWalkBadge: '≈ 15 min a piedi · raggio di 1,2 km',
    urbanMapLocked: 'Mappa Urbana Bloccata',
    urbanMapLockedDesc: 'Mostra la morfologia urbana, la rete stradale e la linea di costa della città misteriosa senza etichette.',
    readyBadge: 'Pronto',
    unlocksOnGuessN: 'Si sblocca al Tentativo {n}',
    zoomIn: 'Ingrandisci',
    zoomOut: 'Riduci',
    resetView: 'Reimposta vista',

    // Victory Modal & Debrief
    theSharedCity: 'La città condivisa',
    sharedCityDesc: 'I risultati urbani riflettono bilanci pubblici, regole sul suolo e potere collettivo—non solo scelte individuali. Il miglioramento deve ampliare l\'accesso senza espellere le persone.',
    gameplayDisclaimer: 'I valori sono stime indicative per il gioco. Vedi metodologia e fonti.',
    statClimate: 'Clima',
    statMeanTemp: 'Temp. media',
    statMetro: 'Popolazione',
    statElevation: 'Elevazione',
    educationalDebrief: 'Sintesi educativa',
    cityPhoto: 'Foto della città',
    photoCreditLabel: 'Foto:',

    // Help Modal
    howToReadCity: 'Come leggere una città',
    readCityPoint1Title: 'Inizia dalla distribuzione.',
    readCityPoint1Desc: 'Grandi differenze di esposizione, tempo, ricchezza e accesso — nascoste dietro una sola media.',
    readCityPoint2Title: 'Tratta i beni essenziali come infrastrutture condivise.',
    readCityPoint2Desc: 'Casa, cura, salute, istruzione, acqua, mobilità, ombra, spazio pubblico.',
    readCityPoint3Title: 'Guarda oltre la scelta individuale.',
    readCityPoint3Desc: 'Viaggi e consumi, condizionati da salari, orari di lavoro, affitti, posizione dei servizi, sicurezza stradale.',
    readCityPoint4Title: 'Chiediti chi decide.',
    readCityPoint4Desc: "Proprietà fondiaria, bilanci, condizioni di lavoro, partecipazione democratica — a chi serve l'urbanistica.",
    readCityPoint5Title: 'Evita lo spiazzamento verde.',
    readCityPoint5Desc: 'Miglioramenti climatici a beneficio di chi già vive lì, senza rendere le case inaccessibili.',
    dataStatusTitle: 'Stato dei dati',
    dataStatusP1: "Cityle è un gioco, non un database — ogni profilo è curato per il gioco. Clima, qualità dell'aria, mobilità, economia, rischio di calore e cifre 2050 sono stime indicative, non dati verificati punto per punto.",
    dataStatusP2: 'I dati sulla popolazione usano definizioni di area metropolitana o funzionale, con anni di riferimento variabili.',
    dataStatusP3: "Le citazioni scientifiche hanno dato forma allo schema e agli intervalli plausibili, ma non certificano nessuna cifra—non usare Cityle per ricerca, politiche pubbliche, salute, investimenti o pianificazione.",
    referencesAndAttribution: 'Riferimenti e attribuzione cartografica',
    osmCartoAttribution: 'La mappa di sfondo del Tentativo 4 usa dati © OpenStreetMap contributors e © CARTO. È una mappa stradale senza etichette, non una foto satellitare.',
    whoTransportGuidance: 'Linee guida OMS sui trasporti urbani salutari',

    // Dossier & Page Layout
    cluesUnlockedBanner: 'Profili urbani curati con indicatori modellati indicativi. Non è un dataset per ricerca o pianificazione.',
    makeAnotherGuess: 'Fai un altro tentativo per sbloccare il prossimo gruppo di indizi.',
    futureEstimatesDisclaimer: 'I campi del 2050 sono stime indicative basate su scenari; non sono previsioni puntuali.',
    directionalInequality: 'Contesto indicativo di disuguaglianza',
    footerTagline: 'CITYLE · gioco di deduzione urbana e climatica curato',
    madeByLabel: 'Creato da',
    methodologySources: 'Metodologia e fonti',
    guessMap: 'Mappa tentativi',
    cluesFraction: 'Indizi',
    bothModesPoolDesc: 'Entrambe le modalità usano lo stesso insieme curato di {count} città.',
    guessesLeft: 'RIMASTI {n}',

    // Robinson Map
    mapPlottedCount: '{n} TRACCIATE',

    // Sparkline
    baselineLabel: 'Base',
    estimate2050Label: 'Stima 2050',
    overlayLabel: 'Sovrapposizione',
    touchHoverHint: 'Tocca o passa il mouse su un mese',
    presentLabel: 'Attuale:',
    future2050ArrowLabel: '→ 2050:',

    // Köppen Modal
    koppenCurrentClassHeader: 'CLASSE KÖPPEN-GEIGER ATTUALE',
    koppenProjected2050Header: 'KÖPPEN-GEIGER PROIETTATO 2050',
    koppenCodeBreakdownHeader: 'SCOMPOSIZIONE DEL CODICE CLIMATICO A 3 LETTERE',
    koppenLetter1Label: '1ª Lettera:',
    koppenLetter2Label: '2ª Lettera:',
    koppenLetter3Label: '3ª Lettera:',
    closeExplanationLabel: 'Chiudi Spiegazione',
    closeLabel: 'Chiudi',

    // Comparison Matrix
    otherRegion: 'Altra Regione',
    populationLabel: 'Popolazione',
    matchLabel: 'Corrisponde',
    higherLabel: 'Più alto',
    lowerLabel: 'Più basso',
    comparisonEmptyState: 'Fai un tentativo. Distanza, direzione e confronti compaiono qui.',

    // Stats Modal — schede Illimitato e Distintivi
    badgesTabLabel: 'DISTINTIVI',
    currentRunLabel: 'SERIE ATTUALE',
    bestRunLabel: 'MIGLIOR SERIE',
    bestGuessLabel: 'MIGLIOR TENTATIVO',
    wonLabel: 'VINTE',
    badgeFirstFlightName: 'Primo Volo',
    badgeFirstFlightDesc: 'Vinci la tua prima partita a Cityle, in qualsiasi modalità.',
    badgeContinentalHopName: 'Salto Continentale',
    badgeContinentalHopDesc: 'Vinci almeno una volta con una città bersaglio in ognuno dei 6 continenti.',
    badgeClimateCartographerName: 'Cartografo del Clima',
    badgeClimateCartographerDesc: 'Vinci almeno una volta in ciascuno dei 5 gruppi climatici Köppen (A-E).',
    badgeFirstGuessAceName: 'Asso al Primo Colpo',
    badgeFirstGuessAceDesc: 'Indovina la città misteriosa al primissimo tentativo.',
    badgeStreakKeeperName: 'Custode della Serie',
    badgeStreakKeeperDesc: 'Raggiungi una serie di 7 giorni di vittorie consecutive in modalità Giornaliera.',
    badgeMarathonerName: 'Maratoneta',
    badgeMarathonerDesc: 'Gioca 50 partite combinate tra Giornaliero e Illimitato.',
    badgeDeepDiverName: 'Immersione Profonda',
    badgeDeepDiverDesc: 'Vinci proprio al tuo sesto e ultimo tentativo.',
    badgeHardModeCartographerName: 'Cartografo Modalità Difficile',
    badgeHardModeCartographerDesc: 'Vinci una partita giocata in difficoltà difficile.',
    badgeUnlockedOn: 'Sbloccato il {date}',
    badgeLockedLabel: 'Bloccato',
    newBadgeUnlocked: 'Nuovo distintivo sbloccato!',

    // Modale Archivio Giornaliero
    archiveTitle: 'ARCHIVIO GIORNALIERO',
    archiveCycleLabel: 'Ciclo {cycle} · Enigmi {start}–{end}',
    closeArchive: 'Chiudi archivio',
    previousMonth: 'Mese precedente',
    nextMonth: 'Mese successivo',
    archiveDayLabel: 'Enigma #{n}',
    archiveTodayLabel: 'Oggi',
    archiveStatusWon: 'Vinto',
    archiveStatusLost: 'Perso',
    archiveStatusInProgress: 'In corso',
    archiveStatusUnplayed: 'Non giocato',

    // Fallback per errore di condivisione
    shareErrorTitle: 'Condivisione automatica non riuscita',
    shareErrorHint: 'Copia il testo qui sotto a mano, oppure riprova.',
    retry: 'Riprova',

    // Intestazione: pulsante Archivio + interruttore Modalità Difficile
    openArchiveLabel: 'Apri archivio giornaliero',
    openAtlasLabel: 'Apri modalità Atlas',
    exploreMenuLabel: 'Esplora',
    openAlmanacLabel: 'Apri Almanacco delle Città',
    openMarathonLabel: 'Apri Maratona del Giorno',
    openPlaylistsLabel: 'Apri Playlist Curate',
    openTimeMachineLabel: 'Apri Macchina del Tempo Climatica',
    openQuickfireLabel: 'Apri Cityle in 60 Secondi',
    openNotesLabel: 'Apri Note del Curatore',
    difficultyStandard: 'Standard',
    difficultyHard: 'Difficile',
    difficultyToggleHint: 'Modalità Difficile: ogni gruppo di indizi arriva un tentativo più tardi',
    difficultyLockedHint: "La difficoltà si blocca all'inizio della partita",
    hardModeSectionLockedDesc: "La Modalità Difficile ritarda anche gli indizi base su clima e qualità dell'aria di un tentativo.",

    // Scala di reazioni vittoria/sconfitta
    winHeadline1: 'IRREALE.',
    winSubline1: 'Un tentativo, una città, zero esitazioni. Fai lo screenshot.',
    winHeadline2: 'NETTO.',
    winSubline2: 'Due tentativi per inchiodare una città su tutta la mappa.',
    winHeadline3: 'LETTURA SOLIDA.',
    winSubline3: "Hai triangolato come se lo sapessi già.",
    winHeadline4: 'CI SEI ARRIVATO.',
    winSubline4: "Un po' di giri, ma il pin è caduto comunque.",
    winHeadline5: 'AL FOTOFINISH.',
    winSubline5: "Un tentativo di margine e l'hai trovata lo stesso.",
    winHeadline6: 'UFF.',
    winSubline6: 'Ultimo tentativo. Battito a mille. Città identificata.',
    lossHeadline: 'NIENTE DA FARE.',
    lossSubline: 'Sei tentativi, zero centri. Ecco la città—vai a vedere cosa ti sei perso.',
    lossStreakSubline: "Se n'è andata una serie di {n} giorni. La prossima parte appena premi play.",

    // Confronto: quasi centrato
    soCloseFlag: 'VICINO',
    sameSubtype: 'Simile',

    // Economia dei token di "Scegli il tuo Indizio"
    clueTabClimateAir: 'Clima e Aria',
    clueTabPeopleEconomy: 'Persone ed Economia',
    clueTabMobilityForm: 'Mobilità e Forma',
    clueTabOutlook2050: 'Prospettiva 2050',
    clueTabPlaceMap: 'Luogo e Mappa',
    clueTabBonusInsight: 'Approfondimento Extra',
    clueTabsAriaLabel: 'Scegli una categoria di indizio',
    chooseYourClueBanner: 'Ogni tentativo genera un Token Informativo — spendilo subito o conservalo per dopo.',
    spendTokenCta: 'Spendi token',
    bankedTokensStatus: '{n} in riserva — spendili quando vuoi',
    lockedTabTooltipNextToken: 'Si sblocca con il tuo prossimo token',
    lockedTabTooltipSpendNow: 'Spendi un token per sbloccare',
    bonusInsightLockedTooltip: "Si sblocca al tuo ultimo tentativo, o con un token avanzato",
    bonusInsightDisclaimer: 'Dati extra per chi vuole approfondire — non servono per vincere, danno solo più contesto.',

    // Fase 4 — Almanacco (Workstream U)
    almanacTitle: 'Almanacco delle Città',
    almanacSubtitle: 'Sfoglia tutto il catalogo curato — foto, bandiera e classe Köppen, niente di più. Zero spoiler.',
    almanacFilterContinentLabel: 'Continente',
    almanacFilterKoppenLabel: 'Gruppo Köppen',
    almanacFilterPopulationLabel: 'Popolazione',
    almanacTierMegacity: 'Megalopoli (10M+)',
    almanacTierLarge: 'Grande (3-10M)',
    almanacTierMid: 'Media (1-3M)',
    almanacTierSmallMid: 'Medio-piccola (250K-1M)',
    almanacSearchPlaceholder: 'Cerca per città o paese...',
    almanacCompareCta: 'Confronta',
    almanacClearFilters: 'Rimuovi filtri',
    almanacResultsCount: '{n} di {total} città',
    almanacEmptyState: 'Nessuna città con questi filtri. Prova a rimuoverne uno.',

    // Fase 4 — Modalità Foto (Workstream V)
    photo: 'FOTO',
    photoModePinnedHint: 'Il tuo unico indizio gratuito — il resto costa un token.',

    // Fase 4 — Modalità Maratona (Workstream T)
    marathonEyebrow: 'MARATONA #{n}',
    marathonPageTitle: 'Maratona del Giorno',
    marathonIntro:
      'Cinque città curate, una sequenza di tentativi, lo stesso ordine per tutti oggi. Risolvi quelle che puoi — il tuo punteggio totale è direttamente confrontabile con quello di chiunque altro giochi.',
    marathonRoundProgress: 'Città {current} di {total}',
    marathonSummaryEyebrow: 'MARATONA COMPLETATA',
    marathonSummaryTitle: 'Percorso Completato',
    marathonSummarySubtitle: "Ecco com'è andato il tuo percorso di cinque città di oggi.",
    marathonTotalScoreLabel: 'Punteggio Totale',
    marathonTableCity: 'Città',
    marathonTableGuesses: 'Tentativi',
    marathonTableResult: 'Risultato',
    marathonResultWon: 'Risolta',
    marathonResultLost: 'Non risolta',
    marathonShareCta: 'Condividi Risultato Maratona',
    marathonComeBackTomorrow: 'Domani arriva una nuova sequenza di cinque città.',
    marathonBackToCityle: '← Torna a Cityle',

    // Fase 5 — Onboarding (Workstream BB)
    welcomeTitle: 'BENVENUTO SU CITYLE',
    welcomeIntro: 'Da qualche parte nel mondo ti aspetta una città reale. Hai sei tentativi per scoprirla.',
    welcomeGuessFeedback: 'Ogni tentativo ti dà distanza, direzione, e se popolazione e clima si avvicinano a quelli reali.',
    welcomeClueMechanic: 'Ogni tentativo genera anche un Token Informativo — spendilo per sbloccare una categoria di indizi sulla città, oppure conservalo per dopo.',
    welcomeDismissCta: 'Iniziamo',
    replayWelcomeGuide: 'Nuovo qui? Rivedi la guida di benvenuto',

    // Fase 5 — Playlist curate (Workstream AA)
    playlistsPageTitle: 'Playlist Curate',
    playlistsPageIntro:
      'Percorsi tematici nel catalogo di città — stessa meccanica di tentativi e indizi della Maratona, incentrata ogni volta su un solo aspetto climatico o urbano. Gioca qualsiasi playlist, in qualsiasi ordine, quando vuoi.',
    playlistCityCount: '{n} città',
    playlistPlayCta: 'Gioca',
    playlistPageEyebrow: 'PLAYLIST CURATA',
    playlistNotFoundTitle: 'Questa playlist non esiste.',
    playlistNotFoundMessage:
      'Potrebbe essere stata scritta male o rimossa. Torna indietro per vedere tutte le playlist disponibili.',
    playlistSummaryEyebrow: 'PLAYLIST COMPLETATA',
    playlistSummarySubtitle: 'Ecco come è andato il tuo percorso in {name}.',
    playlistShareCta: 'Condividi Risultato Playlist',
    playlistComeBackAnytime: 'Le playlist non sono legate a un giorno — rigiocala quando vuoi.',

    // Fase 7 — Macchina del Tempo Climatica (Workstream II)
    timeMachineEyebrow: 'MACCHINA DEL TEMPO CLIMATICA',
    timeMachinePageTitle: 'Macchina del Tempo Climatica',
    timeMachineIntro: 'Ogni città ha già un clima proiettato al 2050 — ne facciamo avanzare una a caso.',
    timeMachineHookTitle: 'Nel 2050, da qualche parte nel mondo, il clima sarà così.',
    timeMachineHookSubtitle: 'Quale città reale si sente così proprio adesso?',
    timeMachineProjectedTempLabel: 'Temp. Proiettata 2050',
    timeMachineRevealIntro: 'La città reale che vive già quel futuro:',
    timeMachinePlayAgain: 'Gioca Ancora',
    timeMachineLoading: 'Proiettiamo una città a caso nel 2050…',

    crypticClueLabel: 'Indizio Criptico',

    // Fase 7 — Quickfire (Workstream MM)
    quickfireEyebrow: 'PARTITA RAPIDA',
    quickfireTitle: 'Cityle in 60 Secondi',
    quickfireIntro: 'Quattro città, un dato, sessanta secondi sul cronometro. Tocca la città vincente di ogni round.',
    quickfireBestScoreLabel: 'Miglior punteggio',
    quickfireStartCta: 'Inizia',
    quickfireTimeLeftLabel: 'Tempo rimasto',
    quickfireScoreLabel: 'Punteggio',
    quickfireQuestionHighest: 'Quale di queste città ha il valore più alto per {field}?',
    quickfireQuestionLowest: 'Quale di queste città ha il valore più basso per {field}?',
    quickfireFieldPopulation: "popolazione dell'area metropolitana",
    quickfireFieldPm25: 'inquinamento annuale da PM2.5',
    quickfireFieldElevation: 'altitudine',
    quickfireFieldTemp: 'temperatura media annuale',
    quickfireFieldTreeCanopy: 'copertura arborea',
    quickfireFieldTransit: 'quota di spostamenti in trasporto pubblico o attivo',
    quickfireFieldEquatorDistance: "distanza dall'equatore",
    quickfireCorrectAnnounce: 'Corretto!',
    quickfireIncorrectAnnounce: 'Sbagliato — era {city}.',
    quickfireFinishedEyebrow: 'TEMPO SCADUTO',
    quickfireFinishedTitle: 'Partita Terminata',
    quickfireFinalScoreLabel: 'Punteggio finale',
    quickfireNewBestBadge: 'Nuovo record!',
    quickfirePlayAgainCta: 'Gioca Ancora',

    notesPageEyebrow: 'NOTE DEL CURATORE',
    notesPageTitle: 'Note del Curatore',
    notesPageIntro:
      'Brevi saggi in prima persona su perché certe città sono entrate in questo catalogo, su cosa i dati non possono dirti, e su alcune opinioni che non nascondo.',
    notesFeaturedBadge: 'Nota in evidenza di oggi',
    notesMoreHeading: 'Altre note',
  }
};

export function getTranslation(locale: Locale): Translations {
  return TRANSLATIONS[locale] || TRANSLATIONS.en;
}
