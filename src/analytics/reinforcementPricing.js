// ================================
// 1. INITIAL STRATEGY SETUP
// ================================

const strategies = [
  { type: "LOW", multiplier: 0.9 },
  { type: "MEDIUM", multiplier: 1.0 },
  { type: "HIGH", multiplier: 1.2 }
];

// ================================
// 2. INITIALIZE STATS
// ================================

export function initializeStrategyStats() {
  const stats = {};

  strategies.forEach((s) => {
    stats[s.type] = {
      count: 0,   // number of times selected
      qValue: 0   // expected reward
    };
  });

  return stats;
}

// ================================
// 3. ACTION SELECTION (ε-GREEDY)
// ================================

export function reinforcementPricing({
  basePrice,
  strategyStats,
  epsilon = 0.3
}) {

  let chosenStrategy;

  // Exploration vs Exploitation
  if (Math.random() < epsilon) {
    // Explore
    chosenStrategy =
      strategies[Math.floor(Math.random() * strategies.length)];
  } else {
    // Exploit (choose best Q-value)
    chosenStrategy = strategies.reduce((best, current) => {
      const bestQ = strategyStats[best.type]?.qValue || 0;
      const currentQ = strategyStats[current.type]?.qValue || 0;
      return currentQ > bestQ ? current : best;
    });
  }

  const finalPrice = basePrice * chosenStrategy.multiplier;

  return {
    price: Math.round(finalPrice),
    strategy: chosenStrategy.type
  };
}

// ================================
// 4. LEARNING FUNCTION (UPDATE Q)
// ================================

export function updateStrategyStats({
  strategyStats,
  strategyType,
  reward
}) {
  const stats = strategyStats[strategyType];

  // Increase count
  stats.count += 1;

  // Incremental Q-value update
  stats.qValue =
    stats.qValue + (reward - stats.qValue) / stats.count;

  return strategyStats;
}

// ================================
// 5. REWARD FUNCTION (SIMULATION)
// ================================
// You can replace this with real profit / conversion data

export function calculateReward(price, demandFactor) {
  // Example: higher price → less demand
  const demand = Math.max(0, demandFactor - price * 0.05);

  const revenue = price * demand;

  return revenue;
}

// ================================
// 6. FULL TRAINING LOOP
// ================================

export function runSimulation() {
  let strategyStats = initializeStrategyStats();

  const basePrice = 100;

  for (let i = 1; i <= 1000; i++) {

    // Step 1: Choose action
    const result = reinforcementPricing({
      basePrice,
      strategyStats
    });

    // Step 2: Simulate environment
    const demandFactor = 50 + Math.random() * 50;

    const reward = calculateReward(
      result.price,
      demandFactor
    );

    // Step 3: Learn
    strategyStats = updateStrategyStats({
      strategyStats,
      strategyType: result.strategy,
      reward
    });

    // Step 4: Log occasionally
    if (i % 100 === 0) {
      console.log(`Iteration ${i}`);
      console.log("Chosen:", result.strategy);
      console.log("Reward:", reward.toFixed(2));
      console.log("Stats:", strategyStats);
      console.log("---------------------------");
    }
  }

  console.log("FINAL LEARNED STRATEGY STATS:");
  console.log(strategyStats);

  return strategyStats;
}

// ================================
// 7. RUN THE SYSTEM
// ================================

runSimulation();