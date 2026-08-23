import React, { createContext, useContext, useState, useEffect } from "react";
import { useGpsLocation } from "@/lib/gps";

const LocationContext = createContext();

export const POPULAR_LOCATIONS = [
  { name: "Sector 62 Noida", zone: "Noida Zone", coords: [28.6280, 77.3649] },
  { name: "Knowledge Park 2 (IILM / Galgotias)", zone: "Greater Noida", coords: [28.4630, 77.4920] },
  { name: "Knowledge Park 3 (Sharda / MaxVet)", zone: "Greater Noida", coords: [28.4710, 77.4850] },
  { name: "Alpha 1 Commercial Belt", zone: "Greater Noida", coords: [28.4730, 77.5030] },
  { name: "Alpha 2 (Kailash / DPS)", zone: "Greater Noida", coords: [28.4780, 77.5090] },
  { name: "Beta 1 Market & Ryan School", zone: "Greater Noida", coords: [28.4630, 77.5140] },
  { name: "Beta 2 Sector Gate", zone: "Greater Noida", coords: [28.4580, 77.5080] },
  { name: "Pari Chowk Roundabout", zone: "Greater Noida", coords: [28.4645, 77.5015] },
  { name: "Sector 18 Commercial Market", zone: "Noida Zone", coords: [28.5708, 77.3261] },
  { name: "Indirapuram", zone: "Ghaziabad Zone", coords: [28.6366, 77.3732] },
];

export function LocationProvider({ children }) {
  const [currentLocality, setCurrentLocality] = useState(() => {
    return localStorage.getItem("pawlytics_locality") || "Sector 62 Noida";
  });
  const [currentZone, setCurrentZone] = useState(() => {
    return localStorage.getItem("pawlytics_zone") || "Noida Zone";
  });
  const [coords, setCoords] = useState(() => {
    const saved = localStorage.getItem("pawlytics_coords");
    return saved ? JSON.parse(saved) : [28.6280, 77.3649];
  });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const updateLocation = (name, zone = "NCR Zone", newCoords = null) => {
    setCurrentLocality(name);
    setCurrentZone(zone);
    if (newCoords) setCoords(newCoords);
    localStorage.setItem("pawlytics_locality", name);
    localStorage.setItem("pawlytics_zone", zone);
    if (newCoords) localStorage.setItem("pawlytics_coords", JSON.stringify(newCoords));
  };

  const detectGpsLocation = async () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }
    setIsDetectingGps(true);
    setGpsError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const userCoords = [lat, lng];

          // 1. Try to find closest popular location (within ~5km)
          let closest = null;
          let minDistance = Infinity;
          for (const loc of POPULAR_LOCATIONS) {
            const dlat = lat - loc.coords[0];
            const dlng = lng - loc.coords[1];
            const dist = Math.sqrt(dlat * dlat + dlng * dlng);
            if (dist < minDistance) {
              minDistance = dist;
              closest = loc;
            }
          }

          let localityName = "";
          let zoneName = "GPS Detected";

          // If within ~3km of a known ward, snap to it
          if (closest && minDistance < 0.04) {
            localityName = closest.name;
            zoneName = closest.zone;
          } else {
            // Reverse geocode via OpenStreetMap Nominatim
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`
              );
              const data = await res.json();
              const addr = data.address || {};
              localityName =
                addr.suburb ||
                addr.neighbourhood ||
                addr.residential ||
                addr.quarter ||
                addr.road ||
                addr.city_district ||
                addr.city ||
                "Current GPS Location";
              zoneName = addr.city || addr.state_district || "GPS Zone";
            } catch {
              localityName = `GPS (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
              zoneName = "Current GPS";
            }
          }

          updateLocation(localityName, zoneName, userCoords);
          setIsDetectingGps(false);
          resolve({ name: localityName, zone: zoneName, coords: userCoords });
        },
        (err) => {
          setIsDetectingGps(false);
          setGpsError(err.message || "Failed to retrieve GPS location");
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocality,
        currentZone,
        coords,
        updateLocation,
        detectGpsLocation,
        isDetectingGps,
        gpsError,
        popularLocations: POPULAR_LOCATIONS,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationState() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationState must be used within a LocationProvider");
  }
  return context;
}
