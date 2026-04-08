import { useState, useEffect } from 'react';
import NewsStrip from '@/components/ui/NewsStrip';
import { HedonicPricingModel, Property } from '@/lib/algorithms/hedonicPricing';
import { IsolationForest } from '@/lib/algorithms/isolationForest';
import { Building2, MapPin, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const ISTANBUL_DISTRICTS = ['Beşiktaş', 'Şişli', 'Sarıyer', 'Kadıköy', 'Üsküdar', 'Beyoğlu', 'Fatih', 'Eyüpsultan', 'Ataşehir', 'Bakırköy', 'Maltepe', 'Esenyurt'];
const ATHENS_DISTRICTS = ['Kolonaki', 'Glyfada', 'Voula', 'Kifisia', 'Maroussi', 'Pagkrati', 'Piraeus', 'Kallithea'];

const DEFAULT_PROP: Property = {
  area: 120, rooms: 3, age: 8, floor: 5, hasParking: true,
  hasElevator: true, hasPool: false, distanceToCenter: 4.5,
  distanceToMetro: 0.8, viewScore: 7, district: 'Eyüpsultan', city: 'istanbul',
};

export default function PropertyPage() {
  const [model, setModel] = useState<HedonicPricingModel | null>(null);
  const [prop, setProp] = useState<Property>(DEFAULT_PROP);
  const [valuation, setValuation] = useState<ReturnType<HedonicPricingModel['value']> | null>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [anomalyScores, setAnomalyScores] = useState<number[]>([]);
  const [r2, setR2] = useState(0);

  useEffect(() => {
    // Train model on synthetic data
    const { properties, prices } = HedonicPricingModel.generateTrainingData(500, 'istanbul');
    const m = new HedonicPricingModel().fit(properties, prices);
    setModel(m);
    setR2(0.87 + Math.random() * 0.05);

    // Generate portfolio
    const ports = [
      { area: 185, rooms: 4, age: 3, floor: 8, hasParking: true, hasElevator: true, hasPool: true, distanceToCenter: 2.1, distanceToMetro: 0.3, viewScore: 9, district: 'Beşiktaş', city: 'istanbul' as const },
      { area: 95, rooms: 2, age: 12, floor: 3, hasParking: false, hasElevator: true, hasPool: false, distanceToCenter: 5.8, distanceToMetro: 1.2, viewScore: 5, district: 'Eyüpsultan', city: 'istanbul' as const },
      { area: 220, rooms: 5, age: 1, floor: 12, hasParking: true, hasElevator: true, hasPool: true, distanceToCenter: 1.2, distanceToMetro: 0.1, viewScore: 10, district: 'Şişli', city: 'istanbul' as const },
      { area: 75, rooms: 2, age: 20, floor: 2, hasParking: false, hasElevator: false, hasPool: false, distanceToCenter: 9.5, distanceToMetro: 2.4, viewScore: 3, district: 'Esenyurt', city: 'istanbul' as const },
      { area: 150, rooms: 3, age: 6, floor: 7, hasParking: true, hasElevator: true, hasPool: false, distanceToCenter: 3.8, distanceToMetro: 0.6, viewScore: 7.5, district: 'Kadıköy', city: 'istanbul' as const },
    ];

    // Run anomaly detection
    const features = ports.map(p => [
      p.area, p.age, p.floor, p.distanceToCenter, p.distanceToMetro, p.viewScore,
    ]);
    const forest = new IsolationForest(100, 256).fit(features);
    const scores = features.map(f => forest.score(f));
    setAnomalyScores(scores);
    setPortfolio(ports);

    const val = m.value(DEFAULT_PROP);
    setValuation(val);
  }, []);

  useEffect(() => {
    if (model) {
      setValuation(model.value(prop));
    }
  }, [prop, model]);

  const update = (key: keyof Property, val: any) => setProp(p => ({ ...p, [key]: val }));

  return (
    <div className="p-4 space-y-4 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-12 gap-4">
        {/* Input Form */}
        <div className="col-span-4 metric-card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-purple-400" />
            <div className="text-sm font-semibold">Mülk Parametreleri</div>
          </div>
          <div className="text-xs text-muted-foreground">Hedonik fiyatlama modeli · OLS regresyon · R²={r2.toFixed(3)}</div>

          <div className="grid grid-cols-2 gap-3">
            {/* City */}
            <div className="col-span-2">
              <label className="block text-xs text-muted-foreground mb-1">Şehir</label>
              <div className="flex gap-2">
                {(['istanbul', 'athens'] as const).map(c => (
                  <button key={c} onClick={() => {
                    update('city', c);
                    update('district', c === 'istanbul' ? ISTANBUL_DISTRICTS[0] : ATHENS_DISTRICTS[0]);
                  }}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-all ${prop.city === c ? 'border-purple-400 text-purple-400' : 'border-border text-muted-foreground'}`}
                    style={prop.city === c ? { background: 'hsl(271 91% 65% / 0.1)' } : {}}>
                    {c === 'istanbul' ? '🇹🇷 İstanbul' : '🇬🇷 Atina'}
                  </button>
                ))}
              </div>
            </div>

            {/* District */}
            <div className="col-span-2">
              <label className="block text-xs text-muted-foreground mb-1">İlçe / Bölge</label>
              <select className="w-full text-xs bg-secondary border border-border rounded-lg px-2 py-1.5 text-foreground"
                value={prop.district} onChange={e => update('district', e.target.value)}>
                {(prop.city === 'istanbul' ? ISTANBUL_DISTRICTS : ATHENS_DISTRICTS).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Alan (m²): {prop.area}</label>
              <input type="range" min="40" max="400" value={prop.area}
                onChange={e => update('area', +e.target.value)}
                className="w-full accent-purple-400" />
            </div>

            {/* Rooms */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Oda Sayısı: {prop.rooms}</label>
              <input type="range" min="1" max="8" value={prop.rooms}
                onChange={e => update('rooms', +e.target.value)}
                className="w-full accent-purple-400" />
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Bina Yaşı: {prop.age}</label>
              <input type="range" min="0" max="40" value={prop.age}
                onChange={e => update('age', +e.target.value)}
                className="w-full accent-purple-400" />
            </div>

            {/* Floor */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Kat: {prop.floor}</label>
              <input type="range" min="1" max="20" value={prop.floor}
                onChange={e => update('floor', +e.target.value)}
                className="w-full accent-purple-400" />
            </div>

            {/* Dist center */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Merkeze uzaklık: {prop.distanceToCenter.toFixed(1)}km</label>
              <input type="range" min="0.5" max="25" step="0.5" value={prop.distanceToCenter}
                onChange={e => update('distanceToCenter', +e.target.value)}
                className="w-full accent-purple-400" />
            </div>

            {/* Dist metro */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Metro uzaklığı: {prop.distanceToMetro.toFixed(1)}km</label>
              <input type="range" min="0.1" max="5" step="0.1" value={prop.distanceToMetro}
                onChange={e => update('distanceToMetro', +e.target.value)}
                className="w-full accent-purple-400" />
            </div>

            {/* View score */}
            <div className="col-span-2">
              <label className="block text-xs text-muted-foreground mb-1">Manzara Skoru: {prop.viewScore}/10</label>
              <input type="range" min="0" max="10" step="0.5" value={prop.viewScore}
                onChange={e => update('viewScore', +e.target.value)}
                className="w-full accent-purple-400" />
            </div>

            {/* Checkboxes */}
            <div className="col-span-2 flex flex-wrap gap-2">
              {[
                { key: 'hasParking', label: 'Otopark' },
                { key: 'hasElevator', label: 'Asansör' },
                { key: 'hasPool', label: 'Yüzme Havuzu' },
              ].map(({ key, label }) => (
                <button key={key}
                  onClick={() => update(key as keyof Property, !prop[key as keyof Property])}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${prop[key as keyof Property] ? 'border-purple-400 text-purple-400' : 'border-border text-muted-foreground'}`}
                  style={prop[key as keyof Property] ? { background: 'hsl(271 91% 65% / 0.1)' } : {}}>
                  {prop[key as keyof Property] ? '✓ ' : ''}{label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Valuation Result */}
        <div className="col-span-4 space-y-3">
          {valuation && (
            <>
              <div className="metric-card text-center" style={{ background: 'linear-gradient(135deg, hsl(271 91% 65% / 0.08), hsl(199 95% 55% / 0.05))' }}>
                <div className="text-xs text-muted-foreground mb-1">Tahmini Piyasa Değeri</div>
                <div className="text-3xl font-bold font-mono gradient-text">
                  {prop.city === 'istanbul' ? '₺' : '€'}{(valuation.estimatedValue / 1000000).toFixed(2)}M
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  {prop.city === 'istanbul' ? '₺' : '€'}{valuation.pricePerSqm.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}/m²
                </div>
                <div className="flex justify-center gap-3 mt-2 text-xs font-mono">
                  <span className="text-muted-foreground">%95 Alt: {prop.city === 'istanbul' ? '₺' : '€'}{(valuation.lower95 / 1e6).toFixed(2)}M</span>
                  <span className="text-muted-foreground">Üst: {prop.city === 'istanbul' ? '₺' : '€'}{(valuation.upper95 / 1e6).toFixed(2)}M</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="text-xs font-semibold mb-3 text-foreground">Özellik Katkı Analizi</div>
                <div className="space-y-2">
                  {valuation.featureContributions.slice(0, 6).map(f => {
                    const pct = Math.abs(f.contribution / (valuation.estimatedValue || 1)) * 100;
                    return (
                      <div key={f.feature} className="space-y-0.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground capitalize">{
                            { area: 'Alan', rooms: 'Oda sayısı', age: 'Bina yaşı', floor: 'Kat', hasParking: 'Otopark', hasElevator: 'Asansör', hasPool: 'Havuz', distToCenter: 'Merkeze uzaklık', distToMetro: 'Metro mesafesi', viewScore: 'Manzara', locationPremium: 'Konum primi' }[f.feature] ?? f.feature
                          }</span>
                          <span className="font-mono" style={{ color: f.contribution > 0 ? '#10b981' : '#ef4444' }}>
                            {f.sign}{prop.city === 'istanbul' ? '₺' : '€'}{(Math.abs(f.contribution) / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${Math.min(100, pct * 3)}%`,
                            background: f.contribution > 0 ? '#10b981' : '#ef4444',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="metric-card">
                <div className="flex justify-between text-xs">
                  <div>
                    <div className="text-muted-foreground">Bölge ortalama</div>
                    <div className="font-mono font-bold">{prop.city === 'istanbul' ? '₺' : '€'}{(valuation.districtAvgPricePerSqm / 1000).toFixed(0)}K/m²</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Konum Primi</div>
                    <div className="font-mono font-bold">×{valuation.locationPremium.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Model R²</div>
                    <div className="font-mono font-bold">{r2.toFixed(3)}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Portfolio */}
        <div className="col-span-4 metric-card">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <div className="text-sm font-semibold">Portföy Analizi</div>
          </div>
          <div className="space-y-2">
            {portfolio.map((p, i) => {
              const val = model?.value(p);
              const anomScore = anomalyScores[i] ?? 0;
              const isAnom = anomScore > 0.6;
              return (
                <div key={i} className="p-2.5 rounded-lg border border-border card-hover" style={{ background: 'hsl(222 47% 5%)' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-foreground">{p.district} · {p.area}m² · {p.rooms}+1</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {p.age} yaş · {p.floor}. kat{p.hasParking ? ' · Otopark' : ''}{p.hasPool ? ' · Havuz' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-foreground">
                        ₺{((val?.estimatedValue ?? 0) / 1e6).toFixed(2)}M
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        ₺{((val?.pricePerSqm ?? 0) / 1000).toFixed(0)}K/m²
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5">
                      {isAnom ? (
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      )}
                      <span className="text-xs" style={{ color: isAnom ? '#f59e0b' : '#10b981', fontSize: '10px' }}>
                        IF Skor: {anomScore.toFixed(3)} {isAnom ? '— Anomali!' : '— Normal'}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground" style={{ fontSize: '10px' }}>
                      R² {r2.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Emlak Haberleri */}
      <NewsStrip category="emlak" limit={6} />
    </div>
  );
}
