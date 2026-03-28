export function selectBestRide(rides) {

  return rides.sort((a, b) => {

    const scoreA =
      0.5 * (a.trust_score || 80) +
      0.3 * (a.available_seats / a.total_seats) * 100 +
      0.2 * (1 / (a.distance || 1));

    const scoreB =
      0.5 * (b.trust_score || 80) +
      0.3 * (b.available_seats / b.total_seats) * 100 +
      0.2 * (1 / (b.distance || 1));

    return scoreB - scoreA;

  });

}