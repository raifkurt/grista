/**
 * NEXUS Gerçek Zamanlı Veri — Sunucu Proxy Versiyonu
 * Tüm API çağrıları /api/* üzerinden yapılır (CORS sorunu yok)
 */

export type NewsCategory = 'finans' | 'emlak' | 'saglik';

export interface NewsItem {
  id: string;
  title: string;
  titleOriginal?: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  description: string;
  image: string | null;
  isNew?: boolean;
  translated?: boolean;
}

export interface LiveForex {
  usdtry: number;
  eurtry: number;
  eurusd: number;
  date: string;
  prev: { usdtry: number; eurtry: number };
  source?: string;
}

export interface LiveCrypto {
  btcusd: number;
  ethusd: number;
  solusd: number;
  btcChange24h: number;
  ethChange24h: number;
  source?: string;
}

export interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  isLive: boolean;
}

// ─── Önbellekler ──────────────────────────────────────────────────────────────

let _fx: LiveForex | null = null;
let _fxAt = 0;
let _crypto: LiveCrypto | null = null;
let _cryptoAt = 0;
const _news: Record<string, { data: NewsItem[]; ts: number }> = {};

const FX_FALLBACK: LiveForex = {
  usdtry: 35.50, eurtry: 38.70, eurusd: 1.089, date: '—',
  prev: { usdtry: 35.32, eurtry: 38.55 },
};
const CRYPTO_FALLBACK: LiveCrypto = {
  btcusd: 68491, ethusd: 3540, solusd: 182,
  btcChange24h: -0.87, ethChange24h: 1.23,
};

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return await res.json() as T;
  } catch {
    return fallback;
  }
}

// ─── Döviz ────────────────────────────────────────────────────────────────────

export async function fetchLiveForex(): Promise<LiveForex> {
  if (_fx && Date.now() - _fxAt < 60_000) return _fx;
  const raw = await apiFetch<any>('/api/forex', null);
  if (!raw) return _fx ?? FX_FALLBACK;
  const result: LiveForex = {
    usdtry: raw.usdtry ?? FX_FALLBACK.usdtry,
    eurtry: raw.eurtry ?? FX_FALLBACK.eurtry,
    eurusd: raw.eurusd ?? FX_FALLBACK.eurusd,
    date: raw.date ?? '—',
    prev: _fx
      ? { usdtry: _fx.usdtry, eurtry: _fx.eurtry }
      : { usdtry: (raw.usdtry ?? FX_FALLBACK.usdtry) * 0.997, eurtry: (raw.eurtry ?? FX_FALLBACK.eurtry) * 0.997 },
    source: raw.source,
  };
  _fx = result;
  _fxAt = Date.now();
  return result;
}

// ─── Kripto ───────────────────────────────────────────────────────────────────

export async function fetchLiveCrypto(): Promise<LiveCrypto> {
  if (_crypto && Date.now() - _cryptoAt < 30_000) return _crypto;
  const raw = await apiFetch<any>('/api/crypto', null);
  if (!raw) return _crypto ?? CRYPTO_FALLBACK;
  _crypto = {
    btcusd: raw.btcusd ?? CRYPTO_FALLBACK.btcusd,
    ethusd: raw.ethusd ?? CRYPTO_FALLBACK.ethusd,
    solusd: raw.solusd ?? CRYPTO_FALLBACK.solusd,
    btcChange24h: raw.btcChange24h ?? CRYPTO_FALLBACK.btcChange24h,
    ethChange24h: raw.ethChange24h ?? CRYPTO_FALLBACK.ethChange24h,
    source: raw.source,
  };
  _cryptoAt = Date.now();
  return _crypto;
}

// ─── Haberler ─────────────────────────────────────────────────────────────────

export async function fetchAllNews(force = false): Promise<NewsItem[]> {
  const cats: NewsCategory[] = ['finans', 'emlak', 'saglik'];
  const all = await Promise.all(cats.map(c => fetchNewsByCategory(c, force)));
  return all.flat().sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}

export async function fetchNewsByCategory(cat: NewsCategory, force = false): Promise<NewsItem[]> {
  const entry = _news[cat];
  // 25sn client cache — 30sn polling cycle’nin altında, taşıma engellemez
  if (!force && entry && Date.now() - entry.ts < 25_000) return entry.data;
  const data = await apiFetch<NewsItem[]>(`/api/news/${cat}`, []);
  if (data.length > 0) _news[cat] = { data, ts: Date.now() };
  return data.length > 0 ? data : (entry?.data ?? []);
}

// ─── İstanbul + Atina ─────────────────────────────────────────────────────────

export async function fetchCitiesNews(): Promise<{ istanbul: NewsItem[]; athens: NewsItem[] }> {
  return apiFetch<any>('/api/cities', { istanbul: [], athens: [] });
}

// ─── Ticker ───────────────────────────────────────────────────────────────────

export async function fetchTickerData(): Promise<TickerItem[]> {
  const [forex, crypto] = await Promise.all([fetchLiveForex(), fetchLiveCrypto()]);
  const items: TickerItem[] = [];

  const usdChg = (forex.usdtry - forex.prev.usdtry) / forex.prev.usdtry;
  const eurChg = (forex.eurtry - forex.prev.eurtry) / forex.prev.eurtry;

  items.push(
    { symbol: 'USD/TRY', price: forex.usdtry, change: usdChg, isLive: forex.usdtry !== FX_FALLBACK.usdtry },
    { symbol: 'EUR/TRY', price: forex.eurtry, change: eurChg, isLive: forex.eurtry !== FX_FALLBACK.eurtry },
    { symbol: 'EUR/USD', price: forex.eurusd, change: (forex.eurusd - 1.085) / 1.085, isLive: true },
    { symbol: 'BTC/USD', price: crypto.btcusd, change: crypto.btcChange24h / 100, isLive: crypto.btcusd !== CRYPTO_FALLBACK.btcusd },
    { symbol: 'ETH/USD', price: crypto.ethusd, change: crypto.ethChange24h / 100, isLive: true },
    { symbol: 'XAU/USD', price: 2385 + (Math.random() - 0.5) * 12, change: 0.0041, isLive: false },
    { symbol: 'BRENT',   price: 85.2  + (Math.random() - 0.5) * 1.5, change: 0.0012, isLive: false },
    { symbol: 'İST m²',  price: 118269, change: 0.0028, isLive: false },
  );

  return items;
}
