export function suggestBestRoute(routes) {

  return routes.sort((a, b) => {

    const scoreA =
      0.5 * a.demand +
      0.3 * (1 / a.distance) +
      0.2 * a.success_rate;

    const scoreB =
      0.5 * b.demand +
      0.3 * (1 / b.distance) +
      0.2 * b.success_rate;

    return scoreB - scoreA;

  });

}