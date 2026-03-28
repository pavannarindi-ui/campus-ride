export function personalizeRides(rides, userPref) {

  return rides.sort((a, b) => {

    const scoreA =
      (userPref.cheap || 0.3) * (1 / (a.price_per_seat || 1)) +
      (userPref.fast || 0.3) * (a.available_seats / (a.total_seats || 1)) +
      (userPref.trust || 0.4) * (a.trust_score || 80);

    const scoreB =
      (userPref.cheap || 0.3) * (1 / (b.price_per_seat || 1)) +
      (userPref.fast || 0.3) * (b.available_seats / (b.total_seats || 1)) +
      (userPref.trust || 0.4) * (b.trust_score || 80);

    return scoreB - scoreA;
  });
}