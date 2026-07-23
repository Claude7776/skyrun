import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { haversineDistanceKm } from '@/utils/geo';
import type { RoutePoint } from '@/types/run';

export type TrackingStatus = 'idle' | 'tracking' | 'paused' | 'stopped';

const WATCH_OPTIONS: Location.LocationOptions = {
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 2000,
  distanceInterval: 5,
};

// GPS noise can produce implausible jumps between two consecutive fixes
// (signal reflection, cold-start inaccuracy); a running human can't cover
// more than ~300m in a single 2s tick, so anything past that is discarded
// rather than added to the live distance.
const MAX_PLAUSIBLE_JUMP_KM = 0.3;

/**
 * Foreground-only live GPS tracking: accumulates route points and distance
 * while the app is open. Background tracking (screen locked) is a possible
 * future enhancement — it requires expo-task-manager and, on iOS, an
 * "Always" location entitlement that needs App Store justification.
 */
export function useLiveTracking() {
  const [status, setStatus] = useState<TrackingStatus>('idle');
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const elapsedBeforePauseRef = useRef(0);
  const lastPointRef = useRef<RoutePoint | null>(null);

  const addPoint = useCallback((point: RoutePoint) => {
    const last = lastPointRef.current;
    if (last) {
      const delta = haversineDistanceKm(last, point);
      if (delta > 0 && delta < MAX_PLAUSIBLE_JUMP_KM) {
        setDistanceKm((d) => d + delta);
      } else if (delta >= MAX_PLAUSIBLE_JUMP_KM) {
        return; // drop the noisy fix entirely, don't record it as a route point
      }
    }
    lastPointRef.current = point;
    setPoints((prev) => [...prev, point]);
  }, []);

  const unsubscribe = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const subscribe = useCallback(async () => {
    startedAtRef.current = Date.now();
    subscriptionRef.current = await Location.watchPositionAsync(WATCH_OPTIONS, (loc) => {
      addPoint({ lat: loc.coords.latitude, lng: loc.coords.longitude, t: loc.timestamp });
    });
    timerRef.current = setInterval(() => {
      setDurationSec(Math.floor((Date.now() - startedAtRef.current) / 1000) + elapsedBeforePauseRef.current);
    }, 1000);
  }, [addPoint]);

  const start = useCallback(async () => {
    setError(null);
    const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
    if (permStatus !== 'granted') {
      setError('Permission de géolocalisation refusée');
      return;
    }

    setPoints([]);
    setDistanceKm(0);
    setDurationSec(0);
    elapsedBeforePauseRef.current = 0;
    lastPointRef.current = null;
    setStatus('tracking');
    await subscribe();
  }, [subscribe]);

  const pause = useCallback(() => {
    unsubscribe();
    elapsedBeforePauseRef.current = durationSec;
    setStatus('paused');
  }, [unsubscribe, durationSec]);

  const resume = useCallback(async () => {
    setStatus('tracking');
    await subscribe();
  }, [subscribe]);

  const stop = useCallback(() => {
    unsubscribe();
    setStatus('stopped');
  }, [unsubscribe]);

  const reset = useCallback(() => {
    unsubscribe();
    setStatus('idle');
    setPoints([]);
    setDistanceKm(0);
    setDurationSec(0);
    elapsedBeforePauseRef.current = 0;
    lastPointRef.current = null;
  }, [unsubscribe]);

  // Safety net: stop watching GPS if the screen unmounts mid-run.
  useEffect(() => unsubscribe, [unsubscribe]);

  return { status, points, distanceKm, durationSec, error, start, pause, resume, stop, reset };
}
