// M/M/1 Queue Model

export function calculateWaitTime(arrivalRate, serviceRate) {

  // If system overloaded
  if (serviceRate <= arrivalRate) {
    return {
      status: "High Delay",
      waitTime: "∞"
    };
  }

  const waitTime = 1 / (serviceRate - arrivalRate);

  return {
    status: "Normal",
    waitTime: waitTime.toFixed(2)
  };
}