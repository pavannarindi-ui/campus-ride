export function gameTheoryPricing({
  basePrice,
  demandIndex,
  totalSeats
}) {

  const strategies = [
    { type: "LOW", multiplier: 0.9, demandFactor: 1.2 },
    { type: "MEDIUM", multiplier: 1.0, demandFactor: 1.0 },
    { type: "HIGH", multiplier: 1.2, demandFactor: 0.7 }
  ];

  let bestProfit = 0;
  let bestPrice = basePrice;

  strategies.forEach((strategy) => {

    const price = basePrice * strategy.multiplier;

    const demandProbability = Math.min(1, demandIndex * strategy.demandFactor);

    const expectedPassengers = totalSeats * demandProbability;

    const profit = price * expectedPassengers;

    if (profit > bestProfit) {
      bestProfit = profit;
      bestPrice = price;
    }

  });

  return Math.round(bestPrice);
}