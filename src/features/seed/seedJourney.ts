import { latLngToCell, gridDisk } from 'h3-js';
import { db } from '../../db';
import { useFog } from '../../store/fog';
import { useCapsules } from '../../store/capsules';
import { getMapInstance } from '../../map/mapActions';
import { haversineDistanceKm } from '../../location/ingest';
import { H3_RES, REVEAL_K } from '../../config';
import type { LatLng, Capsule, RevealedCell } from '../../types';

/**
 * Creates a synthetic scenic photo blob for the demo capsule.
 */
function createDemoPhotoBlob(): Promise<{ blob: Blob; mime: string }> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve({ blob: new Blob([]), mime: 'image/jpeg' });
      return;
    }

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, 400);
    sky.addColorStop(0, '#0f2027');
    sky.addColorStop(0.5, '#203a43');
    sky.addColorStop(1, '#2c5364');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 800, 600);

    // Mountain silhouettes
    ctx.fillStyle = '#112233';
    ctx.beginPath();
    ctx.moveTo(0, 420);
    ctx.lineTo(160, 260);
    ctx.lineTo(340, 390);
    ctx.lineTo(540, 210);
    ctx.lineTo(800, 450);
    ctx.lineTo(800, 600);
    ctx.lineTo(0, 600);
    ctx.closePath();
    ctx.fill();

    // Foreground ridge
    ctx.fillStyle = '#09131d';
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.lineTo(240, 420);
    ctx.lineTo(480, 490);
    ctx.lineTo(720, 380);
    ctx.lineTo(800, 430);
    ctx.lineTo(800, 600);
    ctx.lineTo(0, 600);
    ctx.closePath();
    ctx.fill();

    // Glowing waypoint / amber star
    ctx.fillStyle = '#f5b942';
    ctx.shadowColor = '#f5b942';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(540, 190, 8, 0, Math.PI * 2);
    ctx.fill();

    // Caption overlay
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('The Ancient Banyan Overlook', 40, 550);

    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(45, 212, 191, 0.9)';
    ctx.fillText('SEEKIT EXPEDITION ARCHIVE', 40, 574);

    canvas.toBlob(
      (blob) => {
        resolve({ blob: blob ?? new Blob([]), mime: 'image/jpeg' });
      },
      'image/jpeg',
      0.85
    );
  });
}

/**
 * Seeds a realistic curved demo journey of revealed H3 cells and 3 sample capsules.
 */
export async function seedDemoJourney(
  center: LatLng
): Promise<{ cellsCount: number; capsulesCount: number }> {
  const stepsCount = 42;
  const now = Date.now();
  const journeyDurationMs = 45 * 60 * 1000; // 45 minutes ago
  const startTime = now - journeyDurationMs;
  const timePerStep = journeyDurationMs / stepsCount;

  const revealedMap = new Map<string, number>();
  const pathPoints: LatLng[] = [];

  let currentLat = center.lat;
  let currentLng = center.lng;

  // Generate a meandering curved path
  for (let i = 0; i < stepsCount; i++) {
    const angle = 0.4 + Math.sin(i * 0.18) * 0.9 + (i * 0.08);
    const stepDistanceDeg = 0.00035; // ~38m per step

    currentLat += Math.cos(angle) * stepDistanceDeg;
    currentLng += Math.sin(angle) * stepDistanceDeg * 1.1;

    pathPoints.push({ lat: currentLat, lng: currentLng });

    const stepTime = Math.round(startTime + i * timePerStep);
    const cell = latLngToCell(currentLat, currentLng, H3_RES);
    const disk = gridDisk(cell, REVEAL_K);

    for (const h3 of disk) {
      if (!revealedMap.has(h3)) {
        revealedMap.set(h3, stepTime);
      }
    }
  }

  // Bulk save cells to Dexie
  const cellRecords: RevealedCell[] = Array.from(revealedMap.entries()).map(([h3, ts]) => ({
    h3,
    ts,
  }));
  await db.cells.bulkPut(cellRecords);

  // Generate 3 sample capsules along the path
  const photoAsset = await createDemoPhotoBlob();

  const pStart = pathPoints[4] || center;
  const pMid = pathPoints[20] || center;
  const pEnd = pathPoints[36] || center;

  const demoCapsules: Capsule[] = [
    {
      id: crypto.randomUUID(),
      lat: pStart.lat,
      lng: pStart.lng,
      h3: latLngToCell(pStart.lat, pStart.lng, H3_RES),
      type: 'text',
      title: 'Morning Expedition Departure',
      text: `### Basecamp Start\n\nPacked light with just the essentials. The morning fog is thick, but the compass points true.\n\n- **Weather:** Crisp, 19°C\n- **Objective:** Chart the southern ridge and follow the stream.`,
      createdAt: Math.round(startTime + 4 * timePerStep),
      sealed: false,
    },
    {
      id: crypto.randomUUID(),
      lat: pMid.lat,
      lng: pMid.lng,
      h3: latLngToCell(pMid.lat, pMid.lng, H3_RES),
      type: 'photo',
      title: 'The Ancient Banyan Overlook',
      text: 'Panoramic view from the ridge clearing where the old stone trail begins.',
      blob: photoAsset.blob,
      mime: photoAsset.mime,
      createdAt: Math.round(startTime + 20 * timePerStep),
      sealed: false,
    },
    {
      id: crypto.randomUUID(),
      lat: pEnd.lat,
      lng: pEnd.lng,
      h3: latLngToCell(pEnd.lat, pEnd.lng, H3_RES),
      type: 'text',
      title: 'Secret Ridge Cache (Sealed)',
      text: `### Secret Cache Unlocked!\n\nCongratulations on physically retracing your steps back to this coordinate.\n\n> "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes."\n\n**Coordinates verified:** ${pEnd.lat.toFixed(5)}, ${pEnd.lng.toFixed(5)}`,
      createdAt: Math.round(startTime + 36 * timePerStep),
      sealed: true, // Sealed capsule proximity test
    },
  ];

  await db.capsules.bulkPut(demoCapsules);

  // Compute cumulative distance of the seeded path and add to fog store
  let seedDistanceMeters = 0;
  for (let i = 1; i < pathPoints.length; i++) {
    seedDistanceMeters += haversineDistanceKm(pathPoints[i - 1], pathPoints[i]) * 1000;
  }
  useFog.getState().addDistance(Math.round(seedDistanceMeters));

  // Hydrate stores
  await useFog.getState().hydrateRevealed();
  await useCapsules.getState().hydrateCapsules();

  // Move user dot to the end of the demo path
  const endPoint = pathPoints[pathPoints.length - 1];
  useFog.getState().setPosition(endPoint);

  // Fly map to reveal the path
  const map = getMapInstance();
  if (map) {
    map.flyTo({
      center: [pMid.lng, pMid.lat],
      zoom: 15.2,
      duration: 1500,
      essential: true,
    });
  }

  return {
    cellsCount: cellRecords.length,
    capsulesCount: demoCapsules.length,
  };
}
