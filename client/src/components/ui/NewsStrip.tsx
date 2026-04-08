/**
 * NewsStrip — Sayfa altına yerleştirilen kompakt haber şeridi
 * Finans, Emlak veya Sağlık sayfalarında kullanılır
 */
import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, RefreshCw, Clock, Zap } from 'lucide-react';
import { fetchNewsByCategory, NewsItem, NewsCategory } from '@/lib/data/liveData';

const CAT_COLOR: Record<NewsCategory, { color: string; bg: string; label: string }> = {
  finans: { color: '#0BC5EA', bg: 'rgba(11,197,234,0.08)',  label: 'Finans Haberleri' },
  emlak:  { color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',  label: 'Emlak Haberleri' },
  saglik: { color: '#10b981', bg: 'rgba(16,185,129,0.08)',  label: 'Sağlık Haberleri' },
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`;
  if (s < 3600) return `${Math.floor(s / 60)}dk`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa`;
  return `${Math.floor(s / 86400)}g`;
}

interface Props {
  category: NewsCategory;
  limit?: number;
}

export default function NewsStrip({ category, limit = 5 }: Props) {
  const [news, setNews]     = useState<NewsItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const meta = CAT_COLOR[category];

  const load = useCallback(async (force = false) => {
    setRefreshing(true);
    const items = await fetchNewsByCategory(category, force);
    setNews(items.slice(0, limit));
    setLoading(false);
    setRefreshing(false);
  }, [category, limit]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="metric-card space-y-3">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full" style={{ background: meta.color }} />
          <span className="text-sm font-semibold">{meta.label}</span>
          <span className="text-xs font-mono px-1.5 py-0.5 rounded"
            style={{ background: meta.bg, color: meta.color }}>
            CANLI
          </span>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          title="Yenile"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg animate-pulse"
              style={{ background: 'hsl(222 47% 10%)', opacity: 1 - i * 0.2 }} />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-4 text-xs text-muted-foreground flex flex-col items-center gap-2">
          <Zap className="w-4 h-4 opacity-30" />
          Haberler yükleniyor…
          <button onClick={() => load(true)} className="text-primary hover:underline">Tekrar dene</button>
        </div>
      ) : (
        <div className="space-y-0 divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
          {news.map(item => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 py-3 group hover:bg-secondary/30 -mx-1 px-1 rounded-lg transition-colors"
              style={{ textDecoration: 'none' }}
            >
              {/* Resim küçük thumbnail */}
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="w-14 h-12 object-cover rounded-lg flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-14 h-12 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: meta.bg }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {timeAgo(item.pubDate)}
                  </span>
                  {item.isNew && (
                    <span className="text-xs px-1 py-0.5 rounded font-mono"
                      style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '9px' }}>
                      YENİ
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">{item.source}</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                    style={{ color: meta.color }} />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
