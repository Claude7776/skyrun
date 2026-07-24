import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Box } from 'lucide-react-native';
import {
  MapView,
  Camera,
  UserLocation,
  ShapeSource,
  LineLayer,
  CircleLayer,
  SymbolLayer,
  type CameraRef,
} from '@maplibre/maplibre-react-native';
import { colors, radius, spacing, fontSize, shadows } from '@/styles/theme';
import { haversineDistanceKm } from '@/utils/geo';
import type { RoutePoint } from '@/types/run';

/** One marker per completed kilometer along `route`, numbered in order — matches the checkpoint pins on a live-tracking map. */
function computeKmMarkers(route: RoutePoint[]) {
  const markers: { lat: number; lng: number; label: string }[] = [];
  if (route.length < 2) return markers;

  let cumulativeKm = 0;
  let nextThreshold = 1;
  for (let i = 1; i < route.length; i++) {
    cumulativeKm += haversineDistanceKm(route[i - 1], route[i]);
    if (cumulativeKm >= nextThreshold) {
      markers.push({ lat: route[i].lat, lng: route[i].lng, label: String(nextThreshold) });
      nextThreshold += 1;
    }
  }
  return markers;
}

// Camera tilt for the "3D" view toggle. The tile source is flat raster
// imagery (no building-height data), so this gives a Strava/Nike-Run-style
// tilted perspective rather than extruded 3D buildings — true extrusions
// would need a vector tile provider (MapTiler, Stadia, ...) instead of OSM
// raster tiles.
const PITCH_3D = 60;
const PITCH_2D = 0;

// Raw MapLibre style JSON referencing the standard OSM raster tile server.
// Fine for development; a production app should switch to a provider with
// proper usage terms (MapTiler, Stadia Maps, self-hosted tiles, ...) — see
// https://operations.osmfoundation.org/policies/tiles/
const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  // Text rendering (the km-checkpoint SymbolLayer) needs a glyph source
  // independent of the raster tiles above — MapLibre's public demo glyph
  // server, same dev-only caveat as the OSM tiles themselves.
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

interface RunMapProps {
  route: RoutePoint[];
  /** Live tracking mode: follow the device's current position. */
  followUser?: boolean;
  /** Read-only mode (past run): frame the camera around the recorded route instead. */
  fitToRoute?: boolean;
  /** Rounded corners, for use inside a card. Full-bleed screens (e.g. the live tracking map) should disable this. */
  rounded?: boolean;
  /** A pre-run planned route (from the routing API), drawn dashed to stand out from the solid recorded-route line. */
  suggestedRoute?: RoutePoint[];
  /** Tapped waypoints while planning a route, rendered as small circle markers. */
  waypoints?: RoutePoint[];
  /** Forwards MapView's tap coordinate — used while planning a route (adding waypoints). */
  onMapPress?: (point: RoutePoint) => void;
  /** Numbered checkpoint markers every completed km along `route` — opt-in since it's noisy on small preview maps. */
  showCheckpoints?: boolean;
}

export function RunMap({
  route,
  followUser = true,
  fitToRoute = false,
  rounded = true,
  suggestedRoute,
  waypoints,
  onMapPress,
  showCheckpoints = false,
}: RunMapProps) {
  const cameraRef = useRef<CameraRef>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [is3D, setIs3D] = useState(false);

  // MapLibre's <UserLocation> starts native GPS updates as soon as it mounts —
  // rendering it before the OS permission is granted throws a native
  // SecurityException that crashes the app, so gate it on a confirmed grant.
  useEffect(() => {
    let cancelled = false;

    async function ensureLocationReady() {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        ({ status } = await Location.requestForegroundPermissionsAsync());
      }
      if (status !== 'granted') return;

      // Prime the OS location cache with a fresh fix before mounting
      // <UserLocation> — otherwise it queries a last-known position that
      // doesn't exist yet and logs "Failed to obtain last location update"
      // on every render until the first live fix arrives.
      try {
        await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      } catch {
        // Best-effort: UserLocation will still pick up the next live fix.
      }

      if (!cancelled) setHasLocationPermission(true);
    }

    ensureLocationReady();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!fitToRoute || route.length < 2) return;
    const lats = route.map((p) => p.lat);
    const lngs = route.map((p) => p.lng);
    const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)];
    const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)];
    cameraRef.current?.fitBounds(ne, sw, 40, 500);
  }, [fitToRoute, route]);

  const routeGeoJSON = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: route.map((p) => [p.lng, p.lat]),
    },
  };

  const suggestedRouteGeoJSON = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: (suggestedRoute ?? []).map((p) => [p.lng, p.lat]),
    },
  };

  const waypointsGeoJSON = {
    type: 'FeatureCollection' as const,
    features: (waypoints ?? []).map((p) => ({
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
    })),
  };

  const kmMarkers = showCheckpoints ? computeKmMarkers(route) : [];
  const kmMarkersGeoJSON = {
    type: 'FeatureCollection' as const,
    features: kmMarkers.map((m) => ({
      type: 'Feature' as const,
      properties: { label: m.label },
      geometry: { type: 'Point' as const, coordinates: [m.lng, m.lat] },
    })),
  };

  const handleMapPress = onMapPress
    ? (feature: GeoJSON.Feature) => {
        if (feature.geometry.type !== 'Point') return;
        const [lng, lat] = feature.geometry.coordinates;
        onMapPress({ lat, lng, t: Date.now() });
      }
    : undefined;

  return (
    <View style={[styles.wrapper, rounded && styles.mapRounded]}>
      <MapView
        style={styles.map}
        mapStyle={OSM_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        onPress={handleMapPress}
      >
        <Camera
          ref={cameraRef}
          followUserLocation={followUser}
          followZoomLevel={17}
          pitch={is3D ? PITCH_3D : PITCH_2D}
          animationDuration={500}
        />
        {followUser && hasLocationPermission && (
          // minDisplacement filters out sub-5m GPS jitter before it reaches the
          // puck/camera — without it every raw noisy fix (including standing
          // still) repositions them, which reads as the map jumping around
          // erratically. 5m matches the distanceInterval used for live stats.
          <UserLocation visible animated minDisplacement={5} />
        )}
        {route.length > 1 && (
          <ShapeSource id="routeSource" shape={routeGeoJSON}>
            <LineLayer
              id="routeLine"
              style={{ lineColor: colors.primary, lineWidth: 4, lineCap: 'round', lineJoin: 'round' }}
            />
          </ShapeSource>
        )}
        {suggestedRoute && suggestedRoute.length > 1 && (
          <ShapeSource id="suggestedRouteSource" shape={suggestedRouteGeoJSON}>
            <LineLayer
              id="suggestedRouteLine"
              style={{
                lineColor: colors.accent,
                lineWidth: 4,
                lineCap: 'round',
                lineJoin: 'round',
                lineDasharray: [2, 1.5],
              }}
            />
          </ShapeSource>
        )}
        {waypoints && waypoints.length > 0 && (
          <ShapeSource id="waypointsSource" shape={waypointsGeoJSON}>
            <CircleLayer
              id="waypointsCircles"
              style={{
                circleRadius: 7,
                circleColor: colors.accent,
                circleStrokeWidth: 2,
                circleStrokeColor: colors.bg,
              }}
            />
          </ShapeSource>
        )}
        {kmMarkers.length > 0 && (
          <ShapeSource id="kmMarkersSource" shape={kmMarkersGeoJSON}>
            <CircleLayer
              id="kmMarkersCircles"
              style={{
                circleRadius: 11,
                circleColor: colors.primary,
                circleStrokeWidth: 2,
                circleStrokeColor: colors.bg,
              }}
            />
            <SymbolLayer
              id="kmMarkersLabels"
              style={{
                textField: ['get', 'label'],
                textSize: 11,
                textColor: colors.onPrimary,
                textFont: ['Open Sans Bold'],
                textAllowOverlap: true,
                textIgnorePlacement: true,
              }}
            />
          </ShapeSource>
        )}
      </MapView>

      {/* Positioned mid-right so it never sits under the top stats bar, the
          bottom controls, or the post-run summary card, whichever combination
          is on screen. */}
      <Pressable
        style={styles.toggle3D}
        hitSlop={8}
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          setIs3D((v) => !v);
        }}
      >
        <Box size={16} color={is3D ? colors.primary : colors.textMuted} />
        <Text style={[styles.toggle3DText, is3D && styles.toggle3DTextActive]}>{is3D ? '3D' : '2D'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapRounded: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  toggle3D: {
    position: 'absolute',
    right: spacing[3],
    top: '50%',
    marginTop: -18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.pill,
    backgroundColor: 'rgba(10, 14, 20, 0.6)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  toggle3DText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  toggle3DTextActive: {
    color: colors.primary,
  },
});
