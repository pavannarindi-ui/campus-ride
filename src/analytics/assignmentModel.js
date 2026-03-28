// Simple cost-based assignment

export function assignBestRide(rides, userPreference) {

  return rides.map((ride) => {

    let cost = 0;

    // Lower price → lower cost
    cost += ride.price_per_seat * (1 - (userPreference.cheap || 0.3));

    // More seats → better
    cost += (1 / (ride.available_seats || 1)) * (userPreference.fast || 0.3);

    // Trust → reduce cost
    cost -= (ride.trust_score || 80) * (userPreference.trust || 0.4);

    return {
      ...ride,
      assignment_score: cost
    };

  }).sort((a, b) => a.assignment_score - b.assignment_score);
}