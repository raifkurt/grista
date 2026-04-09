import React, { useEffect, useState, useRef } from 'react';
import { orchestrator } from '@/lib/agents/orchestrator';
import { AgentStatus } from '@/lib/agents/types';
import { generatePriceTrendIndex, getMacroIndicators, generateSentimentData } from '@/lib/data/marketData';
import { ARIMA } from '@/lib/algorithms/arima';
import { KalmanFilter } from '@/lib/algorithms/kalman';
import { IsolationForest } from '@/lib/algorithms/isolationForest';
import {
  Activity, TrendingUp, Building2, DollarSign, Heart,
  Megaphone, Bot, AlertTriangle, Brain, Zap, Target,
  BarChart3, Globe, Shield,
} from 'lucide-react';
import { fmtPct, fmt } from '@/lib/data/utils';

// ─── Simulate agent activity ──────────────────────────────────────────────────
const AGENT_PROFILES = [
  { id: 'market' as const, name: 'Piyasa Ajanı', color: '#00d4ff', icon: TrendingUp,
    insights: ['ARIMA(2,1,2) forecast: İst. konut +2.3% (30 gün)', 'Kalman filtresi: EUR/TRY volatilite artışı tespit edildi', 'Sentiment endeksi 68 → Ihtiyatlı Bullish', 'Eyüpsultan hacim anomalisi: +142% yZ'], },
  { id: 'financial' as const, name: 'Finansal Ajan', color: '#10b981', icon: DollarSign,
    insights: ['VaR(95): ₺2.4M portföy için ₺180K günlük risk', 'Monte Carlo (5K sim): Gayrimenkul IRR medyan %18.4', 'TRY enflasyon hedge: Altın korelasyon 0.72', 'Sharpe ratio portföy: 1.34 (benchmark: 0.89)'], },
  { id: 'property' as const, name: 'Emlak Ajanı', color: '#8b5cf6', icon: Building2,
    insights: ['Hedonik model R²=0.89: Metro 0.5km = +₺12.4K/m²', 'Beşiktaş fiyat/kira oranı: 28.4x (uzun vadeli)', '3 mülk anomali skoru >0.78: Olası değer boşluğu', 'Isolation Forest: Esenyurt\'ta 2 aşırı fiyatlı mülk'], },
  { id: 'wellness' as const, name: 'Sağlık Ajanı', color: '#f59e0b', icon: Heart,
    insights: ['Kreatinin+D3+Mg protokolü optimal sıralama hesaplandı', 'Farmakokinetik: Kafein+L-Theanin peak: 08:45', 'KSM-66 kortizol inhibisyonu: %23 etkinlik tahmini', 'Uyku kalitesi tahmini: 7.2/10 (Mg gece eklendi)'], },
  { id: 'marketing' as const, name: 'Pazarlama Ajanı', color: '#ef4444', icon: Megaphone,
    insights: ['Shapley: Meta %31, Google %28, Organik %22 atıf', 'Retargeting ROAS: 109x — bütçe artışı önerisi', 'Yaş grubu 35-44: En yüksek ROAS (₺145K/konv.)', 'Dubai segmenti: 520x ROAS — LAL kitlesi önerisi'], },
];

const STATES = ['perceiving', 'deliberating', 'executing', 'communicating', 'idle'] as const;

export default function DashboardPage() {
  const [statuses, setStatuses] = useState<AgentStatus[]>([]);
  const [priceIndex, setPriceIndex] = useState<ReturnType<typeof generatePriceTrendIndex> | null>(null);
  const [sentiment, setSentiment] = useState<ReturnType<typeof generateSentimentData> | null>(null);
  const [liveSentiment, setLiveSentiment] = useState<{ value: number; label: string } | null>(null);
  const [liveMacro, setLiveMacro] = useState<any>(null);
  const [arimaForecast, setArimaForecast] = useState<number[]>([]);
  const [anomalies, setAnomalies] = useState<boolean[]>([]);
  const [agentStates, setAgentStates] = useState<Record<string, typeof STATES[number]>>({});
  const [messageLog, setMessageLog] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    // Initialize agents simulation
    const initStatuses = AGENT_PROFILES.map(p => ({
      id: p.id,
      name: p.name,
      state: 'idle' as const,
      beliefs: [{ key: 'domain', value: p.name, confidence: 1, source: p.id, timestamp: Date.now() }],
      activeDesires: [{ id: `${p.id}-d1`, description: 'Analiz ve raporlama', priority: 80, active: true }],
      messagesProcessed: Math.floor(Math.random() * 200 + 50),
      lastActivity: Date.now(),
      health: 92 + Math.random() * 8,
      performance: 0,
      insights: p.insights,
      alerts: [],
    }));
    setStatuses(initStatuses);

    // Generate data
    const idx = generatePriceTrendIndex(36);
    setPriceIndex(idx);
    setSentiment(generateSentimentData(90));

    // Canlı makro + sentiment
    fetch(`/api/macro?_=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json()).then(d => setLiveMacro(d)).catch(() => {});
    fetch(`/api/sentiment?_=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json()).then(d => setLiveSentiment(d)).catch(() => {});

    // Run ARIMA on istanbul prices
    const series = idx.istanbul;
    const model = new ARIMA(2, 1, 2).fit(series);
    const { predictions } = model.forecast(12);
    setArimaForecast(predictions);

    // Isolation Forest on series
    const { isAnomaly } = IsolationForest.fitSeries(series, 4);
    setAnomalies(isAnomaly);
  }, []);

  // Simulate agent state changes
  useEffect(() => {
    const interval = setInterval(() => {
      const newStates: Record<string, typeof STATES[number]> = {};
      for (const p of AGENT_PROFILES) {
        const rand = Math.random();
        newStates[p.id] = rand < 0.3 ? 'executing'
          : rand < 0.5 ? 'deliberating'
          : rand < 0.7 ? 'perceiving'
          : rand < 0.85 ? 'communicating'
          : 'idle';
      }
      setAgentStates(newStates);

      // Random message log
      const msgs = [
        `market → financial: ARIMA forecast parçaları iletildi`,
        `financial → property: Risk parametreleri güncellendi`,
        `property → orchestrator: 3 anomali raporu gönderildi`,
        `wellness → orchestrator: Optimum zamanlama hesaplandı`,
        `marketing → financial: ROAS entegrasyonu senkronize`,
        `orchestrator → broadcast: Sistem sağlığı %${Math.floor(93 + Math.random() * 7)}`,
      ];
      setMessageLog(prev => [msgs[Math.floor(Math.random() * msgs.length)], ...prev].slice(0, 8));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Canvas: neural network visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    // Network topology: 5 input → 8 hidden → 5 hidden → 5 output
    const layers = [5, 8, 5, 5];
    const nodePositions: { x: number; y: number; layer: number }[] = [];

    for (let l = 0; l < layers.length; l++) {
      const x = (l + 0.5) * (W / layers.length);
      for (let n = 0; n < layers[l]; n++) {
        const y = ((n + 0.5) / layers[l]) * H;
        nodePositions.push({ x, y, layer: l });
      }
    }

    let phase = 0;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      phase += 0.02;

      // Draw connections
      for (const from of nodePositions) {
        for (const to of nodePositions) {
          if (to.layer !== from.layer + 1) continue;
          const activation = Math.sin(phase + from.x * 0.01 + from.y * 0.01) * 0.5 + 0.5;
          ctx!.beginPath();
          ctx!.moveTo(from.x, from.y);
          ctx!.lineTo(to.x, to.y);
          ctx!.strokeStyle = `hsla(199, 95%, 55%, ${activation * 0.15})`;
          ctx!.lineWidth = activation * 0.8;
          ctx!.stroke();
        }
      }

      // Draw nodes
      for (const node of nodePositions) {
        const activation = Math.sin(phase + node.x * 0.015 + node.y * 0.01) * 0.5 + 0.5;
        const colors = ['199, 95%, 55%', '158, 64%, 52%', '271, 91%, 65%', '38, 92%, 50%'];
        const color = colors[node.layer % colors.length];

        ctx!.beginPath();
        ctx!.arc(node.x, node.y, 3 + activation * 2, 0, Math.PI * 2);
        ctx!.fillStyle = `hsl(${color})`;
        ctx!.globalAlpha = 0.4 + activation * 0.6;
        ctx!.fill();

        // Glow
        const grd = ctx!.createRadialGradient(node.x, node.y, 0, node.x, node.y, 10);
        grd.addColorStop(0, `hsla(${color}, ${activation * 0.3})`);
        grd.addColorStop(1, 'transparent');
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, 10, 0, Math.PI * 2);
        ctx!.fillStyle = grd;
        ctx!.globalAlpha = activation * 0.3;
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const stateColor = (s: string) => {
    if (s === 'executing') return '#10b981';
    if (s === 'deliberating') return '#8b5cf6';
    if (s === 'perceiving') return '#00d4ff';
    if (s === 'communicating') return '#f59e0b';
    return '#4b5563';
  };

  const stateLabel = (s: string) => {
    if (s === 'executing') return 'Yürütüyor';
    if (s === 'deliberating') return 'Düşünüyor';
    if (s === 'perceiving') return 'Algılıyor';
    if (s === 'communicating') return 'İletişim';
    return 'Bekleniyor';
  };

  const currentSentiment = sentiment?.fearGreed.slice(-1)[0] ?? 68;

  // Canlı veri veya statik fallback
  const macro = liveMacro ?? {
    turkey:  { policyRate: 37.00, inflation: 30.91, gdpGrowth: 3.3,  unemployment: 8.8 },
    greece:  { policyRate: 2.00,  inflation: 2.3,   gdpGrowth: 2.5,  touristArrivals: 33.6 },
  };
  const sentimentValue = liveSentiment?.value ?? currentSentiment;
  const sentimentLbl   = liveSentiment
    ? liveSentiment.label
    : (currentSentiment > 60 ? 'İhtiyatlı Bullish' : currentSentiment > 40 ? 'Nötr' : 'Ayı Piyasası');

  return (
    <div className="p-4 space-y-4 max-w-screen-2xl mx-auto">
      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'İst. Konut Endeksi', value: `${priceIndex?.istanbul.slice(-1)[0]?.toFixed(1) ?? '—'}`, sub: 'ARIMA(2,1,2) tahmin: ' + (arimaForecast.slice(-1)[0]?.toFixed(1) ?? '—'), icon: Building2, color: '#00d4ff', change: '+28.3%' },
          { label: 'Kripto F&G Endeksi', value: `${sentimentValue}`, sub: `${sentimentLbl}${liveSentiment ? ' · Canlı' : ''}`, icon: Brain, color: '#10b981', change: sentimentValue > 60 ? '↑ Açgözlü' : sentimentValue > 40 ? '→ Nötr' : '↓ Korku' },
          { label: 'Portföy VaR (95%)', value: '₺180K', sub: 'Monte Carlo 5.000 sim · günlük', icon: Shield, color: '#8b5cf6', change: '-2.1%' },
          { label: 'Aktif Anomali', value: `${anomalies.filter(Boolean).length}`, sub: 'Isolation Forest tespiti', icon: AlertTriangle, color: '#f59e0b', change: `${anomalies.filter(Boolean).length > 3 ? 'Yüksek' : 'Normal'}` },
        ].map(k => (
          <div key={k.label} className="metric-card card-hover" data-testid={`kpi-${k.label}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="p-1.5 rounded-lg" style={{ background: `${k.color}15` }}>
                <k.icon className="w-4 h-4" style={{ color: k.color }} />
              </div>
              <span className="text-xs font-mono" style={{ color: k.color }}>{k.change}</span>
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-foreground">{k.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{k.label}</div>
            <div className="text-xs mt-1 font-mono" style={{ color: k.color, fontSize: '10px', opacity: 0.7 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-3">
        {/* Price Index Chart */}
        <div className="col-span-5 metric-card" style={{ minHeight: 260 }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-foreground">Konut Fiyat Endeksi</div>
              <div className="text-xs text-muted-foreground">3 yıl · ARIMA forecast dahil · Anomaliler işaretli</div>
            </div>
            <div className="flex gap-2 text-xs font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-cyan-400 inline-block" /> İstanbul</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-400 inline-block" /> Atina</span>
            </div>
          </div>
          {priceIndex && (
            <MiniLineChart
              series={[
                { data: priceIndex.istanbul, color: 'hsl(199 95% 55%)', label: 'İstanbul' },
                { data: priceIndex.athens, color: 'hsl(158 64% 52%)', label: 'Atina' },
              ]}
              forecast={arimaForecast}
              anomalies={anomalies}
              height={180}
            />
          )}
        </div>

        {/* Neural Network Vis */}
        <div className="col-span-3 metric-card flex flex-col">
          <div className="text-sm font-semibold text-foreground mb-1">MLP Sinir Ağı</div>
          <div className="text-xs text-muted-foreground mb-2">Gerçek zamanlı aktivasyon · 5→8→5→5</div>
          <canvas ref={canvasRef} className="flex-1 rounded-lg" style={{ background: 'hsl(222 47% 4%)', minHeight: 180 }} />
        </div>

        {/* Macro */}
        <div className="col-span-4 metric-card">
          <div className="text-sm font-semibold text-foreground mb-3">Makroekonomik Göstergeler</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'TCMB Faiz', value: `%${macro.turkey.policyRate}`, flag: '🇹🇷', ok: false },
              { label: 'TRY Enflasyon', value: `%${macro.turkey.inflation.toFixed(1)}`, flag: '🇹🇷', ok: false },
              { label: 'TR GSYİH', value: `+%${macro.turkey.gdpGrowth.toFixed(1)}`, flag: '🇹🇷', ok: true },
              { label: 'İşsizlik', value: `%${macro.turkey.unemployment.toFixed(1)}`, flag: '🇹🇷', ok: null },
              { label: 'ECB Faiz', value: `%${macro.greece.policyRate}`, flag: '🇬🇷', ok: null },
              { label: 'GR GSYİH', value: `+%${macro.greece.gdpGrowth.toFixed(1)}`, flag: '🇬🇷', ok: true },
              { label: 'ATH Enflasyon', value: `%${macro.greece.inflation.toFixed(1)}`, flag: '🇬🇷', ok: true },
              { label: 'Turist/Yıl', value: `${macro.greece.touristArrivals}M`, flag: '🇬🇷', ok: true },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between p-2 rounded-lg"
                style={{ background: 'hsl(222 47% 5%)' }}>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{m.flag}</span>
                  <span>{m.label}</span>
                </div>
                <span className="text-xs font-mono font-semibold" style={{
                  color: m.ok === true ? 'hsl(158 64% 52%)' : m.ok === false ? 'hsl(0 84% 60%)' : 'hsl(var(--foreground))'
                }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-5 gap-3">
        {AGENT_PROFILES.map(agent => {
          const state = agentStates[agent.id] ?? 'idle';
          const Icon = agent.icon;
          return (
            <div key={agent.id} className="metric-card agent-card space-y-2" data-testid={`agent-${agent.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg" style={{ background: `${agent.color}15` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: agent.color }} />
                  </div>
                  <span className="text-xs font-semibold text-foreground truncate">{agent.name}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: stateColor(state) }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{
                  background: `${stateColor(state)}15`,
                  color: stateColor(state),
                  fontSize: '10px'
                }}>
                  {stateLabel(state)}
                </span>
                <span className="text-xs font-mono text-muted-foreground">BDI</span>
              </div>
              <div className="space-y-1">
                {agent.insights.slice(0, 2).map((ins, i) => (
                  <div key={i} className="text-xs text-muted-foreground leading-tight" style={{ fontSize: '10px', opacity: i === 0 ? 0.9 : 0.6 }}>
                    • {ins}
                  </div>
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
          <span className="text-xs font-semibold text-foreground">Ajan Mesaj Kanalı</span>
          <span className="text-xs text-muted-foreground ml-auto font-mono">Contract Net Protocol</span>
        </div>
        <div className="space-y-1 max-h-28 overflow-auto">
          {messageLog.map((msg, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-mono"
              style={{ opacity: 1 - i * 0.12, fontSize: '10px' }}>
              <span className="text-cyan-400">›</span>
              <span className="text-muted-foreground">{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <span className="text-foreground">{msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════ Global Piyasa Saatleri ════ */}
      <PiyasaSaatleri />

      {/* ════ 2025 Yatırım Getiri Karşılaştırması ════ */}
      <GetiriKarsilastirma />

      {/* ════ Hızlı Bilgi Paneli ════ */}
      <HizliBilgi macro={liveMacro} />

      {/* ════ Emtia & Altın ════ */}
      <EmtiaModulu />

      {/* ════ Kripto Piyasa Özeti ════ */}
      <KriptoPiyasaOzeti />

      {/* ════ İstanbul Mahalle Bazlı Konut ════ */}
      <IstanbulKonut />

      {/* ════ Atina Konut Piyasası ════ */}
      <AtinaKonut />

      {/* ════ Ekonomik Takvim ════ */}
      <EkonomikTakvim />

    </div>
  );
}

// ─── Piyasa Saatleri ───────────────────────────────────────────────────────────────
const MARKETS = [
  { name: 'BIST İstanbul',  flag: '🇹🇷', openH: 6.0,  closeH: 13.5, localOpen: '09:00', localClose: '16:30', tz: 'TST' },
  { name: 'LSE Londra',     flag: '🇬🇧', openH: 8.0,  closeH: 16.5, localOpen: '09:00', localClose: '17:30', tz: 'BST' },
  { name: 'Xetra Frankfurt',flag: '🇩🇪', openH: 7.0,  closeH: 15.5, localOpen: '09:00', localClose: '17:30', tz: 'CEST' },
  { name: 'NYSE / NASDAQ',  flag: '🇺🇸', openH: 14.5, closeH: 21.0, localOpen: '09:30', localClose: '16:00', tz: 'EDT' },
  { name: 'TSE Tokyo',      flag: '🇯🇵', openH: 0.0,  closeH: 6.0,  localOpen: '09:00', localClose: '15:00', tz: 'JST' },
  { name: 'SSE Şangay',    flag: '🇨🇳', openH: 1.5,  closeH: 7.0,  localOpen: '09:30', localClose: '15:00', tz: 'CST' },
  { name: 'Kripto (24/7)',  flag: '₿',   openH: -1,  closeH: -1,  localOpen: '00:00', localClose: '24:00', tz: 'UTC' },
];
function isOpen(m: typeof MARKETS[0]): boolean {
  if (m.openH === -1) return true;
  const now = new Date();
  const d = now.getUTCDay();
  if (d === 0 || d === 6) return false;
  const h = now.getUTCHours() + now.getUTCMinutes() / 60;
  return m.closeH > m.openH ? h >= m.openH && h < m.closeH : h >= m.openH || h < m.closeH;
}
function PiyasaSaatleri() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 30000); return () => clearInterval(t); }, []);
  const open = MARKETS.map(m => isOpen(m));
  const openCount = open.filter(Boolean).length;
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold">Global Piyasa Saatleri</span>
        <span className="text-xs font-mono ml-auto" style={{ color: openCount > 0 ? '#10b981' : '#ef4444' }}>
          {openCount} borsa açık
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {MARKETS.map((m, i) => (
          <div key={m.name} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'hsl(222 47% 5%)' }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 18 }}>{m.flag}</span>
              <div>
                <div className="text-xs font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{m.localOpen}–{m.localClose} {m.tz}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: open[i] ? '#10b981' : '#374151', boxShadow: open[i] ? '0 0 6px #10b981' : 'none' }} />
              <span className="text-xs font-mono font-semibold" style={{ color: open[i] ? '#10b981' : '#4b5563', minWidth: 48 }}>
                {open[i] ? 'AÇIK' : 'KAPALI'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2" style={{ fontSize: 10 }}>
        👁‍🗨️ Saatler yerel iş saatlerini gösterir. Kripto piyasası günün her saati açıktır.
      </div>
    </div>
  );
}

// ─── Getiri Karşılaştırma ───────────────────────────────────────────────────────────────
const RETURNS_2025 = [
  { name: 'Altın (TRY)',         pct: 47.2, color: '#F59E0B', note: 'En güvenli liman', icon: '🪩' },
  { name: 'Dolar (USD/TRY)',      pct: 38.8, color: '#10b981', note: 'Kur artışından kazanc', icon: '💵' },
  { name: 'TL Mevduat',          pct: 38.5, color: '#3B82F6', note: 'Banka faiz getirisi', icon: '🏦' },
  { name: 'BIST 100',            pct: 29.3, color: '#8B5CF6', note: 'Borsa endeks getirisi', icon: '📈' },
  { name: 'Kıymetli Gayrimenkul', pct: 28.1, color: '#EF4444', note: 'İst. konut değer artışı', icon: '🏠' },
  { name: 'Euro (EUR/TRY)',       pct: 23.5, color: '#6B7280', note: 'Avrupa kur artışı', icon: '🇪🇺' },
  { name: 'Bitcoin (USD)',        pct: 112.4,color: '#F7931A', note: 'Kripto piyasası', icon: '₿' },
];
function GetiriKarsilastirma() {
  const maxPct = Math.max(...RETURNS_2025.map(r => r.pct));
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="w-4 h-4 text-emerald-400" />
        <span className="text-sm font-semibold">2025 Yılı Yatırım Getiri Karşılaştırması</span>
      </div>
      <div className="text-xs text-muted-foreground mb-4">
        100 TL yatırım yapsaydın, yıl sonunda ne kadar olurdu?
      </div>
      <div className="space-y-3">
        {RETURNS_2025.sort((a, b) => b.pct - a.pct).map(r => (
          <div key={r.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 14 }}>{r.icon}</span>
                <div>
                  <span className="text-xs font-semibold">{r.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{r.note}</span>
                </div>
              </div>
              <span className="text-sm font-bold font-mono" style={{ color: r.color }}>+%{r.pct.toFixed(1)}</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'hsl(222 47% 8%)' }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${(r.pct / maxPct) * 100}%`, background: r.color, opacity: 0.85 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-3 p-2 rounded-lg" style={{ background: 'hsl(222 47% 5%)', fontSize: 10 }}>
        ⚠️ Geçmiş getiri, gelecekteki getiriyi garanti etmez. Bu veriler bilgi amaçlıdır.
      </div>
    </div>
  );
}

// ─── Hızlı Bilgi Paneli ───────────────────────────────────────────────────────────────
function HizliBilgi({ macro }: { macro: any }) {
  const m = macro ?? { turkey: { policyRate: 37, inflation: 30.91, gdpGrowth: 3.3, unemployment: 8.8 }, greece: { policyRate: 2.00, gdpGrowth: 2.5, touristArrivals: 33.6 } };
  const items = [
    { icon: '🇹🇷', label: 'Türkiye Merkez Bankası Faizi', value: `%${m.turkey.policyRate?.toFixed(2)}`, desc: 'Bu oran, bankaların birbirinden borcuç aldığı taban faizdir. Yüksekse mevduat da yüksek olur.', color: '#ef4444' },
    { icon: '📈', label: 'Türkiye Enflasyonu', value: `%${m.turkey.inflation?.toFixed(1)}`, desc: 'Yıllık fiyat artış oranı. Maaşın bu orandan fazla artmadıysa satın alma gücün düştü.', color: '#f59e0b' },
    { icon: '🇪🇺', label: 'ECB (Avrupa) Faizi', value: `%${m.greece.policyRate?.toFixed(2)}`, desc: 'Avrupa Merkez Bankası faizi. Atina gayrimenkullerini ve Euro/TRY kurunu etkiler.', color: '#3b82f6' },
    { icon: '🇹🇷', label: 'Türkiye Büyme (GSYH)', value: `+%${m.turkey.gdpGrowth?.toFixed(1)}`, desc: 'Ekonominin ne hızda büydüğü. Pozitifse ekonomi genisliyor, negatifse daralıyor.', color: '#10b981' },
    { icon: '🇬🇷', label: 'Yunanistan Büyme', value: `+%${m.greece.gdpGrowth?.toFixed(1)}`, desc: 'Atina özelinde önemli: turizm ve gayrimenkul yatırımları büyumeyi destekliyor.', color: '#10b981' },
    { icon: '🇹🇷', label: 'Türkiye İşsizlik', value: `%${m.turkey.unemployment?.toFixed(1)}`, desc: 'Çalışmak isteyen ama iş bulamayanların oranı. Düşerse ekonomi güçlenıyor demektir.', color: '#8b5cf6' },
    { icon: '🇬🇷', label: 'Yunanistan Turizm', value: `${m.greece.touristArrivals?.toFixed(1)}M/yıl`, desc: 'Yıllık turist sayısı. Atina konut ve kira piyasasını doğrudan etkiler.', color: '#0bc5ea' },
    { icon: '🏦', label: 'En Yüksek Mevduat', value: '%41.00', desc: 'QNB Finansbank 1 ay vadeli TL mevduatı. 100.000₺ yatırınca yılda ~41.000₺ faiz.', color: '#f77f00' },
  ];
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold">Hızlı Bilgi Paneli</span>
        <span className="text-xs text-muted-foreground ml-auto">Dünya Bankası · ECB · TCMB verileri</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(it => (
          <div key={it.label} className="metric-card" style={{ borderLeft: `3px solid ${it.color}` }}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: 16 }}>{it.icon}</span>
              <span className="text-xs font-semibold text-muted-foreground">{it.label}</span>
              <span className="text-sm font-bold font-mono ml-auto" style={{ color: it.color }}>{it.value}</span>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">{it.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Emtia & Altın ───────────────────────────────────────────────────────────
function EmtiaModulu() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`/api/commodities?_=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);
  const MAP: Record<string, { label: string; icon: string; color: string }> = {
    'GC=F':    { label: 'Altın (XAU/USD)',    icon: '🪙', color: '#F59E0B' },
    'SI=F':    { label: 'Gümüş (XAG/USD)',    icon: '🥈', color: '#94A3B8' },
    'BZ=F':    { label: 'Brent Ham Petrol',   icon: '🛢️', color: '#6B7280' },
    'NG=F':    { label: 'Doğal Gaz',          icon: '🔥', color: '#F97316' },
    'XU100.IS':{ label: 'BIST 100 Endeksi',   icon: '📊', color: '#8B5CF6' },
  };
  const UNITS: Record<string, string> = { 'GC=F':'$/oz','SI=F':'$/oz','BZ=F':'$/varil','NG=F':'$/mmBtu','XU100.IS':'puan' };
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-semibold">Emtia & Piyasa Verileri</span>
        <span className="text-xs text-muted-foreground ml-auto font-mono">Yahoo Finance</span>
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_,i)=><div key={i} style={{ height:36, borderRadius:8, background:'hsl(222 47% 8%)', opacity:1-i*.15 }}/>)}</div>
      ) : data.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-4">Veri yüklenemedi</div>
      ) : data.map((d, i) => {
        const m = MAP[d.symbol] ?? { label: d.name, icon: '📈', color: '#10b981' };
        const c = d.changePct ?? 0;
        return (
          <div key={d.symbol} className="flex items-center justify-between p-2.5 rounded-xl mb-2" style={{ background: 'hsl(222 47% 5%)', border: `1px solid ${m.color}15` }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 20 }}>{m.icon}</span>
              <div>
                <div className="text-xs font-semibold">{m.label}</div>
                <div className="text-xs text-muted-foreground font-mono">{UNITS[d.symbol] ?? d.currency}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono" style={{ color: m.color }}>
                {d.price >= 10000 ? d.price.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : d.price >= 100 ? d.price.toFixed(2) : d.price.toFixed(4)}
              </div>
              <div className="text-xs font-mono font-semibold" style={{ color: c >= 0 ? '#10b981' : '#ef4444' }}>
                {c >= 0 ? '+' : ''}{c.toFixed(2)}%
              </div>
            </div>
          </div>
        );
      })}
      <div className="text-xs text-muted-foreground mt-1" style={{ fontSize: 10 }}>
        Altın: Güvenli liman. Petrol: Küresel ekonomi barometresi. Gaz: Enerji maliyeti göstergesi.
      </div>
    </div>
  );
}

// ─── Kripto Piyasa Özeti / Fear & Greed ──────────────────────────────────────
function KriptoPiyasaOzeti() {
  const [fg, setFg] = useState<any>(null);
  const [btc, setBtc] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/sentiment?_=${Date.now()}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null).then(setFg);
    fetch(`/api/crypto?_=${Date.now()}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null).then(setBtc);
  }, []);
  const val = fg?.value ?? 50;
  const label = fg?.label ?? 'Nötr';
  const labelTR: Record<string, string> = { 'Extreme Fear': 'Aşırı Korku 😱', 'Fear': 'Korku 😰', 'Neutral': 'Nötr 😐', 'Greed': 'Açgözlülük 😈', 'Extreme Greed': 'Aşırı Açgözlülük 🤑' };
  const gaugeColor = val < 25 ? '#ef4444' : val < 50 ? '#f97316' : val < 75 ? '#84cc16' : '#10b981';
  const pct = (val / 100) * 180;
  const rad = (deg: number) => deg * Math.PI / 180;
  const cx = 60, cy = 60, r = 45;
  const startAngle = 180, endAngle = startAngle + pct;
  const x1 = cx + r * Math.cos(rad(startAngle)), y1 = cy + r * Math.sin(rad(startAngle));
  const x2 = cx + r * Math.cos(rad(endAngle)), y2 = cy + r * Math.sin(rad(endAngle));
  const large = pct > 90 ? 1 : 0;
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-semibold">Kripto Piyasa Özeti</span>
        <span className="text-xs text-muted-foreground ml-auto font-mono">Alternative.me</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Fear & Greed Gauge */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-muted-foreground mb-2">Korku & Açgözlülük Endeksi</div>
          <svg viewBox="0 0 120 70" style={{ width: '100%', maxWidth: 160 }}>
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="hsl(222 47% 10%)" strokeWidth="10" strokeLinecap="round" />
            {val > 0 && <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={gaugeColor} strokeWidth="10" strokeLinecap="round" />}
            <text x={cx} y={cy - 4} textAnchor="middle" fill={gaugeColor} fontSize="18" fontWeight="700" fontFamily="monospace">{val}</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="#4a6080" fontSize="7">/ 100</text>
          </svg>
          <div className="text-xs font-bold mt-1" style={{ color: gaugeColor }}>{labelTR[label] ?? label}</div>
          <div className="text-xs text-muted-foreground mt-1 text-center" style={{ fontSize: 9 }}>
            {val < 30 ? 'Piyasa çok korkuyor — alım fırsatı olabilir' : val > 70 ? 'Piyasa açgözlü — dikkatli ol!' : 'Piyasa dengeli seyirde'}
          </div>
        </div>
        {/* BTC özet */}
        <div className="flex flex-col justify-center gap-2">
          {[
            { label: 'Bitcoin', value: btc?.btcusd ? `$${btc.btcusd.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—', change: btc?.btcChange24h, color: '#F7931A' },
            { label: 'Ethereum', value: btc?.ethusd ? `$${btc.ethusd.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—', change: btc?.ethChange24h, color: '#627EEA' },
            { label: 'Solana', value: btc?.solusd ? `$${btc.solusd.toFixed(2)}` : '—', change: null, color: '#9945FF' },
          ].map(c => (
            <div key={c.label} className="p-2 rounded-lg" style={{ background: 'hsl(222 47% 5%)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                {c.change != null && <span className="text-xs font-mono" style={{ color: c.change >= 0 ? '#10b981' : '#ef4444' }}>{c.change >= 0 ? '+' : ''}{c.change?.toFixed(2)}%</span>}
              </div>
              <div className="text-sm font-bold font-mono" style={{ color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── İstanbul Konut ───────────────────────────────────────────────────────────
const IST_DISTRICTS = [
  { name: 'Sarıyer',    price: 285000, trend: 1.8 },
  { name: 'Beşiktaş',  price: 268000, trend: 1.4 },
  { name: 'Kadıköy',   price: 235000, trend: 1.6 },
  { name: 'Bakırköy',  price: 208000, trend: 1.2 },
  { name: 'Şişli',     price: 204000, trend: 1.1 },
  { name: 'Beyoğlu',   price: 188000, trend: 0.9 },
  { name: 'Üsküdar',   price: 182000, trend: 1.3 },
  { name: 'Fatih',     price: 165000, trend: 0.8 },
  { name: 'Ataşehir',  price: 162000, trend: 1.5 },
  { name: 'Maltepe',   price: 135000, trend: 1.7 },
  { name: 'Bağcılar',  price: 95000,  trend: 1.9 },
  { name: 'Esenyurt',  price: 72000,  trend: 2.1 },
];
function IstanbulKonut() {
  const max = Math.max(...IST_DISTRICTS.map(d => d.price));
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold">İstanbul — Bölge Bazlı Konut m² Fiyatları</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">Ortalama satış fiyatı · Nisan 2026 · TL/m²</div>
      <div className="space-y-1.5">
        {IST_DISTRICTS.map(d => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20 shrink-0">{d.name}</span>
            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'hsl(222 47% 8%)' }}>
              <div className="h-5 rounded-full flex items-center pl-2" style={{ width: `${(d.price / max) * 100}%`, background: `hsl(${199 - (d.price / max) * 40} 95% ${45 + (d.price / max) * 10}%)` }}>
                <span className="text-xs font-mono font-semibold text-white whitespace-nowrap" style={{ fontSize: 9 }}>
                  {(d.price / 1000).toFixed(0)}K ₺
                </span>
              </div>
            </div>
            <span className="text-xs font-mono shrink-0" style={{ color: '#10b981', minWidth: 36, textAlign: 'right', fontSize: 10 }}>+{d.trend.toFixed(1)}%/ay</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2 p-2 rounded-lg" style={{ background: 'hsl(222 47% 5%)', fontSize: 10 }}>
        📍 Sarıyer & Beşiktaş en pahalı bölgeler. Esenyurt & Bağcılar en hızlı değer kazananlar.
      </div>
    </div>
  );
}

// ─── Atina Konut ──────────────────────────────────────────────────────────────
const ATH_DISTRICTS = [
  { name: 'Vouliagmeni', price: 9800, trend: 2.3 },
  { name: 'Kolonaki',    price: 8200, trend: 1.8 },
  { name: 'Filothei',    price: 5500, trend: 1.6 },
  { name: 'Glyfada',     price: 5800, trend: 2.1 },
  { name: 'Kifisia',     price: 4800, trend: 1.4 },
  { name: 'Marousi',     price: 3200, trend: 1.2 },
  { name: 'Pangrati',    price: 2800, trend: 1.1 },
  { name: 'Piraeus',     price: 2400, trend: 0.9 },
  { name: 'Kypseli',     price: 2000, trend: 0.8 },
  { name: 'Exarchia',    price: 1900, trend: 0.7 },
];
function AtinaKonut() {
  const max = Math.max(...ATH_DISTRICTS.map(d => d.price));
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-semibold">Atina — Bölge Bazlı Konut m² Fiyatları</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">Ortalama satış fiyatı · Nisan 2026 · EUR/m²</div>
      <div className="space-y-1.5">
        {ATH_DISTRICTS.map(d => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-24 shrink-0">{d.name}</span>
            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'hsl(222 47% 8%)' }}>
              <div className="h-5 rounded-full flex items-center pl-2" style={{ width: `${(d.price / max) * 100}%`, background: `hsl(${271 - (d.price / max) * 30} 91% ${55 + (d.price / max) * 10}%)` }}>
                <span className="text-xs font-mono font-semibold text-white whitespace-nowrap" style={{ fontSize: 9 }}>
                  €{d.price.toLocaleString()}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono shrink-0" style={{ color: '#10b981', minWidth: 36, textAlign: 'right', fontSize: 10 }}>+{d.trend.toFixed(1)}%/ay</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2 p-2 rounded-lg" style={{ background: 'hsl(222 47% 5%)', fontSize: 10 }}>
        🏛️ Atina'da Altın Vize etkisi: yabancı yatırımcı talebi fiyatları yukarı çekiyor.
      </div>
    </div>
  );
}

// ─── Ekonomik Takvim ──────────────────────────────────────────────────────────
const TAKVIM = [
  { date: '22 Nisan 2026', event: 'TCMB Para Politikası Kurulu', detail: 'Türkiye faiz kararı açıklanacak', importance: 'yüksek', flag: '🇹🇷' },
  { date: '29-30 Nisan',   event: 'ECB Yönetim Konseyi',         detail: 'Avrupa Merkez Bankası faiz toplantısı', importance: 'yüksek', flag: '🇪🇺' },
  { date: '5 Mayıs 2026',  event: 'TÜİK Nisan Enflasyonu',      detail: 'Türkiye aylık enflasyon verisi', importance: 'orta', flag: '🇹🇷' },
  { date: '6-7 Mayıs',     event: 'Fed FOMC Toplantısı',         detail: 'ABD Merkez Bankası faiz kararı', importance: 'yüksek', flag: '🇺🇸' },
  { date: '26 Mayıs 2026', event: 'TCMB Mayıs Toplantısı',      detail: 'Türkiye 2. çeyrek faiz kararı', importance: 'yüksek', flag: '🇹🇷' },
  { date: '5 Haziran',     event: 'ECB Haziran Toplantısı',      detail: 'Euro Bölgesi faiz kararı', importance: 'yüksek', flag: '🇪🇺' },
];
function EkonomikTakvim() {
  const IMP: Record<string, { color: string; label: string }> = {
    yüksek: { color: '#ef4444', label: '●●●' },
    orta:   { color: '#f59e0b', label: '●●○' },
    düşük:  { color: '#4b5563', label: '●○○' },
  };
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-semibold">Önemli Ekonomik Takvim</span>
        <span className="text-xs text-muted-foreground ml-auto">Nisan–Haziran 2026</span>
      </div>
      <div className="space-y-2">
        {TAKVIM.map((ev, i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl" style={{ background: 'hsl(222 47% 5%)' }}>
            <div className="text-center shrink-0" style={{ minWidth: 70 }}>
              <div className="text-xs font-mono font-bold text-cyan-400">{ev.flag}</div>
              <div className="text-xs font-mono text-muted-foreground leading-tight" style={{ fontSize: 9 }}>{ev.date}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold">{ev.event}</div>
              <div className="text-xs text-muted-foreground">{ev.detail}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs font-mono" style={{ color: IMP[ev.importance].color, letterSpacing: 1 }}>{IMP[ev.importance].label}</div>
              <div className="text-xs text-muted-foreground" style={{ fontSize: 9 }}>{ev.importance}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2" style={{ fontSize: 10 }}>
        ●●● Yüksek etkili · ●●○ Orta etkili · Piyasalar bu tarihlerde volatil olabilir.
      </div>
    </div>
  );
}


// ─── Inline SVG Chart ─────────────────────────────────────────────────────────
function MiniLineChart({ series, forecast, anomalies, height }: {
  series: { data: number[]; color: string; label: string }[];
  forecast?: number[];
  anomalies?: boolean[];
  height: number;
}) {
  const allValues = series.flatMap(s => s.data);
  const min = Math.min(...allValues) * 0.97;
  const max = Math.max(...allValues) * 1.03;
  const n = series[0]?.data.length ?? 0;

  const toX = (i: number, total: number, w: number) => (i / (total - 1)) * w;
  const toY = (v: number, h: number) => h - ((v - min) / (max - min)) * h;

  const W = 100; // percentage coords
  const H = height;

  const buildPath = (data: number[], w = W, h = H) =>
    data.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i, data.length, w).toFixed(2)},${toY(v, h).toFixed(2)}`).join(' ');

  const forecastOffset = n;
  const totalPoints = n + (forecast?.length ?? 0);
  const forecastPath = forecast
    ? [series[0].data.slice(-1)[0], ...forecast]
        .map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(forecastOffset + i - 1, totalPoints, W).toFixed(2)},${toY(v, H).toFixed(2)}`)
        .join(' ')
    : '';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height, display: 'block' }} preserveAspectRatio="none">
      {series.map(s => {
        const path = buildPath(s.data, W * (n / totalPoints), H);
        return (
          <g key={s.label}>
            {/* Area */}
            <path d={`${path} L${toX(s.data.length - 1, totalPoints, W * (n / totalPoints)).toFixed(2)},${H} L0,${H} Z`}
              fill={s.color} opacity="0.06" />
            <path d={path} fill="none" stroke={s.color} strokeWidth="0.5" />
          </g>
        );
      })}
      {/* Forecast band */}
      {forecast && (
        <path d={forecastPath} fill="none" stroke="hsl(199 95% 55%)" strokeWidth="0.5" strokeDasharray="1,1" opacity="0.7" />
      )}
      {/* Anomaly markers */}
      {anomalies && series[0]?.data.map((v, i) => anomalies[i] && (
        <circle key={i}
          cx={toX(i, totalPoints, W * (n / totalPoints))} cy={toY(v, H)} r="1.5"
          fill="hsl(38 92% 50%)" opacity="0.9" />
      ))}
    </svg>
  );
}
