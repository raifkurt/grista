/**
 * Hedonic Pricing Model for Real Estate Valuation
 * OLS regression with Gaussian elimination (partial pivoting).
 * Istanbul district premiums, Athens zone premiums included.
 * Produces marginal price per feature, R², adjusted R², prediction intervals.
 */

export interface Property {
  area: number;        // m²
  rooms: number;
  age: number;         // years
  floor: number;
  hasParking: boolean;
  hasElevator: boolean;
  hasPool: boolean;
  distanceToCenter: number; // km
  distanceToMetro: number;  // km
  viewScore: number;   // 0-10
  district: string;
  city: 'istanbul' | 'athens';
}

export interface ValuationResult {
  estimatedValue: number;
  lower95: number;
  upper95: number;
  pricePerSqm: number;
  featureContributions: { feature: string; value: number; contribution: number; sign: string }[];
  r2: number;
  adjustedR2: number;
  locationPremium: number;
  districtAvgPricePerSqm: number;
}

// Istanbul district base prices (TRY/m², approximate 2025-2026)
const ISTANBUL_DISTRICT_PRICES: Record<string, number> = {
  'Beşiktaş': 185000, 'Şişli': 165000, 'Sarıyer': 175000,
  'Kadıköy': 155000, 'Üsküdar': 130000, 'Beyoğlu': 140000,
  'Fatih': 120000, 'Eyüpsultan': 105000, 'Bağcılar': 78000,
  'Esenyurt': 68000, 'Bahçelievler': 88000, 'Pendik': 92000,
  'Maltepe': 115000, 'Kartal': 98000, 'Ataşehir': 145000,
  'Bakırköy': 160000, 'Zeytinburnu': 100000, 'Sultangazi': 72000,
};

// Athens zone base prices (EUR/m²)
const ATHENS_DISTRICT_PRICES: Record<string, number> = {
  'Kolonaki': 5800, 'Glyfada': 4200, 'Voula': 4500,
  'Kifisia': 4000, 'Maroussi': 3200, 'Chalandri': 2800,
  'Piraeus': 2200, 'Kallithea': 2400, 'Nea Smyrni': 3000,
  'Pagkrati': 3400, 'Exarcheia': 2600, 'Psyrri': 2900,
};

function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  const aug: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) continue;

    for (let row = col + 1; row < n; row++) {
      const f = aug[row][col] / pivot;
      for (let k = col; k <= n; k++) aug[row][k] -= f * aug[col][k];
    }
  }

  const x: number[] = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = aug[i][n];
    for (let j = i + 1; j < n; j++) x[i] -= aug[i][j] * x[j];
    x[i] /= aug[i][i] || 1;
  }
  return x;
}

export class HedonicPricingModel {
  private coefficients: number[] = [];
  private intercept: number = 0;
  private residualStd: number = 0;
  private r2: number = 0;
  private adjustedR2: number = 0;
  private n: number = 0;
  private featureNames: string[] = [
    'area', 'rooms', 'age', 'floor', 'hasParking', 'hasElevator',
    'hasPool', 'distToCenter', 'distToMetro', 'viewScore', 'locationPremium',
  ];

  private toFeatureVector(p: Property): number[] {
    const prices = p.city === 'istanbul' ? ISTANBUL_DISTRICT_PRICES : ATHENS_DISTRICT_PRICES;
    const basePrice = prices[p.district] ?? (p.city === 'istanbul' ? 100000 : 2500);
    const cityAvg = p.city === 'istanbul' ? 115000 : 3100;
    return [
      p.area,
      p.rooms,
      p.age,
      p.floor,
      p.hasParking ? 1 : 0,
      p.hasElevator ? 1 : 0,
      p.hasPool ? 1 : 0,
      p.distanceToCenter,
      p.distanceToMetro,
      p.viewScore,
      basePrice / cityAvg, // location premium ratio
    ];
  }

  fit(properties: Property[], prices: number[]): this {
    this.n = properties.length;
    const X = properties.map(p => this.toFeatureVector(p));
    const p = X[0].length;

    // Augment with intercept
    const Xaug = X.map(row => [1, ...row]);

    // Compute X'X and X'y
    const XtX: number[][] = Array.from({ length: p + 1 }, () => new Array(p + 1).fill(0));
    const Xty: number[] = new Array(p + 1).fill(0);

    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j <= p; j++) {
        for (let k = 0; k <= p; k++) XtX[j][k] += Xaug[i][j] * Xaug[i][k];
        Xty[j] += Xaug[i][j] * prices[i];
      }
    }

    const beta = solveLinearSystem(XtX, Xty);
    this.intercept = beta[0];
    this.coefficients = beta.slice(1);

    // Compute R²
    const yMean = prices.reduce((a, b) => a + b, 0) / this.n;
    const ssTot = prices.reduce((s, y) => s + (y - yMean) ** 2, 0);
    const residuals = properties.map((prop, i) => prices[i] - this.estimate(prop));
    const ssRes = residuals.reduce((s, r) => s + r ** 2, 0);

    this.r2 = 1 - ssRes / (ssTot || 1);
    this.adjustedR2 = 1 - (1 - this.r2) * (this.n - 1) / (this.n - p - 1);
    this.residualStd = Math.sqrt(ssRes / (this.n - p - 1));

    return this;
  }

  estimate(property: Property): number {
    const features = this.toFeatureVector(property);
    return this.intercept + features.reduce((sum, f, i) => sum + f * (this.coefficients[i] ?? 0), 0);
  }

  value(property: Property): ValuationResult {
    const prices = property.city === 'istanbul' ? ISTANBUL_DISTRICT_PRICES : ATHENS_DISTRICT_PRICES;
    const cityAvg = property.city === 'istanbul' ? 115000 : 3100;
    const basePrice = prices[property.district] ?? cityAvg;
    const features = this.toFeatureVector(property);
    const estimate = this.intercept + features.reduce((s, f, i) => s + f * (this.coefficients[i] ?? 0), 0);

    const contributions = this.featureNames.map((name, i) => ({
      feature: name,
      value: features[i],
      contribution: features[i] * (this.coefficients[i] ?? 0),
      sign: (this.coefficients[i] ?? 0) >= 0 ? '+' : '-',
    })).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    return {
      estimatedValue: estimate,
      lower95: estimate - 1.96 * this.residualStd,
      upper95: estimate + 1.96 * this.residualStd,
      pricePerSqm: estimate / property.area,
      featureContributions: contributions,
      r2: this.r2,
      adjustedR2: this.adjustedR2,
      locationPremium: basePrice / cityAvg,
      districtAvgPricePerSqm: basePrice,
    };
  }

  /** Generate training data synthetically */
  static generateTrainingData(n: number, city: 'istanbul' | 'athens'): {
    properties: Property[];
    prices: number[];
  } {
    const istDistricts = Object.keys(ISTANBUL_DISTRICT_PRICES);
    const athDistricts = Object.keys(ATHENS_DISTRICT_PRICES);
    const districts = city === 'istanbul' ? istDistricts : athDistricts;
    const basePrices = city === 'istanbul' ? ISTANBUL_DISTRICT_PRICES : ATHENS_DISTRICT_PRICES;
    const properties: Property[] = [];
    const prices: number[] = [];

    const noise = () => (Math.random() - 0.5) * 0.15; // ±15% noise

    for (let i = 0; i < n; i++) {
      const district = districts[Math.floor(Math.random() * districts.length)];
      const area = 45 + Math.random() * 250;
      const rooms = Math.max(1, Math.round(area / 35 + (Math.random() - 0.5) * 2));
      const age = Math.floor(Math.random() * 40);
      const hasParking = Math.random() > 0.5;
      const hasElevator = Math.random() > 0.4;
      const hasPool = Math.random() > 0.85;
      const floor = Math.floor(Math.random() * 15) + 1;
      const distToCenter = 1 + Math.random() * 20;
      const distToMetro = Math.random() * 3;
      const viewScore = Math.random() * 10;

      const prop: Property = {
        area, rooms, age, floor, hasParking, hasElevator, hasPool,
        distanceToCenter: distToCenter, distanceToMetro: distToMetro,
        viewScore, district, city,
      };

      const basePerSqm = basePrices[district];
      const agePenalty = Math.max(0, 1 - age * 0.01);
      const floorBonus = 1 + floor * 0.005;
      const parkingBonus = hasParking ? 1.05 : 1;
      const poolBonus = hasPool ? 1.08 : 1;
      const metroBonus = Math.max(0.9, 1 - distToMetro * 0.03);
      const viewBonus = 1 + viewScore * 0.015;

      const price = area * basePerSqm * agePenalty * floorBonus * parkingBonus * poolBonus * metroBonus * viewBonus * (1 + noise());

      properties.push(prop);
      prices.push(price);
    }

    return { properties, prices };
  }
}
