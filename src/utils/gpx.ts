import type { Run } from '@/types/run';

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Builds a minimal, valid GPX 1.1 track from a saved run's route points. */
export function buildGpxString(run: Run): string {
  const points = run.route
    .map((point) => `      <trkpt lat="${point.lat}" lon="${point.lng}"><time>${new Date(point.t).toISOString()}</time></trkpt>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="SkyRun" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(run.title)}</name>
    <time>${new Date(run.date).toISOString()}</time>
  </metadata>
  <trk>
    <name>${escapeXml(run.title)}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>
`;
}
