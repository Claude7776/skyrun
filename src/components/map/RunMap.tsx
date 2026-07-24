import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Box } from 'lucide-react-native';
import { MapView, Camera, UserLocation, ShapeSource, LineLayer, type CameraRef } from '@maplibre/maplibre-react-native';
import { colors, radius, spacing, fontSize, shadows } from '@/styles/theme';
import type { RoutePoint } from '@/types/run';

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
}

export function RunMap({ route, followUser = true, fitToRoute = false, rounded = true }: RunMapProps) {
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

  return (
    <View style={[styles.wrapper, rounded && styles.mapRounded]}>
      <MapView style={styles.map} mapStyle={OSM_STYLE} logoEnabled={false} attributionEnabled={false}>
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
