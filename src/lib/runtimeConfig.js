/// <reference types="vite/client" />
const env = import.meta.env;

export const runtimeConfig = Object.freeze({
  demoMode: env.VITE_DEMO_MODE === "true" || window.location.pathname.startsWith("/demo"),
  mapProvider: env.VITE_MAP_PROVIDER || (env.VITE_GOOGLE_MAPS_API_KEY ? "google" : "openstreetmap"),
  googleMapsApiKey: env.VITE_GOOGLE_MAPS_API_KEY || "",
  searchProvider: env.VITE_SEARCH_PROVIDER || "nominatim",
  routingProvider: env.VITE_ROUTING_PROVIDER || "osrm",
});

export const isDemoMode = () => runtimeConfig.demoMode;
