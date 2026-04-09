import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, MapPin } from 'lucide-react';
import { fetchCitiesNews, NewsItem } from '@/lib/data/liveData';

/* ── Resim ────────────────────────────────────────────────────────── */
function img(item: NewsItem, city: 'istanbul' | 'athens') {
  if (item.image) return item.image;
  const h = item.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 1000;
  const kw = city === 'istanbul' ? 'istanbul,bosphorus,turkey' : 'athens,acropolis,greece';
  return `https://loremflickr.com/800/500/${kw}?lock=${h}`;
}

function ago(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)    return `${s}sn`;
  if (s < 3600)  return `${Math.floor(s / 60)}dk`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa`;
  return `${Math.floor(s / 86400)}g`;
}

/* ── Kart ─────────────────────────────────────────────────────────── */
function Card({ item, city, i }: { item: NewsItem; city: 'istanbul' | 'athens'; i: number }) {
  const accent = city === 'istanbul' ? '#0BC5EA' : '#a78bfa';
  const [show, setShow] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), Math.min(i * 40, 500));
    return () => clearTimeout(t);
  }, [i]);

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
        border: `1px solid ${accent}22`,
        textDecoration: 'none',
        opacity: show ? 1 : 0,
        transform: show ? 'none' : 'translateY(12px)',
        transition: `opacity .35s ease ${Math.min(i * 40, 500)}ms, transform .35s ease ${Math.min(i * 40, 500)}ms`,
      }}
    >
      {/* Resim */}
      {!imgErr ? (
        <img
          src={img(item, city)}
          alt=""
          onError={() => setImgErr(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${accent}18, #05090f)` }} />
      )}

      {/* Sadece altta okunabilirlik gradyanı */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(3,8,20,.97) 0%, rgba(3,8,20,.82) 30%, rgba(3,8,20,.05) 60%, transparent 75%)',
      }} />

      {/* Sol şerit */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent }} />

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
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

/* ── Sütun ────────────────────────────────────────────────────────── */
function Col({ city, flag, label, accent, items, loading }: {
  city: 'istanbul' | 'athens'; flag: string; label: string;
  accent: string; items: NewsItem[]; loading: boolean;
}) {
  const [dot, setDot] = useState(true);
  useEffect(() => { const t = setInterval(() => setDot(d => !d), 900); return () => clearInterval(t); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '10px 4px', borderBottom: `2px solid ${accent}`, background: 'hsl(222 47% 5%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{flag}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 1, color: accent }}>{label.toUpperCase()}</div>
            <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#4a6080', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: dot ? '#10b981' : '#064e3b', transition: 'background .4s' }} />
              {loading ? 'yükleniyor…' : `${items.length} haber`}
            </div>
          </div>
          <MapPin size={14} style={{ marginLeft: 'auto', color: accent, opacity: .45 }} />
        </div>
      </div>

      {loading
        ? [...Array(4)].map((_, k) => (
            <div key={k} style={{ height: 260, borderRadius: 16, background: 'hsl(222 47% 8%)', opacity: 1 - k * .2, animation: 'pulse 1.5s infinite' }} />
          ))
        : items.map((item, k) => <Card key={item.id} item={item} city={city} i={k} />)
      }
    </div>
  );
}

/* ── Sayfa ────────────────────────────────────────────────────────── */
export default function CitiesPage() {
  const [istanbul, setIstanbul] = useState<NewsItem[]>([]);
  const [athens, setAthens]     = useState<NewsItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(false);
  const [lastUpd, setLastUpd]   = useState<Date | null>(null);
  const [cd, setCd]             = useState(30);
  const [tab, setTab]           = useState<'istanbul' | 'athens'>('istanbul');
  const cdRef = useRef(30);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const d = await fetchCitiesNews();
      if (d.istanbul?.length || d.athens?.length) {
        setIstanbul(d.istanbul ?? []);
        setAthens(d.athens ?? []);
        setLastUpd(new Date());
      }
    } catch {}
    setLoading(false);
    setBusy(false);
    cdRef.current = 30;
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setInterval(() => {
      cdRef.current -= 1;
      setCd(cdRef.current);
      if (cdRef.current <= 0) load();
    }, 1000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Üst bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #1a2535' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            🇹🇷 İstanbul &nbsp;·&nbsp; 🇬🇷 Atina
            <span style={{ fontSize: 10, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,.1)', color: '#10b981', border: '1px solid rgba(16,185,129,.25)' }}>CANLI</span>
          </div>
          {lastUpd && (
            <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#3d5570', marginTop: 2 }}>
              {istanbul.length + athens.length} haber · {lastUpd.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} · {cd}sn
            </div>
          )}
        </div>
        <button onClick={load} disabled={busy} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid #1a2535', background: 'transparent', color: '#4a6080', cursor: 'pointer' }}>
          <RefreshCw size={13} style={busy ? { animation: 'spin 1s linear infinite' } : {}} />
          Yenile
        </button>
      </div>

      {/* Mobil sekme */}
      <div style={{ display: 'flex', gap: 8, padding: 12, borderBottom: '1px solid #1a2535' }} className="md:hidden">
        {(['istanbul', 'athens'] as const).map((id) => {
          const [flag, lbl, clr] = id === 'istanbul' ? ['🇹🇷', 'İstanbul', '#0BC5EA'] : ['🇬🇷', 'Atina', '#a78bfa'];
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '8px 0', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: tab === id ? `${clr}18` : 'transparent',
              color: tab === id ? clr : '#3d5570',
              border: `1px solid ${tab === id ? clr + '44' : 'transparent'}`,
              transition: 'all .2s',
            }}>
              {flag} {lbl}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, padding: 16 }} className="cities-grid">
        <div className={tab === 'istanbul' ? '' : 'hidden md:block'}>
          <Col city="istanbul" flag="🇹🇷" label="İstanbul" accent="#0BC5EA" items={istanbul} loading={loading} />
        </div>
        <div className={tab === 'athens' ? '' : 'hidden md:block'}>
          <Col city="athens" flag="🇬🇷" label="Atina" accent="#a78bfa" items={athens} loading={loading} />
        </div>
      </div>
    </div>
  );
}
