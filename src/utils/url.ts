const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

/** Origin (scheme+host+port) the API is served from, derived from the base URL. */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

/**
 * The backend returns relative paths for uploaded files (e.g. `/uploads/avatars/x.jpg`).
 * A web client resolves those via same-origin proxying; the mobile app has no
 * such proxy, so <Image> needs a fully-qualified URL.
 */
export function resolveAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
