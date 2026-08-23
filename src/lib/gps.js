import { useState, useCallback } from "react";

/**
 * Shared GPS hook — requests browser geolocation and returns [lat, lng].
 * Includes loading state and error handling.
 */
export function useGpsLocation() {
  const [userLocation, setUserLocation] = useState(null); // [lat, lng]
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported by your browser");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.message || "Location access denied");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  return { userLocation, gpsLoading, gpsError, requestLocation };
}

/**
 * Fetches a real road-geometry route from OSRM (free, no API key needed).
 * Returns an array of [lat, lng] pairs snapped to actual road geometry.
 * @param {[number,number]} from — [lat, lng]
 * @param {[number,number]} to   — [lat, lng]
 * @param {string} profile — 'foot' | 'car' | 'bike'
 */
export async function fetchOsrmRoute(from, to, profile = "foot") {
  // OSRM uses lng,lat order (opposite of Leaflet)
  const url = `https://router.project-osrm.org/route/v1/${profile}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&alternatives=true`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) return [];
    // Return all alternative routes, each as { coords, distance, duration }
    return data.routes.map(r => ({
      coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]), // flip to Leaflet [lat,lng]
      distance: (r.distance / 1000).toFixed(1), // km
      duration: Math.round(r.duration / 60),     // minutes
    }));
  } catch {
    return [];
  }
}
