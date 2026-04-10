import React, { useEffect, useState, useRef } from 'react';
import { generatePriceTrendIndex, getMacroIndicators, generateSentimentData } from '@/lib/data/marketData';
import { ARIMA } from '@/lib/algorithms/arima';
import { KalmanFilter } from '@/lib/algorithms/kalman';
import { IsolationForest } from '@/lib/algorithms/isolationForest';
import {
  Activity, TrendingUp, Building2, DollarSign,
  Megaphone, Bot, AlertTriangle, Brain, Zap, Target,
  BarChart3, Globe, Shield, Landmark, Bitcoin,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════════
   BAĞIMSIZ MODÜLLER
════════════════════════════════════════════════════════════════════ */

/* ── Emtia ──────────────────────────────────────────────────────── */
const EMTIA_META: Record<string, { label: string; icon: string; color: string; unit: string }> = {
  'GC=F':     { label: 'Altın',        icon: '🪙', color: '#F59E0B', unit: '$/oz'    },
  'SI=F':     { label: 'Gümüş',        icon: '🥈', color: '#94A3B8', unit: '$/oz'    },
  'BZ=F':     { label: 'Brent Petrol', icon: '🛢️', color: '#6B7280', unit: '$/varil' },
  'NG=F':     { label: 'Doğal Gaz',    icon: '🔥', color: '#F97316', unit: '$/mmBtu' },
  'XU100.IS': { label: 'BIST 100',     icon: '📊', color: '#8B5CF6', unit: 'puan'    },
};
// Statik fallback — API başarısız olursa
const EMTIA_FALLBACK = [
  { symbol:'GC=F',     price:3162.40, changePct:0.32  },
  { symbol:'SI=F',     price:33.18,   changePct:0.54  },
  { symbol:'BZ=F',     price:71.85,   changePct:-0.28 },
  { symbol:'NG=F',     price:3.412,   changePct:-1.14 },
  { symbol:'XU100.IS', price:9821.4,  changePct:0.78  },
];
function EmtiaModulu() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  useEffect(() => {
    fetch(`/api/commodities?_=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null).catch(() => null)
      .then(d => {
        if (Array.isArray(d) && d.length > 0) {
          setData(d);
        } else {
          setData(EMTIA_FALLBACK);
          setIsFallback(true);
        }
        setLoading(false);
      });
  }, []);
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-semibold">Emtia & Piyasa Verileri</span>
        <span className="text-xs text-muted-foreground ml-auto">Yahoo Finance · 5dk</span>
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} style={{ height:34, borderRadius:8, background:'hsl(222 47% 8%)', opacity:1-i*.15 }} />)}</div>
      ) : data.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-3">Veri yüklenemedi — borsa kapalı olabilir</div>
      ) : data.map(d => {
        const m = EMTIA_META[d.symbol] ?? { label: d.name, icon: '📈', color: '#10b981', unit: d.currency };
        const c = d.changePct ?? 0;
        const px = d.price >= 10000 ? d.price.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : d.price >= 100 ? d.price.toFixed(2) : d.price?.toFixed(4);
        return (
          <div key={d.symbol} className="flex items-center justify-between p-2.5 rounded-xl mb-2" style={{ background:'hsl(222 47% 5%)', border:`1px solid ${m.color}18` }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize:20 }}>{m.icon}</span>
              <div>
                <div className="text-xs font-semibold">{m.label}</div>
                <div className="text-xs text-muted-foreground font-mono">{m.unit}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono" style={{ color:m.color }}>{px}</div>
              <div className="text-xs font-mono font-semibold" style={{ color:c>=0?'#10b981':'#ef4444' }}>{c>=0?'+':''}{c.toFixed(2)}%</div>
            </div>
          </div>
        );
      })}
      <div className="text-xs text-muted-foreground mt-1" style={{ fontSize:10 }}>Altın = güvenli liman · Petrol = küresel ekonomi barometresi</div>
    </div>
  );
}

/* ── Kripto Fear & Greed ────────────────────────────────────────── */
function KriptoPiyasaOzeti() {
  const [fg, setFg] = useState<any>(null);
  const [btc, setBtc] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/sentiment?_=${Date.now()}`, { cache:'no-store' }).then(r => r.ok?r.json():null).catch(()=>null).then(setFg);
    fetch(`/api/crypto?_=${Date.now()}`, { cache:'no-store' }).then(r => r.ok?r.json():null).catch(()=>null).then(setBtc);
  }, []);
  const val = fg?.value ?? 50;
  const labelTR: Record<string,string> = { 'Extreme Fear':'Aşırı Korku 😱','Fear':'Korku 😰','Neutral':'Nötr 😐','Greed':'Açgözlülük 😈','Extreme Greed':'Aşırı Açgözlülük 🤑' };
  const gaugeColor = val < 25 ? '#ef4444' : val < 50 ? '#f97316' : val < 75 ? '#84cc16' : '#10b981';
  const pct = (val / 100) * 180;
  const toRad = (deg: number) => deg * Math.PI / 180;
  const cx=60, cy=60, r=45, sa=180;
  const ea = sa + pct;
  const x1=cx+r*Math.cos(toRad(sa)), y1=cy+r*Math.sin(toRad(sa));
  const x2=cx+r*Math.cos(toRad(ea)), y2=cy+r*Math.sin(toRad(ea));
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-semibold">Kripto Piyasa Duygu Endeksi</span>
        <span className="text-xs text-muted-foreground ml-auto">Alternative.me</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <div className="text-xs text-muted-foreground mb-2 text-center">Korku & Açgözlülük</div>
          <svg viewBox="0 0 120 70" style={{ width:'100%', maxWidth:160 }}>
            <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="hsl(222 47% 10%)" strokeWidth="10" strokeLinecap="round" />
            {val > 0 && <path d={`M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${pct>90?1:0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`} fill="none" stroke={gaugeColor} strokeWidth="10" strokeLinecap="round" />}
            <text x={cx} y={cy-2} textAnchor="middle" fill={gaugeColor} fontSize="18" fontWeight="700" fontFamily="monospace">{val}</text>
            <text x={cx} y={cy+10} textAnchor="middle" fill="#4a6080" fontSize="7">/ 100</text>
          </svg>
          <div className="text-xs font-bold mt-1 text-center" style={{ color:gaugeColor }}>{labelTR[fg?.label] ?? '—'}</div>
          <div className="text-xs text-muted-foreground mt-1 text-center" style={{ fontSize:9 }}>
            {val < 30 ? '⬇ Korku var = alım fırsatı olabilir' : val > 70 ? '⬆ Açgözlülük = dikkatli ol!' : '→ Piyasa dengeli'}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2">
          {[
            { label:'Bitcoin', value:btc?.btcusd?`$${btc.btcusd.toLocaleString('en-US',{maximumFractionDigits:0})}`:'—', chg:btc?.btcChange24h, color:'#F7931A' },
            { label:'Ethereum', value:btc?.ethusd?`$${btc.ethusd.toLocaleString('en-US',{maximumFractionDigits:0})}`:'—', chg:btc?.ethChange24h, color:'#627EEA' },
            { label:'Solana', value:btc?.solusd?`$${btc.solusd.toFixed(2)}`:'—', chg:null, color:'#9945FF' },
          ].map(c => (
            <div key={c.label} className="p-2 rounded-lg" style={{ background:'hsl(222 47% 5%)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                {c.chg!=null && <span className="text-xs font-mono" style={{ color:c.chg>=0?'#10b981':'#ef4444' }}>{c.chg>=0?'+':''}{c.chg.toFixed(2)}%</span>}
              </div>
              <div className="text-sm font-bold font-mono" style={{ color:c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Piyasa Saatleri ───────────────────────────────────────────── */
const MARKETS = [
  { name:'BIST İstanbul',  flag:'🇹🇷', openH:6.0,  closeH:13.5, localOpen:'09:00', localClose:'16:30', tz:'TST' },
  { name:'LSE Londra',     flag:'🇬🇧', openH:8.0,  closeH:16.5, localOpen:'09:00', localClose:'17:30', tz:'BST' },
  { name:'Xetra Frankfurt',flag:'🇩🇪', openH:7.0,  closeH:15.5, localOpen:'09:00', localClose:'17:30', tz:'CEST'},
  { name:'NYSE / NASDAQ',  flag:'🇺🇸', openH:14.5, closeH:21.0, localOpen:'09:30', localClose:'16:00', tz:'EDT' },
  { name:'TSE Tokyo',      flag:'🇯🇵', openH:0.0,  closeH:6.0,  localOpen:'09:00', localClose:'15:00', tz:'JST' },
  { name:'SSE Şangay',     flag:'🇨🇳', openH:1.5,  closeH:7.0,  localOpen:'09:30', localClose:'15:00', tz:'CST' },
  { name:'Kripto (24/7)',  flag:'₿',   openH:-1,   closeH:-1,   localOpen:'00:00', localClose:'24:00', tz:'UTC' },
];
function isMarketOpen(m: typeof MARKETS[0]) {
  if (m.openH === -1) return true;
  const now = new Date(); const d = now.getUTCDay();
  if (d === 0 || d === 6) return false;
  const h = now.getUTCHours() + now.getUTCMinutes() / 60;
  return m.closeH > m.openH ? h >= m.openH && h < m.closeH : h >= m.openH || h < m.closeH;
}
function PiyasaSaatleri() {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick(n => n + 1), 60000); return () => clearInterval(t); }, []);
  const opens = MARKETS.map(isMarketOpen);
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold">Global Piyasa Saatleri</span>
        <span className="text-xs font-mono ml-auto" style={{ color: opens.filter(Boolean).length > 0 ? '#10b981' : '#ef4444' }}>
          {opens.filter(Boolean).length} borsa açık
        </span>
      </div>
      <div className="space-y-1.5">
        {MARKETS.map((m, i) => (
          <div key={m.name} className="flex items-center justify-between p-2 rounded-lg" style={{ background:'hsl(222 47% 5%)' }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize:16 }}>{m.flag}</span>
              <div>
                <div className="text-xs font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{m.localOpen}–{m.localClose} {m.tz}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width:8, height:8, borderRadius:'50%', background:opens[i]?'#10b981':'#374151', boxShadow:opens[i]?'0 0 6px #10b981':'none' }} />
              <span className="text-xs font-mono font-semibold" style={{ color:opens[i]?'#10b981':'#4b5563' }}>{opens[i]?'AÇIK':'KAPALI'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 2025 Getiri ────────────────────────────────────────────────── */
const RETURNS = [
  { name:'Bitcoin (USD)',       pct:112.4, color:'#F7931A', icon:'₿',  note:'Kripto piyasası' },
  { name:'Altın (TRY bazlı)',   pct:47.2,  color:'#F59E0B', icon:'🪙', note:'En güvenli liman' },
  { name:'Dolar (USD/TRY)',     pct:38.8,  color:'#10b981', icon:'💵', note:'Kur artışı' },
  { name:'TL Mevduat',          pct:38.5,  color:'#3B82F6', icon:'🏦', note:'Banka faizi' },
  { name:'BIST 100',            pct:29.3,  color:'#8B5CF6', icon:'📈', note:'Borsa endeksi' },
  { name:'İst. Gayrimenkul',    pct:28.1,  color:'#EF4444', icon:'🏠', note:'Konut değeri' },
  { name:'Euro (EUR/TRY)',      pct:23.5,  color:'#6B7280', icon:'🇪🇺',note:'Kur artışı' },
];
function GetiriKarsilastirma() {
  const maxP = Math.max(...RETURNS.map(r => r.pct));
  const sorted = [...RETURNS].sort((a, b) => b.pct - a.pct);
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        <span className="text-sm font-semibold">2025 Yatırım Getiri Karşılaştırması</span>
      </div>
      <div className="text-xs text-muted-foreground mb-4">100 ₺ yatırsaydın yıl sonunda ne kadar olurdu?</div>
      <div className="space-y-3">
        {sorted.map(r => (
          <div key={r.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span style={{ fontSize:14 }}>{r.icon}</span>
                <span className="text-xs font-semibold">{r.name}</span>
                <span className="text-xs text-muted-foreground">{r.note}</span>
              </div>
              <span className="text-sm font-bold font-mono" style={{ color:r.color }}>+%{r.pct.toFixed(1)}</span>
            </div>
            <div className="h-2 rounded-full" style={{ background:'hsl(222 47% 8%)' }}>
              <div className="h-2 rounded-full" style={{ width:`${(r.pct/maxP)*100}%`, background:r.color, opacity:0.85 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-3 p-2 rounded-lg" style={{ background:'hsl(222 47% 5%)', fontSize:10 }}>
        ⚠️ Geçmiş getiri gelecek getiriyi garanti etmez. Bilgi amaçlıdır.
      </div>
    </div>
  );
}

/* ── İstanbul Konut ─────────────────────────────────────────────── */
const IST = [
  { name:'Sarıyer',   price:285000, trend:1.8 }, { name:'Beşiktaş', price:268000, trend:1.4 },
  { name:'Kadıköy',  price:235000, trend:1.6 }, { name:'Bakırköy', price:208000, trend:1.2 },
  { name:'Şişli',    price:204000, trend:1.1 }, { name:'Beyoğlu',  price:188000, trend:0.9 },
  { name:'Üsküdar',  price:182000, trend:1.3 }, { name:'Fatih',    price:165000, trend:0.8 },
  { name:'Ataşehir', price:162000, trend:1.5 }, { name:'Maltepe',  price:135000, trend:1.7 },
  { name:'Bağcılar', price:95000,  trend:1.9 }, { name:'Esenyurt', price:72000,  trend:2.1 },
];
function IstanbulKonut() {
  const max = Math.max(...IST.map(d => d.price));
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold">İstanbul — Bölge Bazlı Konut m² Fiyatları</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">Ortalama satış · Nisan 2026 · ₺/m²</div>
      <div className="space-y-1.5">
        {IST.map(d => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0" style={{ width:70 }}>{d.name}</span>
            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background:'hsl(222 47% 8%)' }}>
              <div className="h-5 rounded-full flex items-center pl-2" style={{ width:`${(d.price/max)*100}%`, background:`hsl(${199-(d.price/max)*40} 95% ${45+(d.price/max)*10}%)` }}>
                <span className="text-white whitespace-nowrap font-mono font-semibold" style={{ fontSize:9 }}>{(d.price/1000).toFixed(0)}K₺</span>
              </div>
            </div>
            <span className="text-xs font-mono shrink-0" style={{ color:'#10b981', minWidth:44, textAlign:'right', fontSize:10 }}>+{d.trend.toFixed(1)}%/ay</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2 p-2 rounded-lg" style={{ background:'hsl(222 47% 5%)', fontSize:10 }}>
        📍 Sarıyer & Beşiktaş en pahalı · Esenyurt en hızlı değer kazanan
      </div>
    </div>
  );
}

/* ── Atina Konut ────────────────────────────────────────────────── */
const ATH = [
  { name:'Vouliagmeni', price:9800, trend:2.3 }, { name:'Kolonaki',  price:8200, trend:1.8 },
  { name:'Glyfada',     price:5800, trend:2.1 }, { name:'Filothei',  price:5500, trend:1.6 },
  { name:'Kifisia',     price:4800, trend:1.4 }, { name:'Marousi',   price:3200, trend:1.2 },
  { name:'Pangrati',    price:2800, trend:1.1 }, { name:'Piraeus',   price:2400, trend:0.9 },
  { name:'Kypseli',     price:2000, trend:0.8 }, { name:'Exarchia',  price:1900, trend:0.7 },
];
function AtinaKonut() {
  const max = Math.max(...ATH.map(d => d.price));
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-semibold">Atina — Bölge Bazlı Konut m² Fiyatları</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">Ortalama satış · Nisan 2026 · €/m²</div>
      <div className="space-y-1.5">
        {ATH.map(d => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0" style={{ width:80 }}>{d.name}</span>
            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background:'hsl(222 47% 8%)' }}>
              <div className="h-5 rounded-full flex items-center pl-2" style={{ width:`${(d.price/max)*100}%`, background:`hsl(${271-(d.price/max)*30} 91% ${55+(d.price/max)*10}%)` }}>
                <span className="text-white whitespace-nowrap font-mono font-semibold" style={{ fontSize:9 }}>€{d.price.toLocaleString()}</span>
              </div>
            </div>
            <span className="text-xs font-mono shrink-0" style={{ color:'#10b981', minWidth:44, textAlign:'right', fontSize:10 }}>+{d.trend.toFixed(1)}%/ay</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2 p-2 rounded-lg" style={{ background:'hsl(222 47% 5%)', fontSize:10 }}>
        🏛️ Altın Vize etkisi: yabancı talep fiyatları yukarı çekiyor
      </div>
    </div>
  );
}

/* ── Ekonomik Takvim ────────────────────────────────────────────── */
const TAKVIM = [
  { date:'22 Nisan 2026', event:'TCMB PPK Toplantısı',  detail:'Türkiye faiz kararı', imp:'yüksek', flag:'🇹🇷' },
  { date:'29–30 Nisan',   event:'ECB Yönetim Konseyi', detail:'Avrupa faiz kararı',  imp:'yüksek', flag:'🇪🇺' },
  { date:'5 Mayıs',       event:'TÜİK Enflasyon Verisi',detail:'Nisan ayı TÜFE',     imp:'orta',   flag:'🇹🇷' },
  { date:'6–7 Mayıs',     event:'Fed FOMC Toplantısı', detail:'ABD faiz kararı',     imp:'yüksek', flag:'🇺🇸' },
  { date:'26 Mayıs',      event:'TCMB Mayıs Toplantısı',detail:'2. çeyrek faiz',     imp:'yüksek', flag:'🇹🇷' },
  { date:'5 Haziran',     event:'ECB Haziran Kararı',  detail:'Euro Bölgesi faizi',  imp:'yüksek', flag:'🇪🇺' },
];
const IMP_STYLE: Record<string,{ color:string; label:string }> = {
  yüksek:{ color:'#ef4444', label:'●●●' }, orta:{ color:'#f59e0b', label:'●●○' },
};
function EkonomikTakvim() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-semibold">Önemli Ekonomik Takvim</span>
        <span className="text-xs text-muted-foreground ml-auto">Nisan–Haziran 2026</span>
      </div>
      <div className="space-y-2">
        {TAKVIM.map((ev, i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl" style={{ background:'hsl(222 47% 5%)' }}>
            <div className="shrink-0 text-center" style={{ minWidth:65 }}>
              <div style={{ fontSize:14 }}>{ev.flag}</div>
              <div className="text-xs font-mono text-muted-foreground leading-tight" style={{ fontSize:9 }}>{ev.date}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold">{ev.event}</div>
              <div className="text-xs text-muted-foreground">{ev.detail}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs font-mono" style={{ color:IMP_STYLE[ev.imp].color }}>{IMP_STYLE[ev.imp].label}</div>
              <div className="text-xs text-muted-foreground" style={{ fontSize:9 }}>{ev.imp}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2" style={{ fontSize:10 }}>
        ●●● Yüksek etkili — piyasalar bu günlerde dalgalanabilir
      </div>
    </div>
  );
}

/* ── Hızlı Bilgi ────────────────────────────────────────────────── */
function HizliBilgi({ macro }: { macro: any }) {
  const m = macro ?? { turkey:{ policyRate:37, inflation:30.91, gdpGrowth:3.3, unemployment:8.8 }, greece:{ policyRate:2.00, gdpGrowth:2.5, touristArrivals:33.6 } };
  const items = [
    { icon:'🇹🇷', label:'TCMB Faizi',          value:`%${m.turkey.policyRate?.toFixed(2)}`,    desc:'Bankalar bu oranla birbirinden borç alır. Yüksekse mevduat da yüksek olur.', color:'#ef4444' },
    { icon:'📈', label:'Türkiye Enflasyonu',    value:`%${m.turkey.inflation?.toFixed(1)}`,     desc:'Yıllık fiyat artış oranı. Maaşın bundan az artmışsa alım gücün azalmış demek.', color:'#f59e0b' },
    { icon:'🇪🇺', label:'ECB Faizi',            value:`%${m.greece.policyRate?.toFixed(2)}`,   desc:'Avrupa Merkez Bankası faizi. Euro/TRY kurunu ve Atina piyasasını etkiler.', color:'#3b82f6' },
    { icon:'📊', label:'TR Büyüme (GSYİH)',     value:`+%${m.turkey.gdpGrowth?.toFixed(1)}`,   desc:'Ekonominin büyüme hızı. Pozitifse ekonomi genişliyor, negatifse daralıyor.', color:'#10b981' },
    { icon:'🇬🇷', label:'Yunanistan Büyümesi', value:`+%${m.greece.gdpGrowth?.toFixed(1)}`,   desc:'Turizm ve gayrimenkul talep büyümesini destekliyor.', color:'#10b981' },
    { icon:'🇹🇷', label:'İşsizlik Oranı',       value:`%${m.turkey.unemployment?.toFixed(1)}`, desc:'Çalışmak isteyen ama iş bulamayanların oranı.', color:'#8b5cf6' },
    { icon:'🇬🇷', label:'Yunanistan Turizmi',  value:`${m.greece.touristArrivals?.toFixed(1)}M/yıl`, desc:'Yıllık turist sayısı. Atina konut ve kira talebini doğrudan etkiler.', color:'#0bc5ea' },
    { icon:'🏦', label:'En Yüksek Mevduat',    value:'%41.00', desc:'QNB Finansbank 1 ay vadeli. 100.000₺ → yılda ~41.000₺ faiz.', color:'#f77f00' },
  ];
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold">Hızlı Bilgi Paneli</span>
        <span className="text-xs text-muted-foreground ml-auto">Dünya Bankası · ECB · TCMB</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(it => (
          <div key={it.label} className="metric-card" style={{ borderLeft:`3px solid ${it.color}` }}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize:16 }}>{it.icon}</span>
              <span className="text-xs font-semibold text-muted-foreground flex-1">{it.label}</span>
              <span className="text-sm font-bold font-mono" style={{ color:it.color }}>{it.value}</span>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">{it.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ── ATHEX Borsa ─────────────────────────────────────────────────── */
const ATHEX_FALLBACK_STOCKS = [
  {symbol:'ETE',   name:'National Bank of Greece', price:9.42,  changePct:0.85, isIndex:false},
  {symbol:'EUROB', name:'Eurobank Ergasias',        price:2.38,  changePct:1.28, isIndex:false},
  {symbol:'OPAP',  name:'OPAP',                     price:17.85, changePct:0.34, isIndex:false},
  {symbol:'MYTIL', name:'Mytilineos',               price:41.20, changePct:1.95, isIndex:false},
  {symbol:'TITC',  name:'Titan Cement',             price:29.80, changePct:0.67, isIndex:false},
  {symbol:'PPC',   name:'Public Power Corp',        price:12.60, changePct:2.11, isIndex:false},
  {symbol:'ADMIE', name:'ADMIE Holdings',           price:2.95,  changePct:0.34, isIndex:false},
  {symbol:'BELA',  name:'Belagri',                  price:1.82,  changePct:-0.55,isIndex:false},
];
const ATHEX_INDEX_FALLBACK = {symbol:'^ATF', name:'FTSE/ASE General Index', price:1421.5, changePct:0.72, isIndex:true};
function AthexBorsa() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  useEffect(() => {
    fetch(`/api/greece/stocks?_=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => {
        const arr = Array.isArray(d) ? d : [];
        if (arr.length > 0) {
          setData(arr);
        } else {
          setData([ATHEX_INDEX_FALLBACK, ...ATHEX_FALLBACK_STOCKS]);
          setIsFallback(true);
        }
        setLoading(false);
      });
  }, []);
  const index = data.find(d => d.isIndex);
  const stocks = data.filter(d => !d.isIndex);
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4" style={{ color:'#1d63ed' }} />
        <span className="text-sm font-semibold">🇬🇷 ATHEX Borsa — Yunan Hisseleri</span>
        <span className="text-xs text-muted-foreground ml-auto">Yahoo Finance · 5dk</span>
      </div>
      {/* FTSE/ASE Genel Endeks */}
      {index && (
        <div className="flex items-center justify-between p-3 rounded-xl mb-3" style={{ background:'hsl(222 47% 5%)', border:`1px solid ${(index.changePct??0)>=0?'#10b98130':'#ef444430'}` }}>
          <div>
            <div className="text-xs text-muted-foreground">FTSE/ASE General Index</div>
            <div className="text-lg font-bold font-mono" style={{ color:'#1d63ed' }}>
              {index.price?.toFixed(2) ?? '—'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">24 saatlik</div>
            <div className="text-sm font-bold font-mono" style={{ color:(index.changePct??0)>=0?'#10b981':'#ef4444' }}>
              {(index.changePct??0)>=0?'+':''}{(index.changePct??0).toFixed(2)}%
            </div>
          </div>
        </div>
      )}
      {/* Hisse listesi */}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_,i)=><div key={i} style={{height:28,borderRadius:6,background:'hsl(222 47% 8%)',opacity:1-i*.15}}/>)}</div>
      ) : stocks.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-3">Borsa kapalı veya veri yok</div>
      ) : stocks.sort((a,b) => (b.changePct??0)-(a.changePct??0)).map(st => (
        <div key={st.symbol} className="flex items-center justify-between p-2 rounded-lg mb-1.5" style={{background:'hsl(222 47% 5%)'}}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold font-mono" style={{color:'#1d63ed',minWidth:52}}>{st.symbol}</span>
            <span className="text-xs text-muted-foreground truncate">{st.name}</span>
          </div>
          <div className="text-right shrink-0 ml-2">
            <div className="text-xs font-mono font-semibold">€{(st.price??0).toFixed(2)}</div>
            <div className="text-xs font-mono font-bold" style={{color:(st.changePct??0)>=0?'#10b981':'#ef4444'}}>
              {(st.changePct??0)>=0?'+':''}{(st.changePct??0).toFixed(2)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Atina Kira Piyasası ─────────────────────────────────────────── */
const ATINA_KIRA = [
  {name:'Vouliagmeni', oda1:2800, oda2:4200, oda3:6500, kiraGetiri:3.4},
  {name:'Kolonaki',    oda1:1800, oda2:2800, oda3:4500, kiraGetiri:2.6},
  {name:'Glyfada',     oda1:1500, oda2:2400, oda3:3800, kiraGetiri:3.1},
  {name:'Filothei',    oda1:1400, oda2:2200, oda3:3500, kiraGetiri:3.0},
  {name:'Kifisia',     oda1:1100, oda2:1800, oda3:2900, kiraGetiri:2.7},
  {name:'Marousi',     oda1:900,  oda2:1400, oda3:2200, kiraGetiri:3.3},
  {name:'Pangrati',    oda1:750,  oda2:1200, oda3:1900, kiraGetiri:3.2},
  {name:'Piraeus',     oda1:650,  oda2:1000, oda3:1600, kiraGetiri:3.2},
  {name:'Kypseli',     oda1:600,  oda2:950,  oda3:1500, kiraGetiri:3.6},
  {name:'Exarchia',    oda1:550,  oda2:900,  oda3:1400, kiraGetiri:3.8},
];
function AtinaKiraPiyasasi() {
  const [view, setView] = useState<'oda1'|'oda2'|'oda3'>('oda2');
  const max = Math.max(...ATINA_KIRA.map(d => d[view]));
  const labels: Record<string,string> = {oda1:'1+0 Stüdyo', oda2:'2+1 Daire', oda3:'3+1 Daire'};
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="w-4 h-4" style={{color:'#1d63ed'}} />
        <span className="text-sm font-semibold">🇬🇷 Atina Kira Piyasası</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">Aylık kira · Nisan 2026 · EUR</div>
      <div className="flex gap-2 mb-3">
        {(['oda1','oda2','oda3'] as const).map(k => (
          <button key={k} onClick={()=>setView(k)} className="text-xs px-2 py-1 rounded-lg transition-all" style={{
            background: view===k ? '#1d63ed' : 'hsl(222 47% 8%)',
            color: view===k ? '#fff' : '#4a6080', border:'none', cursor:'pointer'
          }}>{labels[k]}</button>
        ))}
      </div>
      <div className="space-y-1.5">
        {ATINA_KIRA.map(d => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0" style={{width:80}}>{d.name}</span>
            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{background:'hsl(222 47% 8%)'}}>
              <div className="h-5 rounded-full flex items-center pl-2" style={{width:`${(d[view]/max)*100}%`, background:'hsl(218 95% 50%)'}}>
                <span className="text-white font-mono font-semibold whitespace-nowrap" style={{fontSize:9}}>€{d[view].toLocaleString()}</span>
              </div>
            </div>
            <span className="text-xs font-mono shrink-0" style={{color:'#f59e0b', minWidth:32, textAlign:'right', fontSize:10}}>%{d.kiraGetiri}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-2" style={{fontSize:10}}>
        <span>Kira Getirisi → Son sütun</span>
        <span>Kypseli & Exarchia en yüksek getiri</span>
      </div>
    </div>
  );
}

/* ── Altın Vize ──────────────────────────────────────────────────── */
const VISA_TIERS = [
  {min:250000, label:'Standart', color:'#6B7280', icon:'🏠',
   desc:"Yunanistan'da herhangi bir gayrimenkul. En yaygın seçenek.", days:60, years:5},
  {min:400000, label:'Premium Bölge', color:'#3B82F6', icon:'🏙️',
   desc:"Atina merkezi, Selanik, Mykonos, Santorini. Daha hızlı süreç.", days:45, years:5},
  {min:800000, label:'Elite', color:'#8B5CF6', icon:'🏝️',
   desc:"2+ mülk veya özel konut projeleri. En geniş haklarla.", days:30, years:5},
  {min:500000, label:'Tarih & Miras', color:'#F59E0B', icon:'🏛️',
   desc:"Tarihi bina restorasyonu. Karşılıksız ikamet ve kültür katkısı.", days:45, years:5},
];
function AltinaVize() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-1">
        <Globe className="w-4 h-4" style={{color:'#1d63ed'}} />
        <span className="text-sm font-semibold">🇬🇷 Yunanistan Altın Vize Programı</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">
        Gayrimenkul yatırımıyla 5 yıl ikamet izni · Schengen bölgesi erişimi
      </div>
      <div className="space-y-3">
        {VISA_TIERS.map((t,i) => (
          <div key={i} className="p-3 rounded-xl" style={{background:'hsl(222 47% 5%)', border:`1px solid ${t.color}25`}}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span style={{fontSize:20}}>{t.icon}</span>
                <div>
                  <span className="text-xs font-bold" style={{color:t.color}}>{t.label}</span>
                  <div className="text-xs text-muted-foreground">Onay: ~{t.days} gün · {t.years} yıl ikamet</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono" style={{color:t.color}}>€{(t.min/1000).toFixed(0)}K+</div>
                <div className="text-xs text-muted-foreground">min. yatırım</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{t.desc}</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-3 p-2 rounded-lg" style={{background:'hsl(222 47% 5%)', fontSize:10}}>
        ✅ Avantajlar: Schengen seyahati · AB erişimi · Aile dahil · Vergi avantajları · Kira geliri
      </div>
    </div>
  );
}

/* ── Yunanistan Turizm ───────────────────────────────────────────── */
const TURIZM_AYLIK = [
  {ay:'Ocak',   ziyaret:0.8,  gelir:0.3},  {ay:'Şubat',  ziyaret:0.9,  gelir:0.4},
  {ay:'Mart',   ziyaret:1.4,  gelir:0.6},  {ay:'Nisan',  ziyaret:2.6,  gelir:1.2},
  {ay:'Mayıs',  ziyaret:3.8,  gelir:1.9},  {ay:'Haziran',ziyaret:5.1,  gelir:2.8},
  {ay:'Temmuz', ziyaret:6.4,  gelir:3.5},  {ay:'Ağustos',ziyaret:6.8,  gelir:3.8},
  {ay:'Eylül',  ziyaret:5.3,  gelir:2.9},  {ay:'Ekim',   ziyaret:3.2,  gelir:1.5},
  {ay:'Kasım',  ziyaret:1.2,  gelir:0.5},  {ay:'Aralık', ziyaret:1.1,  gelir:0.4},
];
function YunanistanTurizm() {
  const maxZ = Math.max(...TURIZM_AYLIK.map(a=>a.ziyaret));
  const toplam = TURIZM_AYLIK.reduce((s,a)=>s+a.ziyaret,0);
  const gelir = TURIZM_AYLIK.reduce((s,a)=>s+a.gelir,0);
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="w-4 h-4" style={{color:'#1d63ed'}} />
        <span className="text-sm font-semibold">🇬🇷 Yunanistan Turizm Verileri 2025</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">Aylık ziyaretçi (Milyon) · Yıllık toplam: {toplam.toFixed(1)}M kişi, €{gelir.toFixed(1)}B gelir</div>
      <div className="flex items-end gap-1 h-24 mb-2">
        {TURIZM_AYLIK.map((a,i) => (
          <div key={a.ay} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full rounded-t-sm" style={{height:`${(a.ziyaret/maxZ)*80}px`, background:`hsl(218 ${60+i*3}% ${45+i*2}%)`, minHeight:2}} />
            <span className="text-muted-foreground" style={{fontSize:7, writingMode:'vertical-rl', transform:'rotate(180deg)', lineHeight:1}}>{a.ay.slice(0,3)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[
          {label:'En Yoğun Ay', value:'Ağustos', sub:'6.8M ziyaretçi', color:'#1d63ed'},
          {label:'Toplam Yıllık', value:`${toplam.toFixed(1)}M`, sub:'2025 tahmini', color:'#10b981'},
          {label:'Turizm Geliri', value:`€${gelir.toFixed(1)}B`, sub:"GSYİH'nin %20'si", color:'#f59e0b'},
        ].map(k=>(
          <div key={k.label} className="p-2 rounded-xl text-center" style={{background:'hsl(222 47% 5%)'}}>
            <div className="text-sm font-bold font-mono" style={{color:k.color}}>{k.value}</div>
            <div className="text-xs text-muted-foreground leading-tight">{k.label}</div>
            <div className="text-xs text-muted-foreground" style={{fontSize:9}}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2" style={{fontSize:10}}>
        📌 Turizm Atina konut talebinin ana motoru — Airbnb kira getirileri yıllık %8-14
      </div>
    </div>
  );
}

/* ── TR–GR Karşılaştırma ─────────────────────────────────────────── */
const KARSILASTIRMA = [
  {konu:'Ortalama m² Fiyatı',    tr:'₺185.000/m²', gr:'€4.200/m²',   trOk:false, grOk:true,  not:'İstanbul merkez vs Atina merkez'},
  {konu:'Kira Getirisi',          tr:'%3-5/yıl',    gr:'%3.5-6/yıl',  trOk:true,  grOk:true,  not:'Brüt kira getirisi'},
  {konu:'Altın Vize Eşiği',       tr:'Yok',         gr:'€250K+',      trOk:false, grOk:true,  not:'AB ikamet izni sağlar'},
  {konu:'Tapu Vergisi',           tr:'%4',          gr:'%3.09',        trOk:false, grOk:true,  not:'Alım vergisi oranı'},
  {konu:'Yıllık Kira Artışı',     tr:'%60-80',      gr:'%8-12',       trOk:true,  grOk:false, not:'2024-25 tahmini'},
  {konu:'Ortalama Satış Süresi',  tr:'45-60 gün',   gr:'60-90 gün',   trOk:true,  grOk:false, not:'Piyasa likiditesi'},
  {konu:'Yabancı Alıcı Kısıtı',  tr:'Sınırlı alan',gr:'Schengen hariç yok', trOk:false, grOk:true, not:'Adalar kısmi'},
  {konu:'GSYİH Büyümesi 2025',    tr:'+%3.3',       gr:'+%2.5',       trOk:true,  grOk:false, not:'Reel büyüme'},
  {konu:'Enflasyon 2025',         tr:'%30.9',       gr:'%2.3',         trOk:false, grOk:true,  not:'Yıl sonu tahmini'},
];
function TrGrKarsilastirma() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold">🇹🇷 Türkiye vs 🇬🇷 Yunanistan — Emlak & Ekonomi</span>
      </div>
      <div className="overflow-x-auto">
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th className="text-xs text-muted-foreground font-normal text-left pb-2">Konu</th>
              <th className="text-xs text-muted-foreground font-normal text-center pb-2">🇹🇷 Türkiye</th>
              <th className="text-xs text-muted-foreground font-normal text-center pb-2">🇬🇷 Yunanistan</th>
            </tr>
          </thead>
          <tbody>
            {KARSILASTIRMA.map((r,i)=>(
              <tr key={i} style={{borderTop:'1px solid rgba(255,255,255,.04)'}}>
                <td className="py-1.5 pr-2">
                  <div className="text-xs font-semibold">{r.konu}</div>
                  <div className="text-xs text-muted-foreground" style={{fontSize:9}}>{r.not}</div>
                </td>
                <td className="py-1.5 text-center">
                  <span className="text-xs font-mono font-bold" style={{color:r.trOk?'#10b981':'#ef4444'}}>{r.tr}</span>
                </td>
                <td className="py-1.5 text-center">
                  <span className="text-xs font-mono font-bold" style={{color:r.grOk?'#10b981':'#ef4444'}}>{r.gr}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground mt-3 p-2 rounded-lg" style={{background:'hsl(222 47% 5%)', fontSize:10}}>
        🟢 Avantajlı · 🔴 Dikkat edilmesi gereken · Veriler tahmini ve bilgi amaçlıdır.
      </div>
    </div>
  );
}



/* ── Enflasyon Tarihi 2024 ───────────────────────────────────────── */
const INF_2024 = [
  {ay:'Oca',tr:64.9,gr:2.9},{ay:'Şub',tr:67.1,gr:2.5},{ay:'Mar',tr:68.5,gr:2.8},
  {ay:'Nis',tr:69.8,gr:3.1},{ay:'May',tr:75.5,gr:3.0},{ay:'Haz',tr:71.6,gr:2.8},
  {ay:'Tem',tr:61.8,gr:2.5},{ay:'Ağu',tr:51.9,gr:2.3},{ay:'Eyl',tr:49.4,gr:2.1},
  {ay:'Eki',tr:48.6,gr:2.2},{ay:'Kas',tr:47.1,gr:2.0},{ay:'Ara',tr:44.4,gr:1.9},
];
function EnflasyonKarsilastirma() {
  const maxTR = Math.max(...INF_2024.map(d=>d.tr));
  const H = 80;
  const W = 100;
  const trPath = INF_2024.map((d,i)=>`${i===0?'M':'L'}${(i/(INF_2024.length-1))*W},${H-((d.tr/maxTR)*H)}`).join(' ');
  const grPath = INF_2024.map((d,i)=>`${i===0?'M':'L'}${(i/(INF_2024.length-1))*W},${H-((d.gr/maxTR)*H)}`).join(' ');
  const latest = INF_2024[INF_2024.length-1];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-semibold">Enflasyon Karşılaştırması — 2024 Yıllık</span>
      </div>
      <div className="flex gap-4 mb-3">
        <div className="flex-1 p-2 rounded-xl text-center" style={{background:'hsl(222 47% 5%)',border:'1px solid #ef444430'}}>
          <div className="text-xs text-muted-foreground">🇹🇷 Türkiye (Aralık)</div>
          <div className="text-xl font-bold font-mono text-red-400">%{latest.tr}</div>
          <div className="text-xs text-muted-foreground">Zirve: %75.5 (Mayıs)</div>
        </div>
        <div className="flex-1 p-2 rounded-xl text-center" style={{background:'hsl(222 47% 5%)',border:'1px solid #3b82f630'}}>
          <div className="text-xs text-muted-foreground">🇬🇷 Yunanistan (Aralık)</div>
          <div className="text-xl font-bold font-mono text-blue-400">%{latest.gr}</div>
          <div className="text-xs text-muted-foreground">Zirve: %3.1 (Nisan)</div>
        </div>
        <div className="flex-1 p-2 rounded-xl text-center" style={{background:'hsl(222 47% 5%)',border:'1px solid #10b98130'}}>
          <div className="text-xs text-muted-foreground">Fark (kat)</div>
          <div className="text-xl font-bold font-mono text-emerald-400">×{(latest.tr/latest.gr).toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">TR/GR oranı</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:H,display:'block'}} preserveAspectRatio="none">
        <path d={trPath} fill="none" stroke="#ef4444" strokeWidth="1.5"/>
        <path d={grPath} fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
      </svg>
      <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1">
        {INF_2024.filter((_,i)=>i%3===0).map(d=><span key={d.ay}>{d.ay}</span>)}
      </div>
      <div className="flex gap-3 mt-2 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 inline-block"/> Türkiye</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-400 inline-block"/> Yunanistan</span>
      </div>
    </div>
  );
}

/* ── Kamu Maliyesi ───────────────────────────────────────────────── */
const MALIYE = [
  {gosterge:'Kamu Borcu / GSYİH',     tr:'%32',      gr:'%160',    trIyi:true,  grIyi:false, not:"GR 2010'da %210 idi — reform var"},
  {gosterge:'Bütçe Dengesi',          tr:'-%3.8',    gr:'+%1.1',   trIyi:false, grIyi:true,  not:"GR 2024'te fazla verdi"},
  {gosterge:'Cari Hesap Dengesi',     tr:'-%4.2',    gr:'-%6.5',   trIyi:false, grIyi:false, not:'İkisi de açık veriyor'},
  {gosterge:'Döviz Rezervi',          tr:'$135B',    gr:'€14B',    trIyi:false, grIyi:null,  not:'ECB desteği GR için avantaj'},
  {gosterge:'Kredi Notu (S&P)',        tr:'B+',       gr:'BBB-',    trIyi:false, grIyi:true,  not:'GR yatırım yapılabilir seviyede'},
  {gosterge:'Vergi / GSYİH',          tr:'%18',      gr:'%42',     trIyi:true,  grIyi:false, not:'GR AB ortalamasında'},
];
function KamuMaliyesi() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Landmark className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-semibold">🇹🇷 vs 🇬🇷 — Kamu Maliyesi</span>
      </div>
      {MALIYE.map((r,i)=>(
        <div key={i} className="py-2" style={{borderBottom:'1px solid rgba(255,255,255,.05)'}}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{r.gosterge}</div>
              <div className="text-xs text-muted-foreground" style={{fontSize:9}}>{r.not}</div>
            </div>
            <div className="flex gap-3 shrink-0">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded" style={{background:r.trIyi?'#10b98120':'#ef444420',color:r.trIyi?'#10b981':'#ef4444',minWidth:50,textAlign:'center'}}>🇹🇷 {r.tr}</span>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded" style={{background:r.grIyi===true?'#10b98120':r.grIyi===false?'#ef444420':'#f59e0b20',color:r.grIyi===true?'#10b981':r.grIyi===false?'#ef4444':'#f59e0b',minWidth:50,textAlign:'center'}}>🇬🇷 {r.gr}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Ücretler & Yaşam ────────────────────────────────────────────── */
const UCRETLER = [
  {kategori:'Asgari Ücret (Aylık)',   trVal:500,  grVal:950,  trStr:'₺22.104 (~$500)',grStr:'€950 (~$1.040)'},
  {kategori:'Ortalama Ücret',         trVal:950,  grVal:1580, trStr:'~₺42.000 ($950)', grStr:'~€1.580 ($1.730)'},
  {kategori:'1+1 Kira (Merkez)',      trVal:400,  grVal:800,  trStr:'~₺17.000 ($400)', grStr:'~€750 ($820)'},
  {kategori:'Aylık Gıda Sepeti',      trVal:200,  grVal:350,  trStr:'~₺8.500 ($200)',  grStr:'~€320 ($350)'},
  {kategori:'Kira/Ücret Oranı',       trVal:42,   grVal:51,   trStr:'%42',             grStr:'%51'},
];
function UcretYasam() {
  const max = Math.max(...UCRETLER.map(u=>Math.max(u.trVal,u.grVal)));
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-green-400" />
        <span className="text-sm font-semibold">🇹🇷 vs 🇬🇷 — Ücretler & Yaşam Maliyeti (USD)</span>
      </div>
      <div className="space-y-3">
        {UCRETLER.map((u,i)=>(
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground font-semibold">{u.kategori}</span>
            </div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs w-3">🇹🇷</span>
              <div className="flex-1 h-4 rounded-full overflow-hidden" style={{background:'hsl(222 47% 8%)'}}>
                <div className="h-4 rounded-full flex items-center pl-1" style={{width:`${(u.trVal/max)*100}%`,background:'#ef4444'}}>
                  <span className="text-white whitespace-nowrap" style={{fontSize:8}}>{u.trStr}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-3">🇬🇷</span>
              <div className="flex-1 h-4 rounded-full overflow-hidden" style={{background:'hsl(222 47% 8%)'}}>
                <div className="h-4 rounded-full flex items-center pl-1" style={{width:`${(u.grVal/max)*100}%`,background:'#1d63ed'}}>
                  <span className="text-white whitespace-nowrap" style={{fontSize:8}}>{u.grStr}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2 p-2 rounded-lg" style={{background:'hsl(222 47% 5%)',fontSize:10}}>
        💡 Satın alma gücü paritesinde (PPP) TR kişi başı GSYİH $45K, GR $36K — ikisi de birbirine yakın
      </div>
    </div>
  );
}

/* ── Dış Ticaret ─────────────────────────────────────────────────── */
const IHRACAT_TR = [{label:'Makine',pct:24},{label:'Tekstil',pct:18},{label:'Taşıt',pct:16},{label:'Gıda',pct:12},{label:'Metal',pct:10},{label:'Diğer',pct:20}];
const IHRACAT_GR = [{label:'Petrol ürünleri',pct:34},{label:'Gıda',pct:18},{label:'İlaç',pct:12},{label:'Metal',pct:10},{label:'Tekstil',pct:8},{label:'Diğer',pct:18}];
function DisTicaret() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-semibold">🇹🇷 vs 🇬🇷 — Dış Ticaret Yapısı (2024)</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-3">
        {[
          {flag:'🇹🇷',name:'Türkiye',ihracat:'$261B',ithalat:'$362B',denge:'-$101B',color:'#ef4444'},
          {flag:'🇬🇷',name:'Yunanistan',ihracat:'$51B',ithalat:'$84B',denge:'-$33B',color:'#1d63ed'},
        ].map(c=>(
          <div key={c.name} className="p-2 rounded-xl" style={{background:'hsl(222 47% 5%)',border:`1px solid ${c.color}25`}}>
            <div className="text-xs font-bold mb-2" style={{color:c.color}}>{c.flag} {c.name}</div>
            {[{l:'İhracat',v:c.ihracat,col:'#10b981'},{l:'İthalat',v:c.ithalat,col:'#ef4444'},{l:'Denge',v:c.denge,col:'#f59e0b'}].map(row=>(
              <div key={row.l} className="flex justify-between text-xs py-0.5">
                <span className="text-muted-foreground">{row.l}</span>
                <span className="font-mono font-bold" style={{color:row.col}}>{row.v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">🇹🇷 İhracat Dağılımı</div>
          {IHRACAT_TR.map(it=>(
            <div key={it.label} className="flex items-center gap-1 mb-1">
              <span className="text-muted-foreground" style={{width:85,fontSize:9}}>{it.label}</span>
              <div className="flex-1 h-2 rounded-full" style={{background:'hsl(222 47% 8%)'}}>
                <div className="h-2 rounded-full" style={{width:`${it.pct}%`,background:'#ef4444'}}/>
              </div>
              <span className="text-muted-foreground font-mono" style={{fontSize:9,width:24}}>%{it.pct}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">🇬🇷 İhracat Dağılımı</div>
          {IHRACAT_GR.map(it=>(
            <div key={it.label} className="flex items-center gap-1 mb-1">
              <span className="text-muted-foreground" style={{width:85,fontSize:9}}>{it.label}</span>
              <div className="flex-1 h-2 rounded-full" style={{background:'hsl(222 47% 8%)'}}>
                <div className="h-2 rounded-full" style={{width:`${it.pct}%`,background:'#1d63ed'}}/>
              </div>
              <span className="text-muted-foreground font-mono" style={{fontSize:9,width:24}}>%{it.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Kapsamlı Ekonomik Karşılaştırma ─────────────────────────────── */
const EKONOMIK_TABLE = [
  {kat:'Genel',items:[
    {gosterge:'GSYİH (nominal)',          tr:'$1.15T',   gr:'$239B',    not:'Türkiye 4.8x büyük'},
    {gosterge:'Kişi Başı GSYİH',         tr:'$13.5K',   gr:'$22.6K',   not:'GR daha yüksek'},
    {gosterge:'Kişi Başı GSYİH (PPP)',   tr:'$45K',     gr:'$36K',     not:"TR satın alma gücünde önde"},
    {gosterge:'Nüfus',                   tr:'86M',       gr:'10.4M',    not:''},
  ]},
  {kat:'İşgücü',items:[
    {gosterge:'İşsizlik',                tr:'%8.8',     gr:'%9.5',     not:'Yakın seviyeler'},
    {gosterge:'Genç İşsizliği',          tr:'%17.2',    gr:'%22.8',    not:"GR gençlik sorunu"},
    {gosterge:'İş Kurma Kolaylığı',      tr:'33/190',   gr:'61/190',   not:'Dünya Bankası sıralaması'},
    {gosterge:'Yolsuzluk Algı Endeksi',  tr:'36/100',   gr:'48/100',   not:"100 = tam temiz"},
  ]},
  {kat:'Sektör Ağırlıkları',items:[
    {gosterge:'Turizm / GSYİH',          tr:'%4.8',     gr:'%20.6',    not:"GR'de dominant sektör"},
    {gosterge:'Sanayi / GSYİH',          tr:'%29',      gr:'%16',      not:"TR daha sanayi odaklı"},
    {gosterge:'Tarım / GSYİH',           tr:'%6.5',     gr:'%3.8',     not:''},
    {gosterge:'Hizmetler / GSYİH',       tr:'%54',      gr:'%77',      not:"GR hizmet ekonomisi"},
  ]},
];
function KapsamliEkonomik() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold">🇹🇷 vs 🇬🇷 — Kapsamlı Ekonomik Göstergeler</span>
      </div>
      <div className="space-y-3">
        {EKONOMIK_TABLE.map(kat=>(
          <div key={kat.kat}>
            <div className="text-xs font-bold text-cyan-400 mb-1.5 border-b border-cyan-400/20 pb-1">{kat.kat}</div>
            <div className="space-y-1">
              {kat.items.map((row,i)=>(
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <span className="text-xs text-muted-foreground flex-1 min-w-0 truncate">{row.gosterge}</span>
                  <span className="text-xs font-mono font-bold text-red-400 shrink-0" style={{minWidth:60,textAlign:'right'}}>🇹🇷 {row.tr}</span>
                  <span className="text-xs font-mono font-bold text-blue-400 shrink-0" style={{minWidth:60,textAlign:'right'}}>🇬🇷 {row.gr}</span>
                  {row.not && <span className="text-muted-foreground shrink-0 hidden md:block" style={{fontSize:9,maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.not}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



/* ── Faiz Oranları Tarihi ────────────────────────────────────────── */
const FAIZ_TARIHI = [
  {tarih:"Oca'23",tcmb:8.5,ecb:2.5},{tarih:"Mar'23",tcmb:8.5,ecb:3.5},
  {tarih:"May'23",tcmb:8.5,ecb:3.75},{tarih:"Haz'23",tcmb:15,ecb:4.0},
  {tarih:"Ağu'23",tcmb:25,ecb:4.25},{tarih:"Eyl'23",tcmb:30,ecb:4.5},
  {tarih:"Kas'23",tcmb:40,ecb:4.5},{tarih:"Oca'24",tcmb:45,ecb:4.5},
  {tarih:"Mar'24",tcmb:50,ecb:4.5},{tarih:"Haz'24",tcmb:50,ecb:4.0},
  {tarih:"Eyl'24",tcmb:50,ecb:3.5},{tarih:"Ara'24",tcmb:47.5,ecb:3.0},
  {tarih:"Oca'25",tcmb:45,ecb:2.75},{tarih:"Mar'25",tcmb:42.5,ecb:2.5},
  {tarih:"Haz'25",tcmb:40,ecb:2.25},{tarih:"Eyl'25",tcmb:38,ecb:2.0},
  {tarih:"Oca'26",tcmb:37.5,ecb:2.0},{tarih:"Mar'26",tcmb:37,ecb:2.0},
];
function FaizTarihi() {
  const maxV = Math.max(...FAIZ_TARIHI.map(d=>d.tcmb));
  const H=80, W=100, n=FAIZ_TARIHI.length;
  const tcmbPath = FAIZ_TARIHI.map((d,i)=>`${i===0?"M":"L"}${(i/(n-1))*W},${H-((d.tcmb/maxV)*H)}`).join(" ");
  const ecbPath  = FAIZ_TARIHI.map((d,i)=>`${i===0?"M":"L"}${(i/(n-1))*W},${H-((d.ecb/maxV)*H)}`).join(" ");
  const last = FAIZ_TARIHI[FAIZ_TARIHI.length-1];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-2">
        <Landmark className="w-4 h-4 text-amber-400"/>
        <span className="text-sm font-semibold">Merkez Bankası Faiz Tarihi — TCMB vs ECB</span>
      </div>
      <div className="flex gap-3 mb-3">
        <div className="flex-1 p-2 rounded-xl text-center" style={{background:"hsl(222 47% 5%)",border:"1px solid #ef444430"}}>
          <div className="text-xs text-muted-foreground">🇹🇷 TCMB (Mart 2026)</div>
          <div className="text-2xl font-bold font-mono text-red-400">%{last.tcmb}</div>
          <div className="text-xs text-muted-foreground">Zirve: %50 (Mar-Eyl 2024)</div>
        </div>
        <div className="flex-1 p-2 rounded-xl text-center" style={{background:"hsl(222 47% 5%)",border:"1px solid #3b82f630"}}>
          <div className="text-xs text-muted-foreground">🇬🇷 ECB (Mart 2026)</div>
          <div className="text-2xl font-bold font-mono text-blue-400">%{last.ecb}</div>
          <div className="text-xs text-muted-foreground">Zirve: %4.5 (Ağu 2023)</div>
        </div>
        <div className="flex-1 p-2 rounded-xl text-center" style={{background:"hsl(222 47% 5%)",border:"1px solid #10b98130"}}>
          <div className="text-xs text-muted-foreground">Fark</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">%{(last.tcmb-last.ecb).toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">TR yüksek faiz primi</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H,display:"block"}} preserveAspectRatio="none">
        <path d={tcmbPath} fill="none" stroke="#ef4444" strokeWidth="1.5"/>
        <path d={ecbPath}  fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
      </svg>
      <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1">
        <span>Oca 2023</span><span>Ort.</span><span>Mar 2026</span>
      </div>
      <div className="flex gap-4 mt-2 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 inline-block"/> TCMB</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-400 inline-block"/> ECB</span>
      </div>
    </div>
  );
}

/* ── €250K Yatırım Senaryosu ─────────────────────────────────────── */
const SENARYO = {
  atina:{
    baslik:"Atina — Pangrati / Kypseli",flag:"🇬🇷",color:"#1d63ed",
    yatirim:"€250.000",alinanM2:"125 m²",aidat:"€120/ay",
    kiraAylik:"€950",kiraYillik:"€11.400",kiraGetiri:"%4.6",
    degerArtis:"Yıllık +%8-12",sermaye5Yil:"€370.000-€440.000",
    altinVize:"✅ Schengen ikamet hakkı",vergi:"Kira geliri %15",
    artı:["Schengen vizesi","EUR bazlı getiri","AB hukuku","Turizm talebi"],
    eksi:["Yüksek tapu maliyeti","Uzaktan yönetim","Dil engeli"],
  },
  istanbul:{
    baslik:"İstanbul — Kadıköy / Ataşehir",flag:"🇹🇷",color:"#ef4444",
    yatirim:"₺11.000.000 (~€250K)",alinanM2:"47 m²",aidat:"₺3.500/ay",
    kiraAylik:"₺42.000",kiraYillik:"₺504.000",kiraGetiri:"%4.6",
    degerArtis:"Yıllık +%25-35",sermaye5Yil:"₺30M-₺40M (USD değeri değişken)",
    altinVize:"❌ Yok",vergi:"Kira geliri %15-35",
    artı:["TRY bazlı yüksek artış","Yerel piyasa bilgisi","Hukuki kolaylık"],
    eksi:["TRY değer kaybı riski","Dolar bazında getiri belirsiz","Yüksek enflasyon"],
  },
};
function YatirimSenaryosu() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-4 h-4 text-purple-400"/>
        <span className="text-sm font-semibold">€250.000 Yatırım Senaryosu — Atina vs İstanbul</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[SENARYO.atina, SENARYO.istanbul].map(c => (
          <div key={c.flag} className="p-3 rounded-xl" style={{background:"hsl(222 47% 5%)",border:`1px solid ${c.color}30`}}>
            <div className="text-xs font-bold mb-2" style={{color:c.color}}>{c.flag} {c.baslik}</div>
            {[
              {l:"Yatırım",v:c.yatirim},{l:"Alınan m²",v:c.alinanM2},
              {l:"Aylık Kira",v:c.kiraAylik},{l:"Kira Getiri",v:c.kiraGetiri},
              {l:"Değer Artışı",v:c.degerArtis},{l:"5 Yıl Sonra",v:c.sermaye5Yil},
              {l:"Altın Vize",v:c.altinVize},
            ].map(row => (
              <div key={row.l} className="flex items-start justify-between py-0.5 gap-1" style={{borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span className="text-xs text-muted-foreground shrink-0">{row.l}</span>
                <span className="text-xs font-mono font-semibold text-right" style={{color:c.color,fontSize:10}}>{row.v}</span>
              </div>
            ))}
            <div className="mt-2">
              <div className="text-xs font-semibold text-emerald-400 mb-1">Avantajlar</div>
              {c.artı.map(a=><div key={a} className="text-xs text-muted-foreground">+ {a}</div>)}
              <div className="text-xs font-semibold text-red-400 mt-1 mb-1">Riskler</div>
              {c.eksi.map(e=><div key={e} className="text-xs text-muted-foreground">- {e}</div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Borsalar Performansı ────────────────────────────────────────── */
const BORSA_5YIL = [
  {yil:"2020",bist:26,athex:2,usd:-30},
  {yil:"2021",bist:67,athex:18,usd:19},
  {yil:"2022",bist:197,athex:8,usd:-34},
  {yil:"2023",bist:85,athex:40,usd:20},
  {yil:"2024",bist:29,athex:18,usd:25},
  {yil:"5Y Toplam (TRY/EUR)",bist:1820,athex:122,usd:42},
];
function BorsaPerformans() {
  const maxV = 150;
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-emerald-400"/>
        <span className="text-sm font-semibold">Borsa Performansı — BIST 100 vs ATHEX vs S&P 500</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">Yıllık getiri (yerel para birimi cinsinden)</div>
      <div className="space-y-2">
        {BORSA_5YIL.slice(0,5).map(r => (
          <div key={r.yil}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-muted-foreground">{r.yil}</span>
              <div className="flex gap-3">
                <span style={{color:"#ef4444",minWidth:52,textAlign:"right"}} className="font-mono text-xs">BIST {r.bist>0?"+":""}{r.bist}%</span>
                <span style={{color:"#1d63ed",minWidth:62,textAlign:"right"}} className="font-mono text-xs">ATHEX {r.athex>0?"+":""}{r.athex}%</span>
                <span style={{color:"#10b981",minWidth:58,textAlign:"right"}} className="font-mono text-xs">S&P {r.usd>0?"+":""}{r.usd}%</span>
              </div>
            </div>
            <div className="flex gap-1 h-3">
              <div className="flex-1 h-3 rounded-sm overflow-hidden" style={{background:"hsl(222 47% 8%)"}}>
                <div style={{width:`${Math.min(100,(Math.abs(r.bist)/maxV)*100)}%`,height:"100%",background:r.bist>=0?"#ef4444":"#374151"}}/>
              </div>
              <div className="flex-1 h-3 rounded-sm overflow-hidden" style={{background:"hsl(222 47% 8%)"}}>
                <div style={{width:`${Math.min(100,(Math.abs(r.athex)/maxV)*100)}%`,height:"100%",background:r.athex>=0?"#1d63ed":"#374151"}}/>
              </div>
              <div className="flex-1 h-3 rounded-sm overflow-hidden" style={{background:"hsl(222 47% 8%)"}}>
                <div style={{width:`${Math.min(100,(Math.abs(r.usd)/maxV)*100)}%`,height:"100%",background:r.usd>=0?"#10b981":"#374151"}}/>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 p-2 rounded-xl" style={{background:"hsl(222 47% 5%)",border:"1px solid rgba(255,255,255,.06)"}}>
        <div className="text-xs font-bold text-muted-foreground mb-1">5 Yıllık Kümülatif (2020-2024)</div>
        <div className="flex gap-3">
          <div className="text-center flex-1">
            <div className="text-sm font-bold font-mono text-red-400">+%1820</div>
            <div className="text-xs text-muted-foreground">BIST (TRY)</div>
            <div className="text-xs text-red-300" style={{fontSize:9}}>~+%60 (USD bazında)</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-sm font-bold font-mono text-blue-400">+%122</div>
            <div className="text-xs text-muted-foreground">ATHEX (EUR)</div>
            <div className="text-xs text-blue-300" style={{fontSize:9}}>~+%98 (USD bazında)</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-sm font-bold font-mono text-emerald-400">+%85</div>
            <div className="text-xs text-muted-foreground">S&P 500 (USD)</div>
            <div className="text-xs text-emerald-300" style={{fontSize:9}}>Global benchmark</div>
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-2" style={{fontSize:10}}>⚠️ BIST TRY bazında çok yüksek görünse de TRY değer kaybı nedeniyle USD bazında ATHEX gerisinde kaldı.</div>
    </div>
  );
}

/* ── Bankacılık Sektörü ──────────────────────────────────────────── */
const TR_BANKALAR = [
  {isim:"Ziraat Bankası",     aktif:"$162B",sermaye:"%18.2",npl:"%2.1",puan:4},
  {isim:"Türkiye İş Bankası", aktif:"$141B",sermaye:"%16.8",npl:"%2.4",puan:4},
  {isim:"Garanti BBVA",       aktif:"$138B",sermaye:"%17.5",npl:"%2.2",puan:5},
  {isim:"Akbank",             aktif:"$115B",sermaye:"%18.9",npl:"%1.9",puan:4},
];
const GR_BANKALAR = [
  {isim:"National Bank of GR",aktif:"€71B", sermaye:"%18.5",npl:"%3.8",puan:4},
  {isim:"Eurobank",            aktif:"€68B", sermaye:"%17.2",npl:"%3.5",puan:4},
  {isim:"Piraeus Bank",        aktif:"€64B", sermaye:"%16.8",npl:"%4.1",puan:3},
  {isim:"Alpha Bank",          aktif:"€58B", sermaye:"%16.5",npl:"%4.4",puan:3},
];
function BankacilikSektoru() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Landmark className="w-4 h-4 text-blue-400"/>
        <span className="text-sm font-semibold">Bankacılık Sektörü — TR vs GR Büyük Bankalar</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[{flag:"🇹🇷",color:"#ef4444",banks:TR_BANKALAR},{flag:"🇬🇷",color:"#1d63ed",banks:GR_BANKALAR}].map(g=>(
          <div key={g.flag}>
            <div className="text-xs font-bold mb-2" style={{color:g.color}}>{g.flag} Top 4 Banka</div>
            {g.banks.map(b=>(
              <div key={b.isim} className="mb-2 p-2 rounded-lg" style={{background:"hsl(222 47% 5%)"}}>
                <div className="text-xs font-semibold mb-1 truncate">{b.isim}</div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-center">
                    <div className="font-mono font-bold" style={{fontSize:10,color:g.color}}>{b.aktif}</div>
                    <div className="text-muted-foreground" style={{fontSize:8}}>Aktif</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono font-bold" style={{fontSize:10,color:"#10b981"}}>{b.sermaye}</div>
                    <div className="text-muted-foreground" style={{fontSize:8}}>Sermaye</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono font-bold" style={{fontSize:10,color:parseFloat(b.npl)>3?"#f59e0b":"#10b981"}}>{b.npl}</div>
                    <div className="text-muted-foreground" style={{fontSize:8}}>NPL</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground" style={{fontSize:9}}>
              {g.flag==="🇹🇷"?"BDDK denetimi · Basel III uyumlu":"SSM denetimi · ECB gözetiminde"}
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2 p-2 rounded-lg" style={{background:"hsl(222 47% 5%)",fontSize:10}}>
        NPL (Takipteki Kredi Oranı): Düşük daha iyi. Sermaye Yeterliliği: Yüksek daha güvenli.
      </div>
    </div>
  );
}

/* ── Risk & Yatırım Ortamı ───────────────────────────────────────── */
const RISK_DATA = [
  {kriter:"Ekonomik Özgürlük (Heritage)", trPuan:54,  grPuan:61,  maxP:100, birimi:"/ 100", not:"Yüksek = daha özgür piyasa"},
  {kriter:"Yolsuzluk Algı (TI)",          trPuan:36,  grPuan:48,  maxP:100, birimi:"/ 100", not:"Yüksek = daha temiz"},
  {kriter:"İş Kurma Kolaylığı (WB)",       trPuan:72,  grPuan:62,  maxP:100, birimi:"/ 100", not:"Yüksek = daha kolay"},
  {kriter:"Siyasi İstikrar",              trPuan:35,  grPuan:62,  maxP:100, birimi:"/ 100", not:"WorldBank governance"},
  {kriter:"Ülke Risk Skoru (OECD)",        trPuan:74,  grPuan:42,  maxP:100, birimi:"/ 100", not:"Yüksek = daha riskli"},
  {kriter:"Mülkiyet Hakları Endeksi",     trPuan:51,  grPuan:63,  maxP:100, birimi:"/ 100", not:"Property Rights Alliance"},
];
function RiskYatirim() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-purple-400"/>
        <span className="text-sm font-semibold">Yatırım Riski & Ortam Puanları — TR vs GR</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">Uluslararası endeksler · 100 üzerinden</div>
      <div className="space-y-3">
        {RISK_DATA.map(r=>{
          const trBetter = r.kriter.includes("Risk") ? r.trPuan < r.grPuan : r.trPuan > r.grPuan;
          const grBetter = r.kriter.includes("Risk") ? r.grPuan < r.trPuan : r.grPuan > r.trPuan;
          return (
            <div key={r.kriter}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground font-semibold">{r.kriter}</span>
                <span className="text-muted-foreground" style={{fontSize:9}}>{r.not}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 text-xs font-bold font-mono text-right" style={{color:trBetter?"#10b981":"#ef4444"}}>🇹🇷 {r.trPuan}</div>
                <div className="flex-1 h-4 rounded-full overflow-hidden relative" style={{background:"hsl(222 47% 8%)"}}>
                  <div className="absolute left-0 top-0 h-4 rounded-l-full" style={{width:`${(r.trPuan/r.maxP)*50}%`,background:"#ef4444",opacity:0.7}}/>
                  <div className="absolute right-0 top-0 h-4 rounded-r-full" style={{width:`${(r.grPuan/r.maxP)*50}%`,background:"#1d63ed",opacity:0.7}}/>
                </div>
                <div className="w-10 text-xs font-bold font-mono" style={{color:grBetter?"#10b981":"#ef4444"}}>🇬🇷 {r.grPuan}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="p-2 rounded-xl text-center" style={{background:"hsl(222 47% 5%)"}}>
          <div className="text-xs text-muted-foreground mb-1">🇹🇷 TR Avantajları</div>
          <div className="text-xs">Büyük iç pazar · Genç nüfus · Coğrafi konum · İş kurma hızı</div>
        </div>
        <div className="p-2 rounded-xl text-center" style={{background:"hsl(222 47% 5%)"}}>
          <div className="text-xs text-muted-foreground mb-1">🇬🇷 GR Avantajları</div>
          <div className="text-xs">AB üyeliği · EUR istikrarı · Hukuk güvenliği · Schengen erişimi</div>
        </div>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════════
   ANA DASHBOARD SAYFASI
════════════════════════════════════════════════════════════════════ */
const AGENT_PROFILES = [
  { id:'market' as const, name:'Piyasa Ajanı', color:'#00d4ff', icon:TrendingUp,
    insights:['ARIMA(2,1,2) forecast: İst. konut +2.3% (30 gün)','Kalman filtresi: EUR/TRY volatilite artışı','Sentiment endeksi 68 → İhtiyatlı Bullish','Eyüpsultan hacim anomalisi: +142% yZ'] },
  { id:'financial' as const, name:'Finansal Ajan', color:'#10b981', icon:DollarSign,
    insights:['VaR(95): ₺2.4M portföy için ₺180K günlük risk','Monte Carlo (5K sim): Gayrimenkul IRR medyan %18.4','TRY enflasyon hedge: Altın korelasyon 0.72','Sharpe ratio portföy: 1.34 (benchmark: 0.89)'] },
  { id:'property' as const, name:'Emlak Ajanı', color:'#8b5cf6', icon:Building2,
    insights:['Hedonik model R²=0.89: Metro 0.5km = +₺12.4K/m²','Beşiktaş fiyat/kira oranı: 28.4x','3 mülk anomali skoru >0.78: Olası değer boşluğu','Isolation Forest: Esenyurt\'ta 2 aşırı fiyatlı mülk'] },
  { id:'wellness' as const, name:'Sağlık Ajanı', color:'#f59e0b', icon:Activity,
    insights:['Kreatinin+D3+Mg protokolü optimal sıralama','Farmakokinetik: Kafein+L-Theanin peak: 08:45','KSM-66 kortizol inhibisyonu: %23 etkinlik','Uyku kalitesi tahmini: 7.2/10'] },
  { id:'marketing' as const, name:'Pazarlama Ajanı', color:'#ef4444', icon:Megaphone,
    insights:['Shapley: Meta %31, Google %28, Organik %22','Retargeting ROAS: 109x — bütçe artışı önerisi','Yaş grubu 35-44: En yüksek ROAS','Dubai segmenti: 520x ROAS'] },
];
const STATES = ['perceiving','deliberating','executing','communicating','idle'] as const;


/* ═══════════════════════════════════════════════════════════════
   30 YENİ İSTANBUL & ATİNA MODÜLÜ
   ═══════════════════════════════════════════════════════════════ */

function NufusDemografi() {
  const data = [
    {sehir:'İstanbul',nufus:'16.0M',yas:'32.4',buyume:'+0.6%',yogunluk:'2,948/km²'},
    {sehir:'Atina Metro',nufus:'3.7M',yas:'44.1',buyume:'-0.2%',yogunluk:'812/km²'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">👥</span><span className="text-xs font-bold">Nüfus & Demografi Karşılaştırması</span></div>
      <div className="grid grid-cols-2 gap-3">
        {data.map(d=>(
          <div key={d.sehir} className="rounded-xl p-3" style={{background:'hsl(222 47% 6%)'}}>
            <div className="text-xs font-bold text-white mb-2">{d.sehir}</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Nüfus</span><span className="font-mono font-bold text-white">{d.nufus}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Medyan Yaş</span><span className="font-mono">{d.yas}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Büyüme</span><span className="font-mono" style={{color:d.buyume.startsWith('+')?'#22c55e':'#ef4444'}}>{d.buyume}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Yoğunluk</span><span className="font-mono">{d.yogunluk}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UlasimMetro() {
  const metro = [
    {sehir:'İstanbul',hat:9,istasyon:113,gunluk:'5.2M',uzunluk:'167 km',genisleme:'Havaist M11 hattı inşaat'},
    {sehir:'Atina',hat:4,istasyon:67,gunluk:'1.1M',uzunluk:'85 km',genisleme:'Hat 4 Alimos-Marousi inşaat'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🚇</span><span className="text-xs font-bold">Metro & Ulaşım Ağı</span></div>
      <div className="grid grid-cols-2 gap-3">
        {metro.map(m=>(
          <div key={m.sehir} className="rounded-xl p-3" style={{background:'hsl(222 47% 6%)'}}>
            <div className="text-xs font-bold text-white mb-2">{m.sehir}</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Hat / İstasyon</span><span className="font-mono font-bold text-white">{m.hat} / {m.istasyon}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Günlük Yolcu</span><span className="font-mono">{m.gunluk}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Toplam Uzunluk</span><span className="font-mono">{m.uzunluk}</span></div>
              <div className="text-xs mt-1" style={{color:'#f59e0b',fontSize:10}}>📍 {m.genisleme}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HavaKalitesi() {
  const d = [
    {sehir:'İstanbul',aqi:72,pm25:'28 µg/m³',durum:'Orta',renk:'#f59e0b'},
    {sehir:'Atina',aqi:54,pm25:'18 µg/m³',durum:'İyi',renk:'#22c55e'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🌬️</span><span className="text-xs font-bold">Hava Kalitesi Endeksi (AQI)</span></div>
      <div className="grid grid-cols-2 gap-3">
        {d.map(x=>(
          <div key={x.sehir} className="rounded-xl p-3 text-center" style={{background:'hsl(222 47% 6%)'}}>
            <div className="text-xs font-bold text-white mb-2">{x.sehir}</div>
            <div className="text-3xl font-black font-mono" style={{color:x.renk}}>{x.aqi}</div>
            <div className="text-xs font-bold mt-1" style={{color:x.renk}}>{x.durum}</div>
            <div className="text-xs text-gray-400 mt-1">PM2.5: {x.pm25}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UniversiteSiralamasi() {
  const unis = [
    {uni:'İTÜ',sehir:'İstanbul',alan:'Mühendislik',qs:428},
    {uni:'Boğaziçi',sehir:'İstanbul',alan:'İşletme & Fen',qs:531},
    {uni:'Koç',sehir:'İstanbul',alan:'MBA & Hukuk',qs:455},
    {uni:'Sabancı',sehir:'İstanbul',alan:'Veri Bilimi',qs:541},
    {uni:'NTUA',sehir:'Atina',alan:'Mühendislik',qs:377},
    {uni:'EKPA',sehir:'Atina',alan:'Tıp & Hukuk',qs:662},
    {uni:'Athens Economics',sehir:'Atina',alan:'İktisat',qs:591},
    {uni:'Panteion',sehir:'Atina',alan:'Sosyal Bilimler',qs:801},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🎓</span><span className="text-xs font-bold">Üniversite Sıralaması (QS 2026)</span></div>
      <div className="grid grid-cols-2 gap-2">
        {unis.map(u=>(
          <div key={u.uni} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
            <div>
              <div className="text-xs font-bold text-white">{u.uni}</div>
              <div style={{fontSize:10}} className="text-gray-400">{u.alan}</div>
            </div>
            <div className="text-xs font-mono font-bold" style={{color:u.sehir==='İstanbul'?'#3b82f6':'#f59e0b'}}>#{u.qs}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GayrimenkulM2() {
  const semtler = [
    {semt:'Beşiktaş',sehir:'İst',m2:'₺268K',kira:'₺28K',getiri:'3.2%'},
    {semt:'Kadıköy',sehir:'İst',m2:'₺195K',kira:'₺22K',getiri:'3.8%'},
    {semt:'Ataşehir',sehir:'İst',m2:'₺142K',kira:'₺18K',getiri:'4.5%'},
    {semt:'Başakşehir',sehir:'İst',m2:'₺98K',kira:'₺14K',getiri:'4.8%'},
    {semt:'Kolonaki',sehir:'Ati',m2:'€4,200',kira:'€1,450',getiri:'3.5%'},
    {semt:'Glyfada',sehir:'Ati',m2:'€3,800',kira:'€1,250',getiri:'4.2%'},
    {semt:'Piraeus',sehir:'Ati',m2:'€2,100',kira:'€750',getiri:'5.1%'},
    {semt:'Kifisia',sehir:'Ati',m2:'€3,500',kira:'€1,100',getiri:'3.8%'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏘️</span><span className="text-xs font-bold">Semt Bazlı m² Fiyat & Kira Getirisi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-5 gap-1 text-xs text-gray-500 px-1" style={{fontSize:10}}>
          <span>Semt</span><span></span><span className="text-right">m²</span><span className="text-right">Kira</span><span className="text-right">Getiri</span>
        </div>
        {semtler.map(s=>(
          <div key={s.semt} className="grid grid-cols-5 gap-1 rounded-lg px-1 py-1" style={{background:'hsl(222 47% 6%)'}}>
            <span className="text-xs font-bold text-white truncate">{s.semt}</span>
            <span style={{fontSize:9,color:s.sehir==='İst'?'#3b82f6':'#f59e0b'}}>{s.sehir}</span>
            <span className="text-xs font-mono text-right">{s.m2}</span>
            <span className="text-xs font-mono text-right text-gray-400">{s.kira}</span>
            <span className="text-xs font-mono text-right font-bold" style={{color:'#22c55e'}}>{s.getiri}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IklimKarsilastirma() {
  const aylar = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const ist = [6,7,10,15,20,25,28,28,24,18,13,8];
  const ati = [10,11,13,17,22,27,30,30,26,21,16,12];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🌡️</span><span className="text-xs font-bold">İklim Karşılaştırması — Aylık Sıcaklık (°C)</span></div>
      <div className="flex gap-1 items-end" style={{height:80}}>
        {aylar.map((ay,i)=>(
          <div key={ay} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5" style={{height:80,alignItems:'flex-end'}}>
              <div style={{flex:1,height:`${ist[i]*2.5}px`,background:'#3b82f6',borderRadius:'3px 3px 0 0'}} title={`İst ${ist[i]}°C`}/>
              <div style={{flex:1,height:`${ati[i]*2.5}px`,background:'#f59e0b',borderRadius:'3px 3px 0 0'}} title={`Ati ${ati[i]}°C`}/>
            </div>
            <span style={{fontSize:8}} className="text-gray-500">{ay}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        <span className="text-xs"><span style={{color:'#3b82f6'}}>■</span> İstanbul</span>
        <span className="text-xs"><span style={{color:'#f59e0b'}}>■</span> Atina</span>
      </div>
    </div>
  );
}

function TurizmGeliri() {
  const d = [
    {sehir:'İstanbul',turist:'20.2M',gelir:'$16.4B',ort:'$812/kişi',pazar:'Rusya, Almanya, İran'},
    {sehir:'Atina',turist:'6.8M',gelir:'€5.1B',ort:'€750/kişi',pazar:'İngiltere, Almanya, Fransa'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">✈️</span><span className="text-xs font-bold">Turizm Geliri & Ziyaretçi Analizi</span></div>
      <div className="grid grid-cols-2 gap-3">
        {d.map(x=>(
          <div key={x.sehir} className="rounded-xl p-3" style={{background:'hsl(222 47% 6%)'}}>
            <div className="text-xs font-bold text-white mb-2">{x.sehir}</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Yıllık Turist</span><span className="font-mono font-bold text-white">{x.turist}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Gelir</span><span className="font-mono">{x.gelir}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Ort. Harcama</span><span className="font-mono">{x.ort}</span></div>
              <div style={{fontSize:10}} className="text-gray-500 mt-1">🌍 {x.pazar}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HavalimanTraffik() {
  const d = [
    {havaalani:'İstanbul (IST)',yolcu:'76M',kargo:'2.1M ton',pist:5,sirket:'Turkish Airlines hub'},
    {havaalani:'Sabiha Gökçen (SAW)',yolcu:'41M',kargo:'0.3M ton',pist:2,sirket:'Pegasus hub'},
    {havaalani:'Atina (ATH)',yolcu:'28M',kargo:'0.12M ton',pist:2,sirket:'Aegean Airlines hub'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">✈️</span><span className="text-xs font-bold">Havalimanı Trafik Karşılaştırması</span></div>
      <div className="space-y-2">
        {d.map(h=>(
          <div key={h.havaalani} className="rounded-xl p-3" style={{background:'hsl(222 47% 6%)'}}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{h.havaalani}</span>
              <span className="text-xs font-mono font-bold" style={{color:'#22c55e'}}>{h.yolcu}</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-400">
              <span>Kargo: {h.kargo}</span><span>Pist: {h.pist}</span>
            </div>
            <div style={{fontSize:10}} className="text-gray-500 mt-1">🛫 {h.sirket}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BogazKopru() {
  const d = [
    {ad:'15 Temmuz Köprüsü',yil:1973,uzunluk:'1,560 m',trafik:'180K/gün'},
    {ad:'FSM Köprüsü',yil:1988,uzunluk:'1,510 m',trafik:'150K/gün'},
    {ad:'Yavuz Sultan Selim',yil:2016,uzunluk:'1,408 m',trafik:'60K/gün'},
    {ad:'Marmaray Tünel',yil:2013,uzunluk:'13,600 m',trafik:'600K/gün'},
    {ad:'Avrasya Tüneli',yil:2016,uzunluk:'5,400 m',trafik:'55K/gün'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🌉</span><span className="text-xs font-bold">İstanbul Boğaz Geçişleri</span></div>
      {d.map(k=>(
        <div key={k.ad} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <div>
            <div className="text-xs font-bold text-white">{k.ad}</div>
            <div style={{fontSize:10}} className="text-gray-500">{k.yil} · {k.uzunluk}</div>
          </div>
          <div className="text-xs font-mono font-bold" style={{color:'#3b82f6'}}>{k.trafik}</div>
        </div>
      ))}
    </div>
  );
}

function TarihiYerler() {
  const yerler = [
    {ad:'Ayasofya',sehir:'İst',yil:'537 AD',ziyaret:'3.8M/yıl',tip:'Cami/Müze'},
    {ad:'Topkapı Sarayı',sehir:'İst',yil:'1478',ziyaret:'2.1M/yıl',tip:'Müze'},
    {ad:'Sultanahmet Camii',sehir:'İst',yil:'1616',ziyaret:'5M/yıl',tip:'Cami'},
    {ad:'Yerebatan Sarnıcı',sehir:'İst',yil:'532 AD',ziyaret:'1.2M/yıl',tip:'Tarihi Yapı'},
    {ad:'Akropolis',sehir:'Ati',yil:'447 BC',ziyaret:'3.0M/yıl',tip:'Antik Tapınak'},
    {ad:'Ulusal Arkeoloji Müzesi',sehir:'Ati',yil:'1829',ziyaret:'0.5M/yıl',tip:'Müze'},
    {ad:'Agora',sehir:'Ati',yil:'600 BC',ziyaret:'0.8M/yıl',tip:'Antik Alan'},
    {ad:'Poseidon Tapınağı',sehir:'Ati',yil:'444 BC',ziyaret:'0.6M/yıl',tip:'Antik Tapınak'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏛️</span><span className="text-xs font-bold">Tarihi & Kültürel Varlıklar</span></div>
      <div className="grid grid-cols-2 gap-1">
        {yerler.map(y=>(
          <div key={y.ad} className="rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white truncate">{y.ad}</span>
              <span style={{fontSize:8,color:y.sehir==='İst'?'#3b82f6':'#f59e0b'}}>{y.sehir}</span>
            </div>
            <div style={{fontSize:10}} className="text-gray-400">{y.yil} · {y.ziyaret}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function YemekKulturu() {
  const yemekler = [
    {yemek:'Kebap Çeşitleri',sehir:'İst',fiyat:'₺250-600',puan:'⭐ 4.6'},
    {yemek:'Balık Ekmek',sehir:'İst',fiyat:'₺120-200',puan:'⭐ 4.3'},
    {yemek:'Kokoreç',sehir:'İst',fiyat:'₺150-250',puan:'⭐ 4.5'},
    {yemek:'Lahmacun',sehir:'İst',fiyat:'₺80-150',puan:'⭐ 4.4'},
    {yemek:'Souvlaki',sehir:'Ati',fiyat:'€3-8',puan:'⭐ 4.5'},
    {yemek:'Moussaka',sehir:'Ati',fiyat:'€8-15',puan:'⭐ 4.4'},
    {yemek:'Gyros',sehir:'Ati',fiyat:'€3-6',puan:'⭐ 4.6'},
    {yemek:'Spanakopita',sehir:'Ati',fiyat:'€2-5',puan:'⭐ 4.3'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🍽️</span><span className="text-xs font-bold">Mutfak & Sokak Yemekleri Rehberi</span></div>
      <div className="grid grid-cols-2 gap-1">
        {yemekler.map(y=>(
          <div key={y.yemek} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
            <div>
              <div className="text-xs font-bold text-white">{y.yemek}</div>
              <div style={{fontSize:10}} className="text-gray-400">{y.fiyat} · <span style={{color:y.sehir==='İst'?'#3b82f6':'#f59e0b'}}>{y.sehir}</span></div>
            </div>
            <span style={{fontSize:10}}>{y.puan}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GocVeExpat() {
  const d = [
    {metrik:'Yabancı Nüfus',ist:'1.2M',ati:'320K'},
    {metrik:'Top Milliyet',ist:'Suriye, İran, Irak',ati:'Arnavutluk, Romanya, Pakistan'},
    {metrik:'Dijital Nomad',ist:'~45K',ati:'~28K'},
    {metrik:'Oturum Başvurusu/Yıl',ist:'280K',ati:'65K'},
    {metrik:'Expat Maliyet Endeksi',ist:'48/100',ati:'62/100'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🌐</span><span className="text-xs font-bold">Göç & Expat Profili</span></div>
      {d.map(x=>(
        <div key={x.metrik} className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <span className="text-xs text-gray-400">{x.metrik}</span>
          <span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>{x.ist}</span>
          <span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>{x.ati}</span>
        </div>
      ))}
      <div className="flex gap-8 justify-center text-xs">
        <span><span style={{color:'#3b82f6'}}>■</span> İstanbul</span>
        <span><span style={{color:'#f59e0b'}}>■</span> Atina</span>
      </div>
    </div>
  );
}

function InsaatSektoru() {
  const d = [
    {metrik:'Aktif Konut Projesi',ist:'2,400+',ati:'380+'},
    {metrik:'Yıllık Yeni Konut',ist:'520K',ati:'28K'},
    {metrik:'Kentsel Dönüşüm',ist:'300K bina riskli',ati:'42K bina riskli'},
    {metrik:'İnşaat Maliyeti/m²',ist:'₺38K ($1,050)',ati:'€1,400'},
    {metrik:'İmar İzni Süresi',ist:'4-8 ay',ati:'6-12 ay'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏗️</span><span className="text-xs font-bold">İnşaat Sektörü Karşılaştırması</span></div>
      {d.map(x=>(
        <div key={x.metrik} className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <span className="text-xs text-gray-400">{x.metrik}</span>
          <span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>{x.ist}</span>
          <span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>{x.ati}</span>
        </div>
      ))}
    </div>
  );
}

function DepremRiski() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">⚠️</span><span className="text-xs font-bold">Deprem Risk Profili</span></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3" style={{background:'hsl(222 47% 6%)'}}>
          <div className="text-xs font-bold text-white mb-2">İstanbul</div>
          <div className="text-2xl font-black font-mono" style={{color:'#ef4444'}}>7.0+</div>
          <div style={{fontSize:10}} className="text-gray-400">Beklenen Mw · Kuzey Anadolu Fayı</div>
          <div className="text-xs mt-2 space-y-1">
            <div className="text-gray-400">Riskli bina: <span className="text-white font-mono">~300K</span></div>
            <div className="text-gray-400">DASK zorunlu: <span className="text-green-400 font-mono">Evet</span></div>
            <div className="text-gray-400">Son büyük: <span className="font-mono">1999 (Mw 7.6)</span></div>
          </div>
        </div>
        <div className="rounded-xl p-3" style={{background:'hsl(222 47% 6%)'}}>
          <div className="text-xs font-bold text-white mb-2">Atina</div>
          <div className="text-2xl font-black font-mono" style={{color:'#f59e0b'}}>6.5+</div>
          <div style={{fontSize:10}} className="text-gray-400">Beklenen Mw · Ege-Parnitha Fayı</div>
          <div className="text-xs mt-2 space-y-1">
            <div className="text-gray-400">Riskli bina: <span className="text-white font-mono">~42K</span></div>
            <div className="text-gray-400">Zorunlu sigorta: <span className="text-yellow-400 font-mono">Kısmi</span></div>
            <div className="text-gray-400">Son büyük: <span className="font-mono">1999 (Mw 6.0)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeknoParkStartup() {
  const d = [
    {ad:'İTÜ Çekirdek',sehir:'İst',startup:800,odak:'DeepTech & AI',renk:'#3b82f6'},
    {ad:'Teknopark İstanbul',sehir:'İst',startup:350,odak:'Fintech & SaaS',renk:'#3b82f6'},
    {ad:'Kolektif House',sehir:'İst',startup:120,odak:'E-commerce',renk:'#3b82f6'},
    {ad:'Found.ation',sehir:'Ati',startup:85,odak:'Fintech & AI',renk:'#f59e0b'},
    {ad:'EIT Digital Athens',sehir:'Ati',startup:60,odak:'Digital Health',renk:'#f59e0b'},
    {ad:'Startup Greece',sehir:'Ati',startup:200,odak:'Tourism Tech',renk:'#f59e0b'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🚀</span><span className="text-xs font-bold">Teknopark & Startup Ekosistemi</span></div>
      {d.map(x=>(
        <div key={x.ad} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <div>
            <div className="text-xs font-bold text-white">{x.ad} <span style={{fontSize:8,color:x.renk}}>{x.sehir}</span></div>
            <div style={{fontSize:10}} className="text-gray-400">{x.odak}</div>
          </div>
          <div className="text-xs font-mono font-bold" style={{color:x.renk}}>{x.startup} startup</div>
        </div>
      ))}
    </div>
  );
}

function SaglikAltyapi() {
  const d = [
    {metrik:'Hastane Sayısı',ist:'582',ati:'94'},
    {metrik:'Doktor / 1000 Kişi',ist:'2.1',ati:'6.2'},
    {metrik:'Yatak / 1000 Kişi',ist:'2.7',ati:'4.2'},
    {metrik:'Sağlık Turizmi',ist:'1.2M hasta/yıl',ati:'120K hasta/yıl'},
    {metrik:'Ortalama Muayene',ist:'₺1,200',ati:'€50'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏥</span><span className="text-xs font-bold">Sağlık Altyapısı Karşılaştırması</span></div>
      {d.map(x=>(
        <div key={x.metrik} className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <span className="text-xs text-gray-400">{x.metrik}</span>
          <span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>{x.ist}</span>
          <span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>{x.ati}</span>
        </div>
      ))}
    </div>
  );
}

function AlisverisMerkezi() {
  const avmler = [
    {ad:'İstanbul Cevahir',sehir:'İst',magaza:343,alan:'180K m²'},
    {ad:'Zorlu Center',sehir:'İst',magaza:175,alan:'105K m²'},
    {ad:'İstinye Park',sehir:'İst',magaza:290,alan:'87K m²'},
    {ad:'Mall of İstanbul',sehir:'İst',magaza:350,alan:'156K m²'},
    {ad:'Golden Hall',sehir:'Ati',magaza:140,alan:'55K m²'},
    {ad:'The Mall Athens',sehir:'Ati',magaza:200,alan:'60K m²'},
    {ad:'McArthurGlen',sehir:'Ati',magaza:110,alan:'25K m²'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🛍️</span><span className="text-xs font-bold">Alışveriş Merkezleri</span></div>
      {avmler.map(a=>(
        <div key={a.ad} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <div>
            <div className="text-xs font-bold text-white">{a.ad} <span style={{fontSize:8,color:a.sehir==='İst'?'#3b82f6':'#f59e0b'}}>{a.sehir}</span></div>
            <div style={{fontSize:10}} className="text-gray-400">{a.magaza} mağaza · {a.alan}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SporKulupler() {
  const takimlar = [
    {takim:'Galatasaray',lig:'Süper Lig',sampiyon:24,stadyum:'Rams Park (52K)'},
    {takim:'Fenerbahçe',lig:'Süper Lig',sampiyon:19,stadyum:'Ülker (50K)'},
    {takim:'Beşiktaş',lig:'Süper Lig',sampiyon:16,stadyum:'Tüpraş (42K)'},
    {takim:'Olympiakos',lig:'Super League GR',sampiyon:47,stadyum:'G. Karaiskakis (33K)'},
    {takim:'Panathinaikos',lig:'Super League GR',sampiyon:20,stadyum:'OAKA (69K)'},
    {takim:'AEK Athens',lig:'Super League GR',sampiyon:12,stadyum:'OPAP Arena (30K)'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">⚽</span><span className="text-xs font-bold">Spor Kulüpleri & Stadyumlar</span></div>
      {takimlar.map(t=>(
        <div key={t.takim} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <div>
            <div className="text-xs font-bold text-white">{t.takim}</div>
            <div style={{fontSize:10}} className="text-gray-400">{t.lig} · {t.stadyum}</div>
          </div>
          <div className="text-xs font-mono font-bold" style={{color:'#f59e0b'}}>🏆 {t.sampiyon}x</div>
        </div>
      ))}
    </div>
  );
}

function DenizYollari() {
  const hatlar = [
    {hat:'Kadıköy-Eminönü',sure:'20 dk',fiyat:'₺18',sehir:'İst'},
    {hat:'Beşiktaş-Üsküdar',sure:'12 dk',fiyat:'₺18',sehir:'İst'},
    {hat:'Adalar Vapur',sure:'90 dk',fiyat:'₺36',sehir:'İst'},
    {hat:'Piraeus-Mykonos',sure:'5 sa',fiyat:'€45-80',sehir:'Ati'},
    {hat:'Piraeus-Santorini',sure:'7.5 sa',fiyat:'€55-95',sehir:'Ati'},
    {hat:'Rafina-Andros',sure:'2 sa',fiyat:'€18-30',sehir:'Ati'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">⛴️</span><span className="text-xs font-bold">Deniz Ulaşımı & Feribot Hatları</span></div>
      {hatlar.map(h=>(
        <div key={h.hat} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <div>
            <div className="text-xs font-bold text-white">{h.hat} <span style={{fontSize:8,color:h.sehir==='İst'?'#3b82f6':'#f59e0b'}}>{h.sehir}</span></div>
            <div style={{fontSize:10}} className="text-gray-400">{h.sure}</div>
          </div>
          <span className="text-xs font-mono font-bold text-white">{h.fiyat}</span>
        </div>
      ))}
    </div>
  );
}

function EnerjiAltyapi() {
  const d = [
    {metrik:'Elektrik Tüketimi',ist:'52 TWh/yıl',ati:'12 TWh/yıl'},
    {metrik:'Doğalgaz Kullanımı',ist:'12.5 BCM/yıl',ati:'2.1 BCM/yıl'},
    {metrik:'Yenilenebilir Enerji',ist:'%8 güneş+rüzgar',ati:'%22 güneş+rüzgar'},
    {metrik:'Konut Elektrik Fiyatı',ist:'₺4.2/kWh ($0.12)',ati:'€0.22/kWh'},
    {metrik:'Doğalgaz Fiyatı',ist:'₺8.5/m³',ati:'€0.09/kWh'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">⚡</span><span className="text-xs font-bold">Enerji & Altyapı Karşılaştırması</span></div>
      {d.map(x=>(
        <div key={x.metrik} className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <span className="text-xs text-gray-400">{x.metrik}</span>
          <span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>{x.ist}</span>
          <span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>{x.ati}</span>
        </div>
      ))}
    </div>
  );
}

function SuKullanimVeAtik() {
  const d = [
    {metrik:'Günlük Su Tüketimi',ist:'2.8M m³',ati:'0.9M m³'},
    {metrik:'Atık Su Arıtma',ist:'%92',ati:'%88'},
    {metrik:'Geri Dönüşüm Oranı',ist:'%12',ati:'%18'},
    {metrik:'Çöp Üretimi (Günlük)',ist:'18K ton',ati:'4.5K ton'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">💧</span><span className="text-xs font-bold">Su & Atık Yönetimi</span></div>
      {d.map(x=>(
        <div key={x.metrik} className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <span className="text-xs text-gray-400">{x.metrik}</span>
          <span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>{x.ist}</span>
          <span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>{x.ati}</span>
        </div>
      ))}
    </div>
  );
}

function VergiKarsilastirma() {
  const d = [
    {vergi:'Gelir Vergisi (Maks)',tr:'%40',gr:'%44'},
    {vergi:'KDV Standart',tr:'%20',gr:'%24'},
    {vergi:'Kurumlar Vergisi',tr:'%25',gr:'%22'},
    {vergi:'Emlak Vergisi (Yıllık)',tr:'%0.1-0.6',gr:'ENFIA €200-3K'},
    {vergi:'Tapu Harcı',tr:'%4',gr:'%3.09'},
    {vergi:'Temettü Vergisi',tr:'%10',gr:'%5'},
    {vergi:'Sermaye Kazancı',tr:'%0 (2 yıl+)',gr:'%15'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">📋</span><span className="text-xs font-bold">Vergi Rejimi Karşılaştırması</span></div>
      <div className="grid grid-cols-3 gap-1 text-xs text-gray-500 px-1" style={{fontSize:10}}>
        <span>Vergi Türü</span><span className="text-center">🇹🇷 Türkiye</span><span className="text-center">🇬🇷 Yunanistan</span>
      </div>
      {d.map(x=>(
        <div key={x.vergi} className="grid grid-cols-3 gap-1 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <span className="text-xs text-gray-400">{x.vergi}</span>
          <span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>{x.tr}</span>
          <span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>{x.gr}</span>
        </div>
      ))}
    </div>
  );
}

function GayrimenkulHukuk() {
  const d = [
    {konu:'Yabancı Mülk Hakkı',tr:'183 ülke ile karşılıklılık',gr:'AB + 3. ülke serbest'},
    {konu:'Tapu Süresi',tr:'7-15 gün',gr:'10-30 gün'},
    {konu:'Golden Visa Eşiği',tr:'$400K (vatandaşlık)',gr:'€250K-500K (oturum)'},
    {konu:'Kiracı Koruma',tr:'5 yıl + enflasyon sınırı',gr:'3 yıl minimum'},
    {konu:'Vergi Muafiyeti',tr:'2 yıl satış kazancı',gr:'Yok (satışta %15)'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">⚖️</span><span className="text-xs font-bold">Gayrimenkul Hukuku & Düzenlemeler</span></div>
      {d.map(x=>(
        <div key={x.konu} className="rounded-lg px-2 py-2" style={{background:'hsl(222 47% 6%)'}}>
          <div className="text-xs font-bold text-white mb-1">{x.konu}</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-xs"><span style={{color:'#3b82f6'}}>🇹🇷</span> <span className="text-gray-400">{x.tr}</span></div>
            <div className="text-xs"><span style={{color:'#f59e0b'}}>🇬🇷</span> <span className="text-gray-400">{x.gr}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function KurDovizRezerv() {
  const d = [
    {metrik:'Merkez Bankası Faizi',tr:'%42.5 (TCMB)',gr:'%4.5 (ECB)'},
    {metrik:'Döviz Rezervi',tr:'$98.2B',gr:'€8.4B (BoG)'},
    {metrik:'Cari Açık/GSYH',tr:'%-3.6',gr:'%-6.2'},
    {metrik:'Dış Borç/GSYH',tr:'%42',gr:'%172'},
    {metrik:'CDS 5Y',tr:'268 bps',gr:'118 bps'},
    {metrik:'Kredi Notu',tr:'B+ (Fitch)',gr:'BBB- (Fitch)'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏦</span><span className="text-xs font-bold">Merkez Bankası & Makro Göstergeler</span></div>
      {d.map(x=>(
        <div key={x.metrik} className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <span className="text-xs text-gray-400">{x.metrik}</span>
          <span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>{x.tr}</span>
          <span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>{x.gr}</span>
        </div>
      ))}
    </div>
  );
}

function IstihdamSektoru() {
  const d = [
    {sektor:'Hizmet',ist:'68%',ati:'78%'},
    {sektor:'Sanayi',ist:'24%',ati:'12%'},
    {sektor:'Tarım',ist:'1%',ati:'2%'},
    {sektor:'İnşaat',ist:'7%',ati:'5%'},
    {sektor:'Teknoloji',ist:'4.2%',ati:'3.8%'},
    {sektor:'İşsizlik',ist:'12.4%',ati:'10.2%'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">💼</span><span className="text-xs font-bold">İstihdam & Sektörel Dağılım</span></div>
      {d.map(x=>(
        <div key={x.sektor} className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <span className="text-xs text-gray-400">{x.sektor}</span>
          <span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>{x.ist}</span>
          <span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>{x.ati}</span>
        </div>
      ))}
    </div>
  );
}

function OtelKonaklama() {
  const d = [
    {tip:'5 Yıldız Ort.',ist:'₺8,500/gece ($235)',ati:'€220/gece'},
    {tip:'4 Yıldız Ort.',ist:'₺3,800/gece ($105)',ati:'€120/gece'},
    {tip:'Airbnb Merkez',ist:'₺2,200/gece ($60)',ati:'€85/gece'},
    {tip:'Doluluk Oranı',ist:'%72',ati:'%68'},
    {tip:'Toplam Yatak',ist:'185K',ati:'72K'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏨</span><span className="text-xs font-bold">Otel & Konaklama Fiyatları</span></div>
      {d.map(x=>(
        <div key={x.tip} className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <span className="text-xs text-gray-400">{x.tip}</span>
          <span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>{x.ist}</span>
          <span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>{x.ati}</span>
        </div>
      ))}
    </div>
  );
}

function EgitimSistem() {
  const d = [
    {metrik:'Öğrenci Sayısı',ist:'4.2M',ati:'720K'},
    {metrik:'Üniversite Sayısı',ist:'57',ati:'24'},
    {metrik:'Uluslararası Okul',ist:'42',ati:'28'},
    {metrik:'Ort. Üniversite Ücreti',ist:'₺15K-250K/yıl',ati:'€0-5K/yıl (devlet ücretsiz)'},
    {metrik:'PISA Puanı (2024)',ist:'476',ati:'459'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">📚</span><span className="text-xs font-bold">Eğitim Sistemi Karşılaştırması</span></div>
      {d.map(x=>(
        <div key={x.metrik} className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <span className="text-xs text-gray-400">{x.metrik}</span>
          <span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>{x.ist}</span>
          <span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>{x.ati}</span>
        </div>
      ))}
    </div>
  );
}

function KulturSanat() {
  const d = [
    {metrik:'Müze Sayısı',ist:'80+',ati:'60+'},
    {metrik:'Tiyatro & Opera',ist:'120+',ati:'50+'},
    {metrik:'Yıllık Festival',ist:'45+',ati:'30+'},
    {metrik:'UNESCO Miras',ist:'Tarihi Yarımada',ati:'Akropolis & çevresi'},
    {metrik:'Sinema Sektörü',ist:'~150 film/yıl',ati:'~40 film/yıl'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🎭</span><span className="text-xs font-bold">Kültür & Sanat Hayatı</span></div>
      {d.map(x=>(
        <div key={x.metrik} className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <span className="text-xs text-gray-400">{x.metrik}</span>
          <span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>{x.ist}</span>
          <span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>{x.ati}</span>
        </div>
      ))}
    </div>
  );
}

function InternetHiz() {
  const d = [
    {metrik:'Ort. İndirme (Sabit)',ist:'52 Mbps',ati:'78 Mbps'},
    {metrik:'Ort. İndirme (Mobil)',ist:'38 Mbps',ati:'45 Mbps'},
    {metrik:'5G Kapsama',ist:'%35 (İstanbul merkez)',ati:'%28 (Atina merkez)'},
    {metrik:'Fiber Penetrasyon',ist:'%42',ati:'%65'},
    {metrik:'Aylık İnternet (100Mbps)',ist:'₺350 ($10)',ati:'€30'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">📶</span><span className="text-xs font-bold">İnternet & Dijital Altyapı</span></div>
      {d.map(x=>(
        <div key={x.metrik} className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
          <span className="text-xs text-gray-400">{x.metrik}</span>
          <span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>{x.ist}</span>
          <span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>{x.ati}</span>
        </div>
      ))}
    </div>
  );
}

function YesilAlanPark() {
  const d = [
    {ad:'Belgrad Ormanı',sehir:'İst',alan:'5,500 ha',tip:'Orman'},
    {ad:'Emirgan Korusu',sehir:'İst',alan:'47 ha',tip:'Park'},
    {ad:'Atatürk Arboretumu',sehir:'İst',alan:'296 ha',tip:'Botanik'},
    {ad:'Maçka Parkı',sehir:'İst',alan:'10 ha',tip:'Şehir Parkı'},
    {ad:'Ulusal Bahçe',sehir:'Ati',alan:'15.5 ha',tip:'Park'},
    {ad:'Stavros Niarchos',sehir:'Ati',alan:'21 ha',tip:'Kültür Parkı'},
    {ad:'Filopappou',sehir:'Ati',alan:'18 ha',tip:'Arkeolojik'},
    {ad:'Pedion tou Areos',sehir:'Ati',alan:'28 ha',tip:'Şehir Parkı'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🌳</span><span className="text-xs font-bold">Yeşil Alan & Parklar</span></div>
      <div className="grid grid-cols-2 gap-1">
        {d.map(p=>(
          <div key={p.ad} className="rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
            <div className="text-xs font-bold text-white">{p.ad} <span style={{fontSize:8,color:p.sehir==='İst'?'#3b82f6':'#f59e0b'}}>{p.sehir}</span></div>
            <div style={{fontSize:10}} className="text-gray-400">{p.alan} · {p.tip}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [priceIndex, setPriceIndex] = useState<ReturnType<typeof generatePriceTrendIndex>|null>(null);
  const [liveSentiment, setLiveSentiment] = useState<{value:number;label:string}|null>(null);
  const [liveMacro, setLiveMacro] = useState<any>(null);
  const [arimaForecast, setArimaForecast] = useState<number[]>([]);
  const [anomalies, setAnomalies] = useState<boolean[]>([]);
  const [agentStates, setAgentStates] = useState<Record<string, typeof STATES[number]>>({});
  const [messageLog, setMessageLog] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const idx = generatePriceTrendIndex(36); setPriceIndex(idx);
    const model = new ARIMA(2,1,2).fit(idx.istanbul);
    const { predictions } = model.forecast(12); setArimaForecast(predictions);
    const { isAnomaly } = IsolationForest.fitSeries(idx.istanbul, 4); setAnomalies(isAnomaly);
    // Canlı makro + sentiment
    fetch(`/api/macro?_=${Date.now()}`, { cache:'no-store' }).then(r=>r.ok?r.json():null).catch(()=>null).then(d=>d&&setLiveMacro(d));
    fetch(`/api/sentiment?_=${Date.now()}`, { cache:'no-store' }).then(r=>r.ok?r.json():null).catch(()=>null).then(d=>d&&setLiveSentiment(d));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newStates: Record<string,typeof STATES[number]> = {};
      for (const p of AGENT_PROFILES) {
        const rand = Math.random();
        newStates[p.id] = rand<.3?'executing':rand<.5?'deliberating':rand<.7?'perceiving':rand<.85?'communicating':'idle';
      }
      setAgentStates(newStates);
      const msgs = [
        'market → financial: ARIMA forecast parçaları iletildi',
        'financial → property: Risk parametreleri güncellendi',
        'property → orchestrator: 3 anomali raporu gönderildi',
        'wellness → orchestrator: Optimum zamanlama hesaplandı',
        'marketing → financial: ROAS entegrasyonu senkronize',
        `orchestrator → broadcast: Sistem sağlığı %${Math.floor(93+Math.random()*7)}`,
      ];
      setMessageLog(prev => [msgs[Math.floor(Math.random()*msgs.length)], ...prev].slice(0,8));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    const layers = [5,8,5,5];
    const nodes: { x:number; y:number; layer:number }[] = [];
    for (let l=0; l<layers.length; l++) {
      const x = (l+.5)*(W/layers.length);
      for (let n=0; n<layers[l]; n++) { const y = ((n+.5)/layers[l])*H; nodes.push({x,y,layer:l}); }
    }
    let phase = 0;
    function draw() {
      ctx!.clearRect(0,0,W,H); phase += .02;
      for (const from of nodes) for (const to of nodes) {
        if (to.layer !== from.layer+1) continue;
        const a = Math.sin(phase+from.x*.01+from.y*.01)*.5+.5;
        ctx!.beginPath(); ctx!.moveTo(from.x,from.y); ctx!.lineTo(to.x,to.y);
        ctx!.strokeStyle = `hsla(199,95%,55%,${a*.15})`; ctx!.lineWidth = a*.8; ctx!.stroke();
      }
      for (const node of nodes) {
        const a = Math.sin(phase+node.x*.015+node.y*.01)*.5+.5;
        const colors = ['199,95%,55%','158,64%,52%','271,91%,65%','38,92%,50%'];
        const color = colors[node.layer%colors.length];
        ctx!.beginPath(); ctx!.arc(node.x,node.y,3+a*2,0,Math.PI*2);
        ctx!.fillStyle = `hsl(${color})`; ctx!.globalAlpha = .4+a*.6; ctx!.fill();
        ctx!.globalAlpha = 1;
      }
      animFrameRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const stateColor = (s: string) => s==='executing'?'#10b981':s==='deliberating'?'#8b5cf6':s==='perceiving'?'#00d4ff':s==='communicating'?'#f59e0b':'#4b5563';
  const stateLabel = (s: string) => s==='executing'?'Yürütüyor':s==='deliberating'?'Düşünüyor':s==='perceiving'?'Algılıyor':s==='communicating'?'İletişim':'Bekleniyor';

  const sentimentValue = liveSentiment?.value ?? 50;
  const sentimentLbl = liveSentiment ? liveSentiment.label : 'Nötr';
  const macro = liveMacro ?? getMacroIndicators();
  const currentSentiment = sentimentValue;

  return (
    <div className="p-4 space-y-4 max-w-screen-2xl mx-auto">

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'İst. Konut Endeksi', value:`${priceIndex?.istanbul.slice(-1)[0]?.toFixed(1)?? '—'}`, sub:'ARIMA tahmin: '+(arimaForecast.slice(-1)[0]?.toFixed(1)??'—'), icon:Building2, color:'#00d4ff', change:'+28.3%' },
          { label:'Kripto Sentiment', value:`${sentimentValue}`, sub:sentimentLbl+(liveSentiment?' · Canlı':''), icon:Brain, color:'#10b981', change:sentimentValue>60?'↑ Açgözlü':sentimentValue>40?'→ Nötr':'↓ Korku' },
          { label:'Portföy VaR (95%)', value:'₺180K', sub:'Monte Carlo 5.000 sim', icon:Shield, color:'#8b5cf6', change:'-2.1%' },
          { label:'Aktif Anomali', value:`${anomalies.filter(Boolean).length}`, sub:'Isolation Forest tespiti', icon:AlertTriangle, color:'#f59e0b', change:anomalies.filter(Boolean).length>3?'Yüksek':'Normal' },
        ].map(k => (
          <div key={k.label} className="metric-card card-hover">
            <div className="flex items-start justify-between mb-2">
              <div className="p-1.5 rounded-lg" style={{ background:`${k.color}15` }}>
                <k.icon className="w-4 h-4" style={{ color:k.color }} />
              </div>
              <span className="text-xs font-mono" style={{ color:k.color }}>{k.change}</span>
            </div>
            <div className="text-xl font-bold font-mono tabular-nums">{k.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{k.label}</div>
            <div className="text-xs font-mono mt-1" style={{ color:k.color, fontSize:'10px', opacity:.7 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-5 metric-card" style={{ minHeight:260 }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold">Konut Fiyat Endeksi</div>
              <div className="text-xs text-muted-foreground">3 yıl · ARIMA forecast dahil</div>
            </div>
            <div className="flex gap-2 text-xs font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-cyan-400 inline-block" /> İstanbul</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-400 inline-block" /> Atina</span>
            </div>
          </div>
          {priceIndex && <MiniLineChart series={[{data:priceIndex.istanbul,color:'hsl(199 95% 55%)',label:'İstanbul'},{data:priceIndex.athens,color:'hsl(158 64% 52%)',label:'Atina'}]} forecast={arimaForecast} anomalies={anomalies} height={180} />}
        </div>
        <div className="col-span-12 md:col-span-3 metric-card flex flex-col">
          <div className="text-sm font-semibold mb-1">MLP Sinir Ağı</div>
          <div className="text-xs text-muted-foreground mb-2">Gerçek zamanlı aktivasyon · 5→8→5→5</div>
          <canvas ref={canvasRef} className="flex-1 rounded-lg" style={{ background:'hsl(222 47% 4%)', minHeight:180 }} />
        </div>
        <div className="col-span-12 md:col-span-4 metric-card">
          <div className="text-sm font-semibold mb-3">Makroekonomik Göstergeler</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:'TCMB Faiz', value:`%${macro.turkey.policyRate}`, flag:'🇹🇷', ok:false },
              { label:'TRY Enflasyon', value:`%${macro.turkey.inflation.toFixed(1)}`, flag:'🇹🇷', ok:false },
              { label:'TR GSYİH', value:`+%${macro.turkey.gdpGrowth.toFixed(1)}`, flag:'🇹🇷', ok:true },
              { label:'İşsizlik', value:`%${macro.turkey.unemployment.toFixed(1)}`, flag:'🇹🇷', ok:null },
              { label:'ECB Faiz', value:`%${macro.greece.policyRate}`, flag:'🇬🇷', ok:null },
              { label:'GR GSYİH', value:`+%${macro.greece.gdpGrowth.toFixed(1)}`, flag:'🇬🇷', ok:true },
              { label:'ATH Enflasyon', value:`%${macro.greece.inflation.toFixed(1)}`, flag:'🇬🇷', ok:true },
              { label:'Turist/Yıl', value:`${macro.greece.touristArrivals}M`, flag:'🇬🇷', ok:true },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between p-2 rounded-lg" style={{ background:'hsl(222 47% 5%)' }}>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{m.flag}</span><span>{m.label}</span>
                </div>
                <span className="text-xs font-mono font-semibold" style={{ color:m.ok===true?'hsl(158 64% 52%)':m.ok===false?'hsl(0 84% 60%)':'hsl(var(--foreground))' }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agents */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {AGENT_PROFILES.map(agent => {
          const state = agentStates[agent.id] ?? 'idle';
          const Icon = agent.icon;
          return (
            <div key={agent.id} className="metric-card agent-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg" style={{ background:`${agent.color}15` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color:agent.color }} />
                  </div>
                  <span className="text-xs font-semibold truncate">{agent.name}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background:stateColor(state) }} />
              </div>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background:`${stateColor(state)}15`, color:stateColor(state), fontSize:'10px' }}>
                {stateLabel(state)}
              </span>
              <div className="space-y-1">
                {agent.insights.slice(0,2).map((ins,i) => (
                  <div key={i} className="text-xs text-muted-foreground leading-tight" style={{ fontSize:'10px', opacity:i===0?.9:.6 }}>• {ins}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Message log */}
      <div className="metric-card">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold">Ajan Mesaj Kanalı</span>
          <span className="text-xs text-muted-foreground ml-auto font-mono">Contract Net Protocol</span>
        </div>
        <div className="space-y-1">
          {messageLog.map((msg,i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-mono" style={{ opacity:1-i*.12, fontSize:'10px' }}>
              <span className="text-cyan-400">›</span>
              <span className="text-muted-foreground">{new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
              <span>{msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── YENİ MODÜLLER ─────────────────────────────────────────── */}
      <EmtiaModulu />
      <KriptoPiyasaOzeti />
      <PiyasaSaatleri />
      <GetiriKarsilastirma />
      <HizliBilgi macro={liveMacro} />
      <IstanbulKonut />
      <AtinaKonut />
      <EkonomikTakvim />
      <AthexBorsa />
      <AtinaKiraPiyasasi />
      <AltinaVize />
      <YunanistanTurizm />
      <TrGrKarsilastirma />
      <EnflasyonKarsilastirma />
      <KamuMaliyesi />
      <UcretYasam />
      <DisTicaret />
      <KapsamliEkonomik />
      <FaizTarihi />
      <YatirimSenaryosu />
      <BorsaPerformans />
      <BankacilikSektoru />
      <RiskYatirim />

      {/* ── 30 YENİ İSTANBUL & ATİNA MODÜLLERİ ─── */}
      <NufusDemografi />
      <UlasimMetro />
      <HavaKalitesi />
      <UniversiteSiralamasi />
      <GayrimenkulM2 />
      <IklimKarsilastirma />
      <TurizmGeliri />
      <HavalimanTraffik />
      <BogazKopru />
      <TarihiYerler />
      <YemekKulturu />
      <GocVeExpat />
      <InsaatSektoru />
      <DepremRiski />
      <TeknoParkStartup />
      <SaglikAltyapi />
      <AlisverisMerkezi />
      <SporKulupler />
      <DenizYollari />
      <EnerjiAltyapi />
      <SuKullanimVeAtik />
      <VergiKarsilastirma />
      <GayrimenkulHukuk />
      <KurDovizRezerv />
      <IstihdamSektoru />
      <OtelKonaklama />
      <EgitimSistem />
      <KulturSanat />
      <InternetHiz />
      <YesilAlanPark />

    </div>
  );
}

// ─── Inline Chart ─────────────────────────────────────────────────
function MiniLineChart({ series, forecast, anomalies, height }: {
  series: { data:number[]; color:string; label:string }[];
  forecast?: number[]; anomalies?: boolean[]; height: number;
}) {
  const allValues = series.flatMap(s => s.data);
  const min = Math.min(...allValues)*.97, max = Math.max(...allValues)*1.03;
  const n = series[0]?.data.length ?? 0;
  const toX = (i:number,total:number,w:number) => (i/(total-1))*w;
  const toY = (v:number,h:number) => h-((v-min)/(max-min))*h;
  const W=100, H=height;
  const buildPath = (data:number[], w=W, h=H) => data.map((v,i)=>`${i===0?'M':'L'}${toX(i,data.length,w).toFixed(2)},${toY(v,h).toFixed(2)}`).join(' ');
  const forecastOffset = n, totalPoints = n+(forecast?.length??0);
  const forecastPath = forecast ? [series[0].data.slice(-1)[0],...forecast].map((v,i)=>`${i===0?'M':'L'}${toX(forecastOffset+i-1,totalPoints,W).toFixed(2)},${toY(v,H).toFixed(2)}`).join(' ') : '';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height, display:'block' }} preserveAspectRatio="none">
      {series.map(s => {
        const path = buildPath(s.data, W*(n/totalPoints), H);
        return (
          <g key={s.label}>
            <path d={`${path} L${toX(s.data.length-1,totalPoints,W*(n/totalPoints)).toFixed(2)},${H} L0,${H} Z`} fill={s.color} opacity="0.06" />
            <path d={path} fill="none" stroke={s.color} strokeWidth="0.5" />
          </g>
        );
      })}
      {forecast && <path d={forecastPath} fill="none" stroke="hsl(199 95% 55%)" strokeWidth="0.5" strokeDasharray="1,1" opacity="0.7" />}
      {anomalies && series[0]?.data.map((v,i) => anomalies[i] && (
        <circle key={i} cx={toX(i,totalPoints,W*(n/totalPoints))} cy={toY(v,H)} r="1.5" fill="hsl(38 92% 50%)" opacity="0.9" />
      ))}
    </svg>
  );
}
