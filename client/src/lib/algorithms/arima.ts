/**
 * ARIMA (AutoRegressive Integrated Moving Average)
 * Full implementation with Yule-Walker parameter estimation via Levinson-Durbin recursion
 * Supports differencing, forecasting with confidence intervals
 */
export class ARIMA {
  private p: number;
  private d: number;
  private q: number;
  private arCoeffs: number[] = [];
  private maCoeffs: number[] = [];
  private residuals: number[] = [];
  private fitted: number[] = [];
  private mean: number = 0;
  private originalSeries: number[] = [];

  constructor(p: number, d: number, q: number) {
    this.p = p;
    this.d = d;
    this.q = q;
  }

  private difference(series: number[], order: number): number[] {
    let diff = [...series];
    for (let i = 0; i < order; i++) {
      const next: number[] = [];
      for (let j = 1; j < diff.length; j++) {
        next.push(diff[j] - diff[j - 1]);
      }
      diff = next;
    }
    return diff;
  }

  private undifference(diffs: number[], original: number[], order: number): number[] {
    let result = [...diffs];
    for (let i = order - 1; i >= 0; i--) {
      const seed = original[original.length - order + i];
      const restored: number[] = [];
      let prev = seed;
      for (const d of result) {
        prev = prev + d;
        restored.push(prev);
      }
      result = restored;
    }
    return result;
  }

  /** Levinson-Durbin recursion for Yule-Walker AR estimation */
  private levinsonDurbin(acf: number[], order: number): number[] {
    const phi: number[][] = Array.from({ length: order + 1 }, () => new Array(order + 1).fill(0));
    const sigma: number[] = new Array(order + 1).fill(0);
    sigma[0] = acf[0];

    phi[1][1] = acf[1] / acf[0];
    sigma[1] = sigma[0] * (1 - phi[1][1] ** 2);

    for (let m = 2; m <= order; m++) {
      let num = acf[m];
      for (let j = 1; j < m; j++) {
        num -= phi[m - 1][j] * acf[m - j];
      }
      phi[m][m] = num / sigma[m - 1];
      for (let j = 1; j < m; j++) {
        phi[m][j] = phi[m - 1][j] - phi[m][m] * phi[m - 1][m - j];
      }
      sigma[m] = sigma[m - 1] * (1 - phi[m][m] ** 2);
    }

    return phi[order].slice(1, order + 1);
  }

  private computeACF(series: number[], maxLag: number): number[] {
    const n = series.length;
    const mean = series.reduce((a, b) => a + b, 0) / n;
    const centered = series.map(x => x - mean);
    const variance = centered.reduce((s, x) => s + x * x, 0) / n;

    const acf: number[] = [variance];
    for (let lag = 1; lag <= maxLag; lag++) {
      let cov = 0;
      for (let i = lag; i < n; i++) {
        cov += centered[i] * centered[i - lag];
      }
      acf.push(cov / n);
    }
    return acf;
  }

  fit(series: number[]): this {
    this.originalSeries = [...series];
    const diffed = this.difference(series, this.d);
    this.mean = diffed.reduce((a, b) => a + b, 0) / diffed.length;
    const centered = diffed.map(x => x - this.mean);

    // Estimate AR parameters
    if (this.p > 0) {
      const acf = this.computeACF(centered, this.p);
      this.arCoeffs = this.levinsonDurbin(acf, this.p);
    }

    // Compute residuals
    const n = diffed.length;
    this.residuals = new Array(this.p).fill(0);
    for (let t = this.p; t < n; t++) {
      let hat = this.mean;
      for (let i = 0; i < this.p; i++) {
        hat += this.arCoeffs[i] * (diffed[t - 1 - i] - this.mean);
      }
      this.residuals.push(diffed[t] - hat);
    }

    // Estimate MA via method of moments on residuals
    if (this.q > 0) {
      const resACF = this.computeACF(this.residuals.slice(this.p), this.q);
      const resVar = resACF[0];
      this.maCoeffs = [];
      for (let lag = 1; lag <= this.q; lag++) {
        this.maCoeffs.push(resVar > 0 ? resACF[lag] / resVar : 0);
      }
    }

    return this;
  }

  forecast(steps: number): {
    predictions: number[];
    lower95: number[];
    upper95: number[];
    lower80: number[];
    upper80: number[];
  } {
    const series = this.originalSeries;
    const diffed = this.difference(series, this.d);
    const extended = [...diffed];
    const extErrors = [...this.residuals];

    const recentRes = this.residuals.slice(-Math.min(100, this.residuals.length));
    const residualVar = recentRes.reduce((s, e) => s + e * e, 0) / recentRes.length;
    const stdDev = Math.sqrt(residualVar);

    const rawPredictions: number[] = [];

    for (let step = 0; step < steps; step++) {
      let hat = this.mean;
      for (let i = 0; i < this.p; i++) {
        const idx = extended.length - 1 - i;
        if (idx >= 0) hat += this.arCoeffs[i] * (extended[idx] - this.mean);
      }
      for (let i = 0; i < this.q; i++) {
        const idx = extErrors.length - 1 - i;
        if (idx >= 0 && this.maCoeffs[i]) hat += this.maCoeffs[i] * extErrors[idx];
      }
      extended.push(hat);
      extErrors.push(0);
      rawPredictions.push(hat);
    }

    const predictions = this.d > 0
      ? this.undifference(rawPredictions, series, this.d)
      : rawPredictions;

    const z95 = 1.96;
    const z80 = 1.282;

    return {
      predictions,
      lower95: predictions.map((p, i) => p - z95 * stdDev * Math.sqrt(i + 1)),
      upper95: predictions.map((p, i) => p + z95 * stdDev * Math.sqrt(i + 1)),
      lower80: predictions.map((p, i) => p - z80 * stdDev * Math.sqrt(i + 1)),
      upper80: predictions.map((p, i) => p + z80 * stdDev * Math.sqrt(i + 1)),
    };
  }

  get aic(): number {
    const n = this.residuals.length;
    const sigmaSquared = this.residuals.reduce((s, e) => s + e * e, 0) / n;
    const k = this.p + this.q + 1;
    return n * Math.log(sigmaSquared) + 2 * k;
  }
}
