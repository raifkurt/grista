import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchTickerData, TickerItem } from '@/lib/data/liveData';

// Simüle fallback (API henüz yanıt vermeden önce gösterilir)
const INITIAL_TICKERS: TickerItem[] = [
  { symbol: 'USD/TRY', price: 35.50,   change:  0.0018, isLive: false },
  { symbol: 'EUR/TRY', price: 38.70,   change:  0.0012, isLive: false },
  { symbol: 'XAU/USD', price: 2385,    change:  0.0041, isLive: false },
  { symbol: 'BTC/USD', price: 68491,   change: -0.0087, isLive: false },
  { symbol: 'ETH/USD', price: 3540,    change:  0.0123, isLive: false },
  { symbol: 'BRENT',   price: 85.21,   change:  0.0012, isLive: false },
  { symbol: 'IST.AVG ₺/m²', price: 118269, change: 0.0028, isLive: false },
];

function fmtPrice(price: number): string {
  if (price > 10_000) return price.toLocaleString('tr-TR', { maximumFractionDigits: 0 });
  if (price > 100)    return price.toLocaleString('tr-TR', { maximumFractionDigits: 1 });
  if (price > 1)      return price.toFixed(4);
  return price.toFixed(5);
}

export default function TickerTape() {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);
  const [liveCount, setLiveCount] = useState(0);

  const load = async () => {
    try {
      const data = await fetchTickerData();
      if (data.length > 0) {
        setTickers(data);
        setLiveCount(data.filter(t => t.isLive).length);
      }
    } catch { /* simüle verilerle devam et */ }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000); // Her 60 sn güncelle
    return () => clearInterval(id);
  }, []);

  const items = [...tickers, ...tickers]; // kesintisiz döngü için tekrarla

  return (
    <div
      className="h-7 border-b border-border overflow-hidden flex items-center flex-shrink-0"
      style={{ background: 'hsl(222 47% 5.5%)' }}
    >
      {/* "CANLI" veya "GERÇEK" etiketi */}
      <div
        className="flex-shrink-0 px-3 border-r border-border text-xs font-mono font-semibold flex items-center gap-1.5"
        style={{ color: 'hsl(199 95% 55%)', fontSize: '10px', height: '100%' }}
      >
        {liveCount > 0 ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot inline-block" />
            GERÇEK
          </>
        ) : 'CANLI'}
      </div>

      {/* Kayan bant */}
      <div className="overflow-hidden flex-1 relative">
        <div className="flex gap-8 ticker-tape whitespace-nowrap">
          {items.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {/* Canlı göstergesi */}
              {t.isLive && (
                <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block" />
              )}
              <span
                className="font-mono font-semibold text-muted-foreground"
                style={{ fontSize: '10px' }}
              >
                {t.symbol}
              </span>
              <span
                className="font-mono font-bold tabular-nums"
                style={{
                  color: t.change >= 0 ? 'hsl(158 64% 52%)' : 'hsl(0 84% 60%)',
                  fontSize: '11px',
                }}
              >
                {fmtPrice(t.price)}
              </span>
              <span
                className="flex items-center gap-0.5 font-mono"
                style={{
                  color: t.change >= 0 ? 'hsl(158 64% 52%)' : 'hsl(0 84% 60%)',
                  fontSize: '10px',
                }}
              >
                {t.change >= 0
                  ? <TrendingUp className="w-2.5 h-2.5" />
                  : <TrendingDown className="w-2.5 h-2.5" />}
                {t.change >= 0 ? '+' : ''}{(t.change * 100).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
