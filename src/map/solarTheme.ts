import type { LatLng } from '../types';

export type MapTheme = 'day' | 'night';

// Civil twilight / sunrise threshold angle in degrees
// Sun altitude >= -0.833° marks official sunrise to sunset.
export const SUN_HORIZON_THRESHOLD_DEG = -0.833;

/**
 * Computes solar altitude (elevation angle in degrees) for a given lat, lng, and Date
 * using the NOAA solar position algorithm.
 */
export function getSolarAltitude(lat: number, lng: number, date: Date = new Date()): number {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const jd = date.getTime() / 86400000 + 2440587.5;
  const t = (jd - 2451545.0) / 36525;

  let l0 = 280.46646 + t * (36000.76983 + 0.0003032 * t);
  l0 = ((l0 % 360) + 360) % 360;

  let m = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  m = ((m % 360) + 360) % 360;
  const mRad = m * rad;

  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);

  const c =
    Math.sin(mRad) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * mRad) * (0.020077 - 0.000101 * t) +
    Math.sin(3 * mRad) * 0.000289;

  const sunTrueLong = l0 + c;
  const omega = 125.04 - 1934.136 * t;
  const lambda = sunTrueLong - 0.00569 - 0.00478 * Math.sin(omega * rad);
  const lambdaRad = lambda * rad;

  const obMean = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const obCorr = obMean + 0.00256 * Math.cos(omega * rad);
  const obRad = obCorr * rad;

  const sinDec = Math.sin(obRad) * Math.sin(lambdaRad);
  const decRad = Math.asin(sinDec);

  const y = Math.pow(Math.tan(obRad / 2), 2);
  const l0Rad = l0 * rad;
  const eot =
    4 *
    deg *
    (y * Math.sin(2 * l0Rad) -
      2 * e * Math.sin(mRad) +
      4 * e * y * Math.sin(mRad) * Math.cos(2 * l0Rad) -
      0.5 * y * y * Math.sin(4 * l0Rad) -
      1.25 * e * e * Math.sin(2 * mRad));

  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const tst = (((utcMinutes + eot + 4 * lng) % 1440) + 1440) % 1440;

  let ha = tst / 4 - 180;
  if (ha < -180) ha += 360;
  const haRad = ha * rad;
  const latRad = lat * rad;

  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  return Math.asin(Math.max(-1, Math.min(1, sinAlt))) * deg;
}

/**
 * Returns whether it is currently daytime or nighttime at the given coordinates,
 * automatically factoring in real-time solar elevation and device timezone.
 */
export function getAutoMapTheme(coords?: LatLng | null, date: Date = new Date()): MapTheme {
  if (
    coords &&
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    !isNaN(coords.lat) &&
    !isNaN(coords.lng)
  ) {
    const altitude = getSolarAltitude(coords.lat, coords.lng, date);
    return altitude >= SUN_HORIZON_THRESHOLD_DEG ? 'day' : 'night';
  }

  // Fallback to local clock time in user's timezone if coords are unavailable
  const localHour = date.getHours() + date.getMinutes() / 60;
  return localHour >= 6.0 && localHour < 18.5 ? 'day' : 'night';
}
