/**
 * Isolation Forest — Anomaly detection via random partitioning
 * Reference: Liu, Fei Tony, Kai Ming Ting, and Zhi-Hua Zhou (2008)
 * "Isolation forest." ICDM.
 *
 * Average path length in a random Binary Search Tree for n elements:
 *   c(n) = 2*H(n-1) - 2*(n-1)/n   where H is harmonic number
 */

function averagePathLength(n: number): number {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  const euler = 0.5772156649015329;
  return 2 * (Math.log(n - 1) + euler) - 2 * (n - 1) / n;
}

interface INode {
  isLeaf: boolean;
  size: number;
  splitFeature: number;
  splitValue: number;
  left: INode | null;
  right: INode | null;
}

function buildTree(data: number[][], depth: number, maxDepth: number): INode {
  if (depth >= maxDepth || data.length <= 1) {
    return { isLeaf: true, size: data.length, splitFeature: 0, splitValue: 0, left: null, right: null };
  }

  const numFeatures = data[0].length;
  const feat = Math.floor(Math.random() * numFeatures);
  const values = data.map(d => d[feat]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return { isLeaf: true, size: data.length, splitFeature: feat, splitValue: min, left: null, right: null };
  }

  const split = min + Math.random() * (max - min);
  const leftData = data.filter(d => d[feat] < split);
  const rightData = data.filter(d => d[feat] >= split);

  if (leftData.length === 0 || rightData.length === 0) {
    return { isLeaf: true, size: data.length, splitFeature: feat, splitValue: split, left: null, right: null };
  }

  return {
    isLeaf: false,
    size: data.length,
    splitFeature: feat,
    splitValue: split,
    left: buildTree(leftData, depth + 1, maxDepth),
    right: buildTree(rightData, depth + 1, maxDepth),
  };
}

function pathLength(node: INode, point: number[], depth: number): number {
  if (node.isLeaf || (!node.left && !node.right)) {
    return depth + averagePathLength(node.size);
  }
  if (point[node.splitFeature] < node.splitValue && node.left) {
    return pathLength(node.left, point, depth + 1);
  }
  if (node.right) {
    return pathLength(node.right, point, depth + 1);
  }
  return depth;
}

export class IsolationForest {
  private numTrees: number;
  private sampleSize: number;
  private trees: INode[] = [];

  constructor(numTrees = 100, sampleSize = 256) {
    this.numTrees = numTrees;
    this.sampleSize = sampleSize;
  }

  fit(data: number[][]): this {
    const maxDepth = Math.ceil(Math.log2(this.sampleSize));
    this.trees = [];
    for (let i = 0; i < this.numTrees; i++) {
      const sample = data
        .map(d => ({ d, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .slice(0, this.sampleSize)
        .map(x => x.d);
      this.trees.push(buildTree(sample, 0, maxDepth));
    }
    return this;
  }

  /**
   * Anomaly score in [0,1]. Scores > 0.6 are anomalous.
   */
  score(point: number[]): number {
    if (this.trees.length === 0) return 0.5;
    const avgPath = this.trees.reduce((s, t) => s + pathLength(t, point, 0), 0) / this.trees.length;
    return Math.pow(2, -avgPath / averagePathLength(this.sampleSize));
  }

  scoreAll(data: number[][]): { scores: number[]; isAnomaly: boolean[]; threshold: number } {
    const scores = data.map(p => this.score(p));
    const sorted = [...scores].sort((a, b) => a - b);
    const threshold = sorted[Math.floor(sorted.length * 0.9)] ?? 0.6;
    const isAnomaly = scores.map(s => s > threshold);
    return { scores, isAnomaly, threshold };
  }

  /** Fit a 1-D series as a sliding window of features */
  static fitSeries(series: number[], windowSize = 3): {
    scores: number[];
    isAnomaly: boolean[];
    threshold: number;
  } {
    const data: number[][] = [];
    for (let i = windowSize; i < series.length; i++) {
      const window = series.slice(i - windowSize, i + 1);
      const mean = window.reduce((a, b) => a + b) / window.length;
      const std = Math.sqrt(window.reduce((s, x) => s + (x - mean) ** 2, 0) / window.length);
      const returns = [];
      for (let j = 1; j < window.length; j++) {
        returns.push((window[j] - window[j - 1]) / (Math.abs(window[j - 1]) + 1e-9));
      }
      data.push([window[window.length - 1], mean, std, ...returns]);
    }
    const forest = new IsolationForest(100, Math.min(256, data.length));
    forest.fit(data);
    const result = forest.scoreAll(data);
    // Pad front to align with original series
    return {
      scores: [...new Array(windowSize).fill(0.5), ...result.scores],
      isAnomaly: [...new Array(windowSize).fill(false), ...result.isAnomaly],
      threshold: result.threshold,
    };
  }
}
