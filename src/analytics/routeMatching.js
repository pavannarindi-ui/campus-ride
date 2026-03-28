export function checkRouteMatch(userDestination, rideCheckpoints) {
  return rideCheckpoints.includes(userDestination);
}