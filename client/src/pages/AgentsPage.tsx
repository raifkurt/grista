import { useState, useEffect, useRef } from 'react';
import { orchestrator } from '@/lib/agents/orchestrator';
import { AgentStatus } from '@/lib/agents/types';
import { Bot, Brain, Zap, MessageSquare, Activity, Network } from 'lucide-react';

const AGENT_CONFIG = [
  { id: 'market', name: 'Piyasa İstihbarat Ajanı', color: '#00d4ff', icon: '📈',
    desc: 'ARIMA(2,1,2) · Kalman Filtresi · K-Means++ kümeleme · Anomali tespiti',
    beliefs: ['İstanbul konut trendi: Bullish', 'EUR/TRY volatilite: Yüksek', 'Q3 beklenti: +2.3%'],
    desires: ['Fiyat tahminlerini güncelle (P:90)', 'Anomali raporla (P:85)', 'Kümeleri yeniden hesapla (P:70)'],
    plan: ['Veri akışını al', 'ARIMA modeli eğit', 'Kalman düzelt', 'Anomali tara', 'Orkestratöre ilet'],
  },
  { id: 'financial', name: 'Finansal Risk Ajanı', color: '#10b981', icon: '💰',
    desc: 'Monte Carlo GBM · VaR/CVaR · IRR hesaplama · Cholesky korelasyon',
    beliefs: ['Portföy VaR(95): ₺180K', 'TRY hedge ihtiyacı: Yüksek', 'Sharpe: 1.34'],
    desires: ['Risk limitlerini izle (P:95)', 'Yatırım simülasyonu çalıştır (P:80)', 'Korelasyon matrisini güncelle (P:65)'],
    plan: ['Piyasa verisi al', 'GBM yolları simüle et', 'VaR hesapla', 'CVaR hesapla', 'Raporu ilet'],
  },
  { id: 'property', name: 'Emlak Değerleme Ajanı', color: '#8b5cf6', icon: '🏢',
    desc: 'Hedonik OLS regresyon · Isolation Forest · İstanbul/Atina lokasyon modeli',
    beliefs: ['Beşiktaş konumsal prim: 1.45x', 'Metro 500m: +₺12.4K/m²', 'Model R²: 0.89'],
    desires: ['Portföy değerlemesini güncelle (P:88)', 'Anomali mülkleri işaretle (P:92)', 'Konum primleri yenile (P:60)'],
    plan: ['Eğitim verisi üret', 'OLS modeli eğit', 'Her mülkü değerle', 'Isolation Forest çalıştır', 'Anomalileri raporla'],
  },
  { id: 'wellness', name: 'Sağlık Optimizasyon Ajanı', color: '#f59e0b', icon: '🏥',
    desc: '1-kompartman PK modeli · Etkileşim matrisi · Fitness tahmincisi',
    beliefs: ['Kafein peak: 08:45', 'Mg+Zn etkileşimi: Orta', 'Optimal protokol: 8 supplement'],
    desires: ['Takvimi optimize et (P:75)', 'Etkileşimleri kontrol et (P:90)', 'Fitness tahmin et (P:65)'],
    plan: ['Supplement seçimini al', 'PK modeli çalıştır', 'Etkileşim matrisini hesapla', 'Optimal zamanlama bul'],
  },
  { id: 'marketing', name: 'Pazarlama Analitik Ajanı', color: '#ef4444', icon: '📣',
    desc: 'Shapley değeri · Monte Carlo permütasyon · Kampanya optimizasyonu',
    beliefs: ['Meta ROAS: 200x (lüks)', 'Dubai segmenti: 520x ROAS', 'Retargeting: En verimli'],
    desires: ['Shapley atıfları güncelle (P:82)', 'Bütçe önerisi hazırla (P:88)', 'Kitle segmentlerini güncelle (P:70)'],
    plan: ['Kanal verisi topla', 'Koalisyonları hesapla', 'Shapley permütasyon çalıştır', 'Atıf raporunu oluştur'],
  },
];

const BDI_STATES = ['idle', 'perceiving', 'deliberating', 'executing', 'communicating'] as const;
const STATE_COLORS: Record<string, string> = {
  idle: '#4b5563', perceiving: '#00d4ff', deliberating: '#8b5cf6',
  executing: '#10b981', communicating: '#f59e0b',
};
const STATE_LABELS: Record<string, string> = {
  idle: 'Bekleniyor', perceiving: 'Algılıyor', deliberating: 'Düşünüyor',
  executing: 'Yürütüyor', communicating: 'İletişim',
};

export default function AgentsPage() {
  const [states, setStates] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<{ from: string; to: string; content: string; time: string }[]>([]);
  const [planSteps, setPlanSteps] = useState<Record<string, number>>({});
  const [selectedAgent, setSelectedAgent] = useState<string | null>('market');
  const [cycleCount, setCycleCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // BDI cycle simulation
    const interval = setInterval(() => {
      const newStates: Record<string, string> = {};
      const newPlanSteps: Record<string, number> = {};

      for (const a of AGENT_CONFIG) {
        const r = Math.random();
        newStates[a.id] = r < 0.25 ? 'executing' : r < 0.45 ? 'deliberating' : r < 0.65 ? 'perceiving' : r < 0.82 ? 'communicating' : 'idle';
        newPlanSteps[a.id] = Math.floor(Math.random() * a.plan.length);
      }

      setStates(newStates);
      setPlanSteps(newPlanSteps);
      setCycleCount(c => c + 1);

      // Generate random message
      if (Math.random() > 0.3) {
        const fromAgent = AGENT_CONFIG[Math.floor(Math.random() * AGENT_CONFIG.length)];
        const toAgent = AGENT_CONFIG[Math.floor(Math.random() * AGENT_CONFIG.length)];
        if (fromAgent.id !== toAgent.id) {
          const msgTemplates = [
            `ARIMA forecast verileri hazır`,
            `Risk parametreleri güncellendi`,
            `3 anomali tespit edildi`,
            `Shapley hesaplama tamamlandı`,
            `PK modeli sonuçları hazır`,
            `Değerleme modeli R²=0.89`,
            `Korelasyon matrisi yenilendi`,
            `Bütçe optimizasyonu önerisi`,
            `Sistem sağlığı raporu`,
          ];
          const content = msgTemplates[Math.floor(Math.random() * msgTemplates.length)];
          const time = new Date().toLocaleTimeString('tr-TR');

          setMessages(prev => [{
            from: fromAgent.name.split(' ')[0],
            to: toAgent.name.split(' ')[0],
            content,
            time,
          }, ...prev].slice(0, 50));
          setMessageCount(c => c + 1);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const selected = AGENT_CONFIG.find(a => a.id === selectedAgent);

  return (
    <div className="p-4 space-y-4 max-w-screen-2xl mx-auto">
      {/* System stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'BDI Döngüsü', value: cycleCount.toLocaleString(), icon: Brain, color: '#00d4ff' },
          { label: 'Mesaj Sayısı', value: messageCount.toLocaleString(), icon: MessageSquare, color: '#10b981' },
          { label: 'Aktif Ajan', value: `${Object.values(states).filter(s => s !== 'idle').length}/5`, icon: Bot, color: '#8b5cf6' },
          { label: 'Algoritma', value: '7 adet', icon: Network, color: '#f59e0b' },
          { label: 'Sistem Sağlığı', value: `${orchestrator.systemHealthScore()}%`, icon: Activity, color: '#ef4444' },
        ].map(k => (
          <div key={k.label} className="metric-card card-hover flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: `${k.color}15` }}>
              <k.icon className="w-4 h-4" style={{ color: k.color }} />
            </div>
            <div>
              <div className="text-sm font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-muted-foreground">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Agent cards */}
        <div className="col-span-4 space-y-2">
          {AGENT_CONFIG.map(a => {
            const state = states[a.id] ?? 'idle';
            const isSelected = selectedAgent === a.id;
            return (
              <div key={a.id}
                onClick={() => setSelectedAgent(a.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all agent-card card-hover ${isSelected ? 'border-cyan-400/50' : 'border-border'}`}
                style={{
                  background: isSelected ? `${a.color}08` : 'hsl(222 47% 7%)',
                }}
                data-testid={`agent-card-${a.id}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{a.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-foreground">{a.name}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: STATE_COLORS[state] }} />
                    <span className="text-xs font-mono" style={{ color: STATE_COLORS[state], fontSize: '10px' }}>
                      {STATE_LABELS[state]}
                    </span>
                  </div>
                </div>

                {/* Current plan step */}
                <div className="flex gap-1 mb-2">
                  {a.plan.map((step, i) => (
                    <div key={i} className="flex-1 h-1 rounded-full"
                      style={{
                        background: i <= (planSteps[a.id] ?? 0) ? a.color : 'hsl(217 33% 17%)',
                        opacity: i === planSteps[a.id] ? 1 : i < (planSteps[a.id] ?? 0) ? 0.6 : 0.2,
                      }} />
                  ))}
                </div>

                <div className="text-xs text-muted-foreground" style={{ fontSize: '10px' }}>
                  {a.plan[planSteps[a.id] ?? 0] ?? a.plan[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Agent detail */}
        <div className="col-span-5 space-y-3">
          {selected && (
            <>
              <div className="metric-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{selected.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{selected.name}</div>
                    <div className="text-xs text-muted-foreground">{selected.desc}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['Inanç', 'Arzu', 'Niyet'].map((label, i) => (
                    <div key={label} className="p-2 rounded-lg" style={{ background: 'hsl(222 47% 5%)', border: `1px solid ${selected.color}20` }}>
                      <div className="text-xs font-semibold mb-2" style={{ color: selected.color }}>{label}</div>
                      <div className="space-y-1">
                        {(i === 0 ? selected.beliefs : i === 1 ? selected.desires : selected.plan).slice(0, 3).map((item, j) => (
                          <div key={j} className="text-xs text-muted-foreground leading-tight" style={{ fontSize: '10px' }}>
                            • {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BDI cycle visualization */}
              <div className="metric-card">
                <div className="text-xs font-semibold mb-3 text-foreground">BDI Döngü Durumu</div>
                <div className="flex items-center justify-center gap-2">
                  {(['perceiving', 'deliberating', 'executing'] as const).map((phase, i) => {
                    const state = states[selected.id] ?? 'idle';
                    const isActive = state === phase;
                    return (
                      <div key={phase} className="flex items-center gap-1">
                        <div className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive ? 'ring-1' : ''}`}
                          style={{
                            background: `${STATE_COLORS[phase]}${isActive ? '25' : '10'}`,
                            color: STATE_COLORS[phase],
                            ringColor: STATE_COLORS[phase],
                            border: `1px solid ${STATE_COLORS[phase]}${isActive ? '60' : '20'}`,
                          }}>
                          {STATE_LABELS[phase]}
                        </div>
                        {i < 2 && <span className="text-muted-foreground text-xs">→</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Message log */}
        <div className="col-span-3 metric-card">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-foreground">Contract Net Protocol</span>
          </div>
          <div className="space-y-1.5 max-h-96 overflow-auto" ref={msgEndRef}>
            {messages.map((msg, i) => (
              <div key={i} className="p-1.5 rounded text-xs" style={{ background: 'hsl(222 47% 5%)' }}>
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-cyan-400 font-mono" style={{ fontSize: '9px' }}>{msg.from}</span>
                  <span className="text-muted-foreground" style={{ fontSize: '9px' }}>→</span>
                  <span className="text-purple-400 font-mono" style={{ fontSize: '9px' }}>{msg.to}</span>
                  <span className="text-muted-foreground ml-auto font-mono" style={{ fontSize: '9px' }}>{msg.time}</span>
                </div>
                <div className="text-muted-foreground" style={{ fontSize: '10px' }}>{msg.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
