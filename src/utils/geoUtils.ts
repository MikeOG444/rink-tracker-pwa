/**
 * Utility functions for geolocation calculations
 */

/**
 * Calculate if a point is within a certain distance of another point
 * @param point1 The first point (e.g., user location)
 * @param point2 The second point (e.g., rink location)
 * @param thresholdFeet The threshold distance in feet
 * @returns True if the points are within the threshold distance, false otherwise
 */
export function isWithinDistance(
  point1: google.maps.LatLngLiteral | null | undefined,
  point2: google.maps.LatLngLiteral | null | undefined,
  thresholdFeet: number
): boolean {
  if (!point1 || !point2) return false;
  
  // Convert threshold from feet to meters (1 foot ≈ 0.3048 meters)
  const thresholdMeters = thresholdFeet * 0.3048;
  
  // Calculate distance using the Haversine formula
  const distance = calculateHaversineDistance(
    point1.lat, point1.lng,
    point2.lat, point2.lng
  );
  
  return distance <= thresholdMeters;
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 Latitude of the first point in degrees
 * @param lon1 Longitude of the first point in degrees
 * @param lat2 Latitude of the second point in degrees
 * @param lon2 Longitude of the second point in degrees
 * @returns Distance in meters
 */
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Earth's radius in meters
  const R = 6371000;
  
  // Convert latitude and longitude from degrees to radians
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  
  // Haversine formula
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}
