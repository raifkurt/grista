/**
 * Market data generator — realistic Istanbul/Athens real estate + financial markets
 * Uses GBM + OU processes seeded from real historical trends
 */
import { gbm, ou, SeededRandom, pastDates, rollingMean, rollingStd } from './utils';

const rng = new SeededRandom(42);
function r() { return rng.next(); }

// ─── Currency & Commodities ─────────────────────────────────────────
export function generateCurrencyData(days = 180) {
  const dates = pastDates(days);

  const usdtry = gbm(32.5, 0.28, 0.18, days - 1, 1 / 252);
  const eurtry = usdtry.map(v => v * (1.08 + 0.01 * Math.sin(Date.now() / 1e9)));
  const eurusd = gbm(1.085, 0.01, 0.07, days - 1, 1 / 252);
  const xauusd = gbm(2340, 0.12, 0.14, days - 1, 1 / 252); // Gold
  const brent  = gbm(84, 0.05, 0.28, days - 1, 1 / 252);   // Oil

  return { dates, usdtry, eurtry, eurusd, xauusd, brent };
}

export function generateCryptoData(days = 90) {
  const dates = pastDates(days);
  const btc = gbm(67000, 0.6, 0.65, days - 1, 1 / 365);
  const eth = gbm(3500, 0.55, 0.70, days - 1, 1 / 365);
  const sol = gbm(180, 0.8, 0.85, days - 1, 1 / 365);
  return { dates, btc, eth, sol };
}

// ─── Istanbul Real Estate ───────────────────────────────────────────
const ISTANBUL_DISTRICTS = [
  { name: 'Beşiktaş', basePrice: 185000, trend: 0.35, vol: 0.12 },
  { name: 'Şişli', basePrice: 165000, trend: 0.30, vol: 0.13 },
  { name: 'Sarıyer', basePrice: 175000, trend: 0.32, vol: 0.14 },
  { name: 'Kadıköy', basePrice: 155000, trend: 0.28, vol: 0.12 },
  { name: 'Üsküdar', basePrice: 130000, trend: 0.25, vol: 0.11 },
  { name: 'Beyoğlu', basePrice: 140000, trend: 0.27, vol: 0.15 },
  { name: 'Fatih', basePrice: 120000, trend: 0.22, vol: 0.10 },
  { name: 'Eyüpsultan', basePrice: 105000, trend: 0.20, vol: 0.09 },
  { name: 'Ataşehir', basePrice: 145000, trend: 0.29, vol: 0.13 },
  { name: 'Bakırköy', basePrice: 160000, trend: 0.31, vol: 0.12 },
  { name: 'Maltepe', basePrice: 115000, trend: 0.24, vol: 0.10 },
  { name: 'Esenyurt', basePrice: 68000, trend: 0.15, vol: 0.09 },
];

export function generateIstanbulMarketData(months = 24) {
  return ISTANBUL_DISTRICTS.map(d => ({
    district: d.name,
    prices: gbm(d.basePrice, d.trend / 12, d.vol / Math.sqrt(12), months - 1),
    avgRentYield: 0.035 + Math.random() * 0.02,
    occupancyRate: 0.88 + Math.random() * 0.1,
    transactionVolume: Math.floor(50 + Math.random() * 450),
    daysOnMarket: Math.floor(15 + Math.random() * 60),
  }));
}

// ─── Athens Real Estate ─────────────────────────────────────────────
const ATHENS_DISTRICTS = [
  { name: 'Kolonaki', basePrice: 5800, trend: 0.12, vol: 0.08 },
  { name: 'Glyfada', basePrice: 4200, trend: 0.10, vol: 0.07 },
  { name: 'Voula', basePrice: 4500, trend: 0.11, vol: 0.07 },
  { name: 'Kifisia', basePrice: 4000, trend: 0.09, vol: 0.07 },
  { name: 'Maroussi', basePrice: 3200, trend: 0.08, vol: 0.06 },
  { name: 'Pagkrati', basePrice: 3400, trend: 0.08, vol: 0.07 },
  { name: 'Piraeus', basePrice: 2200, trend: 0.07, vol: 0.06 },
  { name: 'Kallithea', basePrice: 2400, trend: 0.07, vol: 0.06 },
];

export function generateAthensMarketData(months = 24) {
  return ATHENS_DISTRICTS.map(d => ({
    district: d.name,
    prices: gbm(d.basePrice, d.trend / 12, d.vol / Math.sqrt(12), months - 1),
    avgRentYield: 0.04 + Math.random() * 0.025,
    occupancyRate: 0.85 + Math.random() * 0.12,
    shortTermRentalPremium: 1.8 + Math.random() * 0.8, // Airbnb multiplier
    goldenVisaEligible: d.basePrice * 100 >= 250000, // total property ≥ €250k
  }));
}

// ─── Market Sentiment ───────────────────────────────────────────────
export function generateSentimentData(days = 90) {
  const dates = pastDates(days);
  // OU process — mean reverts to 0.55 (slightly bullish)
  const rawSentiment = ou(0.55, 0.15, 0.55, 0.08, days - 1, 1);
  const sentiment = rawSentiment.map(s => Math.max(0.1, Math.min(0.9, s)));
  const fearGreed = sentiment.map(s => Math.round(s * 100));
  const bullBearRatio = sentiment.map(s => s / (1 - s));

  return { dates, sentiment, fearGreed, bullBearRatio };
}

// ─── Transaction Volume Heatmap ─────────────────────────────────────
export function generateVolumeHeatmap() {
  // 7 days × 24 hours
  return Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      // Business hours peak, Turkish timezone (UTC+3)
      const businessHour = hour >= 9 && hour <= 18;
      const weekday = day < 5;
      const base = businessHour && weekday ? 1.0 : 0.3;
      return Math.max(0, base + (Math.random() - 0.5) * 0.4);
    })
  );
}

// ─── Price Trend Index ──────────────────────────────────────────────
export function generatePriceTrendIndex(months = 36) {
  // Istanbul composite index (base 100 = Jan 2022)
  const istanbul = gbm(100, 0.28 / 12, 0.10 / Math.sqrt(12), months - 1);
  const athens = gbm(100, 0.09 / 12, 0.06 / Math.sqrt(12), months - 1);
  const eu = gbm(100, 0.05 / 12, 0.04 / Math.sqrt(12), months - 1);

  const labels: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    labels.push(d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }));
  }

  return { labels, istanbul, athens, eu };
}

// ─── Macro Indicators ───────────────────────────────────────────────
export function getMacroIndicators() {
  return {
    turkey: {
      gdpGrowth: 4.2 + (Math.random() - 0.5) * 0.5,
      inflation: 42 + (Math.random() - 0.5) * 3,
      policyRate: 50.0,
      unemployment: 8.5 + (Math.random() - 0.5) * 0.5,
      currentAccount: -4.2,
      foreignReserves: 92, // billion USD
    },
    greece: {
      gdpGrowth: 2.3 + (Math.random() - 0.5) * 0.3,
      inflation: 2.8 + (Math.random() - 0.5) * 0.3,
      policyRate: 4.25, // ECB
      unemployment: 10.4 + (Math.random() - 0.5) * 0.5,
      currentAccount: -5.1,
      touristArrivals: 33, // million/year
    },
  };
}

// ─── Live Ticker (simulated) ─────────────────────────────────────────
export function getTickerData() {
  return [
    { symbol: 'USD/TRY', price: 32.84 + (Math.random() - 0.5) * 0.1, change: 0.0023 },
    { symbol: 'EUR/TRY', price: 35.52 + (Math.random() - 0.5) * 0.1, change: 0.0018 },
    { symbol: 'XAU/USD', price: 2387 + (Math.random() - 0.5) * 5, change: 0.0041 },
    { symbol: 'BTC/USD', price: 68420 + (Math.random() - 0.5) * 200, change: -0.0087 },
    { symbol: 'BRENT', price: 85.3 + (Math.random() - 0.5) * 0.5, change: 0.0012 },
    { symbol: 'IST. AVG ₺/m²', price: 118500 + Math.floor((Math.random() - 0.5) * 500), change: 0.0028 },
    { symbol: 'ATH. AVG €/m²', price: 3240 + Math.floor((Math.random() - 0.5) * 20), change: 0.0015 },
  ];
}
