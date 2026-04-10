import { useState, useEffect } from 'react';
import { fetchNewsByCategory, NewsItem } from '@/lib/data/liveData';
import { SUPPLEMENT_DATABASE, pkModel, computeInteractionMatrix, generateFitnessData } from '@/lib/data/wellnessData';
import { Heart, Clock, AlertTriangle, CheckCircle2, TrendingUp , RefreshCw } from 'lucide-react';
import { API_BASE } from '../lib/apiBase';

export default function WellnessPage() {
  const [selected, setSelected] = useState<number[]>([0, 1, 2, 3, 4]);
  const [pkData, setPkData] = useState<number[][]>([]);
  const [interactions, setInteractions] = useState<ReturnType<typeof computeInteractionMatrix> | null>(null);
  const [fitness, setFitness] = useState(generateFitnessData(16));
  const [timeLabels, setTimeLabels] = useState<string[]>([]);

  useEffect(() => {
    const labels: string[] = [];
    for (let h = 0; h <= 24; h += 0.25) {
      if (h % 1 === 0) labels.push(`${String(Math.floor(h)).padStart(2, '0')}:00`);
      else labels.push('');
    }
    setTimeLabels(labels);

    computeModels(selected);
  }, []);

  function computeModels(sel: number[]) {
    const supps = sel.map(i => SUPPLEMENT_DATABASE[i]);
    const pk = supps.map(s => pkModel(s.dose, s.bioavailability, s.halfLife, s.tMax, 24));
    setPkData(pk);

    const inter = computeInteractionMatrix(supps);
    setInteractions(inter);
  }

  const toggleSupplement = (idx: number) => {
    const newSel = selected.includes(idx)
      ? selected.filter(i => i !== idx)
      : [...selected, idx];
    setSelected(newSel);
    computeModels(newSel);
  };

  const COLORS = ['#00d4ff', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

  const timeHours = Array.from({ length: 24 * 4 + 1 }, (_, i) => i / 4);

  const optimalTiming = selected.map(i => {
    const s = SUPPLEMENT_DATABASE[i];
    const timing = {
      morning: 7, 'pre-workout': 7.5, 'post-workout': 9, 'with-food': 8, evening: 22
    };
    return { name: s.name, time: timing[s.timing] ?? 8, timing: s.timing };
  }).sort((a, b) => a.time - b.time);

  return (
    <div className="p-4 space-y-4 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-12 gap-4">
        {/* Supplement selector */}
        <div className="col-span-3 metric-card space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <div className="text-sm font-semibold">Supplement Seçimi</div>
          </div>
          <div className="text-xs text-muted-foreground mb-3">Farmakokiuetik (1-kompartman) modelleme</div>
          {SUPPLEMENT_DATABASE.map((s, i) => (
            <div key={s.name}
              onClick={() => toggleSupplement(i)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all ${selected.includes(i) ? 'border-rose-400/50' : 'border-border hover:border-muted-foreground'}`}
              style={selected.includes(i) ? { background: `${COLORS[selected.indexOf(i) % COLORS.length]}10` } : { background: 'hsl(222 47% 5%)' }}
              data-testid={`supp-${s.name}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selected.includes(i) && (
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[selected.indexOf(i) % COLORS.length] }} />
                  )}
                  <span className="text-xs font-semibold text-foreground">{s.name}</span>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{
                  background: s.evidence === 'strong' ? 'hsl(158 64% 42% / 0.2)' : s.evidence === 'moderate' ? 'hsl(38 92% 50% / 0.2)' : 'hsl(217 33% 30%)',
                  color: s.evidence === 'strong' ? '#10b981' : s.evidence === 'moderate' ? '#f59e0b' : '#94a3b8',
                  fontSize: '9px',
                }}>
                  {s.evidence === 'strong' ? 'Güçlü' : s.evidence === 'moderate' ? 'Orta' : 'Sınırlı'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1" style={{ fontSize: '10px' }}>
                {s.category} · {s.dose}mg · t½={s.halfLife}h
              </div>
            </div>
          ))}
        </div>

        {/* PK Chart */}
        <div className="col-span-6 space-y-3">
          <div className="metric-card">
            <div className="text-sm font-semibold mb-1">Plazma Konsantrasyon Profili</div>
            <div className="text-xs text-muted-foreground mb-3">
              1-kompartman PK modeli · Emilim + eliminasyon kinetiği · 24 saat
            </div>
            <PKChart pkData={pkData} selected={selected} colors={COLORS} height={180} />
            <div className="flex flex-wrap gap-2 mt-2">
              {selected.map((si, ci) => (
                <div key={SUPPLEMENT_DATABASE[si].name} className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-0.5 rounded" style={{ background: COLORS[ci % COLORS.length] }} />
                  <span className="text-muted-foreground">{SUPPLEMENT_DATABASE[si].name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timing schedule */}
          <div className="metric-card">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <div className="text-sm font-semibold">Optimal Alım Takvimi</div>
            </div>
            <div className="relative h-12 bg-muted/30 rounded-lg overflow-hidden">
              {/* Hour markers */}
              {[6, 9, 12, 15, 18, 21, 24].map(h => (
                <div key={h} className="absolute top-0 bottom-0 border-l border-border/50"
                  style={{ left: `${(h / 24) * 100}%` }}>
                  <span className="absolute -top-1 text-xs text-muted-foreground" style={{ fontSize: '9px', transform: 'translateX(-50%)' }}>
                    {h}:00
                  </span>
                </div>
              ))}
              {/* Supplement markers */}
              {optimalTiming.map((s, i) => (
                <div key={s.name} className="absolute top-2 bottom-2 px-1 rounded text-xs flex items-center font-semibold"
                  style={{
                    left: `${(s.time / 24) * 100}%`,
                    transform: 'translateX(-50%)',
                    background: `${COLORS[i % COLORS.length]}20`,
                    border: `1px solid ${COLORS[i % COLORS.length]}50`,
                    color: COLORS[i % COLORS.length],
                    fontSize: '9px',
                    whiteSpace: 'nowrap',
                  }}>
                  {s.name.split(' ')[0]}
                </div>
              ))}
            </div>
          </div>

          {/* Fitness trends */}
          <div className="metric-card">
            <div className="text-sm font-semibold mb-3">Fitness Metrikleri (16 Hafta)</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Güç Endeksi', data: fitness.strength, color: '#00d4ff', current: fitness.strength.slice(-1)[0], unit: '' },
                { label: 'Vücut Ağırlığı', data: fitness.bodyWeight, color: '#f59e0b', current: fitness.bodyWeight.slice(-1)[0], unit: 'kg' },
                { label: 'Yağ Oranı', data: fitness.bodyFat, color: '#ef4444', current: fitness.bodyFat.slice(-1)[0], unit: '%' },
                { label: 'VO₂ Max', data: fitness.vo2max, color: '#10b981', current: fitness.vo2max.slice(-1)[0], unit: '' },
              ].map(m => (
                <div key={m.label} className="p-2 rounded-lg" style={{ background: 'hsl(222 47% 5%)' }}>
                  <div className="text-xs text-muted-foreground">{m.label}</div>
                  <div className="text-sm font-bold font-mono mt-0.5" style={{ color: m.color }}>
                    {m.current}{m.unit}
                  </div>
                  <MiniSparkline data={m.data} color={m.color} height={30} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactions */}
        <div className="col-span-3 metric-card space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <div className="text-sm font-semibold">Etkileşim Analizi</div>
          </div>
          <div className="text-xs text-muted-foreground">Seçili supplementlerin ilaç etkileşim matrisi</div>

          {interactions?.warnings.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'hsl(158 64% 42% / 0.1)', border: '1px solid hsl(158 64% 42% / 0.3)' }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400">Bilinen etkileşim yok</span>
            </div>
          ) : (
            <div className="space-y-2">
              {interactions?.warnings.map((w, i) => (
                <div key={i} className="p-2.5 rounded-lg border" style={{
                  background: w.severity === 'high' ? 'hsl(0 84% 60% / 0.08)' : w.severity === 'medium' ? 'hsl(38 92% 50% / 0.08)' : 'hsl(158 64% 42% / 0.08)',
                  borderColor: w.severity === 'high' ? 'hsl(0 84% 60% / 0.3)' : w.severity === 'medium' ? 'hsl(38 92% 50% / 0.3)' : 'hsl(158 64% 42% / 0.3)',
                }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-semibold" style={{
                      color: w.severity === 'high' ? '#ef4444' : w.severity === 'medium' ? '#f59e0b' : '#10b981'
                    }}>
                      {w.severity === 'high' ? '⚠ Yüksek' : w.severity === 'medium' ? '• Orta' : '○ Düşük'}
                    </div>
                  </div>
                  <div className="text-xs text-foreground">{w.a} ↔ {w.b}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{w.note}</div>
                </div>
              ))}
            </div>
          )}

          {/* Evidence summary */}
          <div className="border-t border-border pt-3 space-y-2">
            <div className="text-xs font-semibold text-foreground">Kanıt Özeti</div>
            {selected.map(i => {
              const s = SUPPLEMENT_DATABASE[i];
              return (
                <div key={s.name} className="text-xs space-y-0.5">
                  <div className="font-semibold text-foreground">{s.name}</div>
                  <div className="text-muted-foreground" style={{ fontSize: '10px' }}>{s.mechanism}</div>
                </div>
              );
            }).slice(0, 3)}
          </div>
        </div>
      </div>

      {/* Sağlık Haberleri — büyük kartlar */}
      <HealthNewsCards />
    </div>
  );
}

function PKChart({ pkData, selected, colors, height }: { pkData: number[][]; selected: number[]; colors: string[]; height: number }) {
  if (pkData.length === 0) return null;
  const all = pkData.flat();
  const max = Math.max(...all, 1);
  const len = pkData[0]?.length ?? 1;
  const toX = (i: number) => (i / (len - 1)) * 100;
  const toY = (v: number) => height - (v / max) * height * 0.9;

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height, display: 'block' }} preserveAspectRatio="none">
      {pkData.map((series, si) => {
        const path = series.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
        const color = colors[si % colors.length];
        return (
          <g key={si}>
            <path d={`${path} L${toX(series.length - 1)},${height} L0,${height} Z`} fill={color} opacity="0.05" />
            <path d={path} fill="none" stroke={color} strokeWidth="0.6" opacity="0.9" />
          </g>
        );
      })}
      {/* Morning/evening markers */}
      {[7, 8, 9, 12, 17, 22].map(h => (
        <line key={h} x1={toX(h * 4)} y1="0" x2={toX(h * 4)} y2={height}
          stroke="hsl(217 33% 25%)" strokeWidth="0.3" strokeDasharray="1,2" />
      ))}
    </svg>
  );
}

function MiniSparkline({ data, color, height }: { data: number[]; color: string; height: number }) {
  const min = Math.min(...data), max = Math.max(...data);
  const n = data.length;
  const toX = (i: number) => (i / (n - 1)) * 100;
  const toY = (v: number) => height - ((v - min) / (max - min + 0.01)) * height;
  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height, display: 'block', marginTop: 4 }} preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth="1" />
    </svg>
  );
}

/* ── Sağlık Haberleri Büyük Kartlar ─────────────────────────────── */
function HealthCard({ item, i }: { item: NewsItem; i: number }) {
  const [show, setShow] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const delay = Math.min(i * 40, 400);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const imgSrc = item.image || (() => {
    const kw = ['health,wellness,nature','fitness,yoga,sport','food,nutrition,fruit','medical,science,lab','ocean,calm,blue'];
    const h = item.id.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
    return `https://loremflickr.com/800/500/${kw[h%kw.length]}?lock=${h%500}`;
  })();

  const ago = (iso: string) => {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s}sn`;
    if (s < 3600) return `${Math.floor(s/60)}dk`;
    if (s < 86400) return `${Math.floor(s/3600)}sa`;
    return `${Math.floor(s/86400)}g`;
  };

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block', position: 'relative', height: 240,
        borderRadius: 14, overflow: 'hidden',
        border: '1px solid rgba(16,185,129,.18)',
        textDecoration: 'none', flexShrink: 0,
        opacity: show ? 1 : 0,
        transform: show ? 'none' : 'translateY(12px)',
        transition: `opacity .3s ease ${delay}ms, transform .3s ease ${delay}ms`,
      }}
    >
      {!imgErr
        ? <img src={imgSrc} alt="" onError={() => setImgErr(true)}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
        : <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(16,185,129,.1),#05090f)' }} />
      }
      <div style={{ position:'absolute', inset:0,
        background:'linear-gradient(to top, rgba(3,8,20,.97) 0%, rgba(3,8,20,.8) 28%, rgba(3,8,20,.04) 58%, transparent 72%)' }} />
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
        background:'linear-gradient(to right,#10b981,#34d399)' }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'10px 12px' }}>
        <p style={{ margin:'0 0 5px', fontWeight:700, fontSize:14, lineHeight:1.3, color:'#fff' }}>
          {item.title}
        </p>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:10, color:'rgba(255,255,255,.35)', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {item.source}
          </span>
          <span style={{ fontSize:10, color:'rgba(255,255,255,.25)', fontFamily:'monospace' }}>
            {ago(item.pubDate)}
          </span>
        </div>
      </div>
    </a>
  );
}

function HealthNewsCards() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/news/healthgood`);
      if (res.ok) { const d = await res.json(); if (Array.isArray(d)) setNews(d); }
    } catch {}
    setLoading(false);
    setBusy(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:3, height:16, borderRadius:2, background:'#10b981' }} />
          <span style={{ fontWeight:600, fontSize:14 }}>Sağlık Haberleri</span>
          <span style={{ fontSize:10, fontFamily:'monospace', padding:'2px 6px', borderRadius:999,
            background:'rgba(16,185,129,.1)', color:'#10b981', border:'1px solid rgba(16,185,129,.2)' }}>CANLI</span>
        </div>
        <button onClick={load} disabled={busy} style={{ background:'none', border:'none', cursor:'pointer', color:'#4a6080', padding:4 }}>
          <RefreshCw size={13} style={busy ? { animation:'spin 1s linear infinite' } : {}} />
        </button>
      </div>
      {loading
        ? [...Array(4)].map((_,k) => (
            <div key={k} style={{ height:240, borderRadius:14, background:'hsl(222 47% 8%)', opacity:1-k*.15, marginBottom:10, animation:'pulse 1.5s infinite' }} />
          ))
        : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {news.map((item, k) => <HealthCard key={item.id} item={item} i={k} />)}
          </div>
      }
    </div>
  );
}
