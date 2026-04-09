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
function AthexBorsa() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`/api/greece/stocks?_=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); });
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
