export function calculateSafetyRisk(ride, driver) {
  const night = isNight(ride.departure_time) ? 1 : 0;
  const lowTrust = driver.trust_score < 50 ? 1 : 0;
  const lowPassengers = ride.accepted_by.length < 2 ? 1 : 0;

  return 0.4 * night + 0.3 * lowTrust + 0.3 * lowPassengers;
}