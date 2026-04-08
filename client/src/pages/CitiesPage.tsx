/**
 * GRISTA — İstanbul & Atina Şehir Haberleri
 * Maksimum akıcılık, otomatik yenileme, yan yana görünüm
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, RefreshCw, Clock, Globe, ExternalLink, TrendingUp, MapPin, Zap } from 'lucide-react';
import { fetchCitiesNews, NewsItem } from '@/lib/data/liveData';

// ─── Haber resmi ────────────────────────────────────────────────────────────────

const CAT_KEYWORDS: Record<string, string> = {
  istanbul: 'istanbul,turkey,bosphorus',
  athens: 'athens,greece,acropolis',
  finans: 'finance,economy,business',
  emlak: 'architecture,building,real+estate',
  saglik: 'health,wellness,medical',
};

function articleImage(item: NewsItem, catKeyword = 'istanbul'): string {
  if (item.image) return item.image;
  const hash = item.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 1000;
  const kw = CAT_KEYWORDS[catKeyword] || CAT_KEYWORDS.istanbul;
  return `https://loremflickr.com/800/450/${kw}?lock=${hash}`;
}

// ─── Zaman yardımcısı ─────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`;
  if (s < 3600) return `${Math.floor(s / 60)}dk`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa`;
  return `${Math.floor(s / 86400)} gün`;
}

// ─── Canlı nokta animasyonu ───────────────────────────────────────────────────

function LiveDot({ color = '#10b981' }: { color?: string }) {
  const [on, setOn] = useState(true);
  useEffect(() => { const id = setInterval(() => setOn(v => !v), 900); return () => clearInterval(id); }, []);
  return <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: on ? color : color + '44', transition: 'background 0.4s' }} />;
}

// ─── Haber kartı (büyük, akıcı) ───────────────────────────────────────────────

function NewsCard({ item, accent, delay = 0, catKey = 'istanbul' }: { item: NewsItem; accent: string; delay?: number; catKey?: string }) {
  const [visible, setVisible] = useState(false);
  const imgSrc = articleImage(item, catKey);
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
      className="block rounded-2xl overflow-hidden relative group cursor-pointer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
        textDecoration: 'none',
        minHeight: 200,
        background: `linear-gradient(160deg, hsl(222 47% 8%) 0%, hsl(222 47% 6%) 100%)`,
        border: `1px solid ${accent}22`,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}55`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}22`; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
      {/* Arka plan resmi */}
      {imgOk && (
        <img src={imgSrc} alt="" onError={() => setImgOk(false)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.45 }} />
      )}

      {/* Sol accent çizgisi */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: accent }} />

      {/* İçerik */}
      <div className="relative z-10 p-4 pl-5 flex flex-col gap-2.5" style={{ minHeight: 200 }}>

        {/* Üst bilgi şeridi */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md"
            style={{ background: `${accent}18`, color: accent }}>
            <Building2 className="w-2.5 h-2.5 inline mr-1" />
            EMLAK
          </span>
          {item.isNew && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-md animate-pulse"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              ● YENİ
            </span>
          )}
          {(item as any).translated && (
            <span className="text-xs px-2 py-0.5 rounded-md font-mono"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: 9 }}>
              🌐 ÇEVİRİLDİ
            </span>
          )}
          <div className="ml-auto flex items-center gap-1 text-xs" style={{ color: 'hsl(215 20% 45%)' }}>
            <Clock className="w-3 h-3" />
            {timeAgo(item.pubDate)}
          </div>
        </div>

        {/* Başlık */}
        <h3 className="font-bold leading-snug text-white group-hover:text-opacity-90"
          style={{ fontSize: 'clamp(13px, 2vw, 16px)', lineHeight: 1.4 }}>
          {item.title}
        </h3>

        {/* Özet */}
        {item.description && item.description.length > 20 && (
          <p className="text-xs leading-relaxed"
            style={{ color: 'hsl(215 20% 55%)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.description}
          </p>
        )}

        {/* Alt: kaynak + oku */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'hsl(215 20% 40%)' }}>
            <Globe className="w-3 h-3" />
            <span className="truncate max-w-[140px]">{item.source}</span>
          </div>
          <span className="flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: accent }}>
            <ExternalLink className="w-3 h-3" />
            Oku
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Şehir sütunu ─────────────────────────────────────────────────────────────

function CityColumn({
  flag, name, items, accent, loading, count,
}: {
  flag: string; name: string; items: NewsItem[]; accent: string; loading: boolean; count: number;
}) {
  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Başlık */}
      <div className="flex items-center gap-2 sticky top-0 z-10 py-2 px-1"
        style={{ background: 'hsl(222 47% 5%)', borderBottom: `1px solid ${accent}22` }}>
        <span className="text-xl">{flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base">{name}</h2>
            <LiveDot color={accent} />
          </div>
          <p className="text-xs font-mono" style={{ color: 'hsl(215 20% 45%)' }}>
            {loading ? 'Yükleniyor…' : `${count} haber · Gayrimenkul odaklı`}
          </p>
        </div>
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse"
              style={{ height: 180, background: 'hsl(222 47% 8%)', opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'hsl(222 47% 8%)' }}>
          <Zap className="w-8 h-8 mx-auto mb-3 opacity-20" />
          <p className="text-sm text-muted-foreground">Haberler yükleniyor…</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <NewsCard key={item.id} item={item} accent={accent} catKey={name === 'İstanbul' ? 'istanbul' : 'athens'} delay={Math.min(i * 40, 600)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function CitiesPage() {
  const [istanbul, setIstanbul] = useState<NewsItem[]>([]);
  const [athens,   setAthens]   = useState<NewsItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpd, setLastUpd] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(180);
  const [mobileCityTab, setMobileCityTab] = useState<'istanbul' | 'athens'>('istanbul');
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
    } catch { /* sessiz hata */ }
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
    <div className="p-3 md:p-4 space-y-4 max-w-screen-2xl mx-auto">

      {/* ── Başlık ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: '#0BC5EA' }} />
            <h1 className="text-base font-bold">İstanbul & Atina Gayrimenkul</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
              CANLI
            </span>
          </div>
          {lastUpd && (
            <p className="text-xs font-mono mt-0.5" style={{ color: 'hsl(215 20% 45%)' }}>
              {istanbul.length + athens.length} haber · {lastUpd.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} · Sonraki: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
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

      {/* ── Mobil tab ── */}
      <div className="flex md:hidden gap-2 p-1 rounded-xl" style={{ background: 'hsl(222 47% 8%)', border: '1px solid hsl(var(--border))' }}>
        {([['istanbul', '🇹🇷 İstanbul', '#0BC5EA'], ['athens', '🇬🇷 Atina', '#8b5cf6']] as const).map(([id, label, color]) => (
          <button key={id} onClick={() => setMobileCityTab(id)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: mobileCityTab === id ? `${color}18` : 'transparent',
              color: mobileCityTab === id ? color : 'hsl(215 20% 50%)',
              border: mobileCityTab === id ? `1px solid ${color}44` : '1px solid transparent',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Masaüstü: iki sütun | Mobil: tekli ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

        {/* İstanbul */}
        <div className={mobileCityTab === 'istanbul' ? 'block' : 'hidden md:block'}>
          <CityColumn
            flag="🇹🇷" name="İstanbul"
            items={istanbul}
            accent="#0BC5EA"
            loading={loading}
            count={istanbul.length}
          />
        </div>

        {/* Atina */}
        <div className={mobileCityTab === 'athens' ? 'block' : 'hidden md:block'}>
          <CityColumn
            flag="🇬🇷" name="Atina"
            items={athens}
            accent="#8b5cf6"
            loading={loading}
            count={athens.length}
          />
        </div>
      </div>
    </div>
  );
}
