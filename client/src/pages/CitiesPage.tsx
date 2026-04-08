/**
 * GRISTA — İstanbul & Atina Şehir Nabzı
 * Sadece bu iki şehirde olup bitenler
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Clock, ExternalLink, MapPin, Globe } from 'lucide-react';
import { fetchCitiesNews, NewsItem } from '@/lib/data/liveData';

// ─── Açıklama Temizleyici ──────────────────────────────────────────────────

/**
 * Google News RSS'te description genellikle başlığı tekrar eder.
 * Eğer description başlıkla çok benzer/aynıysa gösterme.
 */
function getSummary(title: string, desc: string): string | null {
  if (!desc || desc.length < 25) return null;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9ğüşıöçα-ω]/gi, '').slice(0, 60);
  const t = norm(title);
  const d = norm(desc);
  // description başlığın ilk kısmıyla başlıyorsa → tekrar
  if (t.length > 20 && d.startsWith(t.slice(0, 30))) return null;
  if (d.length > 20 && t.startsWith(d.slice(0, 30))) return null;
  return desc;
}

// ─── Resim ───────────────────────────────────────────────────────────────────

function articleImage(item: NewsItem, city: 'istanbul' | 'athens'): string {
  if (item.image) return item.image;
  const hash = item.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 1000;
  const kw = city === 'istanbul'
    ? 'istanbul,turkey,bosphorus,city'
    : 'athens,greece,acropolis,city';
  return `https://loremflickr.com/800/500/${kw}?lock=${hash}`;
}

// ─── Zaman ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`;
  if (s < 3600) return `${Math.floor(s / 60)}dk`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa`;
  return `${Math.floor(s / 86400)} gün`;
}

// ─── Haber Kartı ─────────────────────────────────────────────────────────────

function NewsCard({ item, city, delay = 0 }: {
  item: NewsItem;
  city: 'istanbul' | 'athens';
  delay?: number;
}) {
  const accent = city === 'istanbul' ? '#0BC5EA' : '#a78bfa';
  const imgSrc = articleImage(item, city);
  const [visible, setVisible] = useState(false);
  const [imgOk, setImgOk] = useState(true);

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
        minHeight: 260,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(14px)',
        transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
        textDecoration: 'none',
        border: `1px solid ${accent}20`,
      }}
    >
      {/* Resim */}
      {imgOk && (
        <img
          src={imgSrc}
          alt=""
          onError={() => setImgOk(false)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 1.0 }}
        />
      )}

      {/* Altta ince okunabilirlik gradyanı — resmin büyük kısmı açık kalır */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(5,13,26,0.94) 0%, rgba(5,13,26,0.80) 28%, rgba(5,13,26,0.20) 58%, rgba(5,13,26,0.00) 78%)',
        }}
      />

      {/* Accent çizgisi */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: accent }} />

      {/* İçerik */}
      <div className="relative z-10 p-4 flex flex-col justify-end" style={{ minHeight: 260 }}>

        {/* Üst: zaman + çeviri */}
        <div className="flex items-center gap-2 mb-3">
          {item.isNew && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full animate-pulse"
              style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
              ● YENİ
            </span>
          )}
          {(item as any).translated && (
            <span className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ background: 'rgba(167,139,250,0.2)', color: '#a78bfa' }}>
              🌐 ÇEVİRİLDİ
            </span>
          )}
          <div className="ml-auto flex items-center gap-1 text-xs"
            style={{ color: 'rgba(255,255,255,0.45)' }}>
            <Clock className="w-3 h-3" />
            {timeAgo(item.pubDate)}
          </div>
        </div>

        {/* Başlık */}
        <h3
          className="font-bold text-white leading-snug mb-2"
          style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', lineHeight: 1.35 }}
        >
          {item.title}
        </h3>



        {/* Kaynak + oku */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs"
            style={{ color: 'rgba(255,255,255,0.35)' }}>
            <Globe className="w-3 h-3" />
            <span className="truncate max-w-[160px]">{item.source}</span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: accent }}>
            <ExternalLink className="w-3 h-3" />
            Oku
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Şehir Sütunu ─────────────────────────────────────────────────────────────

function CityColumn({
  city, flag, name, accent, items, loading,
}: {
  city: 'istanbul' | 'athens';
  flag: string;
  name: string;
  accent: string;
  items: NewsItem[];
  loading: boolean;
}) {
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-4">

      {/* Şehir başlığı */}
      <div className="sticky top-0 z-10 flex items-center justify-between py-3 px-1"
        style={{
          background: 'hsl(222 47% 5%)',
          borderBottom: `2px solid ${accent}`,
        }}>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{flag}</span>
          <div>
            <div className="font-bold text-lg tracking-wide" style={{ color: accent }}>
              {name.toUpperCase()}
            </div>
            <div className="text-xs font-mono flex items-center gap-1.5"
              style={{ color: 'hsl(215 20% 45%)' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: pulse ? '#10b981' : '#065f46', transition: 'background 0.5s' }} />
              {loading ? 'Yükleniyor...' : `${items.length} haber · canlı`}
            </div>
          </div>
        </div>
        <MapPin className="w-4 h-4" style={{ color: accent, opacity: 0.5 }} />
      </div>

      {/* Haberler */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse"
              style={{ height: 240, background: 'hsl(222 47% 8%)', opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <NewsCard
              key={item.id}
              item={item}
              city={city}
              delay={Math.min(i * 50, 800)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function CitiesPage() {
  const [istanbul, setIstanbul] = useState<NewsItem[]>([]);
  const [athens, setAthens]     = useState<NewsItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpd, setLastUpd]   = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(180);
  const [mobileCity, setMobileCity] = useState<'istanbul' | 'athens'>('istanbul');
  const countRef = useRef(180);

  const load = useCallback(async (force = false) => {
    setRefreshing(true);
    try {
      const data = await fetchCitiesNews();
      if (data.istanbul?.length || data.athens?.length) {
        setIstanbul(data.istanbul ?? []);
        setAthens(data.athens ?? []);
        setLastUpd(new Date());
      }
    } catch { /* sessiz */ }
    setLoading(false);
    setRefreshing(false);
    countRef.current = 180;
  }, []);

  useEffect(() => { load(true); }, [load]);

  useEffect(() => {
    const id = setInterval(() => {
      countRef.current -= 1;
      setCountdown(countRef.current);
      if (countRef.current <= 0) load(true);
    }, 1000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="max-w-screen-2xl mx-auto">

      {/* Üst bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'hsl(var(--border))' }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold">🇹🇷 İstanbul</span>
            <span style={{ color: 'hsl(215 20% 40%)' }}>·</span>
            <span className="font-bold">🇬🇷 Atina</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full ml-1"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
              CANLI
            </span>
          </div>
          {lastUpd && (
            <p className="text-xs font-mono mt-0.5" style={{ color: 'hsl(215 20% 45%)' }}>
              {istanbul.length + athens.length} haber · {lastUpd.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} · {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
            </p>
          )}
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Mobil sekme */}
      <div className="flex md:hidden gap-2 p-3 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        {([['istanbul', '🇹🇷 İstanbul', '#0BC5EA'], ['athens', '🇬🇷 Atina', '#a78bfa']] as const).map(([id, label, clr]) => (
          <button key={id} onClick={() => setMobileCity(id)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: mobileCity === id ? `${clr}18` : 'transparent',
              color: mobileCity === id ? clr : 'hsl(215 20% 50%)',
              border: `1px solid ${mobileCity === id ? clr + '44' : 'transparent'}`,
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* İki sütun */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6 p-3 md:p-4">

        <div className={mobileCity === 'istanbul' ? 'block' : 'hidden md:block'}>
          <CityColumn
            city="istanbul" flag="🇹🇷" name="İstanbul"
            accent="#0BC5EA"
            items={istanbul}
            loading={loading}
          />
        </div>

        <div className={mobileCity === 'athens' ? 'block' : 'hidden md:block'}>
          <CityColumn
            city="athens" flag="🇬🇷" name="Atina"
            accent="#a78bfa"
            items={athens}
            loading={loading}
          />
        </div>

      </div>
    </div>
  );
}
