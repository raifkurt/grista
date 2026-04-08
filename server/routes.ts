import type { Express } from "express";

// ─── HTML İşleme ──────────────────────────────────────────────────────────────

function decodeEntities(s: string): string {
  return (s || '')
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'").replace(/&nbsp;/gi, ' ')
    .replace(/&#x?[0-9a-f]+;/gi, ' ');
}

function cleanText(html: string): string {
  return decodeEntities(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 400);
}

// ─── RSS Parser ───────────────────────────────────────────────────────────────

function parseRSS(xml: string, category: string): any[] {
  const items: any[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const getRaw = (tag: string): string => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
        || block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return m ? m[1].trim() : '';
    };
    const get = (tag: string) => cleanText(getRaw(tag));

    const rawTitle = get('title');
    // "Başlık - Kaynak" formatından kaynağı ayır
    const titleParts = rawTitle.match(/^(.*?)\s+-\s+([^-]+)$/);
    const title  = titleParts ? titleParts[1].trim() : rawTitle;
    const source = titleParts ? titleParts[2].trim() : (get('source') || new URL('http://x.com').hostname);
    const link   = getRaw('link').trim() || (block.match(/https?:\/\/[^\s<"]+/) || [])[0] || '#';
    const pubDate = get('pubDate') || get('dc:date') || '';
    const desc   = get('description');

    // Resim bul
    let image: string | null = null;
    const mediaM = block.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["']/i);
    if (mediaM) image = mediaM[1];
    if (!image) {
      const encM = block.match(/<enclosure[^>]+url=["']([^"']+\.(?:jpg|jpeg|png|webp))[^"']*["']/i);
      if (encM) image = encM[1];
    }
    if (!image) {
      const imgM = decodeEntities(getRaw('description')).match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgM && imgM[1].startsWith('http')) image = imgM[1];
    }

    if (title.length > 8) {
      const pubTs = pubDate ? new Date(pubDate).getTime() : Date.now();
      items.push({
        id: (link || Math.random().toString(36)).slice(-20) + pubDate.slice(-8),
        title,
        link,
        pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source,
        category,
        description: desc,
        image,
        isNew: Date.now() - pubTs < 15 * 60_000,
      });
    }
  }
  return items;
}

async function fetchRSS(url: string, category: string): Promise<any[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GristaBot/1.0)', 'Accept': 'application/rss+xml, application/xml, text/xml, */*' }
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSS(xml, category);
  } catch { clearTimeout(timer); return []; }
}

function dedup(items: any[]): any[] {
  const seen = new Set<string>();
  return items
    .filter(i => {
      const k = i.title.toLowerCase().replace(/\s+/g, '').slice(0, 40);
      if (seen.has(k)) return false;
      seen.add(k); return true;
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}

async function translate(text: string, from = 'el', to = 'tr'): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${from}|${to}`;
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return text;
    const d = await res.json();
    return d.responseData?.translatedText || text;
  } catch { return text; }
}

// ─── Maksimum RSS Kaynakları ──────────────────────────────────────────────────
// Her şehir için 6-8 farklı arama → 100+ haber

const FEEDS: Record<string, string[]> = {

  // ── İSTANBUL: Şehrin nabzı ── Sadece İstanbul'da olanlar
  istanbul: [
    // Genel İstanbul haberleri
    'https://news.google.com/rss/search?q=İstanbul+haber+şehir&hl=tr&gl=TR&ceid=TR:tr',
    // Gayrimenkul + kira
    'https://news.google.com/rss/search?q=İstanbul+konut+kira+emlak+fiyat&hl=tr&gl=TR&ceid=TR:tr',
    // İlçeler bazında
    'https://news.google.com/rss/search?q=Beşiktaş+Kadıköy+Şişli+Sarıyer+haber&hl=tr&gl=TR&ceid=TR:tr',
    // İnşaat + kentsel dönüşüm
    'https://news.google.com/rss/search?q=İstanbul+inşaat+kentsel+dönüşüm+proje&hl=tr&gl=TR&ceid=TR:tr',
    // Yatırım + piyasa
    'https://news.google.com/rss/search?q=İstanbul+gayrimenkul+yatırım+değer&hl=tr&gl=TR&ceid=TR:tr',
    // Ulaşım + altyapı
    'https://news.google.com/rss/search?q=İstanbul+metro+ulaşım+altyapı+İBB&hl=tr&gl=TR&ceid=TR:tr',
  ],

  // ── ATİNA: Şehrin nabzı ── Sadece Atina'da olanlar
  athens: [
    // Genel Atina haberleri (İngilizce)
    'https://news.google.com/rss/search?q=Athens+Greece+city+news+2026&hl=en&gl=GR&ceid=GR:en',
    // Gayrimenkul (İngilizce)
    'https://news.google.com/rss/search?q=Athens+real+estate+property+rent+buy&hl=en&gl=GR&ceid=GR:en',
    // Golden Visa + yatırım
    'https://news.google.com/rss/search?q=Greece+Golden+Visa+property+investment&hl=en&gl=GR&ceid=GR:en',
    // Yunanca haberler
    'https://news.google.com/rss/search?q=Αθήνα+ακίνητα+αγορά+κτηματαγορά&hl=el&gl=GR&ceid=GR:el',
    // Mahalle bazında (Kolonaki, Glyfada)
    'https://news.google.com/rss/search?q=Kolonaki+Glyfada+Vouliagmeni+property&hl=en&gl=GR&ceid=GR:en',
    // Atina şehir haberleri
    'https://news.google.com/rss/search?q=Athens+municipality+city+development&hl=en&gl=GR&ceid=GR:en',
  ],

  // ── FİNANS: TR + GR ekonomi ──
  finans: [
    'https://news.google.com/rss/search?q=borsa+BIST+dolar+faiz+enflasyon&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=ekonomi+merkez+bankası+döviz+TRY&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=BTC+ETH+kripto+borsa+yatırım&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=Greece+economy+ECB+interest+rate&hl=en&gl=GR&ceid=GR:en',
  ],

  // ── EMLAK: Genel TR ──
  emlak: [
    'https://news.google.com/rss/search?q=emlak+konut+kira+inşaat+İstanbul&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=gayrimenkul+fiyat+konut+Türkiye&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=Athens+Greece+real+estate+Spitogatos&hl=en&gl=GR&ceid=GR:en',
  ],

  // ── SAĞLIK ──
  saglik: [
    'https://news.google.com/rss/search?q=sağlık+hastane+ilaç+tedavi&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=health+wellness+nutrition+longevity&hl=en&gl=US&ceid=US:en',
  ],
};

// ─── Önbellek ─────────────────────────────────────────────────────────────────

const CACHE: Record<string, { data: any; ts: number }> = {};
function cached(key: string, ttl: number, fn: () => Promise<any>) {
  const e = CACHE[key];
  if (e && Date.now() - e.ts < ttl) return Promise.resolve(e.data);
  return fn().then(d => { CACHE[key] = { data: d, ts: Date.now() }; return d; });
}

// ─── Rotalar ──────────────────────────────────────────────────────────────────

export async function registerRoutes(_httpServer: any, app: Express): Promise<any> {

  // Döviz (Frankfurter ECB)
  app.get('/api/forex', async (_req, res) => {
    try {
      const data = await cached('forex', 60_000, async () => {
        const [r1, r2, r3] = await Promise.all([
          fetch('https://api.frankfurter.app/latest?from=USD&to=TRY'),
          fetch('https://api.frankfurter.app/latest?from=EUR&to=TRY'),
          fetch('https://api.frankfurter.app/latest?from=EUR&to=USD'),
        ]);
        const [u, e, eu] = await Promise.all([r1.json(), r2.json(), r3.json()]);
        return { usdtry: u.rates?.TRY, eurtry: e.rates?.TRY, eurusd: eu.rates?.USD, date: e.date, source: 'Frankfurter (ECB)' };
      });
      res.json(data);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Kripto (CoinGecko)
  app.get('/api/crypto', async (_req, res) => {
    try {
      const data = await cached('crypto', 30_000, async () => {
        const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const d = await r.json();
        return { btcusd: d.bitcoin?.usd, ethusd: d.ethereum?.usd, solusd: d.solana?.usd, btcChange24h: d.bitcoin?.usd_24h_change, ethChange24h: d.ethereum?.usd_24h_change, source: 'CoinGecko' };
      });
      res.json(data);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Haberler — tek kategori
  app.get('/api/news/:category', async (req, res) => {
    const cat = req.params.category;
    const feeds = FEEDS[cat];
    if (!feeds) return res.status(400).json({ error: 'Geçersiz kategori' });
    try {
      const data = await cached(`news_${cat}`, 2 * 60_000, async () => {
        const results = await Promise.allSettled(feeds.map(u => fetchRSS(u, cat)));
        const all = results.filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled').flatMap(r => r.value);
        return dedup(all);
      });
      res.json(data);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // İstanbul + Atina şehir sayfası — maksimum kaynak
  app.get('/api/cities', async (_req, res) => {
    try {
      const data = await cached('cities', 3 * 60_000, async () => {

        // İstanbul: 8 feed paralel
        const istPromises = FEEDS.istanbul.map(u => fetchRSS(u, 'istanbul'));
        // Atina: 7 feed paralel
        const athPromises = FEEDS.athens.map(u => fetchRSS(u, 'athens'));

        const [istResults, athResults] = await Promise.all([
          Promise.allSettled(istPromises),
          Promise.allSettled(athPromises),
        ]);

        const istanbul = dedup(
          istResults.filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled').flatMap(r => r.value)
        );

        let athens = dedup(
          athResults.filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled').flatMap(r => r.value)
        );

        // Yunanca başlıkları Türkçeye çevir (paralel, max 15)
        const translateQueue = athens.slice(0, 15).map(async (item) => {
          const isGreek = /[α-ωΑ-Ωάέήίόύώ]/.test(item.title);
          if (isGreek) {
            const tr = await translate(item.title, 'el', 'tr');
            return { ...item, titleOriginal: item.title, title: tr, translated: true };
          }
          return item;
        });

        const translatedSlice = await Promise.all(translateQueue);
        const finalAthens = [...translatedSlice, ...athens.slice(15)];

        return {
          istanbul,
          athens: finalAthens,
          updatedAt: new Date().toISOString(),
        };
      });
      res.json(data);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  return _httpServer;
}
