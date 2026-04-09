import { useState, useEffect } from 'react';
import NewsStrip from '@/components/ui/NewsStrip';
import { MonteCarloEngine } from '@/lib/algorithms/monteCarlo';
import { KalmanFilter } from '@/lib/algorithms/kalman';
import { generateCurrencyData } from '@/lib/data/marketData';
import { DollarSign, Activity, Shield, TrendingUp } from 'lucide-react';

export default function FinancialPage() {
  const [params, setParams] = useState({ S0: 2000000, mu: 0.18, sigma: 0.22, years: 5 });
  const [result, setResult] = useState<any>(null);
  const [reResult, setReResult] = useState<any>(null);
  const [currency, setCurrency] = useState<any>(null);
  const [kalmanForex, setKalmanForex] = useState<number[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const cur = generateCurrencyData(180);
    setCurrency(cur);
    const kf = new KalmanFilter(100, 1);
    const { smoothed } = kf.filter(cur.usdtry);
    setKalmanForex(smoothed);
    runSimulation();
  }, []);

  function runSimulation() {
    setRunning(true);
    setTimeout(() => {
      const engine = new MonteCarloEngine(3000);
      const r = engine.simulateGBM(params.S0, params.mu, params.sigma, params.years, params.years * 12);
      setResult(r);

      const reR = engine.projectRealEstate({
        initialValue: params.S0,
        annualAppreciation: 0.28,
        appreciationVol: 0.15,
        rentalYield: 0.04,
        rentalGrowth: 0.10,
        rentalVol: 0.05,
        years: params.years,
        taxRate: 0.15,
        maintenancePct: 0.01,
      });
      setReResult(reR);
      setRunning(false);
    }, 100);
  }

  const histBuckets = result ? (() => {
    const vals = result.finalValues;
    const min = vals[0], max = vals[vals.length - 1];
    const step = (max - min) / 30;
    const buckets = Array(30).fill(0);
    for (const v of vals) {
      const i = Math.min(29, Math.floor((v - min) / step));
      buckets[i]++;
    }
    const maxCount = Math.max(...buckets);
    return { buckets, maxCount, min, max, step };
  })() : null;

  return (
    <div className="p-4 space-y-4 max-w-screen-2xl mx-auto">
      {/* Controls */}
      <div className="metric-card">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-emerald-400" />
          <div className="text-sm font-semibold">Monte Carlo Simülasyon Parametreleri</div>
          <span className="text-xs text-muted-foreground ml-auto">3.000 yol · GBM</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: `Başlangıç Değeri: ₺${(params.S0 / 1e6).toFixed(1)}M`, key: 'S0', min: 500000, max: 20000000, step: 100000 },
            { label: `Yıllık Getiri: %${(params.mu * 100).toFixed(0)}`, key: 'mu', min: 0.05, max: 0.60, step: 0.01 },
            { label: `Volatilite: %${(params.sigma * 100).toFixed(0)}`, key: 'sigma', min: 0.05, max: 0.60, step: 0.01 },
            { label: `Ufuk: ${params.years} yıl`, key: 'years', min: 1, max: 20, step: 1 },
          ].map(p => (
            <div key={p.key}>
              <label className="block text-xs text-muted-foreground mb-1">{p.label}</label>
              <input type="range" min={p.min} max={p.max} step={p.step}
                value={params[p.key as keyof typeof params]}
                onChange={e => setParams(prev => ({ ...prev, [p.key]: +e.target.value }))}
                className="w-full accent-emerald-400" />
            </div>
          ))}
        </div>
        <button onClick={runSimulation} disabled={running}
          className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg transition-all"
          style={{ background: 'hsl(158 64% 42%)', color: '#fff' }}
          data-testid="btn-simulate">
          {running ? 'Simüle ediliyor...' : `Simülasyonu Çalıştır (GBM · ${params.years * 12} adım)`}
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-12 gap-4">
          {/* KPI strip */}
          <div className="col-span-12 grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: 'Medyan Sonuç', value: `₺${(result.median / 1e6).toFixed(2)}M`, color: '#10b981', sub: `Getiri: ${((result.median / params.S0 - 1) * 100).toFixed(0)}%` },
              { label: 'P5 (Kötü Senaryo)', value: `₺${(result.p5 / 1e6).toFixed(2)}M`, color: '#ef4444', sub: `Kayıp: ${((result.p5 / params.S0 - 1) * 100).toFixed(0)}%` },
              { label: 'P95 (İyi Senaryo)', value: `₺${(result.p95 / 1e6).toFixed(2)}M`, color: '#00d4ff', sub: `Getiri: ${((result.p95 / params.S0 - 1) * 100).toFixed(0)}%` },
              { label: 'VaR (%95)', value: `₺${(result.var95 / 1e6).toFixed(2)}M`, color: '#f59e0b', sub: 'Günlük 1-yıl ufku' },
              { label: 'CVaR (ES)', value: `₺${(result.cvar95 / 1e6).toFixed(2)}M`, color: '#8b5cf6', sub: 'Beklenen kayıp kuyruğu' },
              { label: 'Sharpe Oranı', value: result.sharpe.toFixed(3), color: result.sharpe > 1 ? '#10b981' : result.sharpe > 0.5 ? '#f59e0b' : '#ef4444', sub: result.sharpe > 1 ? 'Mükemmel' : result.sharpe > 0.5 ? 'İyi' : 'Zayıf' },
            ].map(k => (
              <div key={k.label} className="metric-card card-hover text-center">
                <div className="text-base font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="text-xs font-mono mt-0.5" style={{ color: k.color, opacity: 0.7, fontSize: '10px' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Distribution histogram */}
          {histBuckets && (
            <div className="col-span-12 md:col-span-6 metric-card">
              <div className="text-sm font-semibold mb-1">Terminal Değer Dağılımı</div>
              <div className="text-xs text-muted-foreground mb-3">Monte Carlo {params.years} yıl · {result.finalValues.length} simülasyon</div>
              <div className="flex items-end gap-0.5" style={{ height: 140 }}>
                {histBuckets.buckets.map((count, i) => {
                  const val = histBuckets.min + i * histBuckets.step;
                  const isVar = val < params.S0 - result.var95;
                  const pct = count / histBuckets.maxCount;
                  return (
                    <div key={i} className="flex-1 flex items-end" style={{ height: '100%' }}>
                      <div className="w-full transition-all rounded-t"
                        style={{
                          height: `${pct * 100}%`,
                          background: isVar ? 'hsl(0 84% 55%)' : val > params.S0 ? 'hsl(158 64% 42%)' : 'hsl(199 95% 55%)',
                          opacity: 0.8,
                        }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1">
                <span>₺{(histBuckets.min / 1e6).toFixed(1)}M</span>
                <span className="text-red-400">← VaR sınırı</span>
                <span>₺{(histBuckets.max / 1e6).toFixed(1)}M</span>
              </div>
            </div>
          )}

          {/* Real Estate projection */}
          {reResult && (
            <div className="col-span-12 md:col-span-6 metric-card">
              <div className="text-sm font-semibold mb-1">Gayrimenkul Yatırım Projeksiyonu</div>
              <div className="text-xs text-muted-foreground mb-3">
                Kira getirisi dahil · %{(params.mu * 100).toFixed(0)} değerlenme · IRR: %{(reResult.irr * 100).toFixed(1)}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'IRR', value: `%${(reResult.irr * 100).toFixed(1)}` },
                  { label: 'Medyan Net', value: `₺${(reResult.totalReturn.median / 1e6).toFixed(2)}M` },
                  { label: 'Sharpe', value: reResult.totalReturn.sharpe.toFixed(2) },
                ].map(k => (
                  <div key={k.label} className="p-2 rounded-lg text-center" style={{ background: 'hsl(222 47% 5%)' }}>
                    <div className="text-sm font-bold font-mono text-emerald-400">{k.value}</div>
                    <div className="text-xs text-muted-foreground">{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                {reResult.roiByYear?.slice(0, Math.min(params.years, 5)).map((roi: number, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-10">Yıl {i + 1}</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.abs(roi) * 50)}%`,
                          background: roi > 0 ? '#10b981' : '#ef4444',
                        }} />
                    </div>
                    <span className="font-mono w-12 text-right" style={{ color: roi > 0 ? '#10b981' : '#ef4444' }}>
                      {roi >= 0 ? '+' : ''}{(roi * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forex Kalman */}
          {currency && kalmanForex.length > 0 && (
            <div className="col-span-12 metric-card">
              <div className="text-sm font-semibold mb-1">USD/TRY — Kalman Filtresi Analizi</div>
              <div className="text-xs text-muted-foreground mb-3">Ham veri (gri) + Kalman düzeltmeli (yeşil) · Adaptif gürültü tahmini</div>
              <ForexChart raw={currency.usdtry} smoothed={kalmanForex} height={100} />
            </div>
          )}
        </div>
      )}

      {/* Finans Haberleri */}
      <NewsStrip category="finans" limit={6} />
    </div>
  );
}

function ForexChart({ raw, smoothed, height }: { raw: number[]; smoothed: number[]; height: number }) {
  const all = [...raw, ...smoothed];
  const min = Math.min(...all) * 0.995;
  const max = Math.max(...all) * 1.005;
  const n = raw.length;
  const toX = (i: number) => (i / (n - 1)) * 100;
  const toY = (v: number) => height - ((v - min) / (max - min)) * height;
  const rawPath = raw.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
  const kPath = smoothed.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height, display: 'block' }} preserveAspectRatio="none">
      <path d={rawPath} fill="none" stroke="hsl(217 33% 35%)" strokeWidth="0.4" />
      <path d={kPath} fill="none" stroke="hsl(158 64% 52%)" strokeWidth="0.7" />
    </svg>
  );
}
