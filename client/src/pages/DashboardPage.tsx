import { useEffect, useState, useRef } from 'react';
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
