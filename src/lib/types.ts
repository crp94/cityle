export type Continent =
  | 'Europe'
  | 'Asia'
  | 'Africa'
  | 'North America'
  | 'South America'
  | 'Oceania';

export type AQITier =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy (Sensitive)'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export type GiniTier =
  | 'Low (<0.30)'
  | 'Moderate (0.30-0.40)'
  | 'High (0.40-0.50)'
  | 'Very High (>0.50)';

export type RiskLevel = 'None (Inland)' | 'Low' | 'Moderate' | 'High' | 'Severe' | 'Extremely High';

export interface KoppenClass {
  code: string;       // e.g. "Csa", "Cfb", "BWh", "Dfa", "Aw", "Af", "ET"
  name: string;       // e.g. "Hot-summer Mediterranean", "Oceanic", "Hot Desert"
  group: string;      // "A: Tropical", "B: Arid", "C: Temperate", "D: Continental", "E: Polar"
  description?: string;
}

export interface ClimateAnalogue {
  cityName: string;
  country: string;
  countryCode: string;
  similarityPct: number; // e.g. 96%
  note?: string;
}

export interface MorphologyProfile {
  type: 'radial-concentric' | 'linear-river' | 'coastal-bay' | 'island-archipelago' | 'grid-sprawl' | 'valley-basin' | 'delta-estuary';
  primaryWater: 'ocean-coast' | 'major-river' | 'bay-harbor' | 'lake' | 'delta-channels' | 'inland-dry';
  waterOrientation?: 'north' | 'south' | 'east' | 'west' | 'bisecting' | 'surrounding';
  ringsCount?: number;
  sprawlScaleKm: number; // e.g. 30, 45, 60 km
  seed: number;
}

export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string; // ISO 2-letter
  continent: Continent;
  lat: number;
  lng: number;
  elevation_m: number;

  // 1. Climate & Shifts
  koppen_current: KoppenClass;
  koppen_2050: KoppenClass;
  temp_mean_annual_c: number;
  temp_2050_anomaly_c: number; // e.g. +2.4
  precip_annual_mm: number;
  precip_2050_shift_pct: number; // e.g. -12 or +8
  monthly_temps_c: number[]; // 12 months [Jan..Dec]
  monthly_precip_mm: number[]; // 12 months [Jan..Dec]
  monthly_temps_2050_c?: number[]; // Projected 12 months in 2050
  monthly_precip_2050_mm?: number[]; // Projected 12 months in 2050

  // Climate Extremes & Decarbonization
  heatwave_days_above_35c_current?: number; // Days/yr >35°C
  heatwave_days_above_35c_2050?: number; // Projected Days/yr >35°C in 2050
  cooling_degree_days?: number; // CDD cooling energy demand
  carbon_footprint_tco2e_capita?: number; // tCO2e/capita/year
  warming_rate_c_per_decade?: number; // Observed warming rate °C/decade
  aridity_index?: string; // e.g. "Semi-Arid", "Dry Sub-Humid", "Humid"

  // 2. Climate Analogues (Current Twin & 2050 Future Analogue)
  analogue_current?: ClimateAnalogue;
  analogue_2050?: ClimateAnalogue;

  // 3. Air Quality & Pollution
  pm25_annual_ugm3: number;
  aqi_tier: AQITier;
  peak_smog_season: string; // e.g. "Winter thermal inversion", "Summer ozone peak", "Spring dust"

  // 4. Socio-Economics & Demographics
  population_metro: number;
  density_urban_pop_km2: number;
  gdp_per_capita_ppp: number;
  gini_tier: GiniTier;
  median_age: number;

  // 5. Form & Mobility
  transit_active_share_pct: number; // % non-private car commuting
  tree_canopy_pct: number;

  // 6. Risks & Vulnerabilities
  uhi_index_c: number; // Urban Heat Island excess temp (+°C)
  coastal_flood_risk: RiskLevel;
  water_stress_2050: 'Low' | 'Medium' | 'High' | 'Extremely High';

  // Educational Context
  urban_fact: string;
  educational_debrief: string;

  // Visual Photography & License Attribution (Wikimedia Commons / Public Domain)
  image_url?: string;
  image_author?: string;
  image_license?: string;
  image_caption?: string;

  // Urban Morphology / Sprawl footprint descriptor
  morphology: MorphologyProfile;
}

export type StatStatus = 'exact' | 'close' | 'higher' | 'lower' | 'different';

export interface MetricComparison {
  value: number | string;
  targetValue: number | string;
  status: StatStatus;
  label: string;
  deltaText?: string;
}

export interface GuessResult {
  city: City;
  guessNumber: number;
  isCorrect: boolean;
  distanceKm: number;
  bearingDeg: number;
  bearingCompass: string; // e.g. "NE", "SSW"
  bearingArrow: string;   // e.g. "↗️", "⬇️"
  closenessPct: number;   // 0 to 100%

  countryMatch: boolean;
  continentMatch: boolean;

  populationComp: MetricComparison;
  pm25Comp: MetricComparison;
  tempComp: MetricComparison;
  koppenComp: {
    guessed: string;
    target: string;
    // 'same-subtype' sits between 'exact' and 'same-group': the guessed and
    // target Köppen codes share both their first (group) and second
    // (moisture-pattern) letters and differ only in the third (heat/precip
    // intensity) letter — e.g. 'Cfa' vs 'Cfb'. 'same-group' now means only
    // the first letter matches (e.g. 'Csa' vs 'Cfa'). See evaluateGuess in
    // gameLogic.ts for the comparison logic.
    status: 'exact' | 'same-subtype' | 'same-group' | 'different';
  };
  transitComp: MetricComparison;
  elevationComp: MetricComparison;
}

export type GameStatus = 'playing' | 'won' | 'lost';
export type GameMode = 'daily' | 'unlimited' | 'archive' | 'challenge';

export type Difficulty = 'standard' | 'hard';

export interface GameState {
  mode: GameMode;
  dailyNumber: number;
  targetCityId: string;
  guesses: GuessResult[];
  status: GameStatus;
  maxGuesses: number;
  completedAt?: string;
  // Defaults to 'standard' when absent on old saves — fully backward compatible.
  difficulty?: Difficulty;
  // Lives mode (an orthogonal extension of Hard Mode, see GameSettings.livesMode
  // in storage.ts): remaining lives for the current game, starting at
  // LIVES_MODE_START_COUNT (gameLogic.ts) and decremented whenever
  // shouldLoseLife() returns true for a guess. Absent when Lives mode is off,
  // or on any old saved state — fully backward compatible. Wiring the actual
  // decrement-and-end-game-at-zero behavior into page.tsx is a later
  // integration step, not implemented alongside this field.
  livesRemaining?: number;
}

// Unlimited mode has no daily cadence, so instead of a streak it tracks a
// "current unbeaten run" — consecutive wins since the last loss.
export interface UnlimitedStats {
  played: number;
  won: number;
  guessDistribution: Record<number, number>; // 1: count, 2: count, etc.
  currentRun: number;
  bestRun: number;
  bestGuessCount?: number;
}

export interface GameStats {
  schemaVersion: number;
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>; // 1: count, 2: count, etc.
  lastPlayedDate?: string;
  unlimited: UnlimitedStats;
}
