/**
 * Geographic calculations for distance, bearing, and compass directions.
 */

// Converts numeric degrees to radians
function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

// Converts radians to numeric degrees
function toDeg(value: number): number {
  return (value * 180) / Math.PI;
}

/**
 * Calculates Great-Circle distance between two points on the Earth (WGS84 sphere) in kilometers.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates the initial compass bearing from point 1 to point 2 in degrees (0..360).
 */
export function calculateBearingDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaLambda = toRad(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  return (toDeg(theta) + 360) % 360;
}

/**
 * Converts a bearing in degrees into a 16-wind compass abbreviation and arrow emoji.
 */
export function getCompassDirection(bearingDeg: number): {
  compass: string;
  arrow: string;
} {
  const points = [
    { label: 'N', arrow: '⬆️' },
    { label: 'NNE', arrow: '↗️' },
    { label: 'NE', arrow: '↗️' },
    { label: 'ENE', arrow: '↗️' },
    { label: 'E', arrow: '➡️' },
    { label: 'ESE', arrow: '↘️' },
    { label: 'SE', arrow: '↘️' },
    { label: 'SSE', arrow: '↘️' },
    { label: 'S', arrow: '⬇️' },
    { label: 'SSW', arrow: '↙️' },
    { label: 'SW', arrow: '↙️' },
    { label: 'WSW', arrow: '↙️' },
    { label: 'W', arrow: '⬅️' },
    { label: 'WNW', arrow: '↖️' },
    { label: 'NW', arrow: '↖️' },
    { label: 'NNW', arrow: '↖️' },
  ];

  const index = Math.round(bearingDeg / 22.5) % 16;
  return {
    compass: points[index].label,
    arrow: points[index].arrow,
  };
}

/**
 * Computes a percentage score of closeness from 0% (antipodal / >15,000km) to 100% (0km).
 */
export function calculateClosenessPct(distanceKm: number): number {
  // Max half-circumference is ~20,015 km
  const maxDist = 20000;
  const pct = Math.max(0, Math.round((1 - distanceKm / maxDist) * 100));
  return pct;
}

/**
 * Converts ISO 3166-1 alpha-2 country code to emoji flag
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
