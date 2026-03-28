export function predictCancellationRisk(user) {

  const cancelRate =
    user?.cancelled_rides / (user?.total_rides || 1);

  let risk = cancelRate;

  if ((user?.trust_score || 80) < 70) {
    risk += 0.2;
  }

  return risk;
}