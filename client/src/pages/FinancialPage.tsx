import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNewsByCategory, NewsItem } from '@/lib/data/liveData';
import { MonteCarloEngine } from '@/lib/algorithms/monteCarlo';
import { KalmanFilter } from '@/lib/algorithms/kalman';
import { generateCurrencyData } from '@/lib/data/marketData';
import { DollarSign, Activity, RefreshCw } from 'lucide-react';

/* ── Yardımcı ─────────────────────────────────────────────────── */
function ago(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)    return `${s}sn`;
  if (s < 3600)  return `${Math.floor(s / 60)}dk`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa`;
  return `${Math.floor(s / 86400)}g`;
}

const FIN_KW = [
  'finance,stock,market', 'money,trading,chart', 'business,economy,bank',
  'crypto,bitcoin,blockchain', 'investment,growth,profit', 'wall-street,nasdaq,exchange',
];

function finImg(item: NewsItem) {
  if (item.image) return item.image;
  const h = item.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return `https://loremflickr.com/800/500/${FIN_KW[h % FIN_KW.length]}?lock=${h % 500}`;
}

/* ── Finans Haber Kartı ───────────────────────────────────────── */
function FinCard({ item, i }: { item: NewsItem; i: number }) {
  const [show, setShow] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const delay = Math.min(i * 40, 600);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        position: 'relative',
        height: 220,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(11,197,234,.18)',
        textDecoration: 'none',
        opacity: show ? 1 : 0,
        transform: show ? 'none' : 'translateY(14px)',
        transition: `opacity .35s ease ${delay}ms, transform .35s ease ${delay}ms`,
      }}
    >
      {/* Resim */}
      {!imgErr ? (
        <img
          src={finImg(item)}
          alt=""
          onError={() => setImgErr(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(11,197,234,.12), #05090f)' }} />
      )}

      {/* Alt gradyan */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(3,8,20,.97) 0%, rgba(3,8,20,.82) 30%, rgba(3,8,20,.05) 60%, transparent 75%)',
      }} />

      {/* Üst mavi çizgi */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(to right, #0BC5EA, #00d4ff)' }} />

      {/* Başlık + kaynak/saat */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 14px' }}>
        <p style={{ margin: '0 0 5px', fontWeight: 700, fontSize: 'clamp(12px, 2vw, 15px)', lineHeight: 1.3, color: '#fff' }}>
          {item.title}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.source}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', fontFamily: 'monospace' }}>
            {ago(item.pubDate)}
          </span>
        </div>
      </div>
    </a>
  );
}

/* ── Ana Sayfa ────────────────────────────────────────────────── */
export default function FinancialPage() {
  const [params, setParams] = useState({ S0: 2000000, mu: 0.18, sigma: 0.22, years: 5 });
  const [result, setResult] = useState<any>(null);
  const [reResult, setReResult] = useState<any>(null);
  const [currency, setCurrency] = useState<any>(null);
  const [kalmanForex, setKalmanForex] = useState<number[]>([]);
  const [running, setRunning] = useState(false);

  /* Finans haberleri */
  const [finNews, setFinNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsBusy, setNewsBusy] = useState(false);
  const [newsLastUpd, setNewsLastUpd] = useState<Date | null>(null);
  const [newscd, setNewscd] = useState(30);
  const newsCdRef = useRef(30);

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

  /* Finans haber yükleme */
  const loadFinNews = useCallback(async () => {
    setNewsBusy(true);
    try {
      const items = await fetchNewsByCategory('finans');
      if (items.length) { setFinNews(items); setNewsLastUpd(new Date()); }
    } catch {}
    setNewsLoading(false);
    setNewsBusy(false);
    newsCdRef.current = 30;
  }, []);

  useEffect(() => { loadFinNews(); }, [loadFinNews]);
  useEffect(() => {
    const t = setInterval(() => {
      newsCdRef.current -= 1;
      setNewscd(newsCdRef.current);
      if (newsCdRef.current <= 0) loadFinNews();
    }, 1000);
    return () => clearInterval(t);
  }, [loadFinNews]);

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

      {/* ── Finans Haberleri — Büyük Resimli Kartlar ─────────────── */}
      <div>
        {/* Başlık */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 16 }}>
            <DollarSign size={16} color="#0BC5EA" />
            Finans Haberleri
            <span style={{ fontSize: 10, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 999, background: 'rgba(11,197,234,.1)', color: '#0BC5EA', border: '1px solid rgba(11,197,234,.25)' }}>CANLI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {newsLastUpd && (
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#3d5570' }}>
                {finNews.length} haber · {newscd}sn
              </span>
            )}
            <button onClick={loadFinNews} disabled={newsBusy} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid #1a2535', background: 'transparent', color: '#4a6080', cursor: 'pointer' }}>
              <RefreshCw size={13} style={newsBusy ? { animation: 'spin 1s linear infinite' } : {}} />
              Yenile
            </button>
          </div>
        </div>

        {/* Kart grid */}
        {newsLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {[...Array(6)].map((_, k) => (
              <div key={k} style={{ height: 220, borderRadius: 16, background: 'hsl(222 47% 8%)', opacity: 1 - k * .1, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : finNews.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', borderRadius: 16, background: 'hsl(222 47% 8%)' }}>
            <p style={{ color: '#4a6080' }}>Haberler yükleniyor…</p>
            <button onClick={loadFinNews} style={{ marginTop: 8, color: '#0BC5EA', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Tekrar dene</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {finNews.map((item, k) => <FinCard key={item.id} item={item} i={k} />)}
          </div>
        )}
      </div>
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
