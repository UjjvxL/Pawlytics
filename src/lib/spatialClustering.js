/**
 * Pawlytics Spatial DBSCAN & Kernel Density Estimation (KDE) Hotspot Clustering Engine
 * Groups verified incident points into dynamic spatial conflict zones.
 */

/** Calculate Haversine distance in meters between two lat/lng coordinates */
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * DBSCAN Spatial Clustering
 * @param {Array} points Array of objects with lat, lng, severity, weight
 * @param {number} eps Maximum distance in meters (default: 250m)
 * @param {number} minPts Minimum points to form cluster (default: 3)
 */
export function dbscanClustering(points = [], eps = 250, minPts = 3) {
  if (!points || points.length === 0) return [];

  const visited = new Set();
  const clusters = [];

  const getNeighbors = (pointIdx) => {
    const neighbors = [];
    const p1 = points[pointIdx];
    const p1Lat = p1.latitude || p1.lat;
    const p1Lng = p1.longitude || p1.lng;

    for (let i = 0; i < points.length; i++) {
      const p2 = points[i];
      const p2Lat = p2.latitude || p2.lat;
      const p2Lng = p2.longitude || p2.lng;

      if (p1Lat && p1Lng && p2Lat && p2Lng) {
        const dist = haversineDistanceMeters(p1Lat, p1Lng, p2Lat, p2Lng);
        if (dist <= eps) {
          neighbors.push(i);
        }
      }
    }
    return neighbors;
  };

  for (let i = 0; i < points.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);

    const neighbors = getNeighbors(i);
    if (neighbors.length >= minPts) {
      const currentCluster = [i];
      const queue = [...neighbors.filter((n) => n !== i)];

      while (queue.length > 0) {
        const qIdx = queue.shift();
        if (!visited.has(qIdx)) {
          visited.add(qIdx);
          const qNeighbors = getNeighbors(qIdx);
          if (qNeighbors.length >= minPts) {
            queue.push(...qNeighbors.filter((n) => !visited.has(n)));
          }
        }
        if (!currentCluster.includes(qIdx)) {
          currentCluster.push(qIdx);
        }
      }

      clusters.push(currentCluster);
    }
  }

  // Format clusters into hotspot spatial objects
  return clusters.map((clusterIndices, clusterId) => {
    const clusterPoints = clusterIndices.map((idx) => points[idx]);
    const avgLat =
      clusterPoints.reduce((sum, p) => sum + (p.latitude || p.lat), 0) / clusterPoints.length;
    const avgLng =
      clusterPoints.reduce((sum, p) => sum + (p.longitude || p.lng), 0) / clusterPoints.length;

    // Calculate maximum radius from centroid
    let maxDist = 150;
    clusterPoints.forEach((p) => {
      const d = haversineDistanceMeters(avgLat, avgLng, p.latitude || p.lat, p.longitude || p.lng);
      if (d > maxDist) maxDist = d;
    });

    const totalSeverity = clusterPoints.reduce((sum, p) => sum + (p.severity_level || 1), 0);
    const riskScore = Math.min(99, Math.round((totalSeverity / clusterPoints.length) * 18 + clusterPoints.length * 5));

    return {
      id: `dbscan-hotspot-${clusterId + 1}`,
      name: `Spatial Hotspot Zone ${clusterId + 1}`,
      center_lat: avgLat,
      center_lng: avgLng,
      radius_meters: Math.round(maxDist + 50),
      report_count: clusterPoints.length,
      risk_score: riskScore,
      is_active: true,
      cluster_type: riskScore >= 70 ? "High Density Pack" : "Moderate Incident Zone",
    };
  });
}
