export function calculateRideScore(ride) {
  const trust = ride.trust_score || 50;
  const cancellation = ride.cancellation_risk || 0;
  const safety = ride.safety_risk || 0;
  const demand = ride.demand_index || 1;

  const seatUtilization =
    ride.total_seats > 0
      ? (ride.total_seats - ride.available_seats) / ride.total_seats
      : 0;

  // Normalize trust to 0–1
  const trustNormalized = trust / 100;

  // Final weighted score
  const finalScore =
    0.30 * trustNormalized +
    0.25 * (1 - cancellation) +
    0.15 * seatUtilization +
    0.15 * demand +
    0.15 * (1 - safety);

  return Number(finalScore.toFixed(3));
}