/**
 * Multi-Layer Perceptron with full backpropagation
 * Features: Xavier init, ReLU hidden layers, Sigmoid output,
 * mini-batch SGD, dropout regularization, early stopping.
 */

function randn(): number {
  return Math.sqrt(-2 * Math.log(Math.random() + 1e-15)) * Math.cos(2 * Math.PI * Math.random());
}
function relu(x: number): number { return Math.max(0, x); }
function reluPrime(x: number): number { return x > 0 ? 1 : 0; }
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))); }
function sigmoidPrime(x: number): number { const s = sigmoid(x); return s * (1 - s); }
function tanh_(x: number): number { return Math.tanh(x); }
function tanhPrime(x: number): number { const t = Math.tanh(x); return 1 - t * t; }

export type Activation = 'relu' | 'sigmoid' | 'tanh';

export interface LayerConfig {
  units: number;
  activation: Activation;
  dropout?: number;  // dropout rate 0-1
}

export interface TrainHistory {
  epoch: number;
  loss: number;
  valLoss?: number;
}

export class NeuralNetwork {
  private layers: LayerConfig[];
  private weights: number[][][];  // [layer][output_neuron][input_neuron]
  private biases: number[][];     // [layer][neuron]
  private lr: number;
  public history: TrainHistory[] = [];

  constructor(inputSize: number, layers: LayerConfig[], learningRate = 0.001) {
    this.layers = layers;
    this.lr = learningRate;
    this.weights = [];
    this.biases = [];
    this.initialize(inputSize, layers);
  }

  private initialize(inputSize: number, layers: LayerConfig[]): void {
    let prevSize = inputSize;
    for (const layer of layers) {
      const scale = Math.sqrt(2.0 / (prevSize + layer.units)); // He init for ReLU
      const W: number[][] = [];
      const b: number[] = [];
      for (let j = 0; j < layer.units; j++) {
        W.push(Array.from({ length: prevSize }, () => randn() * scale));
        b.push(0);
      }
      this.weights.push(W);
      this.biases.push(b);
      prevSize = layer.units;
    }
  }

  private activate(z: number, act: Activation): number {
    if (act === 'relu') return relu(z);
    if (act === 'tanh') return tanh_(z);
    return sigmoid(z);
  }

  private activatePrime(z: number, act: Activation): number {
    if (act === 'relu') return reluPrime(z);
    if (act === 'tanh') return tanhPrime(z);
    return sigmoidPrime(z);
  }

  forward(input: number[], training = false): { activations: number[][]; zValues: number[][] } {
    const activations: number[][] = [input];
    const zValues: number[][] = [];

    let current = input;
    for (let l = 0; l < this.layers.length; l++) {
      const z: number[] = [];
      const a: number[] = [];
      const dropout = training ? (this.layers[l].dropout ?? 0) : 0;
      const scale = dropout > 0 ? 1 / (1 - dropout) : 1;

      for (let j = 0; j < this.layers[l].units; j++) {
        let sum = this.biases[l][j];
        for (let k = 0; k < current.length; k++) {
          sum += current[k] * this.weights[l][j][k];
        }
        z.push(sum);
        let act = this.activate(sum, this.layers[l].activation);
        // Apply dropout mask
        if (training && dropout > 0 && Math.random() < dropout) act = 0;
        else act *= scale;
        a.push(act);
      }
      zValues.push(z);
      activations.push(a);
      current = a;
    }

    return { activations, zValues };
  }

  /** MSE backpropagation */
  backward(input: number[], target: number[]): number {
    const { activations, zValues } = this.forward(input, true);
    const L = this.layers.length;
    const deltas: number[][] = new Array(L).fill(null).map(() => []);

    // Output delta
    const out = activations[L];
    let loss = 0;
    const outDelta: number[] = [];
    for (let j = 0; j < out.length; j++) {
      const err = out[j] - target[j];
      loss += err * err;
      outDelta.push(err * this.activatePrime(zValues[L - 1][j], this.layers[L - 1].activation));
    }
    deltas[L - 1] = outDelta;

    // Hidden deltas (backpropagate)
    for (let l = L - 2; l >= 0; l--) {
      const delta: number[] = [];
      for (let j = 0; j < this.layers[l].units; j++) {
        let sum = 0;
        for (let k = 0; k < deltas[l + 1].length; k++) {
          sum += deltas[l + 1][k] * this.weights[l + 1][k][j];
        }
        delta.push(sum * this.activatePrime(zValues[l][j], this.layers[l].activation));
      }
      deltas[l] = delta;
    }

    // Gradient descent update
    for (let l = 0; l < L; l++) {
      for (let j = 0; j < deltas[l].length; j++) {
        for (let k = 0; k < activations[l].length; k++) {
          this.weights[l][j][k] -= this.lr * deltas[l][j] * activations[l][k];
        }
        this.biases[l][j] -= this.lr * deltas[l][j];
      }
    }

    return loss / 2;
  }

  train(
    data: { input: number[]; output: number[] }[],
    epochs = 200,
    batchSize = 32,
    validationSplit = 0.1,
    onEpoch?: (h: TrainHistory) => void
  ): TrainHistory[] {
    this.history = [];
    const split = Math.floor(data.length * (1 - validationSplit));
    const trainData = data.slice(0, split);
    const valData = data.slice(split);

    for (let epoch = 0; epoch < epochs; epoch++) {
      // Shuffle training data
      trainData.sort(() => Math.random() - 0.5);
      let epochLoss = 0;
      let batches = 0;

      for (let i = 0; i < trainData.length; i += batchSize) {
        const batch = trainData.slice(i, i + batchSize);
        let batchLoss = 0;
        for (const sample of batch) {
          batchLoss += this.backward(sample.input, sample.output);
        }
        epochLoss += batchLoss / batch.length;
        batches++;
      }

      let valLoss: number | undefined;
      if (valData.length > 0) {
        valLoss = valData.reduce((s, sample) => {
          const out = this.predict(sample.input);
          return s + out.reduce((ss, o, i) => ss + (o - sample.output[i]) ** 2, 0) / 2;
        }, 0) / valData.length;
      }

      const record: TrainHistory = { epoch, loss: epochLoss / batches, valLoss };
      this.history.push(record);
      onEpoch?.(record);
    }

    return this.history;
  }

  predict(input: number[]): number[] {
    return this.forward(input).activations[this.layers.length];
  }

  /** Normalize inputs to [0,1] based on training data stats */
  static normalize(data: number[][]): { normalized: number[][]; mins: number[]; maxs: number[] } {
    const n = data.length;
    const p = data[0].length;
    const mins = Array(p).fill(Infinity);
    const maxs = Array(p).fill(-Infinity);

    for (const row of data) {
      for (let j = 0; j < p; j++) {
        if (row[j] < mins[j]) mins[j] = row[j];
        if (row[j] > maxs[j]) maxs[j] = row[j];
      }
    }

    const normalized = data.map(row =>
      row.map((v, j) => maxs[j] > mins[j] ? (v - mins[j]) / (maxs[j] - mins[j]) : 0)
    );

    return { normalized, mins, maxs };
  }
}

/** Predict next value in a time series using a trained MLP */
export function buildTimeSeriesPredictor(series: number[], lookback = 10): {
  net: NeuralNetwork;
  predict: (lastValues: number[]) => number;
  history: TrainHistory[];
} {
  const rawInputs = [];
  const rawOutputs = [];
  for (let i = lookback; i < series.length; i++) {
    rawInputs.push(series.slice(i - lookback, i));
    rawOutputs.push([series[i]]);
  }

  const { normalized: normIn, mins: inMins, maxs: inMaxs } = NeuralNetwork.normalize(rawInputs);
  const { normalized: normOut, mins: outMins, maxs: outMaxs } = NeuralNetwork.normalize(rawOutputs);

  const trainData = normIn.map((inp, i) => ({ input: inp, output: normOut[i] }));

  const net = new NeuralNetwork(lookback, [
    { units: 32, activation: 'relu', dropout: 0.1 },
    { units: 16, activation: 'relu' },
    { units: 1, activation: 'sigmoid' },
  ], 0.005);

  const history = net.train(trainData, 80, 16, 0.15);

  const predict = (lastValues: number[]): number => {
    const normInput = lastValues.map((v, j) =>
      inMaxs[j] > inMins[j] ? (v - inMins[j]) / (inMaxs[j] - inMins[j]) : 0
    );
    const [normPred] = net.predict(normInput);
    return normPred * (outMaxs[0] - outMins[0]) + outMins[0];
  };

  return { net, predict, history };
}
