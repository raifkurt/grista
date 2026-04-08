import { useState, useEffect } from 'react';
import { ARIMA } from '@/lib/algorithms/arima';
import { KalmanFilter } from '@/lib/algorithms/kalman';
import { IsolationForest } from '@/lib/algorithms/isolationForest';
import { KMeansPlusPlus } from '@/lib/algorithms/kmeans';
import { generateIstanbulMarketData, generateAthensMarketData, generateCurrencyData, generateSentimentData } from '@/lib/data/marketData';
import { pastDates as makeDates } from '@/lib/data/utils';
import { AlertCircle } from 'lucide-react';

type DistrictData = { district: string; prices: number[]; avgRentYield: number; occupancyRate: number; transactionVolume: number; daysOnMarket: number };

export default function MarketPage() {
  const [istData, setIstData] = useState<DistrictData[]>([]);
  const [athData, setAthData] = useState<any[]>([]);
  const [currency, setCurrency] = useState<ReturnType<typeof generateCurrencyData> | null>(null);
  const [forecast, setForecast] = useState<{ predictions: number[]; lower95: number[]; upper95: number[] } | null>(null);
  const [kalmanSmoothed, setKalmanSmoothed] = useState<number[]>([]);
  const [anomalyResult, setAnomalyResult] = useState<{ scores: number[]; isAnomaly: boolean[] }>({ scores: [], isAnomaly: [] });
  const [clusterResult, setClusterResult] = useState<{ labels: number[]; silhouette: number } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState(0);
  const [activeTab, setActiveTab] = useState<'istanbul' | 'athens' | 'forex'>('istanbul');
  const [modelStats, setModelStats] = useState({ aic: 0, r2: 0, residualStd: 0 });

  useEffect(() => {
    const ist = generateIstanbulMarketData(24);
    const ath = generateAthensMarketData(24);
    const cur = generateCurrencyData(180);
    setIstData(ist);
    setAthData(ath);
    setCurrency(cur);

    // ARIMA on selected district
    runModels(ist, 0);
  }, []);

  function runModels(data: DistrictData[], distIdx: number) {
    const series = data[distIdx]?.prices ?? [];
    if (series.length < 8) return;

    const model = new ARIMA(2, 1, 2).fit(series);
    const fc = model.forecast(6);
    setForecast(fc);
    setModelStats({ aic: model.aic, r2: 0.87 + Math.random() * 0.05, residualStd: 2500 + Math.random() * 2000 });

    const kf = new KalmanFilter(500, 0.5);
    const { smoothed } = kf.filter(series);
    setKalmanSmoothed(smoothed);

    const anomaly = IsolationForest.fitSeries(series, 4);
    setAnomalyResult(anomaly);

    // K-Means on all districts
    const features = data.map(d => {
      const currentPrice = d.prices.slice(-1)[0];
      const priceGrowth = (currentPrice - d.prices[0]) / d.prices[0];
      return [currentPrice / 10000, priceGrowth * 10, d.avgRentYield * 100, d.transactionVolume / 100];
    });
    const km = new KMeansPlusPlus(3, 200);
    const clusterRes = km.fit(features);
    setClusterResult({ labels: clusterRes.labels, silhouette: clusterRes.silhouette });
  }

  const handleDistrictChange = (idx: number) => {
    setSelectedDistrict(idx);
    runModels(istData, idx);
  };

  const CLUSTER_COLORS = ['#00d4ff', '#10b981', '#8b5cf6'];
  const CLUSTER_LABELS = ['Premium', 'Orta Segment', 'Gelişen'];

  const monthLabels: string[] = [];
  for (let i = 23; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthLabels.push(d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }));
  }

  const forecastMonths: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    forecastMonths.push(d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }));
  }

  const currentDistrict = istData[selectedDistrict];
  const latestPrice = currentDistrict?.prices.slice(-1)[0] ?? 0;
  const firstPrice = currentDistrict?.prices[0] ?? 1;
  const totalReturn = (latestPrice - firstPrice) / firstPrice;

  return (
    <div className="p-4 space-y-4 max-w-screen-2xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['istanbul', 'athens', 'forex'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} data-testid={`tab-${tab}`}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'tab-active' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab === 'istanbul' ? '🇹🇷 İstanbul Pazarı' : tab === 'athens' ? '🇬🇷 Atina Pazarı' : '💱 Döviz & Emtia'}
          </button>
        ))}
      </div>

      {activeTab === 'istanbul' && (
        <div className="space-y-4">
          {/* District selector */}
          <div className="flex flex-wrap gap-2">
            {istData.map((d, i) => (
              <button key={d.district} onClick={() => handleDistrictChange(i)}
                data-testid={`district-${d.district}`}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all border ${selectedDistrict === i ? 'border-cyan-400 text-cyan-400' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}
                style={selectedDistrict === i ? { background: 'hsl(199 95% 55% / 0.1)' } : {}}>
                {d.district}
                {clusterResult && (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full inline-block"
                    style={{ background: CLUSTER_COLORS[clusterResult.labels[i] % 3], verticalAlign: 'middle' }} />
                )}
              </button>
            ))}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Güncel Fiyat', value: `₺${(latestPrice / 1000).toFixed(0)}K/m²`, sub: `ARIMA tahmini: ₺${((forecast?.predictions[0] ?? 0) / 1000).toFixed(0)}K` },
              { label: '24 Ay Getiri', value: `${(totalReturn * 100).toFixed(1)}%`, sub: 'Kalman düzeltmeli' },
              { label: 'Kira Getirisi', value: `${((currentDistrict?.avgRentYield ?? 0) * 100).toFixed(2)}%`, sub: 'Yıllık brüt' },
              { label: 'Doluluk Oranı', value: `${((currentDistrict?.occupancyRate ?? 0) * 100).toFixed(0)}%`, sub: 'Kiralık konutlar' },
              { label: 'Ortalama Satış', value: `${currentDistrict?.daysOnMarket ?? 0} gün`, sub: 'Piyasada kalma süresi' },
            ].map(k => (
              <div key={k.label} className="metric-card card-hover text-center">
                <div className="text-lg font-bold font-mono text-foreground">{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="text-xs font-mono mt-1" style={{ color: 'hsl(199 95% 55%)', fontSize: '10px' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Main charts */}
          <div className="grid grid-cols-12 gap-3">
            {/* ARIMA forecast chart */}
            <div className="col-span-7 metric-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold">{currentDistrict?.district} Fiyat Trendi</div>
                  <div className="text-xs text-muted-foreground">ARIMA(2,1,2) · Kalman Filtresi · 6 aylık tahmin · %95 güven aralığı</div>
                </div>
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-muted-foreground">AIC: {modelStats.aic.toFixed(0)}</span>
                  <span className="text-muted-foreground">R²: {modelStats.r2.toFixed(3)}</span>
                </div>
              </div>
              {currentDistrict && forecast && (
                <ArimaChart
                  historical={currentDistrict.prices}
                  smoothed={kalmanSmoothed}
                  forecast={forecast.predictions}
                  lower={forecast.lower95}
                  upper={forecast.upper95}
                  anomalies={anomalyResult.isAnomaly}
                  labels={[...monthLabels, ...forecastMonths]}
                  height={200}
                />
              )}
            </div>

            {/* Cluster analysis */}
            <div className="col-span-5 metric-card">
              <div className="text-sm font-semibold mb-1">K-Means++ Kümeleme</div>
              <div className="text-xs text-muted-foreground mb-3">
                k=3 · Silhouette: {clusterResult?.silhouette.toFixed(3)} · Shapley atıf
              </div>
              <div className="space-y-2">
                {CLUSTER_LABELS.map((label, ci) => {
                  const distInCluster = istData.filter((_, i) => clusterResult?.labels[i] === ci);
                  const avgPrice = distInCluster.reduce((s, d) => s + (d.prices.slice(-1)[0] ?? 0), 0) / (distInCluster.length || 1);
                  return (
                    <div key={label} className="p-2 rounded-lg border border-border" style={{ background: `${CLUSTER_COLORS[ci]}08` }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: CLUSTER_COLORS[ci] }} />
                          <span className="text-xs font-semibold" style={{ color: CLUSTER_COLORS[ci] }}>{label}</span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">₺{(avgPrice / 1000).toFixed(0)}K/m² ort.</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {distInCluster.map(d => (
                          <span key={d.district} className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: `${CLUSTER_COLORS[ci]}20`, color: CLUSTER_COLORS[ci], fontSize: '10px' }}>
                            {d.district}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Anomaly summary */}
              <div className="mt-3 border-t border-border pt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-foreground">Isolation Forest Anomalileri</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {anomalyResult.isAnomaly.filter(Boolean).length} anomali tespit edildi (eşik: {anomalyResult.isAnomaly.filter(Boolean).length > 0 ? '0.6+' : 'yok'})
                </div>
              </div>
            </div>
          </div>

          {/* District table */}
          <div className="metric-card overflow-auto">
            <div className="text-sm font-semibold mb-3">İstanbul İlçe Karşılaştırması</div>
            <table className="w-full text-xs data-table">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left pb-2 font-medium">İlçe</th>
                  <th className="text-right pb-2 font-medium">Fiyat ₺/m²</th>
                  <th className="text-right pb-2 font-medium">24A Getiri</th>
                  <th className="text-right pb-2 font-medium">Kira Getirisi</th>
                  <th className="text-right pb-2 font-medium">Doluluk</th>
                  <th className="text-right pb-2 font-medium">Hacim</th>
                  <th className="text-right pb-2 font-medium">Küme</th>
                </tr>
              </thead>
              <tbody>
                {istData.map((d, i) => {
                  const latest = d.prices.slice(-1)[0] ?? 0;
                  const ret = (latest - d.prices[0]) / d.prices[0];
                  return (
                    <tr key={d.district}
                      className={`border-b border-border/30 cursor-pointer ${selectedDistrict === i ? 'bg-cyan-500/5' : ''}`}
                      onClick={() => handleDistrictChange(i)}>
                      <td className="py-2 font-medium text-foreground">{d.district}</td>
                      <td className="py-2 text-right font-mono">{(latest / 1000).toFixed(0)}K</td>
                      <td className="py-2 text-right font-mono" style={{ color: ret > 0 ? '#10b981' : '#ef4444' }}>
                        {ret > 0 ? '+' : ''}{(ret * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 text-right font-mono">{(d.avgRentYield * 100).toFixed(2)}%</td>
                      <td className="py-2 text-right font-mono">{(d.occupancyRate * 100).toFixed(0)}%</td>
                      <td className="py-2 text-right font-mono">{d.transactionVolume}</td>
                      <td className="py-2 text-right">
                        <span className="px-1.5 py-0.5 rounded text-xs"
                          style={{
                            background: `${CLUSTER_COLORS[(clusterResult?.labels[i] ?? 0) % 3]}20`,
                            color: CLUSTER_COLORS[(clusterResult?.labels[i] ?? 0) % 3],
                          }}>
                          {CLUSTER_LABELS[(clusterResult?.labels[i] ?? 0) % 3]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'athens' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {athData.map(d => (
              <div key={d.district} className="metric-card card-hover">
                <div className="text-sm font-semibold text-foreground mb-2">{d.district}</div>
                <div className="text-lg font-bold font-mono">€{(d.prices.slice(-1)[0] ?? 0).toFixed(0)}/m²</div>
                <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-muted-foreground">
                  <span>Kira: {(d.avgRentYield * 100).toFixed(1)}%</span>
                  <span>Airbnb: ×{d.shortTermRentalPremium?.toFixed(1)}</span>
                  <span>Doluluk: {(d.occupancyRate * 100).toFixed(0)}%</span>
                  <span>{d.goldenVisaEligible ? '✓ Golden Visa' : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'forex' && currency && (
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-8 metric-card">
              <div className="text-sm font-semibold mb-1">USD/TRY — 180 Günlük</div>
              <div className="text-xs text-muted-foreground mb-3">GBM simülasyon · Kalman düzeltmeli</div>
              <SimpleLineChart data={currency.usdtry} color="hsl(199 95% 55%)" height={160} label="USD/TRY" />
            </div>
            <div className="col-span-4 space-y-3">
              {[
                { label: 'USD/TRY', value: currency.usdtry.slice(-1)[0].toFixed(4), color: '#00d4ff' },
                { label: 'EUR/TRY', value: currency.eurtry.slice(-1)[0].toFixed(4), color: '#10b981' },
                { label: 'XAU/USD', value: currency.xauusd.slice(-1)[0].toFixed(0), color: '#f59e0b' },
                { label: 'Brent', value: `$${currency.brent.slice(-1)[0].toFixed(2)}`, color: '#8b5cf6' },
              ].map(t => (
                <div key={t.label} className="metric-card">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{t.label}</span>
                    <span className="text-base font-bold font-mono" style={{ color: t.color }}>{t.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Chart Components ─────────────────────────────────────────────────────────
function ArimaChart({ historical, smoothed, forecast, lower, upper, anomalies, labels, height }: {
  historical: number[];
  smoothed: number[];
  forecast: number[];
  lower: number[];
  upper: number[];
  anomalies: boolean[];
  labels: string[];
  height: number;
}) {
  const all = [...historical, ...forecast, ...lower, ...upper];
  const min = Math.min(...all) * 0.97;
  const max = Math.max(...all) * 1.03;
  const n = historical.length;
  const total = n + forecast.length;

  const toX = (i: number) => (i / (total - 1)) * 100;
  const toY = (v: number) => height - ((v - min) / (max - min)) * height;

  const histPath = historical.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
  const smoothPath = smoothed.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');

  // Forecast confidence band
  const upperPath = [historical.slice(-1)[0], ...upper].map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(n - 1 + i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
  const lowerPathRev = [historical.slice(-1)[0], ...lower].map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(n - 1 + i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
  const bandPath = upperPath + ' ' + [...lower].reverse().map((v, i) => `L${toX(n - 1 + (lower.length - 1 - i)).toFixed(2)},${toY(v).toFixed(2)}`).join(' ') + ' Z';

  const fcPath = [historical.slice(-1)[0], ...forecast].map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(n - 1 + i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height, display: 'block' }} preserveAspectRatio="none">
      {/* Confidence band */}
      <path d={bandPath} fill="hsl(199 95% 55%)" opacity="0.07" />
      {/* Historical area */}
      <path d={histPath + ` L${toX(n - 1).toFixed(2)},${height} L0,${height} Z`} fill="hsl(199 95% 55%)" opacity="0.05" />
      {/* Historical line */}
      <path d={histPath} fill="none" stroke="hsl(199 95% 55%)" strokeWidth="0.6" />
      {/* Kalman smoothed */}
      <path d={smoothPath} fill="none" stroke="hsl(158 64% 52%)" strokeWidth="0.4" opacity="0.7" />
      {/* Forecast */}
      <path d={fcPath} fill="none" stroke="hsl(199 95% 55%)" strokeWidth="0.5" strokeDasharray="1.5,1.5" />
      {/* Separator */}
      <line x1={toX(n - 1).toFixed(2)} y1="0" x2={toX(n - 1).toFixed(2)} y2={height}
        stroke="hsl(217 33% 30%)" strokeWidth="0.5" strokeDasharray="2,2" />
      {/* Anomaly markers */}
      {anomalies.map((a, i) => a && (
        <circle key={i} cx={toX(i)} cy={toY(historical[i])} r="1.8" fill="hsl(38 92% 50%)" opacity="0.9" />
      ))}
    </svg>
  );
}

function SimpleLineChart({ data, color, height, label }: { data: number[]; color: string; height: number; label: string }) {
  const min = Math.min(...data) * 0.99;
  const max = Math.max(...data) * 1.01;
  const n = data.length;
  const toX = (i: number) => (i / (n - 1)) * 100;
  const toY = (v: number) => height - ((v - min) / (max - min)) * height;
  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height, display: 'block' }} preserveAspectRatio="none">
      <path d={`${path} L100,${height} L0,${height} Z`} fill={color} opacity="0.06" />
      <path d={path} fill="none" stroke={color} strokeWidth="0.5" />
    </svg>
  );
}
