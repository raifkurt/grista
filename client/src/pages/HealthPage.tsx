import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Heart } from 'lucide-react';
import { NewsItem } from '@/lib/data/liveData';

/* ── Resim ────────────────────────────────────────────────────────── */
const KW = [
  'health,wellness,nature', 'fitness,yoga,sport', 'food,nutrition,fruit',
  'medical,science,lab', 'nature,forest,green', 'ocean,calm,blue',
  'flowers,garden,spring', 'running,active,lifestyle', 'sunrise,sky,peaceful',
];

function img(item: NewsItem) {
  if (item.image) return item.image;
  const h = item.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return `https://loremflickr.com/800/500/${KW[h % KW.length]}?lock=${h % 500}`;
}

function ago(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)    return `${s}sn`;
  if (s < 3600)  return `${Math.floor(s / 60)}dk`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa`;
  return `${Math.floor(s / 86400)}g`;
}

/* ── Kart ─────────────────────────────────────────────────────────── */
function Card({ item, i }: { item: NewsItem; i: number }) {
  const [show, setShow] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const delay = Math.min(i * 40, 600);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        position: 'relative',
        height: 260,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(16,185,129,.18)',
        textDecoration: 'none',
        opacity: show ? 1 : 0,
        transform: show ? 'none' : 'translateY(14px)',
        transition: `opacity .35s ease ${delay}ms, transform .35s ease ${delay}ms`,
      }}
    >
      {/* Resim */}
      {!imgErr ? (
        <img
          src={img(item)}
          alt=""
          onError={() => setImgErr(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(16,185,129,.12), #05090f)' }} />
      )}

      {/* Sadece alt gradyan */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(3,8,20,.97) 0%, rgba(3,8,20,.82) 30%, rgba(3,8,20,.05) 60%, transparent 75%)',
      }} />

      {/* Üst yeşil çizgi */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(to right, #10b981, #34d399)' }} />

      {/* Sadece başlık + kaynak/saat — alta yapışık */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px' }}>
        <p style={{
          margin: '0 0 6px',
          fontWeight: 700,
          fontSize: 'clamp(13px, 2vw, 16px)',
          lineHeight: 1.3,
          color: '#fff',
        }}>
          {item.title}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.source}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', fontFamily: 'monospace' }}>
            {ago(item.pubDate)}
          </span>
        </div>
      </div>
    </a>
  );
}

/* ── Sayfa ────────────────────────────────────────────────────────── */
export default function HealthPage() {
  const [news, setNews]   = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]   = useState(false);
  const [lastUpd, setLastUpd] = useState<Date | null>(null);
  const [cd, setCd]       = useState(30);
  const cdRef = useRef(30);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/news/healthgood', { cache: 'no-store' });
      if (res.ok) {
        const d = await res.json();
        if (Array.isArray(d) && d.length) {
          const sorted = [...d].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
          setNews(sorted);
          setLastUpd(new Date());
        }
      }
    } catch {}
    setLoading(false);
    setBusy(false);
    cdRef.current = 30;
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Pull-to-refresh */
  useEffect(() => {
    const handler = () => load();
    window.addEventListener('ptr', handler);
    return () => window.removeEventListener('ptr', handler);
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => {
      cdRef.current -= 1;
      setCd(cdRef.current);
      if (cdRef.current <= 0) load();
    }, 1000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      {/* Başlık */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 17 }}>
            <Heart size={18} color="#10b981" />
            Sağlık & İyi Haberler
            <span style={{ fontSize: 10, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,.1)', color: '#10b981', border: '1px solid rgba(16,185,129,.25)' }}>CANLI</span>
          </div>
          {lastUpd && (
            <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#3d5570', marginTop: 4 }}>
              {news.length} haber · dünyanın her yerinden · {lastUpd.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} · {cd}sn
            </div>
          )}
        </div>
        <button onClick={load} disabled={busy} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid #1a2535', background: 'transparent', color: '#4a6080', cursor: 'pointer' }}>
          <RefreshCw size={13} style={busy ? { animation: 'spin 1s linear infinite' } : {}} />
          Yenile
        </button>
      </div>

      {/* Kartlar */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(6)].map((_, k) => (
            <div key={k} style={{ height: 260, borderRadius: 16, background: 'hsl(222 47% 8%)', opacity: 1 - k * .12, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', borderRadius: 16, background: 'hsl(222 47% 8%)' }}>
          <Heart size={36} color="#10b981" style={{ opacity: .2, marginBottom: 12 }} />
          <p style={{ color: '#4a6080' }}>Haberler yükleniyor…</p>
          <button onClick={load} style={{ marginTop: 10, color: '#10b981', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Tekrar dene</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {news.map((item, k) => <Card key={item.id} item={item} i={k} />)}
        </div>
      )}
    </div>
  );
}
