let _idCounter = 0;
export function generateId(): string {
  return `${Date.now()}-${++_idCounter}`;
}

/** Geometric Brownian Motion path */
export function gbm(S0: number, mu: number, sigma: number, steps: number, dt = 1): number[] {
  const path = [S0];
  let S = S0;
  for (let i = 0; i < steps; i++) {
    const z = Math.sqrt(-2 * Math.log(Math.random() + 1e-15)) * Math.cos(2 * Math.PI * Math.random());
    S = S * Math.exp((mu - 0.5 * sigma ** 2) * dt + sigma * Math.sqrt(dt) * z);
    path.push(Math.max(0, S));
  }
  return path;
}

/** Ornstein-Uhlenbeck (mean-reverting) process */
export function ou(X0: number, theta: number, mu: number, sigma: number, steps: number, dt = 1): number[] {
  const path = [X0];
  let X = X0;
  for (let i = 0; i < steps; i++) {
    const z = Math.sqrt(-2 * Math.log(Math.random() + 1e-15)) * Math.cos(2 * Math.PI * Math.random());
    X = X + theta * (mu - X) * dt + sigma * Math.sqrt(dt) * z;
    path.push(X);
  }
  return path;
}

/** Format large numbers */
export function fmt(n: number, decimals = 0): string {
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(decimals) + 'B';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(decimals) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(decimals) + 'K';
  return n.toFixed(decimals);
}

export function fmtCurrency(n: number, currency = '₺'): string {
  return `${currency}${fmt(n, 0)}`;
}

export function fmtPct(n: number, decimals = 1): string {
  return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(decimals)}%`;
}

/** Seeded pseudo-random for reproducible demos */
export class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xffffffff;
    return ((this.seed >>> 0) / 0xffffffff);
  }
}

/** Rolling statistics */
export function rollingMean(series: number[], window: number): number[] {
  return series.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = series.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

export function rollingStd(series: number[], window: number): number[] {
  const means = rollingMean(series, window);
  return series.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = series.slice(start, i + 1);
    const m = means[i];
    return Math.sqrt(slice.reduce((s, v) => s + (v - m) ** 2, 0) / slice.length);
  });
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Days between dates */
export function daysBetween(a: Date, b: Date): number {
  return Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
}

/** Generate date labels going back N days */
export function pastDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }));
  }
  return dates;
}
