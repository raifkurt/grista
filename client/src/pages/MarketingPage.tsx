import { useState } from 'react';
import { generateCampaigns, generateChannelAttribution, generateCampaignTimeSeries, generateAudienceInsights } from '@/lib/data/marketingData';
import { Megaphone, TrendingUp, Users, Target, DollarSign } from 'lucide-react';

export default function MarketingPage() {
  const [campaigns] = useState(generateCampaigns());
  const [attribution] = useState(generateChannelAttribution());
  const [timeSeries] = useState(generateCampaignTimeSeries(60));
  const [audience] = useState(generateAudienceInsights());
  const [activeTab, setActiveTab] = useState<'campaigns' | 'attribution' | 'audience'>('campaigns');

  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const totalSpend = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const avgROAS = totalRevenue / totalSpend;

  return (
    <div className="p-4 space-y-4 max-w-screen-2xl mx-auto">
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Toplam Harcama', value: `₺${(totalSpend / 1000).toFixed(0)}K`, color: '#00d4ff', sub: `${campaigns.filter(c => c.status === 'active').length} aktif kampanya` },
          { label: 'Toplam Gelir', value: `₺${(totalRevenue / 1e6).toFixed(2)}M`, color: '#10b981', sub: `ROAS: ×${avgROAS.toFixed(1)}` },
          { label: 'Toplam Dönüşüm', value: totalConversions.toLocaleString(), color: '#8b5cf6', sub: `Ort. CPA: ₺${(totalSpend / totalConversions).toFixed(0)}` },
          { label: 'Shapley Atıf', value: 'Aktif', color: '#f59e0b', sub: 'Oyun teorisi tabanlı' },
        ].map(k => (
          <div key={k.label} className="metric-card card-hover">
            <div className="text-lg font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="text-xs font-mono mt-0.5" style={{ color: k.color, opacity: 0.7, fontSize: '10px' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['campaigns', 'attribution', 'audience'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'tab-active' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab === 'campaigns' ? '📊 Kampanyalar' : tab === 'attribution' ? '🔬 Shapley Atıf' : '👥 Kitle Analizi'}
          </button>
        ))}
      </div>

      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="metric-card overflow-auto">
            <table className="w-full text-xs data-table">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  {['Kampanya', 'Kanal', 'Harcama', 'Gelir', 'ROAS', 'Dönüşüm', 'CPA', 'CTR', 'Durum'].map(h => (
                    <th key={h} className={`pb-2 font-medium ${h === 'Kampanya' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-b border-border/30">
                    <td className="py-2 font-medium text-foreground pr-4">{c.name}</td>
                    <td className="py-2 text-right text-muted-foreground">{c.channel}</td>
                    <td className="py-2 text-right font-mono">₺{c.spent.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono text-emerald-400">₺{(c.revenue / 1000).toFixed(0)}K</td>
                    <td className="py-2 text-right font-mono font-semibold" style={{ color: c.roas > 50 ? '#10b981' : c.roas > 20 ? '#f59e0b' : '#ef4444' }}>
                      ×{c.roas.toFixed(1)}
                    </td>
                    <td className="py-2 text-right font-mono">{c.conversions}</td>
                    <td className="py-2 text-right font-mono">₺{c.cpa.toFixed(0)}</td>
                    <td className="py-2 text-right font-mono">{c.ctr.toFixed(2)}%</td>
                    <td className="py-2 text-right">
                      <span className="px-1.5 py-0.5 rounded text-xs" style={{
                        background: c.status === 'active' ? 'hsl(158 64% 42% / 0.15)' : 'hsl(38 92% 50% / 0.15)',
                        color: c.status === 'active' ? '#10b981' : '#f59e0b',
                      }}>
                        {c.status === 'active' ? 'Aktif' : 'Duraklatıldı'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Time series */}
          <div className="grid grid-cols-2 gap-3">
            <div className="metric-card">
              <div className="text-sm font-semibold mb-1">Günlük Harcama & Gelir</div>
              <div className="text-xs text-muted-foreground mb-2">60 gün · GBM simülasyon</div>
              <DoubleLineChart d1={timeSeries.spend} d2={timeSeries.revenue.map(r => r / 10)} c1="hsl(0 84% 60%)" c2="hsl(158 64% 52%)" height={80} />
              <div className="flex gap-3 text-xs mt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-red-400 inline-block" /> Harcama (×10)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-400 inline-block" /> Gelir (/10)</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="text-sm font-semibold mb-1">ROAS Trendi</div>
              <div className="text-xs text-muted-foreground mb-2">60 gün · Rolling average</div>
              <DoubleLineChart d1={timeSeries.roas} d2={[]} c1="hsl(199 95% 55%)" c2="" height={80} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attribution' && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5 metric-card">
            <div className="text-sm font-semibold mb-1">Shapley Değeri Atıf Modeli</div>
            <div className="text-xs text-muted-foreground mb-4">
              Oyun teorisi tabanlı · Koalisyon katkıları · 2.000 Monte Carlo permütasyon
            </div>
            <div className="space-y-3">
              {attribution.map(ch => (
                <div key={ch.channel} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: ch.color }} />
                      <span className="text-foreground font-medium">{ch.channel}</span>
                    </div>
                    <div className="flex gap-3 font-mono text-muted-foreground">
                      <span className="font-semibold" style={{ color: ch.color }}>{(ch.shapleyShare * 100).toFixed(1)}%</span>
                      <span>₺{(ch.revenue / 1e6).toFixed(1)}M</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-muted">
                    <div className="h-full rounded-l" style={{ width: `${ch.shapleyShare * 100}%`, background: ch.color }} />
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground" style={{ fontSize: '10px' }}>
                    <span>Son temas: {(ch.lastTouchShare * 100).toFixed(1)}%</span>
                    <span>İlk temas: {(ch.firstTouchShare * 100).toFixed(1)}%</span>
                    <span>Lineer: {(ch.linearShare * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-7 metric-card">
            <div className="text-sm font-semibold mb-3">Atıf Modeli Karşılaştırması</div>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left pb-2">Kanal</th>
                    <th className="text-right pb-2">Shapley</th>
                    <th className="text-right pb-2">Son Temas</th>
                    <th className="text-right pb-2">İlk Temas</th>
                    <th className="text-right pb-2">Lineer</th>
                    <th className="text-right pb-2">Gelir</th>
                  </tr>
                </thead>
                <tbody>
                  {attribution.map(ch => (
                    <tr key={ch.channel} className="border-b border-border/30">
                      <td className="py-2 font-medium" style={{ color: ch.color }}>{ch.channel}</td>
                      <td className="py-2 text-right font-mono font-bold" style={{ color: ch.color }}>{(ch.shapleyShare * 100).toFixed(1)}%</td>
                      <td className="py-2 text-right font-mono text-muted-foreground">{(ch.lastTouchShare * 100).toFixed(1)}%</td>
                      <td className="py-2 text-right font-mono text-muted-foreground">{(ch.firstTouchShare * 100).toFixed(1)}%</td>
                      <td className="py-2 text-right font-mono text-muted-foreground">{(ch.linearShare * 100).toFixed(1)}%</td>
                      <td className="py-2 text-right font-mono text-emerald-400">₺{(ch.revenue / 1e6).toFixed(1)}M</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audience' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="metric-card">
            <div className="text-sm font-semibold mb-3">Yaş Grubu Analizi</div>
            <div className="space-y-2">
              {audience.ageGroups.map(g => (
                <div key={g.age} className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{g.age}</span>
                    <span className="font-mono text-foreground">{g.pct}% · CPA ₺{g.cpa} · CTR {g.ctr}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${g.pct * 3}%`, background: 'hsl(199 95% 55%)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="metric-card">
            <div className="text-sm font-semibold mb-3">En İyi Lokasyonlar</div>
            <div className="space-y-2">
              {audience.topLocations.map(l => (
                <div key={l.city} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'hsl(222 47% 5%)' }}>
                  <span className="text-xs font-medium text-foreground">{l.city}</span>
                  <div className="text-right text-xs font-mono">
                    <div className="text-emerald-400">ROAS ×{l.roas}</div>
                    <div className="text-muted-foreground">{l.conversions} konv.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="metric-card">
            <div className="text-sm font-semibold mb-3">Cihaz Dağılımı</div>
            <div className="space-y-3">
              {audience.devices.map(d => (
                <div key={d.device} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{d.device}</span>
                    <span className="font-mono text-foreground">{d.pct}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: 'hsl(271 91% 65%)' }} />
                  </div>
                  <div className="text-xs text-muted-foreground" style={{ fontSize: '10px' }}>
                    CTR {d.ctr}% · Dönüşüm %{d.convRate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DoubleLineChart({ d1, d2, c1, c2, height }: { d1: number[]; d2: number[]; c1: string; c2: string; height: number }) {
  const all = [...d1, ...d2].filter(Boolean);
  if (all.length === 0) return null;
  const min = Math.min(...all) * 0.95, max = Math.max(...all) * 1.05;
  const n = d1.length;
  const toX = (i: number) => (i / (n - 1)) * 100;
  const toY = (v: number) => height - ((v - min) / (max - min)) * height;
  const p1 = d1.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
  const p2 = d2.length > 0 ? d2.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ') : '';
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height, display: 'block' }} preserveAspectRatio="none">
      <path d={`${p1} L100,${height} L0,${height} Z`} fill={c1} opacity="0.06" />
      <path d={p1} fill="none" stroke={c1} strokeWidth="0.6" />
      {p2 && <path d={p2} fill="none" stroke={c2} strokeWidth="0.6" />}
    </svg>
  );
}
