/**
 * Monte Carlo Simulation Engine
 * - Geometric Brownian Motion for price paths
 * - Value at Risk (VaR) and Conditional VaR (CVaR / Expected Shortfall)
 * - Real estate investment projection with rent yield
 * - Box-Muller transform for correlated random normals
 */

/** Box-Muller transform — standard normal sample */
function randn(): number {
  const u1 = Math.random() + 1e-15;
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** Cholesky decomposition for correlated GBM */
function cholesky(matrix: number[][]): number[][] {
  const n = matrix.length;
  const L: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
      L[i][j] = i === j
        ? Math.sqrt(Math.max(0, matrix[i][i] - sum))
        : (matrix[i][j] - sum) / (L[j][j] + 1e-15);
    }
  }
  return L;
}

export interface GBMResult {
  paths: number[][];        // [numSims][steps+1]
  finalValues: number[];    // terminal values
  mean: number;
  median: number;
  p5: number;
  p25: number;
  p75: number;
  p95: number;
  var95: number;
  cvar95: number;
  sharpe: number;
  maxDrawdown: number;
}

export class MonteCarloEngine {
  private numSims: number;

  constructor(numSimulations = 5000) {
    this.numSims = numSimulations;
  }

  /**
   * Simulate asset paths via GBM.
   * @param S0 initial price
   * @param mu annual drift
   * @param sigma annual volatility
   * @param T years
   * @param steps number of time steps
   */
  simulateGBM(S0: number, mu: number, sigma: number, T: number, steps: number): GBMResult {
    const dt = T / steps;
    const paths: number[][] = [];
    const finalValues: number[] = [];

    for (let s = 0; s < this.numSims; s++) {
      const path: number[] = [S0];
      let S = S0;
      let peak = S0;
      let maxDD = 0;

      for (let t = 0; t < steps; t++) {
        const z = randn();
        S = S * Math.exp((mu - 0.5 * sigma ** 2) * dt + sigma * Math.sqrt(dt) * z);
        S = Math.max(0, S);
        path.push(S);
        if (S > peak) peak = S;
        const dd = (peak - S) / peak;
        if (dd > maxDD) maxDD = dd;
      }

      paths.push(path);
      finalValues.push(S);
    }

    finalValues.sort((a, b) => a - b);
    const n = finalValues.length;

    const pct = (p: number) => finalValues[Math.floor(p * n)];
    const mean = finalValues.reduce((a, b) => a + b, 0) / n;
    const median = pct(0.5);
    const p5 = pct(0.05);
    const p95 = pct(0.95);
    const var95 = S0 - p5;
    const cvar95 = S0 - finalValues.slice(0, Math.floor(0.05 * n)).reduce((a, b) => a + b, 0) / Math.floor(0.05 * n);
    const annualReturn = (mean - S0) / S0;
    const returns = finalValues.map(v => (v - S0) / S0);
    const retStd = Math.sqrt(returns.reduce((s, r) => s + (r - annualReturn) ** 2, 0) / n);
    const sharpe = (annualReturn - 0.05) / (retStd + 1e-9);
    const maxDrawdown = paths.reduce((maxDD, path) => {
      let peak = path[0], dd = 0;
      for (const v of path) {
        if (v > peak) peak = v;
        dd = Math.max(dd, (peak - v) / peak);
      }
      return Math.max(maxDD, dd);
    }, 0);

    return {
      paths: paths.slice(0, 200), // return sample paths
      finalValues,
      mean,
      median,
      p5,
      p25: pct(0.25),
      p75: pct(0.75),
      p95,
      var95,
      cvar95,
      sharpe,
      maxDrawdown,
    };
  }

  /**
   * Real estate investment projection (includes rental yield).
   */
  projectRealEstate(params: {
    initialValue: number;   // TRY or EUR
    annualAppreciation: number;
    appreciationVol: number;
    rentalYield: number;
    rentalGrowth: number;
    rentalVol: number;
    years: number;
    taxRate: number;
    maintenancePct: number;
  }): {
    totalReturn: GBMResult;
    cashflows: number[][];
    irr: number;
    roiByYear: number[];
  } {
    const { initialValue, annualAppreciation, appreciationVol, rentalYield,
      rentalGrowth, rentalVol, years, taxRate, maintenancePct } = params;

    const cashflows: number[][] = [];
    const finalReturns: number[] = [];

    for (let s = 0; s < Math.min(this.numSims, 2000); s++) {
      const yearCashflows: number[] = [-initialValue];
      let propertyValue = initialValue;
      let rent = initialValue * rentalYield;

      for (let y = 1; y <= years; y++) {
        const appreciationShock = randn();
        const rentalShock = randn();
        propertyValue *= (1 + annualAppreciation + appreciationVol * appreciationShock);
        rent *= (1 + rentalGrowth + rentalVol * rentalShock);
        const grossRent = Math.max(0, rent);
        const netRent = grossRent * (1 - taxRate) - propertyValue * maintenancePct;
        yearCashflows.push(netRent);
      }

      yearCashflows[years] += Math.max(0, propertyValue);
      cashflows.push(yearCashflows);
      finalReturns.push(propertyValue + yearCashflows.slice(1).reduce((a, b) => a + b, 0) - initialValue);
    }

    finalReturns.sort((a, b) => a - b);
    const n = finalReturns.length;
    const mean = finalReturns.reduce((a, b) => a + b, 0) / n;
    const annualReturn = annualAppreciation + rentalYield;
    const vol = appreciationVol;

    const totalReturn: GBMResult = {
      paths: [],
      finalValues: finalReturns,
      mean,
      median: finalReturns[Math.floor(n * 0.5)],
      p5: finalReturns[Math.floor(n * 0.05)],
      p25: finalReturns[Math.floor(n * 0.25)],
      p75: finalReturns[Math.floor(n * 0.75)],
      p95: finalReturns[Math.floor(n * 0.95)],
      var95: -finalReturns[Math.floor(n * 0.05)],
      cvar95: -finalReturns.slice(0, Math.floor(n * 0.05)).reduce((a, b) => a + b, 0) / Math.floor(n * 0.05),
      sharpe: (annualReturn - 0.05) / (vol + 1e-9),
      maxDrawdown: 0,
    };

    // Newton-Raphson IRR approximation on median cashflow
    const medCFs = cashflows[Math.floor(n * 0.5)] ?? cashflows[0];
    const irr = this.computeIRR(medCFs);
    const roiByYear = medCFs.slice(1).map((cf, i) => {
      const cumulative = medCFs.slice(1, i + 2).reduce((a, b) => a + b, 0);
      return cumulative / initialValue;
    });

    return { totalReturn, cashflows: cashflows.slice(0, 50), irr, roiByYear };
  }

  private computeIRR(cashflows: number[], maxIter = 100): number {
    let rate = 0.1;
    for (let iter = 0; iter < maxIter; iter++) {
      let npv = 0, dnpv = 0;
      for (let t = 0; t < cashflows.length; t++) {
        const discount = Math.pow(1 + rate, t);
        npv += cashflows[t] / discount;
        dnpv -= t * cashflows[t] / (discount * (1 + rate));
      }
      if (Math.abs(dnpv) < 1e-10) break;
      const newRate = rate - npv / dnpv;
      if (Math.abs(newRate - rate) < 1e-7) { rate = newRate; break; }
      rate = Math.max(-0.99, Math.min(10, newRate));
    }
    return rate;
  }

  /** Correlated multi-asset simulation using Cholesky decomposition */
  simulateCorrelated(assets: { name: string; S0: number; mu: number; sigma: number }[],
    correlationMatrix: number[][], T: number, steps: number): {
    assetPaths: { name: string; path: number[] }[][];
    portfolioValue: number[];
  } {
    const L = cholesky(correlationMatrix);
    const n = assets.length;
    const dt = T / steps;
    const allPaths: { name: string; path: number[] }[][] = [];
    const portfolioFinal: number[] = [];

    for (let s = 0; s < Math.min(this.numSims, 500); s++) {
      const paths = assets.map(a => ({ name: a.name, path: [a.S0] }));
      const S = assets.map(a => a.S0);

      for (let t = 0; t < steps; t++) {
        const z = assets.map(() => randn());
        const correlated = Array(n).fill(0).map((_, i) =>
          L[i].reduce((sum, lij, j) => sum + lij * z[j], 0)
        );
        for (let i = 0; i < n; i++) {
          S[i] = S[i] * Math.exp((assets[i].mu - 0.5 * assets[i].sigma ** 2) * dt + assets[i].sigma * Math.sqrt(dt) * correlated[i]);
          S[i] = Math.max(0, S[i]);
          paths[i].path.push(S[i]);
        }
      }

      allPaths.push(paths);
      portfolioFinal.push(S.reduce((a, b) => a + b, 0) / n);
    }

    return { assetPaths: allPaths.slice(0, 100), portfolioValue: portfolioFinal };
  }
}
