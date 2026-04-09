/**
 * GRISTA — Sağlık & İyi Haberler
 * Dünyanın her yerinden iyi haberler — sadece başlık
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Clock, Globe, Heart } from 'lucide-react';
import { NewsItem } from '@/lib/data/liveData';

// ─── Resim ───────────────────────────────────────────────────────────────────

const HEALTH_KEYWORDS = [
  'health,wellness,nature',
  'medical,science,research',
  'fitness,yoga,meditation',
  'food,nutrition,healthy',
  'nature,forest,green',
  'sunrise,sky,peaceful',
  'flowers,garden,beauty',
  'ocean,water,calm',
  'running,sport,active',
  'vegetables,fruit,diet',
];

function healthImage(item: NewsItem): string {
  if (item.image) return item.image;
  const hash = item.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const kw = HEALTH_KEYWORDS[hash % HEALTH_KEYWORDS.length];
  const lock = hash % 500;
  return `https://loremflickr.com/800/500/${kw}?lock=${lock}`;
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`;
  if (s < 3600) return `${Math.floor(s / 60)}dk`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa`;
  return `${Math.floor(s / 86400)} gün`;
}

// ─── Haber Kartı ─────────────────────────────────────────────────────────────

function HealthCard({ item, delay = 0 }: { item: NewsItem; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const imgSrc = healthImage(item);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(id);
  }, [delay]);

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl overflow-hidden relative group"
      style={{
        height: 280,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
        textDecoration: 'none',
        border: '1px solid rgba(16,185,129,0.18)',
      }}
    >
      {/* Resim — tam kart, filtre yok */}
      {imgOk ? (
        <img
          src={imgSrc}
          alt=""
          onError={() => setImgOk(false)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), hsl(222 47% 10%))' }}
        />
      )}

      {/* Gradient sadece alt bant */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(5,13,26,0.97) 0%, rgba(5,13,26,0.88) 22%, rgba(5,13,26,0.08) 52%, rgba(5,13,26,0.00) 68%)',
        }}
      />

      {/* Üst yeşil çizgi */}
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: 'linear-gradient(to right, #10b981, #34d399)' }} />

      {/* İçerik — alta yapışık */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-3 pt-2">
        <h2
          className="font-bold text-white leading-snug mb-1.5"
          style={{ fontSize: 'clamp(13px, 2.2vw, 17px)', lineHeight: 1.3 }}
        >
          {item.title}
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
            <Globe className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[170px]">{item.source}</span>
          </div>
          <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.30)' }}>
            {timeAgo(item.pubDate)}
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function HealthPage() {
  const [news, setNews]       = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpd, setLastUpd] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);
  const countRef = useRef(30);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/news/healthgood');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setNews(data);
          setLastUpd(new Date());
        }
      }
    } catch { /* sessiz */ }
    setLoading(false);
    setRefreshing(false);
    countRef.current = 30;
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(() => {
      countRef.current -= 1;
      setCountdown(countRef.current);
      if (countRef.current <= 0) load();
    }, 1000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="p-4 space-y-4 max-w-screen-lg mx-auto">

      {/* Başlık */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5" style={{ color: '#10b981' }} />
            <h1 className="text-lg font-bold">Sağlık & İyi Haberler</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
              CANLI
            </span>
          </div>
          {lastUpd && (
            <p className="text-xs font-mono mt-0.5" style={{ color: 'hsl(215 20% 45%)' }}>
              Dünyanın her yerinden · {news.length} haber · {lastUpd.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} · {countdown}sn
            </p>
          )}
        </div>
        <button
          onClick={() => load()} disabled={refreshing}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Kartlar */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse"
              style={{ height: 280, background: 'hsl(222 47% 8%)', opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'hsl(222 47% 8%)' }}>
          <Heart className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: '#10b981' }} />
          <p className="text-muted-foreground">Haberler yükleniyor...</p>
          <button onClick={() => load()} className="mt-3 text-sm underline" style={{ color: '#10b981' }}>
            Tekrar dene
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {news.map((item, i) => (
            <HealthCard key={item.id} item={item} delay={Math.min(i * 40, 800)} />
          ))}
          <p className="text-center text-xs font-mono py-4" style={{ color: 'hsl(215 20% 40%)' }}>
            <Clock className="w-3 h-3 inline mr-1" />
            Sonraki: {countdown}sn
          </p>
        </div>
      )}
    </div>
  );
}
