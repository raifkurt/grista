/**
 * NEXUS — Canlı Haber Akışı (Instagram-stil büyük kartlar)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DollarSign, Building2, Heart, RefreshCw, ExternalLink,
  Clock, Globe, Zap, TrendingUp, TrendingDown,
} from 'lucide-react';
import {
  fetchAllNews, fetchLiveForex, fetchLiveCrypto,
  NewsItem, NewsCategory, LiveForex, LiveCrypto,
} from '@/lib/data/liveData';

// ─── Haber resmi ────────────────────────────────────────────────────────────

const CAT_KW: Record<string, string> = {
  finans:  'finance,economy,stock+market',
  emlak:   'architecture,building,real+estate',
  saglik:  'health,wellness,doctor',
};

function articleImg(item: NewsItem): string {
  if (item.image) return item.image;
  const hash = item.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 1000;
  const kw = CAT_KW[item.category] || 'city,architecture';
  return `https://loremflickr.com/800/450/${kw}?lock=${hash}`;
}

// ─── Sabitler ─────────────────────────────────────────────────────────────

const CAT: Record<NewsCategory, {
  label: string; short: string; color: string;
  grad: string; Icon: any;
}> = {
  finans: {
    label: 'Finans', short: 'FİNANS',
    color: '#0BC5EA',
    grad: 'linear-gradient(135deg,#0a2540 0%,#0e3a5f 50%,#0BC5EA22 100%)',
    Icon: DollarSign,
  },
  emlak: {
    label: 'Emlak', short: 'EMLAK',
    color: '#8b5cf6',
    grad: 'linear-gradient(135deg,#1a0a40 0%,#2d1266 50%,#8b5cf622 100%)',
    Icon: Building2,
  },
  saglik: {
    label: 'Sağlık', short: 'SAĞLIK',
    color: '#10b981',
    grad: 'linear-gradient(135deg,#051f17 0%,#093d2b 50%,#10b98122 100%)',
    Icon: Heart,
  },
};

// ─── Yardımcılar ─────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`;
  if (s < 3600) return `${Math.floor(s / 60)}dk`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa`;
  return `${Math.floor(s / 86400)}g`;
}

function fmtNum(n: number, d = 2) {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
}

// ─── Canlı gösterge ────────────────────────────────────────────────────────

function LiveDot() {
  const [on, setOn] = useState(true);
  useEffect(() => { const id = setInterval(() => setOn(v => !v), 800); return () => clearInterval(id); }, []);
  return <span className="inline-block w-2 h-2 rounded-full" style={{ background: on ? '#10b981' : '#065f46', transition: 'background 0.3s' }} />;
}

// ─── Döviz şeridi ─────────────────────────────────────────────────────────

function PriceChip({ sym, price, chg, live }: { sym: string; price: number; chg: number; live: boolean }) {
  const up = chg >= 0;
  return (
    <div className="flex-shrink-0 px-3 py-2 rounded-xl border flex flex-col gap-0.5"
      style={{ background: 'hsl(222 47% 8%)', borderColor: 'hsl(217 33% 17%)' }}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-mono text-muted-foreground">{sym}</span>
        {live && <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block" />}
      </div>
      <span className="font-mono font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>
        {price > 1000 ? price.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : fmtNum(price)}
      </span>
      <span className="flex items-center gap-0.5 text-xs font-mono" style={{ color: up ? '#10b981' : '#ef4444' }}>
        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {up ? '+' : ''}{(chg * 100).toFixed(2)}%
      </span>
    </div>
  );
}

// ─── Instagram-stil büyük haber kartı ──────────────────────────────────────

function NewsCard({ item }: { item: NewsItem }) {
  const cat = CAT[item.category];
  const imgSrc = articleImg(item);
  const [imgOk, setImgOk] = useState(true);

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl overflow-hidden relative group"
      style={{
        background: cat.grad,
        border: `1px solid ${cat.color}30`,
        textDecoration: 'none',
        minHeight: 280,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {/* Arka plan resmi */}
      {imgOk && (
        <img
          src={imgSrc}
          alt=""
          onError={() => setImgOk(false)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.45 }}
        />
      )}

      {/* Gradyan overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 55%, rgba(0,0,0,0.25) 100%)' }}
      />

      {/* İçerik */}
      <div className="relative z-10 flex flex-col justify-between p-5" style={{ minHeight: 280 }}>

        {/* Üst: Kategori + Yeni + Zaman */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-full"
              style={{ background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}55` }}
            >
              <cat.Icon className="w-3 h-3" />
              {cat.short}
            </span>
            {item.isNew && (
              <span
                className="text-xs font-mono font-bold px-2 py-0.5 rounded-full animate-pulse"
                style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)' }}
              >
                ● YENİ
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-white/50 font-mono">
            <Clock className="w-3 h-3" />
            {timeAgo(item.pubDate)}
          </div>
        </div>

        {/* Alt: Başlık + Özet + Kaynak */}
        <div>
          <h2
            className="font-bold leading-snug text-white mb-2"
            style={{ fontSize: 'clamp(15px, 2.5vw, 20px)', lineHeight: 1.35 }}
          >
            {item.title}
          </h2>

          {item.description && (
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.65)', WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {item.description}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <Globe className="w-3 h-3" />
              <span className="truncate max-w-[180px]">{item.source}</span>
            </div>
            <span
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `${cat.color}20`, color: cat.color }}
            >
              <ExternalLink className="w-3 h-3" />
              Haberi oku
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

// ─── Ana sayfa ─────────────────────────────────────────────────────────────

export default function LiveFeedPage() {
  const [news, setNews]     = useState<NewsItem[]>([]);
  const [forex, setForex]   = useState<LiveForex | null>(null);
  const [crypto, setCrypto] = useState<LiveCrypto | null>(null);
  const [filter, setFilter] = useState<NewsCategory | 'all'>('all');
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpd, setLastUpd] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(180);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const prevIds = useRef<Set<string>>(new Set());
  const countRef = useRef(180);

  const loadNews = useCallback(async (force = false) => {
    setRefreshing(true);
    const items = await fetchAllNews(force);
    if (items.length) {
      const fresh = new Set(items.filter(i => !prevIds.current.has(i.id)).map(i => i.id));
      setNewIds(fresh);
      prevIds.current = new Set(items.map(i => i.id));
      setTimeout(() => setNewIds(new Set()), 10_000);
      setNews(items);
      setLastUpd(new Date());
    }
    setLoading(false);
    setRefreshing(false);
    countRef.current = 180;
  }, []);

  const loadPrices = useCallback(async () => {
    const [f, c] = await Promise.all([fetchLiveForex(), fetchLiveCrypto()]);
    setForex(f);
    setCrypto(c);
  }, []);

  useEffect(() => { loadNews(true); loadPrices(); }, [loadNews, loadPrices]);
  useEffect(() => {
    const id = setInterval(() => {
      countRef.current -= 1;
      setCountdown(countRef.current);
      if (countRef.current <= 0) loadNews(true);
    }, 1000);
    return () => clearInterval(id);
  }, [loadNews]);
  useEffect(() => {
    const id = setInterval(loadPrices, 60_000);
    return () => clearInterval(id);
  }, [loadPrices]);

  const filtered = filter === 'all' ? news : news.filter(n => n.category === filter);

  return (
    <div className="p-4 space-y-5 max-w-screen-lg mx-auto">

      {/* ── Başlık ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <LiveDot />
            <h1 className="text-lg font-bold">Canlı Haber Akışı</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            Google Haberler · Reuters · CoinGecko · Frankfurter
            {lastUpd && ` · ${lastUpd.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
          </span>
          <button
            onClick={() => loadNews(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </div>

      {/* ── Canlı fiyat şeridi ── */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {forex ? (
          <>
            <PriceChip sym="USD/TRY" price={forex.usdtry} chg={(forex.usdtry - forex.prev.usdtry) / forex.prev.usdtry} live />
            <PriceChip sym="EUR/TRY" price={forex.eurtry} chg={(forex.eurtry - forex.prev.eurtry) / forex.prev.eurtry} live />
            <PriceChip sym="EUR/USD" price={forex.eurusd} chg={(forex.eurusd - 1.085) / 1.085} live />
            {forex.date && (
              <div className="flex-shrink-0 self-center text-xs font-mono text-muted-foreground px-2">
                ECB · {forex.date}
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 py-2">
            <RefreshCw className="w-3 h-3 animate-spin" /> Fiyatlar çekiliyor…
          </div>
        )}
        {crypto && (
          <>
            <PriceChip sym="BTC/USD" price={crypto.btcusd} chg={crypto.btcChange24h / 100} live />
            <PriceChip sym="ETH/USD" price={crypto.ethusd} chg={crypto.ethChange24h / 100} live />
          </>
        )}
      </div>

      {/* ── Filtreler ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          ['all',    'Tümü',   '#ffffff', 'rgba(255,255,255,0.08)'] as const,
          ['finans', 'Finans', CAT.finans.color, `${CAT.finans.color}18`] as const,
          ['emlak',  'Emlak',  CAT.emlak.color,  `${CAT.emlak.color}18`] as const,
          ['saglik', 'Sağlık', CAT.saglik.color, `${CAT.saglik.color}18`] as const,
        ]).map(([id, lbl, clr, bg]) => (
          <button key={id} onClick={() => setFilter(id as any)}
            className="text-sm px-4 py-1.5 rounded-full border font-medium transition-all"
            style={{
              background: filter === id ? bg : 'transparent',
              color: filter === id ? clr : 'hsl(215 20% 50%)',
              borderColor: filter === id ? `${clr}66` : 'hsl(var(--border))',
            }}
          >
            {lbl}
            {id !== 'all' && (
              <span className="ml-2 opacity-50 text-xs">
                {news.filter(n => n.category === id).length}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} haber</span>
      </div>

      {/* ── Haber kartları (Instagram-stil) ── */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse"
              style={{ height: 280, background: 'hsl(222 47% 8%)', opacity: 1 - i * 0.18 }} />
          ))}
          <p className="text-center text-xs text-muted-foreground py-2 flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            Google Haberler RSS bağlanıyor…
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl text-center py-20 text-muted-foreground"
          style={{ background: 'hsl(222 47% 8%)' }}>
          <Globe className="w-10 h-10 mx-auto mb-4 opacity-20" />
          <p>Bu kategoride haber bulunamadı.</p>
          <button onClick={() => loadNews(true)} className="mt-3 text-sm text-primary hover:underline">
            Yeniden dene
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(item => (
            <NewsCard key={item.id} item={item} />
          ))}
          <p className="text-center text-xs text-muted-foreground py-4 flex items-center justify-center gap-2">
            <Clock className="w-3 h-3" />
            Sonraki güncelleme: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
          </p>
        </div>
      )}
    </div>
  );
}
