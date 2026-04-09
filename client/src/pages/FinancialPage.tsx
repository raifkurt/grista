import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNewsByCategory, NewsItem } from '@/lib/data/liveData';
import { MonteCarloEngine } from '@/lib/algorithms/monteCarlo';
import { KalmanFilter } from '@/lib/algorithms/kalman';
import { generateCurrencyData } from '@/lib/data/marketData';
import {
  DollarSign, Activity, RefreshCw, TrendingUp,
  Bitcoin, BarChart2, Globe, Landmark, Building2,
} from 'lucide-react';

/* ─── Yardımcılar ───────────────────────────────────────────────────────── */
function ago(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`;
  if (s < 3600) return `${Math.floor(s / 60)}dk`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa`;
  return `${Math.floor(s / 86400)}g`;
}
function fmtUSD(p: number) {
  if (!p && p !== 0) return '—';
  if (p >= 1000)  return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (p >= 1)     return '$' + p.toFixed(2);
  if (p >= 0.01)  return '$' + p.toFixed(4);
  return '$' + p.toFixed(6);
}
function fmtMcap(v: number) {
  if (!v) return '—';
  if (v >= 1e12) return '$' + (v / 1e12).toFixed(2) + 'T';
  if (v >= 1e9)  return '$' + (v / 1e9).toFixed(1) + 'B';
  return '$' + (v / 1e6).toFixed(0) + 'M';
}
const green = '#10b981', red = '#ef4444';
const chgClr = (c: number) => (c >= 0 ? green : red);

/* ─── Fallback görseller (finans haberleri) ─────────────────────────────── */
const FIN_KW = [
  'finance,stock,market',      'money,currency,banking',    'business,economy,office',
  'crypto,bitcoin,blockchain', 'investment,chart,growth',   'bank,finance,building',
  'trading,exchange,numbers',  'savings,wealth,gold',       'economy,global,trade',
  'startup,entrepreneur,tech', 'coins,gold,wealth',         'data,analytics,charts',
  'economics,market,analysis', 'wall-street,nasdaq,stocks', 'real-estate,property,invest',
];
function finImg(item: NewsItem) {
  if (item.image) return item.image;
  let h = 5381;
  for (const c of item.id + item.title) h = ((h << 5) + h + c.charCodeAt(0)) & 0x7fffffff;
  const a = Math.abs(h);
  return `https://loremflickr.com/800/500/${FIN_KW[a % FIN_KW.length]}?lock=${a % 9999}`;
}

/* ─── BTC / ETH büyük kartı ─────────────────────────────────────────────── */
function BigCoinCard({ coin }: { coin: any }) {
  if (!coin) return (
    <div className="metric-card" style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#3d5570', fontSize: 12 }}>Yükleniyor…</span>
    </div>
  );
  const c = coin.change24h ?? 0;
  return (
    <div className="metric-card" style={{ borderTop: `2px solid ${chgClr(c)}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <img src={coin.image} alt={coin.symbol} style={{ width: 36, height: 36, borderRadius: '50%' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{coin.name}</div>
          <div style={{ fontSize: 11, color: '#4a6080', fontFamily: 'monospace' }}>{coin.symbol}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: 18, fontFamily: 'monospace' }}>{fmtUSD(coin.price)}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: chgClr(c) }}>
            {c >= 0 ? '+' : ''}{c.toFixed(2)}%
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {[
          { label: 'Piyasa Değeri', val: fmtMcap(coin.marketCap) },
          { label: 'Hacim 24s',     val: fmtMcap(coin.volume) },
          { label: '24s Aralık',    val: `${fmtUSD(coin.low24h)}–${fmtUSD(coin.high24h)}` },
        ].map(m => (
          <div key={m.label} style={{ background: 'hsl(222 47% 5%)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#3d5570', marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#8eb4d8', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Altcoin satırı ────────────────────────────────────────────────────── */
function AltRow({ coin, rank }: { coin: any; rank: number }) {
  const c = coin.change24h ?? 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
      <span style={{ fontSize: 10, color: '#3d5570', fontFamily: 'monospace', width: 18, textAlign: 'right', flexShrink: 0 }}>{rank}</span>
      <img src={coin.image} alt={coin.symbol} style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{coin.name}</div>
        <div style={{ fontSize: 10, color: '#4a6080', fontFamily: 'monospace' }}>{coin.symbol}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>{fmtUSD(coin.price)}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: green }}>+{c.toFixed(2)}%</div>
      </div>
      <div style={{ width: 56, height: 4, borderRadius: 2, background: 'hsl(222 47% 8%)', flexShrink: 0 }}>
        <div style={{ width: `${Math.min(100, c * 1.8)}%`, height: '100%', borderRadius: 2, background: green }} />
      </div>
    </div>
  );
}

/* ─── Hisse senedi satırı ────────────────────────────────────────────────── */
function StockRow({ stock, rank, tl }: { stock: any; rank: number; tl?: boolean }) {
  const c = stock.changePct ?? 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
      <span style={{ fontSize: 10, color: '#3d5570', fontFamily: 'monospace', width: 18, textAlign: 'right', flexShrink: 0 }}>{rank}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{stock.symbol}</span>
          <span style={{ fontSize: 10, color: '#4a6080', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{stock.name}</span>
        </div>
      </div>
      <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, flexShrink: 0 }}>
        {tl ? `₺${(stock.price ?? 0).toFixed(2)}` : `$${(stock.price ?? 0).toFixed(2)}`}
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, color: chgClr(c), minWidth: 54, textAlign: 'right', flexShrink: 0 }}>
        {c >= 0 ? '+' : ''}{c.toFixed(2)}%
      </span>
    </div>
  );
}

/* ─── Finans haber kartı ─────────────────────────────────────────────────── */
function FinCard({ item, i }: { item: NewsItem; i: number }) {
  const [show, setShow] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const delay = Math.min(i * 40, 600);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{
      display: 'block', position: 'relative', height: 220, borderRadius: 16,
      overflow: 'hidden', border: '1px solid rgba(11,197,234,.18)', textDecoration: 'none',
      opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(14px)',
      transition: `opacity .35s ease ${delay}ms, transform .35s ease ${delay}ms`,
    }}>
      {!imgErr
        ? <img src={finImg(item)} alt="" onError={() => setImgErr(true)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(11,197,234,.12),#05090f)' }} />
      }
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(3,8,20,.97) 0%,rgba(3,8,20,.82) 30%,rgba(3,8,20,.05) 60%,transparent 75%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(to right,#0BC5EA,#00d4ff)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 14px' }}>
        <p style={{ margin: '0 0 5px', fontWeight: 700, fontSize: 'clamp(12px,2vw,15px)', lineHeight: 1.3, color: '#fff' }}>{item.title}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.source}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', fontFamily: 'monospace' }}>{ago(item.pubDate)}</span>
        </div>
      </div>
    </a>
  );
}

/* ─── Forex grafiği ─────────────────────────────────────────────────────── */
function ForexChart({ raw, smoothed, height }: { raw: number[]; smoothed: number[]; height: number }) {
  const all = [...raw, ...smoothed];
  const min = Math.min(...all) * 0.995, max = Math.max(...all) * 1.005;
  const n = raw.length;
  const toX = (i: number) => (i / (n - 1)) * 100;
  const toY = (v: number) => height - ((v - min) / (max - min)) * height;
  const rawPath = raw.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
  const kPath  = smoothed.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height, display: 'block' }} preserveAspectRatio="none">
      <path d={rawPath} fill="none" stroke="hsl(217 33% 35%)" strokeWidth="0.4" />
      <path d={kPath}   fill="none" stroke="hsl(158 64% 52%)" strokeWidth="0.7" />
    </svg>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────────────────── */
function Skel({ n = 5 }: { n?: number }) {
  return <>{[...Array(n)].map((_, i) => (
    <div key={i} style={{ height: 28, borderRadius: 6, background: 'hsl(222 47% 8%)', marginBottom: 4, opacity: 1 - i * 0.15 }} />
  ))}</>;
}

/* ════════════════════════════════════════════════════════════════════════════
   ANA SAYFA
════════════════════════════════════════════════════════════════════════════ */
export default function FinancialPage() {

  /* Monte Carlo */
  const [params, setParams]   = useState({ S0: 2000000, mu: 0.18, sigma: 0.22, years: 5 });
  const [result, setResult]   = useState<any>(null);
  const [reResult, setReResult] = useState<any>(null);
  const [currency, setCurrency] = useState<any>(null);
  const [kalmanForex, setKalmanForex] = useState<number[]>([]);
  const [running, setRunning] = useState(false);

  /* Kripto */
  const [crypto, setCrypto]   = useState<any>(null);
  const [cryptoCd, setCryptoCd] = useState(300);
  const cryptoCdRef = useRef(300);

  /* Piyasa modülleri */
  const [usGainers,   setUsGainers]   = useState<any[]>([]);
  const [bistGainers, setBistGainers] = useState<any[]>([]);
  const [bankRates,   setBankRates]   = useState<any>(null);
  const [funds,       setFunds]       = useState<any[]>([]);
  const [mktLoading,  setMktLoading]  = useState(true);

  /* Finans haberleri */
  const [finNews,       setFinNews]       = useState<NewsItem[]>([]);
  const [newsLoading,   setNewsLoading]   = useState(true);
  const [newsBusy,      setNewsBusy]      = useState(false);
  const [newsLastUpd,   setNewsLastUpd]   = useState<Date | null>(null);
  const [newscd,        setNewscd]        = useState(30);
  const newsCdRef = useRef(30);

  /* ── Monte Carlo init ── */
  useEffect(() => {
    const cur = generateCurrencyData(180);
    setCurrency(cur);
    const { smoothed } = new KalmanFilter(100, 1).filter(cur.usdtry);
    setKalmanForex(smoothed);
    runSim({ S0: 2000000, mu: 0.18, sigma: 0.22, years: 5 });
  }, []);

  function runSim(p = params) {
    setRunning(true);
    setTimeout(() => {
      const engine = new MonteCarloEngine(3000);
      setResult(engine.simulateGBM(p.S0, p.mu, p.sigma, p.years, p.years * 12));
      setReResult(engine.projectRealEstate({
        initialValue: p.S0, annualAppreciation: 0.28, appreciationVol: 0.15,
        rentalYield: 0.04, rentalGrowth: 0.10, rentalVol: 0.05, years: p.years,
        taxRate: 0.15, maintenancePct: 0.01,
      }));
      setRunning(false);
    }, 100);
  }

  /* ── Kripto: her 5 dakika ── */
  const loadCrypto = useCallback(async (force = false) => {
    try {
      const r = await fetch(`/api/cryptodetail?${force ? 'force=1&' : ''}_=${Date.now()}`, { cache: 'no-store' });
      if (r.ok) setCrypto(await r.json());
    } catch {}
    cryptoCdRef.current = 300;
  }, []);
  useEffect(() => { loadCrypto(); }, [loadCrypto]);
  useEffect(() => {
    const t = setInterval(() => {
      cryptoCdRef.current -= 1; setCryptoCd(cryptoCdRef.current);
      if (cryptoCdRef.current <= 0) loadCrypto();
    }, 1000);
    return () => clearInterval(t);
  }, [loadCrypto]);

  /* ── Piyasa modülleri: tek seferde yükle ── */
  useEffect(() => {
    const ts = Date.now();
    Promise.all([
      fetch(`/api/us/gainers?_=${ts}`,   { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`/api/bist/gainers?_=${ts}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`/api/bankrates?_=${ts}`,    { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`/api/funds?_=${ts}`,        { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([us, bist, bank, fund]) => {
      setUsGainers(Array.isArray(us) ? us : []);
      setBistGainers(Array.isArray(bist) ? bist : []);
      setBankRates(bank);
      setFunds(Array.isArray(fund) ? fund : []);
      setMktLoading(false);
    });
  }, []);

  /* ── Finans haberleri ── */
  const loadFinNews = useCallback(async (force = false) => {
    setNewsBusy(true);
    try {
      const items = await fetchNewsByCategory('finans', force);
      if (items.length) {
        setFinNews([...items].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()));
        setNewsLastUpd(new Date());
      }
    } catch {}
    setNewsLoading(false); setNewsBusy(false);
    newsCdRef.current = 30;
  }, []);
  useEffect(() => { loadFinNews(); }, [loadFinNews]);
  useEffect(() => {
    const handler = (e: Event) => loadFinNews((e as CustomEvent).detail?.force ?? false);
    window.addEventListener('ptr', handler);
    return () => window.removeEventListener('ptr', handler);
  }, [loadFinNews]);
  useEffect(() => {
    const t = setInterval(() => {
      newsCdRef.current -= 1; setNewscd(newsCdRef.current);
      if (newsCdRef.current <= 0) loadFinNews();
    }, 1000);
    return () => clearInterval(t);
  }, [loadFinNews]);

  /* ── Histogram hesapla ── */
  const hist = result ? (() => {
    const vals = result.finalValues;
    const mn = vals[0], mx = vals[vals.length - 1], step = (mx - mn) / 30;
    const buckets = Array(30).fill(0);
    for (const v of vals) buckets[Math.min(29, Math.floor((v - mn) / step))]++;
    return { buckets, max: Math.max(...buckets), mn, mx, step };
  })() : null;

  /* ══════════════════════════ RENDER ══════════════════════════════════════ */
  return (
    <div className="p-4 space-y-4 max-w-screen-2xl mx-auto">

      {/* ══ 1. KRİPTO PANELİ ══════════════════════════════════════════════ */}
      <div>
        {/* Başlık */}
        <div style={{ display:'flex', alignItems:'center', gap:10, fontWeight:700, fontSize:16, paddingBottom:12 }}>
          <Bitcoin size={16} color="#F7931A" />
          Kripto Piyasası
          <span style={{ fontSize:10, padding:'2px 8px', borderRadius:999, background:'rgba(247,147,26,.1)', color:'#F7931A', border:'1px solid rgba(247,147,26,.25)', fontFamily:'monospace' }}>CANLI</span>
          {crypto && <span style={{ fontSize:10, color:'#3d5570', marginLeft:'auto', fontFamily:'monospace' }}>{cryptoCd}sn</span>}
        </div>

        {/* BTC + ETH */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <BigCoinCard coin={crypto?.btc} />
          <BigCoinCard coin={crypto?.eth} />
        </div>

        {/* Top 10 Altcoin Yükseleni */}
        <div className="metric-card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <TrendingUp size={13} color={green} />
            <span style={{ fontWeight:700, fontSize:13 }}>En Çok Yükselen 10 Altcoin</span>
            <span style={{ fontSize:10, color:'#3d5570', fontFamily:'monospace', marginLeft:'auto' }}>24 saatlik değişim</span>
          </div>
          {!crypto ? (
            <Skel n={8} />
          ) : (crypto.gainers ?? []).length === 0 ? (
            <div style={{ padding:'16px 0', textAlign:'center', color:'#3d5570', fontSize:12 }}>Veri yok</div>
          ) : (
            (crypto.gainers ?? []).map((coin: any, i: number) => <AltRow key={coin.id} coin={coin} rank={i + 1} />)
          )}
        </div>
      </div>

      {/* ══ 2. 4 MODÜL ════════════════════════════════════════════════════ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>

        {/* BIST En Çok Yükselen */}
        <div className="metric-card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <BarChart2 size={14} color="#e63946" />
            <span style={{ fontWeight:700, fontSize:13 }}>BIST — Günün Yükselenleri</span>
            <span style={{ fontSize:9, padding:'1px 6px', borderRadius:999, background:'rgba(230,57,70,.1)', color:'#e63946', border:'1px solid rgba(230,57,70,.2)', marginLeft:'auto', fontFamily:'monospace' }}>CANLI</span>
          </div>
          {mktLoading ? <Skel /> : bistGainers.length === 0 ? (
            <div style={{ fontSize:12, color:'#3d5570', padding:'16px 0', textAlign:'center' }}>Borsa kapalı veya veri yok</div>
          ) : bistGainers.map((stock: any, i: number) => (
            <StockRow key={stock.symbol} stock={stock} rank={i + 1} tl />
          ))}
        </div>

        {/* ABD Borsası En Çok Yükselen */}
        <div className="metric-card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <Globe size={14} color="#4361ee" />
            <span style={{ fontWeight:700, fontSize:13 }}>ABD — Günün Yükselenleri</span>
            <span style={{ fontSize:9, padding:'1px 6px', borderRadius:999, background:'rgba(67,97,238,.1)', color:'#4361ee', border:'1px solid rgba(67,97,238,.2)', marginLeft:'auto', fontFamily:'monospace' }}>CANLI</span>
          </div>
          {mktLoading ? <Skel /> : usGainers.length === 0 ? (
            <div style={{ fontSize:12, color:'#3d5570', padding:'16px 0', textAlign:'center' }}>Borsa kapalı veya veri yok</div>
          ) : usGainers.map((stock: any, i: number) => (
            <StockRow key={stock.symbol} stock={stock} rank={i + 1} />
          ))}
        </div>

        {/* Banka TL Faiz Oranları */}
        <div className="metric-card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <Landmark size={14} color="#f77f00" />
            <span style={{ fontWeight:700, fontSize:13 }}>Banka TL Faiz Oranları</span>
            <span style={{ fontSize:9, padding:'1px 6px', borderRadius:999, background:'rgba(247,127,0,.1)', color:'#f77f00', border:'1px solid rgba(247,127,0,.2)', marginLeft:'auto', fontFamily:'monospace' }}>1 Ay</span>
          </div>
          {bankRates && (
            <div style={{ fontSize:10, color:'#3d5570', marginBottom:8, fontFamily:'monospace' }}>
              TCMB Politika Faizi: <span style={{ color:'#f77f00', fontWeight:700 }}>%{bankRates.tcmbPolicy?.toFixed(2)}</span>
            </div>
          )}
          {!bankRates ? <Skel n={7} /> : (bankRates.rates ?? []).map((b: any, i: number) => (
            <div key={b.bank} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:10, color:'#3d5570', width:16, textAlign:'right', fontFamily:'monospace', flexShrink:0 }}>{i + 1}</span>
                <span style={{ fontSize:11, color:'#c8d8e8' }}>{b.bank}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:13, fontFamily:'monospace', fontWeight:700, color:'#f77f00' }}>%{b.rate1m?.toFixed(2)}</span>
                <div style={{ width:36, height:4, borderRadius:2, background:'hsl(222 47% 8%)' }}>
                  <div style={{ width:`${Math.min(100, ((b.rate1m - 36) / 8) * 100)}%`, height:'100%', borderRadius:2, background:'#f77f00' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TEFAS En Çok Getiren Fonlar */}
        <div className="metric-card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <Building2 size={14} color="#a855f7" />
            <span style={{ fontWeight:700, fontSize:13 }}>TEFAS — En Çok Getiren Fonlar</span>
            <span style={{ fontSize:9, padding:'1px 6px', borderRadius:999, background:'rgba(168,85,247,.1)', color:'#a855f7', border:'1px solid rgba(168,85,247,.2)', marginLeft:'auto', fontFamily:'monospace' }}>30G</span>
          </div>
          {mktLoading ? <Skel /> : funds.length === 0 ? (
            <div style={{ fontSize:12, color:'#3d5570', padding:'16px 0', textAlign:'center', lineHeight:1.6 }}>
              TEFAS verisi yükleniyor…<br />
              <span style={{ fontSize:10 }}>Piyasa açık saatlerinde güncellenir</span>
            </div>
          ) : funds.map((f: any, i: number) => (
            <div key={f.code} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
              <span style={{ fontSize:10, color:'#3d5570', width:18, textAlign:'right', fontFamily:'monospace', flexShrink:0 }}>{i + 1}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight:700, fontFamily:'monospace', color:'#c8d8e8' }}>{f.code}</div>
                <div style={{ fontSize:10, color:'#4a6080', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#a855f7' }}>+{(f.return30d ?? 0).toFixed(2)}%</div>
                {f.return1y != null && <div style={{ fontSize:10, color:'#4a6080', fontFamily:'monospace' }}>1Y %{f.return1y?.toFixed(1)}</div>}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ══ 3. MONTE CARLO SİMÜLASYONU ════════════════════════════════════ */}
      <div className="metric-card">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-emerald-400" />
          <div className="text-sm font-semibold">Monte Carlo Simülasyon Parametreleri</div>
          <span className="text-xs text-muted-foreground ml-auto">3.000 yol · GBM</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: `Başlangıç: ₺${(params.S0 / 1e6).toFixed(1)}M`, key: 'S0', min: 500000, max: 20000000, step: 100000 },
            { label: `Yıllık Getiri: %${(params.mu * 100).toFixed(0)}`, key: 'mu', min: 0.05, max: 0.60, step: 0.01 },
            { label: `Volatilite: %${(params.sigma * 100).toFixed(0)}`, key: 'sigma', min: 0.05, max: 0.60, step: 0.01 },
            { label: `Ufuk: ${params.years} yıl`, key: 'years', min: 1, max: 20, step: 1 },
          ].map(p => (
            <div key={p.key}>
              <label className="block text-xs text-muted-foreground mb-1">{p.label}</label>
              <input type="range" min={p.min} max={p.max} step={p.step}
                value={params[p.key as keyof typeof params]}
                onChange={e => {
                  const next = { ...params, [p.key]: +e.target.value };
                  setParams(next);
                }}
                className="w-full accent-emerald-400" />
            </div>
          ))}
        </div>
        <button onClick={() => runSim()} disabled={running}
          className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg transition-all"
          style={{ background: 'hsl(158 64% 42%)', color: '#fff' }}>
          {running ? 'Simüle ediliyor…' : `Simülasyonu Çalıştır (${params.years * 12} adım)`}
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-12 gap-4">
          {/* KPI strip */}
          <div className="col-span-12 grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: 'Medyan Sonuç',      value: `₺${(result.median / 1e6).toFixed(2)}M`,  color: green,   sub: `Getiri: ${((result.median / params.S0 - 1) * 100).toFixed(0)}%` },
              { label: 'P5 Kötü Senaryo',   value: `₺${(result.p5     / 1e6).toFixed(2)}M`,  color: red,     sub: `Kayıp: ${((result.p5 / params.S0 - 1) * 100).toFixed(0)}%` },
              { label: 'P95 İyi Senaryo',   value: `₺${(result.p95    / 1e6).toFixed(2)}M`,  color: '#00d4ff', sub: `Getiri: ${((result.p95 / params.S0 - 1) * 100).toFixed(0)}%` },
              { label: 'VaR (%95)',          value: `₺${(result.var95  / 1e6).toFixed(2)}M`,  color: '#f59e0b', sub: 'Günlük 1-yıl ufku' },
              { label: 'CVaR (ES)',          value: `₺${(result.cvar95 / 1e6).toFixed(2)}M`,  color: '#8b5cf6', sub: 'Beklenen kayıp kuyruğu' },
              { label: 'Sharpe',            value: result.sharpe.toFixed(3),                   color: result.sharpe > 1 ? green : result.sharpe > 0.5 ? '#f59e0b' : red, sub: result.sharpe > 1 ? 'Mükemmel' : result.sharpe > 0.5 ? 'İyi' : 'Zayıf' },
            ].map(k => (
              <div key={k.label} className="metric-card card-hover text-center">
                <div className="text-base font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="text-xs font-mono mt-0.5" style={{ color: k.color, opacity: 0.7, fontSize: '10px' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Histogram */}
          {hist && (
            <div className="col-span-12 md:col-span-6 metric-card">
              <div className="text-sm font-semibold mb-1">Terminal Değer Dağılımı</div>
              <div className="text-xs text-muted-foreground mb-3">Monte Carlo {params.years} yıl · {result.finalValues.length} simülasyon</div>
              <div className="flex items-end gap-0.5" style={{ height: 140 }}>
                {hist.buckets.map((count: number, i: number) => {
                  const val = hist.mn + i * hist.step;
                  const isVar = val < params.S0 - result.var95;
                  return (
                    <div key={i} className="flex-1 flex items-end" style={{ height: '100%' }}>
                      <div className="w-full rounded-t" style={{ height: `${(count / hist.max) * 100}%`, background: isVar ? 'hsl(0 84% 55%)' : val > params.S0 ? 'hsl(158 64% 42%)' : 'hsl(199 95% 55%)', opacity: 0.8 }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1">
                <span>₺{(hist.mn / 1e6).toFixed(1)}M</span>
                <span className="text-red-400">← VaR sınırı</span>
                <span>₺{(hist.mx / 1e6).toFixed(1)}M</span>
              </div>
            </div>
          )}

          {/* Gayrimenkul projeksiyonu */}
          {reResult && (
            <div className="col-span-12 md:col-span-6 metric-card">
              <div className="text-sm font-semibold mb-1">Gayrimenkul Yatırım Projeksiyonu</div>
              <div className="text-xs text-muted-foreground mb-3">Kira getirisi dahil · %{(params.mu * 100).toFixed(0)} değerlenme · IRR: %{(reResult.irr * 100).toFixed(1)}</div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[{ label: 'IRR', value: `%${(reResult.irr * 100).toFixed(1)}` }, { label: 'Medyan Net', value: `₺${(reResult.totalReturn.median / 1e6).toFixed(2)}M` }, { label: 'Sharpe', value: reResult.totalReturn.sharpe.toFixed(2) }].map(k => (
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
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.abs(roi) * 50)}%`, background: roi > 0 ? green : red }} />
                    </div>
                    <span className="font-mono w-12 text-right" style={{ color: roi > 0 ? green : red }}>{roi >= 0 ? '+' : ''}{(roi * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forex Kalman */}
          {currency && kalmanForex.length > 0 && (
            <div className="col-span-12 metric-card">
              <div className="text-sm font-semibold mb-1">USD/TRY — Kalman Filtresi Analizi</div>
              <div className="text-xs text-muted-foreground mb-3">Ham veri (gri) + Kalman düzeltmeli (yeşil)</div>
              <ForexChart raw={currency.usdtry} smoothed={kalmanForex} height={100} />
            </div>
          )}
        </div>
      )}

      {/* ══ 4. FİNANS HABERLERİ ═══════════════════════════════════════════ */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, fontWeight:700, fontSize:16 }}>
            <DollarSign size={16} color="#0BC5EA" />
            Finans Haberleri
            <span style={{ fontSize:10, fontFamily:'monospace', padding:'2px 8px', borderRadius:999, background:'rgba(11,197,234,.1)', color:'#0BC5EA', border:'1px solid rgba(11,197,234,.25)' }}>CANLI</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {newsLastUpd && <span style={{ fontSize:11, fontFamily:'monospace', color:'#3d5570' }}>{finNews.length} haber · {newscd}sn</span>}
            <button onClick={() => loadFinNews(true)} disabled={newsBusy} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, padding:'6px 12px', borderRadius:8, border:'1px solid #1a2535', background:'transparent', color:'#4a6080', cursor:'pointer' }}>
              <RefreshCw size={13} style={newsBusy ? { animation:'spin 1s linear infinite' } : {}} />
              Yenile
            </button>
          </div>
        </div>

        {newsLoading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
            {[...Array(6)].map((_, k) => <div key={k} style={{ height:220, borderRadius:16, background:'hsl(222 47% 8%)', opacity:1-k*.1 }} />)}
          </div>
        ) : finNews.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', borderRadius:16, background:'hsl(222 47% 8%)' }}>
            <p style={{ color:'#4a6080' }}>Haberler yükleniyor…</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
            {finNews.map((item, k) => <FinCard key={item.id} item={item} i={k} />)}
          </div>
        )}
      </div>

    </div>
  );
}
