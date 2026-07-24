import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
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

// GPS altitude is noisier than lat/lng — small wobble must be ignored or
// elevation gain creeps up while standing still; anything past ~30m in one
// tick is a bad fix, not a real climb.
const MIN_ELEVATION_DELTA_M = 1.5;
const MAX_PLAUSIBLE_ELEVATION_JUMP_M = 30;

// Rough average energy cost of running (~70 kcal/km), used only for the
// live in-run estimate. The authoritative figure is recomputed server-side
// from the saved run, which can factor in the user's actual profile.
const KCAL_PER_KM = 70;

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
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [elevationGainM, setElevationGainM] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const elapsedBeforePauseRef = useRef(0);
  const lastPointRef = useRef<RoutePoint | null>(null);
  const lastAltitudeRef = useRef<number | null>(null);
  const distanceRef = useRef(0);
  const lastKmMilestoneRef = useRef(0);

  const addPoint = useCallback((point: RoutePoint, speedFromGps: number | null) => {
    const last = lastPointRef.current;
    if (last) {
      const delta = haversineDistanceKm(last, point);
      if (delta > 0 && delta < MAX_PLAUSIBLE_JUMP_KM) {
        const nextDistance = distanceRef.current + delta;
        distanceRef.current = nextDistance;
        setDistanceKm(nextDistance);
        if (speedFromGps != null && speedFromGps >= 0) {
          setCurrentSpeedKmh(speedFromGps * 3.6);
        } else {
          const dtHours = (point.t - last.t) / 3_600_000;
          if (dtHours > 0) setCurrentSpeedKmh(delta / dtHours);
        }

        // Buzz once per completed kilometer — the classic running-app cue
        // so the runner doesn't have to look at the screen to know they hit one.
        const milestone = Math.floor(nextDistance);
        if (milestone > lastKmMilestoneRef.current) {
          lastKmMilestoneRef.current = milestone;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
      } else if (delta >= MAX_PLAUSIBLE_JUMP_KM) {
        return; // drop the noisy fix entirely, don't record it as a route point
      }
    }
    lastPointRef.current = point;
    setPoints((prev) => [...prev, point]);
  }, []);

  const addElevation = useCallback((altitude: number | null | undefined) => {
    if (altitude == null) return;
    const last = lastAltitudeRef.current;
    if (last != null) {
      const delta = altitude - last;
      if (delta > MIN_ELEVATION_DELTA_M && delta < MAX_PLAUSIBLE_ELEVATION_JUMP_M) {
        setElevationGainM((e) => e + delta);
      }
    }
    lastAltitudeRef.current = altitude;
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
      addPoint({ lat: loc.coords.latitude, lng: loc.coords.longitude, t: loc.timestamp }, loc.coords.speed);
      addElevation(loc.coords.altitude);
    });
    timerRef.current = setInterval(() => {
      setDurationSec(Math.floor((Date.now() - startedAtRef.current) / 1000) + elapsedBeforePauseRef.current);
    }, 1000);
  }, [addPoint, addElevation]);

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
    setCurrentSpeedKmh(0);
    setElevationGainM(0);
    elapsedBeforePauseRef.current = 0;
    lastPointRef.current = null;
    lastAltitudeRef.current = null;
    distanceRef.current = 0;
    lastKmMilestoneRef.current = 0;
    setStatus('tracking');
    await subscribe();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, [subscribe]);

  const pause = useCallback(() => {
    unsubscribe();
    elapsedBeforePauseRef.current = durationSec;
    setCurrentSpeedKmh(0);
    setStatus('paused');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [unsubscribe, durationSec]);

  const resume = useCallback(async () => {
    setStatus('tracking');
    await subscribe();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [subscribe]);

  const stop = useCallback(() => {
    unsubscribe();
    setCurrentSpeedKmh(0);
    setStatus('stopped');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  }, [unsubscribe]);

  const reset = useCallback(() => {
    unsubscribe();
    setStatus('idle');
    setPoints([]);
    setDistanceKm(0);
    setDurationSec(0);
    setCurrentSpeedKmh(0);
    setElevationGainM(0);
    elapsedBeforePauseRef.current = 0;
    lastPointRef.current = null;
    lastAltitudeRef.current = null;
    distanceRef.current = 0;
    lastKmMilestoneRef.current = 0;
  }, [unsubscribe]);

  // Safety net: stop watching GPS if the screen unmounts mid-run.
  useEffect(() => unsubscribe, [unsubscribe]);

  // Live-only estimate shown during the run; the backend recomputes the
  // authoritative calorie figure when the run is saved.
  const caloriesEstimate = Math.round(distanceKm * KCAL_PER_KM);

  return {
    status,
    points,
    distanceKm,
    durationSec,
    currentSpeedKmh,
    elevationGainM,
    caloriesEstimate,
    error,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
