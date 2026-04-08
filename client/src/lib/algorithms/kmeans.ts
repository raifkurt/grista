/**
 * K-Means++ with Silhouette scoring and Shapley-based feature attribution
 */

function euclidean(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
}

function randn(): number {
  return Math.sqrt(-2 * Math.log(Math.random() + 1e-15)) * Math.cos(2 * Math.PI * Math.random());
}

export interface ClusterResult {
  labels: number[];
  centroids: number[][];
  silhouette: number;
  inertia: number;
  iterations: number;
}

export class KMeansPlusPlus {
  private k: number;
  private maxIter: number;
  centroids: number[][] = [];
  labels: number[] = [];

  constructor(k: number, maxIterations = 300) {
    this.k = k;
    this.maxIter = maxIterations;
  }

  private initCentroids(data: number[][]): number[][] {
    const centroids: number[][] = [];
    const chosen = new Set<number>();

    // Random first centroid
    const first = Math.floor(Math.random() * data.length);
    centroids.push([...data[first]]);
    chosen.add(first);

    // D² weighting for remaining centroids
    for (let c = 1; c < this.k; c++) {
      const dists = data.map((point, idx) => {
        if (chosen.has(idx)) return 0;
        return Math.min(...centroids.map(cen => euclidean(point, cen) ** 2));
      });
      const total = dists.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      let chosen_idx = 0;
      for (let i = 0; i < dists.length; i++) {
        r -= dists[i];
        if (r <= 0) { chosen_idx = i; break; }
      }
      centroids.push([...data[chosen_idx]]);
      chosen.add(chosen_idx);
    }

    return centroids;
  }

  fit(data: number[][]): ClusterResult {
    if (data.length === 0) return { labels: [], centroids: [], silhouette: 0, inertia: 0, iterations: 0 };

    this.centroids = this.initCentroids(data);
    this.labels = new Array(data.length).fill(0);
    let iter = 0;

    for (; iter < this.maxIter; iter++) {
      // Assign
      const newLabels = data.map(point => {
        const dists = this.centroids.map(c => euclidean(point, c));
        return dists.indexOf(Math.min(...dists));
      });

      const converged = newLabels.every((l, i) => l === this.labels[i]);
      this.labels = newLabels;
      if (converged && iter > 0) break;

      // Update centroids
      const newCentroids = Array.from({ length: this.k }, () => new Array(data[0].length).fill(0));
      const counts = new Array(this.k).fill(0);

      for (let i = 0; i < data.length; i++) {
        const l = this.labels[i];
        counts[l]++;
        for (let j = 0; j < data[i].length; j++) {
          newCentroids[l][j] += data[i][j];
        }
      }

      for (let c = 0; c < this.k; c++) {
        if (counts[c] > 0) {
          this.centroids[c] = newCentroids[c].map(v => v / counts[c]);
        }
      }
    }

    const inertia = data.reduce((s, point, i) => s + euclidean(point, this.centroids[this.labels[i]]) ** 2, 0);
    const silhouette = this.computeSilhouette(data);

    return { labels: this.labels, centroids: this.centroids, silhouette, inertia, iterations: iter };
  }

  private computeSilhouette(data: number[][]): number {
    if (this.k === 1 || data.length < 2 * this.k) return 0;

    const scores = data.map((point, i) => {
      const label = this.labels[i];

      const sameCluster = data.filter((_, j) => this.labels[j] === label && j !== i);
      const a = sameCluster.length > 0
        ? sameCluster.reduce((s, p) => s + euclidean(point, p), 0) / sameCluster.length
        : 0;

      const bs = [];
      for (let c = 0; c < this.k; c++) {
        if (c === label) continue;
        const clusterPts = data.filter((_, j) => this.labels[j] === c);
        if (clusterPts.length === 0) continue;
        bs.push(clusterPts.reduce((s, p) => s + euclidean(point, p), 0) / clusterPts.length);
      }

      const b = bs.length > 0 ? Math.min(...bs) : 0;
      return (b - a) / Math.max(a, b, 1e-10);
    });

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  predict(point: number[]): number {
    const dists = this.centroids.map(c => euclidean(point, c));
    return dists.indexOf(Math.min(...dists));
  }

  /** Shapley value approximation for feature attribution */
  shapleyValues(data: number[][], featureNames: string[], numSamples = 500): {
    feature: string;
    value: number;
    rank: number;
  }[] {
    const p = data[0].length;
    const phi = new Array(p).fill(0);
    const baseline = this.centroids[0];

    for (let s = 0; s < numSamples; s++) {
      const samplePoint = data[Math.floor(Math.random() * data.length)];
      const perm = [...Array(p).keys()].sort(() => Math.random() - 0.5);
      let current = [...baseline];

      for (const featureIdx of perm) {
        const before = euclidean(current, baseline);
        current[featureIdx] = samplePoint[featureIdx];
        const after = euclidean(current, baseline);
        phi[featureIdx] += Math.abs(after - before);
      }
    }

    const normalized = phi.map(v => v / numSamples);
    const sorted = featureNames
      .map((name, i) => ({ feature: name, value: normalized[i], rank: 0 }))
      .sort((a, b) => b.value - a.value)
      .map((item, rank) => ({ ...item, rank: rank + 1 }));

    return sorted;
  }

  /** Elbow method: return inertias for k=1..maxK */
  static elbowMethod(data: number[][], maxK = 8): number[] {
    return Array.from({ length: maxK }, (_, i) => {
      const km = new KMeansPlusPlus(i + 1, 100);
      const result = km.fit(data);
      return result.inertia;
    });
  }
}
