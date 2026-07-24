import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { MapView, Camera, UserLocation, ShapeSource, LineLayer, type CameraRef } from '@maplibre/maplibre-react-native';
import { colors, radius } from '@/styles/theme';
import type { RoutePoint } from '@/types/run';

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
}

export function RunMap({ route, followUser = true, fitToRoute = false }: RunMapProps) {
  const cameraRef = useRef<CameraRef>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

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
    <MapView style={styles.map} mapStyle={OSM_STYLE} logoEnabled={false} attributionEnabled={false}>
      <Camera
        ref={cameraRef}
        followUserLocation={followUser}
        followZoomLevel={17}
        animationDuration={500}
      />
      {followUser && hasLocationPermission && <UserLocation visible animated />}
      {route.length > 1 && (
        <ShapeSource id="routeSource" shape={routeGeoJSON}>
          <LineLayer
            id="routeLine"
            style={{ lineColor: colors.primary, lineWidth: 4, lineCap: 'round', lineJoin: 'round' }}
          />
        </ShapeSource>
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});
