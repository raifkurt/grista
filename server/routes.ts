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
    // Tire / en-dash / em-dash ile kaynak adını ayır
    const sep = rawTitle.match(/^(.+?)\s+[-\u2013\u2014]\s+([^\u2013\u2014-]{2,80})$/);
    const title  = sep ? sep[1].trim() : rawTitle.replace(/\s+[-\u2013\u2014]\s+\S+.*$/, '').trim() || rawTitle;
    const source = sep ? sep[2].trim() : (get('source') || '');
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
        description: '',  // kullanılmıyor, bant genişliği tasarrufu
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

// ─── RSS Kaynakları ───────────────────────────────────────────────────────────

const FEEDS: Record<string, string[]> = {

  // ── İSTANBUL (17 kaynak) ──
  istanbul: [
    // Direkt haber siteleri
    'https://www.dailysabah.com/rss',
    'https://www.trtworld.com/rss',
    'https://www.hurriyetdailynews.com/rss',
    'https://bianet.org/english/rss.xml',
    'https://www.middleeasteye.net/tags/turkey/rss.xml',
    // Google News — Türkçe
    'https://news.google.com/rss/search?q=İstanbul+haber+şehir&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=İstanbul+konut+kira+emlak+fiyat&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=Beşiktaş+Kadıköy+Şişli+Sarıyer+haber&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=İstanbul+inşaat+kentsel+dönüşüm+proje&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=İstanbul+metro+ulaşım+altyapı+İBB&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=İstanbul+ekonomi+turizm+kültür&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=Fatih+Üsküdar+Ataşehir+Bakırköy+haber&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=İstanbul+deprem+altyapı+güvenlik&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=İstanbul+nüfus+göç+yaşam+maliyet&hl=tr&gl=TR&ceid=TR:tr',
    // Google News — İngilizce
    'https://news.google.com/rss/search?q=Istanbul+Turkey+news+city&hl=en&gl=TR&ceid=TR:en',
    'https://news.google.com/rss/search?q=Istanbul+real+estate+property+2026&hl=en&gl=TR&ceid=TR:en',
    'https://news.google.com/rss/search?q=Istanbul+development+investment+urban&hl=en&gl=TR&ceid=TR:en',
  ],

  // ── ATİNA (16 kaynak) ──
  athens: [
    // Direkt haber siteleri
    'https://www.ekathimerini.com/rss/',
    'https://greekreporter.com/feed/',
    'https://www.keeptalkinggreece.com/feed/',
    'https://greekcitytimes.com/feed/',
    // Google News — İngilizce
    'https://news.google.com/rss/search?q=Athens+Greece+city+news+2026&hl=en&gl=GR&ceid=GR:en',
    'https://news.google.com/rss/search?q=Athens+real+estate+property+rent+buy&hl=en&gl=GR&ceid=GR:en',
    'https://news.google.com/rss/search?q=Greece+Golden+Visa+property+investment&hl=en&gl=GR&ceid=GR:en',
    'https://news.google.com/rss/search?q=Kolonaki+Glyfada+Vouliagmeni+property&hl=en&gl=GR&ceid=GR:en',
    'https://news.google.com/rss/search?q=Athens+municipality+city+development&hl=en&gl=GR&ceid=GR:en',
    'https://news.google.com/rss/search?q=Greece+economy+tourism+investment+2026&hl=en&gl=GR&ceid=GR:en',
    'https://news.google.com/rss/search?q=Athens+Piraeus+infrastructure+transport&hl=en&gl=GR&ceid=GR:en',
    'https://news.google.com/rss/search?q=Greece+construction+new+project+development&hl=en&gl=GR&ceid=GR:en',
    'https://news.google.com/rss/search?q=Athens+cost+of+living+rental+market&hl=en&gl=GR&ceid=GR:en',
    'https://news.google.com/rss/search?q=Greece+expat+living+digital+nomad+2026&hl=en&gl=GR&ceid=GR:en',
    // Google News — Yunanca
    'https://news.google.com/rss/search?q=Αθήνα+ακίνητα+αγορά+κτηματαγορά&hl=el&gl=GR&ceid=GR:el',
    'https://news.google.com/rss/search?q=Ελλάδα+νέα+αθήνα+ακίνητα+οικονομία&hl=el&gl=GR&ceid=GR:el',
  ],

  // ── FİNANS (14 kaynak) ──
  finans: [
    // Direkt siteler
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://feeds.reuters.com/reuters/businessNews',
    'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    'https://www.investing.com/rss/news_285.rss',
    // Google News — Türkçe
    'https://news.google.com/rss/search?q=borsa+BIST+dolar+faiz+enflasyon&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=ekonomi+merkez+bankası+döviz+TRY&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=BTC+ETH+kripto+borsa+yatırım&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=Türkiye+ekonomi+enflasyon+faiz+büyüme+2026&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=altın+dolar+euro+parite+yatırım&hl=tr&gl=TR&ceid=TR:tr',
    // Google News — İngilizce
    'https://news.google.com/rss/search?q=Turkey+economy+lira+inflation+central+bank&hl=en&gl=TR&ceid=TR:en',
    'https://news.google.com/rss/search?q=Greece+economy+ECB+interest+rate+2026&hl=en&gl=GR&ceid=GR:en',
    'https://news.google.com/rss/search?q=cryptocurrency+bitcoin+ethereum+market+2026&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=global+markets+stocks+bonds+Fed+ECB+2026&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=real+estate+investment+property+market+2026&hl=en&gl=US&ceid=US:en',
  ],

  // ── EMLAK ──
  emlak: [
    'https://news.google.com/rss/search?q=emlak+konut+kira+inşaat+İstanbul&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=gayrimenkul+fiyat+konut+Türkiye&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=Athens+Greece+real+estate+Spitogatos&hl=en&gl=GR&ceid=GR:en',
  ],

  // ── SAĞLIK (küçük) ──
  saglik: [
    'https://news.google.com/rss/search?q=sağlık+hastane+ilaç+tedavi&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=health+wellness+nutrition+longevity&hl=en&gl=US&ceid=US:en',
  ],

  // ── SAĞLIK DETAYLI (40 kaynak → 400-600 benzersiz haber) ──
  healthgood: [
    // ── Direkt haber siteleri (kendi görselleriyle geliyor!) ──
    'https://feeds.bbci.co.uk/news/health/rss.xml',
    'https://www.sciencedaily.com/rss/health_medicine.xml',
    'https://medicalxpress.com/rss-feed/',
    'https://www.statnews.com/feed/',
    'https://feeds.reuters.com/reuters/healthNews',
    'https://www.theguardian.com/society/health/rss',
    'https://www.livescience.com/feeds/health.rss',
    'https://www.newscientist.com/section/health/feed/',
    'https://www.medicalnewstoday.com/rss/medical-news-today-rss-feed.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
    'https://feeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC',
    'https://www.healthline.com/rss/health-news',
    'https://www.everydayhealth.com/rss/news.xml',
    // ── Google News — İngilizce (farklı konular) ──
    'https://news.google.com/rss/search?q=health+medicine+news+2026&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=medical+research+clinical+trial+patients&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=FDA+drug+approval+new+treatment+2026&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=cancer+treatment+immunotherapy+survival+2026&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=diabetes+heart+disease+prevention+research+2026&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=mental+health+depression+anxiety+treatment+2026&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=longevity+aging+lifespan+science+2026&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=anti+aging+centenarian+longevity+research&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=nutrition+diet+healthy+eating+research&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=fitness+exercise+workout+health+benefit&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=sleep+health+rest+recovery+science+2026&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=gut+microbiome+probiotics+immune+health&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=AI+artificial+intelligence+medicine+diagnosis&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=gene+therapy+CRISPR+genetics+disease+cure&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=vaccine+infectious+disease+prevention+2026&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=obesity+weight+loss+GLP1+medication+2026&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=brain+neuroscience+alzheimer+dementia+research&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=hospital+surgery+innovation+medical+device&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=public+health+WHO+pandemic+disease+2026&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=wellness+holistic+health+natural+remedy&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=vitamins+supplements+minerals+health+benefit&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=mediterranean+diet+plant+based+health+study&hl=en&gl=US&ceid=US:en',
    // ── Google News — Türkçe ──
    'https://news.google.com/rss/search?q=sağlık+keşif+tedavi+iyi+haber+2026&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=sağlıklı+yaşam+beslenme+spor+wellness&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=uzun+yaş+yaşlanma+araştırma+bilim&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=kanser+tedavisi+ilaç+araştırma+hastane&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=ruh+sağlığı+psikoloji+stres+mutluluk&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=beslenme+diyet+kilo+sağlık+spor&hl=tr&gl=TR&ceid=TR:tr',
    'https://news.google.com/rss/search?q=yapay+zeka+tıp+tanı+dijital+sağlık&hl=tr&gl=TR&ceid=TR:tr',
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

  // Tüm /api/* yanıtlarına tarayıcı cache'ini kapat
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });

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
      if (req.query.force === '1') delete CACHE[`news_${cat}`]; // cache bypass
      const data = await cached(`news_${cat}`, 90_000, async () => {
        const results = await Promise.allSettled(feeds.map(u => fetchRSS(u, cat)));
        const all = results.filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled').flatMap(r => r.value);
        return dedup(all);
      });
      res.json(data);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // İstanbul + Atina şehir sayfası — maksimum kaynak
  app.get('/api/cities', async (req, res) => {
    try {
      if (req.query.force === '1') delete CACHE['cities']; // cache bypass
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


  // ── Makroekonomik Göstergeler — World Bank + ECB ──────────────────────────
  app.get('/api/macro', async (req, res) => {
    try {
      if (req.query.force === '1') delete CACHE['macro'];
      const data = await cached('macro', 12 * 60 * 60_000, async () => {
        const wbGet = async (url: string, fb: number): Promise<number> => {
          try {
            const ctrl = new AbortController();
            setTimeout(() => ctrl.abort(), 10_000);
            const r = await fetch(url, { signal: ctrl.signal });
            if (!r.ok) return fb;
            const d = await r.json();
            return typeof d[1]?.[0]?.value === 'number' ? d[1][0].value : fb;
          } catch { return fb; }
        };
        const [trInfl, trGdp, trUnem, grInfl, grGdp] = await Promise.all([
          wbGet('https://api.worldbank.org/v2/country/TR/indicator/FP.CPI.TOTL.ZG?format=json&mrv=1', 30.91),
          wbGet('https://api.worldbank.org/v2/country/TR/indicator/NY.GDP.MKTP.KD.ZG?format=json&mrv=1', 3.3),
          wbGet('https://api.worldbank.org/v2/country/TR/indicator/SL.UEM.TOTL.ZS?format=json&mrv=1', 8.8),
          wbGet('https://api.worldbank.org/v2/country/GR/indicator/FP.CPI.TOTL.ZG?format=json&mrv=1', 2.3),
          wbGet('https://api.worldbank.org/v2/country/GR/indicator/NY.GDP.MKTP.KD.ZG?format=json&mrv=1', 2.5),
        ]);
        // ECB deposit facility rate
        let ecbRate = 2.00;
        try {
          const ctrl = new AbortController();
          setTimeout(() => ctrl.abort(), 8_000);
          const ecbR = await fetch(
            'https://data-api.ecb.europa.eu/service/data/FM/B.U2.EUR.4F.KR.DFR.LEV?format=jsondata&lastNObservations=1',
            { signal: ctrl.signal }
          );
          const ecbD = await ecbR.json();
          const series = ecbD.dataSets?.[0]?.series;
          if (series) {
            const firstKey = Object.keys(series)[0];
            const obs = series[firstKey]?.observations;
            if (obs) {
              const lastIdx = Object.keys(obs).sort((a, b) => +a - +b).pop();
              if (lastIdx !== undefined) ecbRate = obs[lastIdx][0];
            }
          }
        } catch {}
        return {
          turkey:  { policyRate: 37.00, inflation: trInfl,  gdpGrowth: trGdp,  unemployment: trUnem },
          greece:  { policyRate: ecbRate, inflation: grInfl, gdpGrowth: grGdp,  touristArrivals: 33.6 },
          source:  'World Bank · ECB API',
          updatedAt: new Date().toISOString(),
        };
      });
      res.json(data);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ── Kripto Korku/Açgözlülük Endeksi ───────────────────────────────────────
  app.get('/api/sentiment', async (req, res) => {
    try {
      if (req.query.force === '1') delete CACHE['sentiment'];
      const data = await cached('sentiment', 60 * 60_000, async () => {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 8_000);
        const r = await fetch('https://api.alternative.me/fng/?limit=1&format=json', { signal: ctrl.signal });
        const d = await r.json();
        const cur = d.data?.[0];
        return {
          value: parseInt(cur?.value ?? '50'),
          label: cur?.value_classification ?? 'Neutral',
          updatedAt: new Date().toISOString(),
          source: 'Alternative.me',
        };
      });
      res.json(data);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });


  // ── Kripto Detay: BTC+ETH + Top 10 Altcoin Yükseleni ─────────────────────
  app.get('/api/cryptodetail', async (req, res) => {
    try {
      if (req.query.force === '1') delete CACHE['cryptodetail'];
      const data = await cached('cryptodetail', 5 * 60_000, async () => {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 12_000);
        // BTC + ETH detayı
        const [r1, r2] = await Promise.all([
          fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&order=market_cap_desc&per_page=2&page=1&sparkline=false&price_change_percentage=24h', { signal: ctrl.signal }),
          fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=30&page=1&sparkline=false', { signal: ctrl.signal }),
        ]);
        const [majors, gainersRaw] = await Promise.all([r1.json(), r2.json()]);
        const fmt = (c: any) => ({
          id: c.id, symbol: c.symbol.toUpperCase(), name: c.name,
          price: c.current_price, change24h: c.price_change_percentage_24h,
          marketCap: c.market_cap, image: c.image,
          high24h: c.high_24h, low24h: c.low_24h,
          volume: c.total_volume,
        });
        const btc = majors.find((c: any) => c.id === 'bitcoin');
        const eth = majors.find((c: any) => c.id === 'ethereum');
        const gainers = gainersRaw
          .filter((c: any) => {
            const STABLE = ['tether','usd-coin','binance-usd','dai','true-usd','ethena-usde',
              'frax','usdd','first-digital-usd','paypal-usd','mountain-protocol-usdm','reserve-rights-token',
              'liquity-usd','neutrino','fei-usd','gemini-dollar','nusd','celo-dollar'];
            return !['bitcoin','ethereum'].includes(c.id)
              && !STABLE.includes(c.id)
              && Math.abs((c.current_price ?? 1) - 1) > 0.1   // stablecoin fiyat filtresi
              && (c.price_change_percentage_24h ?? 0) > 1;     // en az %1 artış
          })
          .slice(0, 10)
          .map(fmt);
        return { btc: btc ? fmt(btc) : null, eth: eth ? fmt(eth) : null, gainers, updatedAt: new Date().toISOString() };
      });
      res.json(data);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });


  // ── ABD Borsası — Günün En Çok Yükselen Hisseleri ─────────────────────────
  app.get('/api/us/gainers', async (req, res) => {
    try {
      if (req.query.force === '1') delete CACHE['us_gainers'];
      const data = await cached('us_gainers', 5 * 60_000, async () => {
        const ctrl = new AbortController(); setTimeout(() => ctrl.abort(), 10_000);
        const r = await fetch(
          'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&lang=en-US&region=US&scrIds=day_gainers&start=0&count=10',
          { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } }
        );
        const d = await r.json();
        return (d.finance?.result?.[0]?.quotes ?? []).map((q: any) => ({
          symbol: q.symbol, name: q.shortName || q.longName || q.symbol,
          price: q.regularMarketPrice, changePct: q.regularMarketChangePercent,
          change: q.regularMarketChange, volume: q.regularMarketVolume, mktCap: q.marketCap,
        }));
      });
      res.json(data);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ── BIST — Günün En Çok Yükselen Türk Hisseleri ───────────────────────────
  app.get('/api/bist/gainers', async (req, res) => {
    try {
      if (req.query.force === '1') delete CACHE['bist_gainers'];
      const data = await cached('bist_gainers', 5 * 60_000, async () => {
        const ctrl = new AbortController(); setTimeout(() => ctrl.abort(), 10_000);
        const body = JSON.stringify({
          offset: 0, size: 10,
          sortField: 'percentchange', sortType: 'DESC', quoteType: 'EQUITY',
          topOperator: 'AND',
          query: { operator: 'AND', operands: [{ operator: 'EQ', operands: ['exchange', 'TUP'] }] },
          userId: '', userIdType: 'guid',
        });
        const r = await fetch('https://query2.finance.yahoo.com/v1/finance/screener?formatted=false&lang=en-US&region=US&start=0&count=10', {
          method: 'POST', signal: ctrl.signal,
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
          body,
        });
        const d = await r.json();
        return (d.finance?.result?.[0]?.quotes ?? []).map((q: any) => ({
          symbol: q.symbol?.replace('.IS', '') ?? q.symbol,
          name: q.shortName || q.longName || q.symbol,
          price: q.regularMarketPrice, changePct: q.regularMarketChangePercent,
          change: q.regularMarketChange, volume: q.regularMarketVolume,
          currency: q.currency ?? 'TRY',
        }));
      });
      res.json(data);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // ── Banka TL Mevduat Faizleri ──────────────────────────────────────────────
  app.get('/api/bankrates', async (_req, res) => {
    // TCMB politika faizi %37 · Gecelik borç verme %40
    res.json({
      updatedAt: '2026-04-09',
      source: 'TCMB · Banka açıklamaları',
      tcmbPolicy: 37.00,
      rates: [
        { bank: 'QNB Finansbank',      logo: 'QNB',  rate1m: 41.00, rate3m: 41.50, rate6m: 41.00 },
        { bank: 'HSBC Türkiye',        logo: 'HSBC', rate1m: 40.50, rate3m: 41.00, rate6m: 40.75 },
        { bank: 'Yapı Kredi',          logo: 'YKB',  rate1m: 40.00, rate3m: 40.50, rate6m: 40.25 },
        { bank: 'Denizbank',           logo: 'DNZ',  rate1m: 40.00, rate3m: 40.25, rate6m: 40.00 },
        { bank: 'Garanti BBVA',        logo: 'GRT',  rate1m: 39.50, rate3m: 40.00, rate6m: 39.75 },
        { bank: 'Akbank',              logo: 'AKB',  rate1m: 39.25, rate3m: 39.75, rate6m: 39.50 },
        { bank: 'Türkiye İş Bankası',  logo: 'ISB',  rate1m: 39.00, rate3m: 39.50, rate6m: 39.25 },
        { bank: 'TEB',                 logo: 'TEB',  rate1m: 38.75, rate3m: 39.25, rate6m: 39.00 },
        { bank: 'Vakıfbank',           logo: 'VKF',  rate1m: 38.50, rate3m: 38.75, rate6m: 38.50 },
        { bank: 'Halkbank',            logo: 'HLK',  rate1m: 38.50, rate3m: 38.75, rate6m: 38.50 },
        { bank: 'Ziraat Bankası',      logo: 'ZRT',  rate1m: 38.00, rate3m: 38.50, rate6m: 38.25 },
      ],
    });
  });

  // ── TEFAS — En Fazla Getiren Türk Yatırım Fonları ─────────────────────────
  app.get('/api/funds', async (req, res) => {
    try {
      if (req.query.force === '1') delete CACHE['funds'];
      const data = await cached('funds', 60 * 60_000, async () => {
        // TEFAS API — son 30 günlük getiriye göre sıralı
        const today = new Date();
        const ago30 = new Date(today); ago30.setDate(today.getDate() - 30);
        const fmt = (d: Date) => `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
        const ctrl = new AbortController(); setTimeout(() => ctrl.abort(), 12_000);
        const r = await fetch(
          `https://www.tefas.gov.tr/api/DB/BindHistoryInfo?FontipKodu=YAT&sfonkod=&bastarih=${fmt(ago30)}&bittarih=${fmt(today)}&fonturkodu=&islemdurum=`,
          { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.tefas.gov.tr/' } }
        );
        if (!r.ok) throw new Error('TEFAS HTTP ' + r.status);
        const d = await r.json();
        const list = Array.isArray(d) ? d : (d.data ?? d.Data ?? []);
        return list
          .filter((f: any) => f.getiri30 > 0 || f.GETIRI30 > 0)
          .sort((a: any, b: any) => (b.getiri30 ?? b.GETIRI30 ?? 0) - (a.getiri30 ?? a.GETIRI30 ?? 0))
          .slice(0, 10)
          .map((f: any) => ({
            code: f.fonkodu ?? f.FONKODU ?? '—',
            name: f.fonadi ?? f.FONADI ?? '—',
            type: f.foncategorisi ?? f.FONTURU ?? '—',
            return30d: f.getiri30 ?? f.GETIRI30 ?? 0,
            return1y:  f.getiri365 ?? f.GETIRI365 ?? null,
            price:     f.fiyat ?? f.FIYAT ?? null,
          }));
      });
      res.json(data);
    } catch {
      // TEFAS erişilemezse boş dön
      res.json([]);
    }
  });

  return _httpServer;
}
