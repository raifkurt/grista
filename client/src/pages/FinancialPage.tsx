import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNewsByCategory, NewsItem } from '@/lib/data/liveData';
import { MonteCarloEngine } from '@/lib/algorithms/monteCarlo';
import { KalmanFilter } from '@/lib/algorithms/kalman';
import { generateCurrencyData } from '@/lib/data/marketData';
import { DollarSign, Activity, RefreshCw, TrendingUp, Bitcoin, BarChart2, Globe, Landmark, Building2 } from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function ago(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`; if (s < 3600) return `${Math.floor(s/60)}dk`;
  if (s < 86400) return `${Math.floor(s/3600)}sa`; return `${Math.floor(s/86400)}g`;
}
function fmtUSD(p: number) {
  if (!p && p !== 0) return '—';
  if (p >= 1000) return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (p >= 1)    return '$' + p.toFixed(2);
  if (p >= 0.01) return '$' + p.toFixed(4);
  return '$' + p.toFixed(6);
}
function fmtM(v: number) {
  if (!v) return '—';
  if (v >= 1e12) return '$' + (v/1e12).toFixed(2) + 'T';
  if (v >= 1e9)  return '$' + (v/1e9).toFixed(1) + 'B';
  return '$' + (v/1e6).toFixed(0) + 'M';
}
const G = '#10b981', R = '#ef4444';
const cc = (c: number) => c >= 0 ? G : R;

/* ─── statik banka verileri (anında gösterim) ─────────────────────────────── */
const BANK_RATES = [
  { bank: 'QNB Finansbank',     rate1m: 41.00 },
  { bank: 'HSBC Türkiye',       rate1m: 40.50 },
  { bank: 'Yapı Kredi',         rate1m: 40.00 },
  { bank: 'Denizbank',          rate1m: 40.00 },
  { bank: 'Garanti BBVA',       rate1m: 39.50 },
  { bank: 'Akbank',             rate1m: 39.25 },
  { bank: 'Türkiye İş Bankası', rate1m: 39.00 },
  { bank: 'TEB',                rate1m: 38.75 },
  { bank: 'Vakıfbank',          rate1m: 38.50 },
  { bank: 'Halkbank',           rate1m: 38.50 },
  { bank: 'Ziraat Bankası',     rate1m: 38.00 },
];

/* ─── statik TEFAS fonları (anında gösterim) ──────────────────────────────── */
const STATIC_FUNDS = [
  { code: 'TTE', name: 'Tacirler Portföy Teknoloji Hisse Fonu',         return30d: 8.42, return1y: 67.3 },
  { code: 'IAH', name: 'İş Portföy Yapay Zeka & Teknoloji Hisse Fonu',  return30d: 7.89, return1y: 58.1 },
  { code: 'TI2', name: 'TEFAS İstanbul Hisse Senedi Fonu',               return30d: 6.94, return1y: 51.2 },
  { code: 'GAH', name: 'Garanti Portföy BIST Temettü 25 Fonu',           return30d: 6.41, return1y: 48.7 },
  { code: 'AKH', name: 'Ak Portföy BIST 30 Endeks Fonu',                 return30d: 5.87, return1y: 43.9 },
  { code: 'YEH', name: 'Yapı Kredi Portföy Hisse Fonu',                  return30d: 5.63, return1y: 41.2 },
  { code: 'DZH', name: 'Deniz Portföy Hisse Fonu',                       return30d: 5.21, return1y: 38.6 },
  { code: 'ZRH', name: 'Ziraat Portföy BIST Hisse Fonu',                 return30d: 4.98, return1y: 36.4 },
  { code: 'HLH', name: 'Halk Portföy Hisse Fonu',                        return30d: 4.72, return1y: 34.1 },
  { code: 'VKH', name: 'Vakıf Portföy Hisse Senedi Fonu',                return30d: 4.51, return1y: 32.8 },
];

/* ─── image kw ────────────────────────────────────────────────────────────── */
const FIN_KW = [
  'finance,stock,market','money,currency,banking','business,economy,office',
  'crypto,bitcoin,blockchain','investment,chart,growth','bank,finance,building',
  'trading,exchange,numbers','savings,wealth,gold','economy,global,trade',
  'startup,entrepreneur,tech','coins,gold,wealth','data,analytics,charts',
  'economics,market,analysis','wall-street,nasdaq,stocks','real-estate,property,invest',
];
function finImg(item: NewsItem) {
  if (item.image) return item.image;
  let h = 5381;
  for (const c of item.id + item.title) h = ((h<<5)+h+c.charCodeAt(0))&0x7fffffff;
  const a = Math.abs(h);
  return `https://loremflickr.com/800/500/${FIN_KW[a%FIN_KW.length]}?lock=${a%9999}`;
}

/* ─── BigCoin ──────────────────────────────────────────────────────────────── */
function BigCoin({ coin, loading }: { coin: any; loading: boolean }) {
  if (loading) return (
    <div className="metric-card" style={{ minHeight: 130 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'hsl(222 47% 10%)' }} />
        <div style={{ flex:1, height:14, borderRadius:6, background:'hsl(222 47% 10%)' }} />
      </div>
      {[0,1].map(i => <div key={i} style={{ height:12, borderRadius:6, background:'hsl(222 47% 10%)', marginBottom:6, opacity:1-i*.3 }} />)}
    </div>
  );
  if (!coin) return null;
  const c = coin.change24h ?? 0;
  return (
    <div className="metric-card" style={{ borderTop:`2px solid ${cc(c)}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <img src={coin.image} alt={coin.symbol} style={{ width:40, height:40, borderRadius:'50%', flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:16 }}>{coin.name}</div>
          <div style={{ fontSize:11, color:'#4a6080', fontFamily:'monospace' }}>{coin.symbol}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontWeight:800, fontSize:20, fontFamily:'monospace' }}>{fmtUSD(coin.price)}</div>
          <div style={{ fontSize:14, fontWeight:700, color:cc(c) }}>{c>=0?'+':''}{c.toFixed(2)}%</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
        {[['Piyasa Değeri',fmtM(coin.marketCap)],['Hacim 24s',fmtM(coin.volume)],['24s Yüksek',fmtUSD(coin.high24h)]].map(([l,v])=>(
          <div key={l} style={{ background:'hsl(222 47% 5%)', borderRadius:8, padding:'6px 8px', textAlign:'center' }}>
            <div style={{ fontSize:9, color:'#3d5570', marginBottom:2 }}>{l}</div>
            <div style={{ fontSize:10, fontFamily:'monospace', color:'#8eb4d8', fontWeight:600 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── AltRow ───────────────────────────────────────────────────────────────── */
function AltRow({ coin, rank }: { coin: any; rank: number }) {
  const c = coin.change24h ?? 0;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
      <span style={{ fontSize:10, color:'#3d5570', fontFamily:'monospace', width:18, textAlign:'right', flexShrink:0 }}>{rank}</span>
      <img src={coin.image} alt={coin.symbol} style={{ width:26, height:26, borderRadius:'50%', flexShrink:0 }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:600 }}>{coin.name}</div>
        <div style={{ fontSize:10, color:'#4a6080', fontFamily:'monospace' }}>{coin.symbol}</div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontSize:12, fontFamily:'monospace', fontWeight:600 }}>{fmtUSD(coin.price)}</div>
        <div style={{ fontSize:11, fontWeight:700, color:G }}>+{c.toFixed(2)}%</div>
      </div>
      <div style={{ width:50, height:4, borderRadius:2, background:'hsl(222 47% 8%)', flexShrink:0 }}>
        <div style={{ width:`${Math.min(100,c*1.5)}%`, height:'100%', borderRadius:2, background:G }} />
      </div>
    </div>
  );
}

/* ─── StockRow ─────────────────────────────────────────────────────────────── */
function StockRow({ st, rank, tl }: { st: any; rank: number; tl?: boolean }) {
  const c = st.changePct ?? 0;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
      <span style={{ fontSize:10, color:'#3d5570', fontFamily:'monospace', width:18, textAlign:'right', flexShrink:0 }}>{rank}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <span style={{ fontSize:12, fontWeight:700, fontFamily:'monospace' }}>{st.symbol}</span>
        <span style={{ fontSize:10, color:'#4a6080', marginLeft:6 }}>{(st.name??'').slice(0,22)}</span>
      </div>
      <span style={{ fontSize:12, fontFamily:'monospace', fontWeight:600, flexShrink:0 }}>{tl?`₺`:'$'}{(st.price??0).toFixed(2)}</span>
      <span style={{ fontSize:12, fontWeight:700, color:cc(c), minWidth:52, textAlign:'right', flexShrink:0 }}>{c>=0?'+':''}{c.toFixed(2)}%</span>
    </div>
  );
}

/* ─── FinCard ──────────────────────────────────────────────────────────────── */
function FinCard({ item, i }: { item: NewsItem; i: number }) {
  const [show,setShow] = useState(false); const [err,setErr] = useState(false);
  const d = Math.min(i*40,600);
  useEffect(()=>{const t=setTimeout(()=>setShow(true),d);return()=>clearTimeout(t);},[d]);
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display:'block', position:'relative', height:220, borderRadius:16, overflow:'hidden', border:'1px solid rgba(11,197,234,.18)', textDecoration:'none', opacity:show?1:0, transform:show?'none':'translateY(14px)', transition:`opacity .35s ease ${d}ms,transform .35s ease ${d}ms` }}>
      {!err ? <img src={finImg(item)} alt="" onError={()=>setErr(true)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(11,197,234,.12),#05090f)' }} />}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(3,8,20,.97) 0%,rgba(3,8,20,.82) 30%,rgba(3,8,20,.05) 60%,transparent 75%)' }} />
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(to right,#0BC5EA,#00d4ff)' }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'10px 14px' }}>
        <p style={{ margin:'0 0 5px', fontWeight:700, fontSize:'clamp(12px,2vw,15px)', lineHeight:1.3, color:'#fff' }}>{item.title}</p>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.38)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.source}</span>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.28)', fontFamily:'monospace' }}>{ago(item.pubDate)}</span>
        </div>
      </div>
    </a>
  );
}

/* ─── Skel ─────────────────────────────────────────────────────────────────── */
const Skel = ({ n=5 }: { n?: number }) => (
  <>{[...Array(n)].map((_,i)=><div key={i} style={{ height:28, borderRadius:6, background:'hsl(222 47% 8%)', marginBottom:4, opacity:1-i*.15 }}/>)}</>
);

/* ─── ForexChart ───────────────────────────────────────────────────────────── */
function ForexChart({ raw, smoothed, height }: { raw:number[]; smoothed:number[]; height:number }) {
  const all=[...raw,...smoothed], mn=Math.min(...all)*.995, mx=Math.max(...all)*1.005, n=raw.length;
  const toX=(i:number)=>(i/(n-1))*100, toY=(v:number)=>height-((v-mn)/(mx-mn))*height;
  const rP=raw.map((v,i)=>`${i===0?'M':'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
  const kP=smoothed.map((v,i)=>`${i===0?'M':'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height, display:'block' }} preserveAspectRatio="none">
      <path d={rP} fill="none" stroke="hsl(217 33% 35%)" strokeWidth="0.4"/>
      <path d={kP} fill="none" stroke="hsl(158 64% 52%)" strokeWidth="0.7"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ANA SAYFA
══════════════════════════════════════════════════════════════════════════════ */
export default function FinancialPage() {

  /* Monte Carlo */
  const [params,  setParams]  = useState({ S0:2000000, mu:.18, sigma:.22, years:5 });
  const [result,  setResult]  = useState<any>(null);
  const [reResult,setReResult]= useState<any>(null);
  const [currency,setCurrency]= useState<any>(null);
  const [kalman,  setKalman]  = useState<number[]>([]);
  const [running, setRunning] = useState(false);

  /* Kripto */
  const [crypto,   setCrypto]  = useState<any>(null);
  const [cryptoLd, setCryptoLd]= useState(true);
  const [cryptoCd, setCryptoCd]= useState(300);
  const cdRef = useRef(300);

  /* Borsa */
  const [usGainers,   setUsG]  = useState<any[]>([]);
  const [bistGainers, setBistG]= useState<any[]>([]);
  const [usLd,  setUsLd]  = useState(true);
  const [bistLd,setBistLd]= useState(true);

  /* Haberler */
  const [finNews,     setFinNews]    = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading]= useState(true);
  const [newsBusy,    setNewsBusy]   = useState(false);
  const [newsLastUpd, setNewsLastUpd]= useState<Date|null>(null);
  const [newscd,      setNewscd]     = useState(30);
  const newsCdRef = useRef(30);

  /* Monte Carlo init */
  useEffect(()=>{
    const cur=generateCurrencyData(180); setCurrency(cur);
    const {smoothed}=new KalmanFilter(100,1).filter(cur.usdtry); setKalman(smoothed);
    runSim({S0:2000000,mu:.18,sigma:.22,years:5});
  },[]);
  function runSim(p=params){
    setRunning(true);
    setTimeout(()=>{
      const e=new MonteCarloEngine(3000);
      setResult(e.simulateGBM(p.S0,p.mu,p.sigma,p.years,p.years*12));
      setReResult(e.projectRealEstate({ initialValue:p.S0, annualAppreciation:.28, appreciationVol:.15, rentalYield:.04, rentalGrowth:.10, rentalVol:.05, years:p.years, taxRate:.15, maintenancePct:.01 }));
      setRunning(false);
    },100);
  }

  /* Kripto: her 5 dakika */
  const loadCrypto = useCallback(async(force=false)=>{
    setCryptoLd(true);
    try{const r=await fetch(`/api/cryptodetail?${force?'force=1&':''}_=${Date.now()}`,{cache:'no-store'});if(r.ok)setCrypto(await r.json());}catch{}
    setCryptoLd(false); cdRef.current=300;
  },[]);
  useEffect(()=>{loadCrypto();},[loadCrypto]);
  useEffect(()=>{
    const t=setInterval(()=>{cdRef.current-=1;setCryptoCd(cdRef.current);if(cdRef.current<=0)loadCrypto();},1000);
    return()=>clearInterval(t);
  },[loadCrypto]);

  /* ABD hisseler */
  useEffect(()=>{
    fetch(`/api/us/gainers?_=${Date.now()}`,{cache:'no-store'})
      .then(r=>r.ok?r.json():[]).catch(()=>[])
      .then(d=>{setUsG(Array.isArray(d)?d:[]);setUsLd(false);});
  },[]);

  /* BIST hisseler */
  useEffect(()=>{
    fetch(`/api/bist/gainers?_=${Date.now()}`,{cache:'no-store'})
      .then(r=>r.ok?r.json():[]).catch(()=>[])
      .then(d=>{setBistG(Array.isArray(d)?d:[]);setBistLd(false);});
  },[]);

  /* Haberler */
  const loadFinNews=useCallback(async(force=false)=>{
    setNewsBusy(true);
    try{const items=await fetchNewsByCategory('finans',force);if(items.length){setFinNews([...items].sort((a,b)=>new Date(b.pubDate).getTime()-new Date(a.pubDate).getTime()));setNewsLastUpd(new Date());}}catch{}
    setNewsLoading(false);setNewsBusy(false);newsCdRef.current=30;
  },[]);
  useEffect(()=>{loadFinNews();},[loadFinNews]);
  useEffect(()=>{
    const h=(e:Event)=>loadFinNews((e as CustomEvent).detail?.force??false);
    window.addEventListener('ptr',h);return()=>window.removeEventListener('ptr',h);
  },[loadFinNews]);
  useEffect(()=>{
    const t=setInterval(()=>{newsCdRef.current-=1;setNewscd(newsCdRef.current);if(newsCdRef.current<=0)loadFinNews();},1000);
    return()=>clearInterval(t);
  },[loadFinNews]);

  /* Histogram */
  const hist=result?(()=>{
    const v=result.finalValues,mn=v[0],mx=v[v.length-1],step=(mx-mn)/30;
    const b=Array(30).fill(0);for(const x of v)b[Math.min(29,Math.floor((x-mn)/step))]++;
    return{b,max:Math.max(...b),mn,mx,step};
  })():null;

  /* ═══════════════════ RENDER ══════════════════════════════════════════════ */
  return (
    <div className="p-4 space-y-4 max-w-screen-2xl mx-auto">

      {/* ══ 1. KRİPTO ════════════════════════════════════════════════════════ */}
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontWeight:700, fontSize:16, paddingBottom:12 }}>
          <Bitcoin size={16} color="#F7931A"/>
          Kripto Piyasası
          <span style={{ fontSize:10, padding:'2px 8px', borderRadius:999, background:'rgba(247,147,26,.1)', color:'#F7931A', border:'1px solid rgba(247,147,26,.25)', fontFamily:'monospace' }}>CANLI</span>
          {!cryptoLd && <span style={{ fontSize:10, color:'#3d5570', marginLeft:'auto', fontFamily:'monospace' }}>{cryptoCd}sn</span>}
        </div>

        {/* BTC — tam genişlik */}
        <div style={{ marginBottom:12 }}>
          <BigCoin coin={crypto?.btc} loading={cryptoLd}/>
        </div>
        {/* ETH — tam genişlik */}
        <div style={{ marginBottom:12 }}>
          <BigCoin coin={crypto?.eth} loading={cryptoLd}/>
        </div>

        {/* Top 10 altcoin */}
        <div className="metric-card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <TrendingUp size={13} color={G}/>
            <span style={{ fontWeight:700, fontSize:13 }}>En Çok Yükselen 20 Altcoin</span>
            <span style={{ fontSize:10, color:'#3d5570', marginLeft:'auto', fontFamily:'monospace' }}>24 saatlik</span>
          </div>
          {cryptoLd ? <Skel n={8}/> : (crypto?.gainers??[]).length===0 ? (
            <div style={{ padding:'16px 0', textAlign:'center', color:'#3d5570', fontSize:12 }}>Yükleniyor…</div>
          ) : (crypto.gainers??[]).map((c:any,i:number)=><AltRow key={c.id} coin={c} rank={i+1}/>)}
        </div>
      </div>

      {/* ══ 2. BIST ══════════════════════════════════════════════════════════ */}
      <div className="metric-card">
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <BarChart2 size={14} color="#e63946"/>
          <span style={{ fontWeight:700, fontSize:13 }}>BIST — Günün En Çok Yükselenleri</span>
          <span style={{ fontSize:9, padding:'1px 6px', borderRadius:999, background:'rgba(230,57,70,.1)', color:'#e63946', border:'1px solid rgba(230,57,70,.2)', marginLeft:'auto', fontFamily:'monospace' }}>CANLI</span>
        </div>
        {bistLd ? <Skel/> : bistGainers.length===0 ? (
          <div style={{ fontSize:12, color:'#3d5570', padding:'16px 0', textAlign:'center' }}>Borsa kapalı veya veri yok</div>
        ) : bistGainers.map((s:any,i:number)=><StockRow key={s.symbol} st={s} rank={i+1} tl/>)}
      </div>

      {/* ══ 3. ABD BORSASI ═══════════════════════════════════════════════════ */}
      <div className="metric-card">
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <Globe size={14} color="#4361ee"/>
          <span style={{ fontWeight:700, fontSize:13 }}>ABD Borsası — Günün En Çok Yükselenleri</span>
          <span style={{ fontSize:9, padding:'1px 6px', borderRadius:999, background:'rgba(67,97,238,.1)', color:'#4361ee', border:'1px solid rgba(67,97,238,.2)', marginLeft:'auto', fontFamily:'monospace' }}>CANLI</span>
        </div>
        {usLd ? <Skel/> : usGainers.length===0 ? (
          <div style={{ fontSize:12, color:'#3d5570', padding:'16px 0', textAlign:'center' }}>Borsa kapalı veya veri yok</div>
        ) : usGainers.map((s:any,i:number)=><StockRow key={s.symbol} st={s} rank={i+1}/>)}
      </div>

      {/* ══ 4. BANKA FAİZ ORANLARI (statik — anında gösterim) ════════════════ */}
      <div className="metric-card">
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <Landmark size={14} color="#f77f00"/>
          <span style={{ fontWeight:700, fontSize:13 }}>Banka TL Faiz Oranları</span>
          <span style={{ fontSize:9, padding:'1px 6px', borderRadius:999, background:'rgba(247,127,0,.1)', color:'#f77f00', border:'1px solid rgba(247,127,0,.2)', marginLeft:'auto', fontFamily:'monospace' }}>1 AY VADELİ</span>
        </div>
        <div style={{ fontSize:10, color:'#3d5570', marginBottom:8, fontFamily:'monospace' }}>
          TCMB Politika Faizi: <span style={{ color:'#f77f00', fontWeight:700 }}>%37.00</span>
          <span style={{ marginLeft:12, color:'#2d3e50' }}>Gecelik Borç Verme: <span style={{ color:'#f77f00' }}>%40.00</span></span>
        </div>
        {BANK_RATES.map((b,i)=>(
          <div key={b.bank} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:10, color:'#3d5570', width:18, textAlign:'right', fontFamily:'monospace', flexShrink:0 }}>{i+1}</span>
              <span style={{ fontSize:12, color:'#c8d8e8' }}>{b.bank}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:14, fontFamily:'monospace', fontWeight:700, color:'#f77f00' }}>%{b.rate1m.toFixed(2)}</span>
              <div style={{ width:40, height:4, borderRadius:2, background:'hsl(222 47% 8%)' }}>
                <div style={{ width:`${Math.min(100,((b.rate1m-36)/8)*100)}%`, height:'100%', borderRadius:2, background:'#f77f00' }}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ 5. TEFAS FONLARI (statik — anında gösterim) ══════════════════════ */}
      <div className="metric-card">
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <Building2 size={14} color="#a855f7"/>
          <span style={{ fontWeight:700, fontSize:13 }}>TEFAS — En Çok Getiren Yatırım Fonları</span>
          <span style={{ fontSize:9, padding:'1px 6px', borderRadius:999, background:'rgba(168,85,247,.1)', color:'#a855f7', border:'1px solid rgba(168,85,247,.2)', marginLeft:'auto', fontFamily:'monospace' }}>30 GÜNLÜK</span>
        </div>
        {STATIC_FUNDS.map((f,i)=>(
          <div key={f.code} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
            <span style={{ fontSize:10, color:'#3d5570', width:18, textAlign:'right', fontFamily:'monospace', flexShrink:0 }}>{i+1}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:700, fontFamily:'monospace', color:'#c8d8e8' }}>{f.code}</div>
              <div style={{ fontSize:10, color:'#4a6080', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#a855f7' }}>+{f.return30d.toFixed(2)}%</div>
              <div style={{ fontSize:10, color:'#4a6080', fontFamily:'monospace' }}>1Y %{f.return1y.toFixed(1)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ 6. MONTE CARLO ════════════════════════════════════════════════════ */}
      <div className="metric-card">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-emerald-400"/>
          <div className="text-sm font-semibold">Monte Carlo Simülasyon</div>
          <span className="text-xs text-muted-foreground ml-auto">3.000 yol · GBM</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {label:`Başlangıç: ₺${(params.S0/1e6).toFixed(1)}M`,key:'S0',min:500000,max:20000000,step:100000},
            {label:`Getiri: %${(params.mu*100).toFixed(0)}`,key:'mu',min:.05,max:.60,step:.01},
            {label:`Volatilite: %${(params.sigma*100).toFixed(0)}`,key:'sigma',min:.05,max:.60,step:.01},
            {label:`Ufuk: ${params.years} yıl`,key:'years',min:1,max:20,step:1},
          ].map(p=>(
            <div key={p.key}>
              <label className="block text-xs text-muted-foreground mb-1">{p.label}</label>
              <input type="range" min={p.min} max={p.max} step={p.step} value={params[p.key as keyof typeof params]}
                onChange={e=>{const nx={...params,[p.key]:+e.target.value};setParams(nx);}}
                className="w-full accent-emerald-400"/>
            </div>
          ))}
        </div>
        <button onClick={()=>runSim()} disabled={running} className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg" style={{ background:'hsl(158 64% 42%)',color:'#fff' }}>
          {running?'Hesaplanıyor…':`Simülasyonu Çalıştır (${params.years*12} adım)`}
        </button>
      </div>

      {result&&(
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              {label:'Medyan',value:`₺${(result.median/1e6).toFixed(2)}M`,color:G,sub:`+${((result.median/params.S0-1)*100).toFixed(0)}%`},
              {label:'P5 Kötü',value:`₺${(result.p5/1e6).toFixed(2)}M`,color:R,sub:`${((result.p5/params.S0-1)*100).toFixed(0)}%`},
              {label:'P95 İyi',value:`₺${(result.p95/1e6).toFixed(2)}M`,color:'#00d4ff',sub:`+${((result.p95/params.S0-1)*100).toFixed(0)}%`},
              {label:'VaR 95%',value:`₺${(result.var95/1e6).toFixed(2)}M`,color:'#f59e0b',sub:'Günlük'},
              {label:'CVaR',value:`₺${(result.cvar95/1e6).toFixed(2)}M`,color:'#8b5cf6',sub:'Beklenen kayıp'},
              {label:'Sharpe',value:result.sharpe.toFixed(3),color:result.sharpe>1?G:result.sharpe>.5?'#f59e0b':R,sub:result.sharpe>1?'Mükemmel':'İyi'},
            ].map(k=>(
              <div key={k.label} className="metric-card card-hover text-center">
                <div className="text-base font-bold font-mono" style={{color:k.color}}>{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="text-xs font-mono mt-0.5" style={{color:k.color,opacity:.7,fontSize:'10px'}}>{k.sub}</div>
              </div>
            ))}
          </div>
          {hist&&(
            <div className="col-span-12 md:col-span-6 metric-card">
              <div className="text-sm font-semibold mb-1">Terminal Değer Dağılımı</div>
              <div className="text-xs text-muted-foreground mb-3">{params.years} yıl · {result.finalValues.length} simülasyon</div>
              <div className="flex items-end gap-0.5" style={{height:140}}>
                {hist.b.map((cnt:number,i:number)=>{
                  const val=hist.mn+i*hist.step, isVar=val<params.S0-result.var95;
                  return <div key={i} className="flex-1 flex items-end" style={{height:'100%'}}><div className="w-full rounded-t" style={{height:`${(cnt/hist.max)*100}%`,background:isVar?'hsl(0 84% 55%)':val>params.S0?'hsl(158 64% 42%)':'hsl(199 95% 55%)',opacity:.8}}/></div>;
                })}
              </div>
              <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1">
                <span>₺{(hist.mn/1e6).toFixed(1)}M</span><span className="text-red-400">← VaR</span><span>₺{(hist.mx/1e6).toFixed(1)}M</span>
              </div>
            </div>
          )}
          {reResult&&(
            <div className="col-span-12 md:col-span-6 metric-card">
              <div className="text-sm font-semibold mb-1">Gayrimenkul Projeksiyonu</div>
              <div className="text-xs text-muted-foreground mb-3">IRR: %{(reResult.irr*100).toFixed(1)}</div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[{l:'IRR',v:`%${(reResult.irr*100).toFixed(1)}`},{l:'Medyan Net',v:`₺${(reResult.totalReturn.median/1e6).toFixed(2)}M`},{l:'Sharpe',v:reResult.totalReturn.sharpe.toFixed(2)}].map(k=>(
                  <div key={k.l} className="p-2 rounded-lg text-center" style={{background:'hsl(222 47% 5%)'}}>
                    <div className="text-sm font-bold font-mono text-emerald-400">{k.v}</div>
                    <div className="text-xs text-muted-foreground">{k.l}</div>
                  </div>
                ))}
              </div>
              {reResult.roiByYear?.slice(0,Math.min(params.years,5)).map((roi:number,i:number)=>(
                <div key={i} className="flex items-center gap-2 text-xs mb-1">
                  <span className="text-muted-foreground w-10">Yıl {i+1}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${Math.min(100,Math.abs(roi)*50)}%`,background:roi>0?G:R}}/></div>
                  <span className="font-mono w-12 text-right" style={{color:roi>0?G:R}}>{roi>=0?'+':''}{(roi*100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
          {currency&&kalman.length>0&&(
            <div className="col-span-12 metric-card">
              <div className="text-sm font-semibold mb-1">USD/TRY — Kalman Filtresi</div>
              <ForexChart raw={currency.usdtry} smoothed={kalman} height={100}/>
            </div>
          )}
        </div>
      )}

      {/* ══ 7. HABERLERw ══════════════════════════════════════════════════════ */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, fontWeight:700, fontSize:16 }}>
            <DollarSign size={16} color="#0BC5EA"/>
            Finans Haberleri
            <span style={{ fontSize:10, fontFamily:'monospace', padding:'2px 8px', borderRadius:999, background:'rgba(11,197,234,.1)', color:'#0BC5EA', border:'1px solid rgba(11,197,234,.25)' }}>CANLI</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {newsLastUpd&&<span style={{ fontSize:11, fontFamily:'monospace', color:'#3d5570' }}>{finNews.length} haber · {newscd}sn</span>}
            <button onClick={()=>loadFinNews(true)} disabled={newsBusy} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, padding:'6px 12px', borderRadius:8, border:'1px solid #1a2535', background:'transparent', color:'#4a6080', cursor:'pointer' }}>
              <RefreshCw size={13} style={newsBusy?{animation:'spin 1s linear infinite'}:{}}/>Yenile
            </button>
          </div>
        </div>
        {newsLoading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
            {[...Array(6)].map((_,k)=><div key={k} style={{ height:220, borderRadius:16, background:'hsl(222 47% 8%)', opacity:1-k*.1 }}/>)}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
            {finNews.map((item,k)=><FinCard key={item.id} item={item} i={k}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
