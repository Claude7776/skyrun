import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { buildGpxString } from './gpx';
import { formatDate, formatDistance, formatDuration, formatPace } from './format';
import type { Run } from '@/types/run';

function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'footing';
}

async function shareFile(uri: string, mimeType: string, dialogTitle: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Le partage de fichiers n'est pas disponible sur cet appareil");
  }
  await Sharing.shareAsync(uri, { mimeType, dialogTitle });
}

export async function exportRunAsGpx(run: Run): Promise<void> {
  const gpx = buildGpxString(run);
  const fileUri = `${FileSystem.documentDirectory}${slugify(run.title)}.gpx`;
  await FileSystem.writeAsStringAsync(fileUri, gpx, { encoding: FileSystem.EncodingType.UTF8 });
  await shareFile(fileUri, 'application/gpx+xml', 'Exporter le footing (GPX)');
}

function buildRunReportHtml(run: Run): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: -apple-system, Roboto, sans-serif; color: #0a0e14; padding: 32px; }
      h1 { font-size: 24px; margin-bottom: 4px; }
      .date { color: #667181; font-size: 14px; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; }
      td.label { color: #667181; }
      td.value { text-align: right; font-weight: 700; }
      .brand { color: #0ea5e9; font-weight: 800; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
    </style>
  </head>
  <body>
    <div class="brand">SkyRun</div>
    <h1>${run.title}</h1>
    <div class="date">${formatDate(run.date)}</div>
    <table>
      <tr><td class="label">Distance</td><td class="value">${formatDistance(run.distanceKm)}</td></tr>
      <tr><td class="label">Temps</td><td class="value">${formatDuration(run.durationSec)}</td></tr>
      <tr><td class="label">Allure moyenne</td><td class="value">${formatPace(run.avgPaceMinPerKm)}</td></tr>
      <tr><td class="label">Vitesse moyenne</td><td class="value">${run.avgSpeedKmh} km/h</td></tr>
      <tr><td class="label">Calories</td><td class="value">${run.calories} kcal</td></tr>
    </table>
  </body>
</html>`;
}

export async function exportRunAsPdf(run: Run): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html: buildRunReportHtml(run) });
  await shareFile(uri, 'application/pdf', 'Exporter le footing (PDF)');
}
