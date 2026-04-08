/**
 * Kalman Filter — Optimal linear state estimator
 * Implements the classic discrete-time Kalman filter for 1-D time series
 * smoothing and multi-step ahead prediction.
 */
export class KalmanFilter {
  private R: number; // measurement noise covariance
  private Q: number; // process noise covariance
  private x: number = 0; // state estimate
  private P: number = 1; // estimate error covariance
  private K: number = 0; // Kalman gain

  constructor(measurementNoise = 1.0, processNoise = 0.01) {
    this.R = measurementNoise;
    this.Q = processNoise;
  }

  /** Reset internal state */
  reset(initialValue: number): void {
    this.x = initialValue;
    this.P = 1.0;
  }

  /** Single update step */
  update(measurement: number): number {
    // Predict
    const P_pred = this.P + this.Q;
    // Update
    this.K = P_pred / (P_pred + this.R);
    this.x = this.x + this.K * (measurement - this.x);
    this.P = (1 - this.K) * P_pred;
    return this.x;
  }

  /** Filter an entire series — returns smoothed values */
  filter(measurements: number[]): { smoothed: number[]; gains: number[] } {
    if (measurements.length === 0) return { smoothed: [], gains: [] };
    this.reset(measurements[0]);
    const smoothed: number[] = [this.x];
    const gains: number[] = [0];
    for (let i = 1; i < measurements.length; i++) {
      smoothed.push(this.update(measurements[i]));
      gains.push(this.K);
    }
    return { smoothed, gains };
  }

  /** Predict n steps ahead (no new measurements) */
  predictAhead(measurements: number[], steps: number): number[] {
    this.filter(measurements);
    const predictions: number[] = [];
    for (let i = 0; i < steps; i++) {
      // Pure prediction: drift the state with no measurement correction
      this.P = this.P + this.Q;
      predictions.push(this.x);
    }
    return predictions;
  }

  /** Adaptive Kalman: auto-tune R/Q using innovation monitoring */
  static adaptive(measurements: number[], windowSize = 20): {
    smoothed: number[];
    adaptiveR: number[];
  } {
    const kf = new KalmanFilter(1.0, 0.01);
    kf.reset(measurements[0]);
    const smoothed: number[] = [measurements[0]];
    const adaptiveR: number[] = [1.0];
    const innovations: number[] = [0];

    for (let i = 1; i < measurements.length; i++) {
      // Innovation
      const innov = measurements[i] - kf.x;
      innovations.push(innov);

      // Update R adaptively using recent innovation variance
      if (i >= windowSize) {
        const window = innovations.slice(i - windowSize, i);
        const innovVar = window.reduce((s, e) => s + e * e, 0) / windowSize;
        kf.R = Math.max(0.01, innovVar - kf.P);
      }

      smoothed.push(kf.update(measurements[i]));
      adaptiveR.push(kf.R);
    }

    return { smoothed, adaptiveR };
  }
}
