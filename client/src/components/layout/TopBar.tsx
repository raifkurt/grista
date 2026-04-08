import { useLocation } from 'wouter';
import { Bell, RefreshCw, Wifi, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const PAGE_TITLES: Record<string, { title: string; desc: string }> = {
  '/': { title: 'Komuta Merkezi', desc: 'Gerçek zamanlı zeka paneli' },
  '/live':   { title: 'Canlı Akış',    desc: 'Finans · Emlak · Sağlık — Gerçek zamanlı haberler' },
  '/health':  { title: 'Sağlık & İyi Haberler', desc: 'Dünyanın her yerinden pozitif haberler · Wellness' },
  '/cities': { title: 'İstanbul & Atina', desc: 'Gayrimenkul haberleri · Türkçe + Yunanca kaynak · Otomatik çeviri' },
  '/market': { title: 'Piyasa İstihbaratı', desc: 'ARIMA + Kalman tahminleri · İstanbul & Atina' },
  '/property': { title: 'Emlak Değerleme Motoru', desc: 'Hedonik fiyatlama modeli · OLS regresyon' },
  '/financial': { title: 'Finansal Risk Analizi', desc: 'Monte Carlo simülasyonu · VaR & CVaR' },
  '/wellness': { title: 'Sağlık & Wellness Optimizasyonu', desc: 'Farmakokiuetik modelleme · Supplement yönetimi' },
  '/marketing': { title: 'Pazarlama Analitik', desc: 'Shapley değeri atıf modeli · Meta & Google' },
  '/agents': { title: 'Ajan Orkestra Sistemi', desc: 'BDI mimarisi · Çoklu ajan koordinasyonu' },
};

export default function TopBar() {
  const [location] = useLocation();
  const [time, setTime] = useState(new Date());
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setPulse(p => !p);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const page = PAGE_TITLES[location] ?? PAGE_TITLES['/'];

  return (
    <header className="h-12 border-b border-border flex items-center justify-between px-3 md:px-4 flex-shrink-0"
      style={{ background: 'hsl(222 47% 6.5%)' }}>

      {/* Sol: Başlık */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Mobilde GRISTA logosu */}
        <div className="md:hidden flex-shrink-0">
          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
            <polygon points="10,1 19,5.5 19,14.5 10,19 1,14.5 1,5.5"
              stroke="hsl(199 95% 55%)" strokeWidth="1.5" fill="hsl(199 95% 55% / 0.1)" />
            <circle cx="10" cy="10" r="3" fill="hsl(199 95% 55%)" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">{page.title}</h1>
          <p className="topbar-desc text-xs text-muted-foreground hidden md:block">{page.desc}</p>
        </div>
      </div>

      {/* Sağ: Göstergeler */}
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className={`w-1.5 h-1.5 rounded-full ${pulse ? 'bg-emerald-400' : 'bg-emerald-600'} transition-colors`} />
          <span className="text-muted-foreground font-mono text-xs">CANLI</span>
        </div>

        {/* Connection — sadece desktop */}
        <div className="topbar-wifi hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span className="font-mono">12ms</span>
        </div>

        {/* Clock — sadece desktop */}
        <div className="topbar-clock hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="font-mono tabular-nums">
            {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Refresh */}
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          onClick={() => window.location.reload()}
          data-testid="btn-refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Notifications */}
        <button className="relative p-1 rounded hover:bg-secondary transition-colors" data-testid="btn-notifications">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
        </button>
      </div>
    </header>
  );
}
