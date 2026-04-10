# Gris.Pro — İstanbul & Atina Gayrimenkul & Finans Platformu

## Proje Hakkında

Gris.Pro, İstanbul ve Atina gayrimenkul piyasalarını, finans verilerini ve sağlık haberlerini tek platformda sunan gerçek zamanlı bir web uygulamasıdır.

### Sayfalar

| Sayfa | İçerik |
|-------|--------|
| **Panel** | 30 modül — makro veri, emtia, kripto, BIST, ABD borsası, ATHEX, altın vize |
| **Şehirler** | İstanbul & Atina güncel haberleri |
| **Sağlık** | 10 sağlık modülü + 47 beslenme/wellness kaynağından haberler |
| **Finans** | Kripto (Binance), BIST, ABD borsası, banka faizleri, fonlar |
| **Pazarlama** | 50 gayrimenkul pazarlama makale kartı + 15 strateji modülü |
| **Komuta Merkezi** | Kampanya analitiği (Shapley modeli) |

---

## Hızlı Kurulum

### Gereksinimler
- Node.js 18+
- npm 9+

### Lokal Geliştirme

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Geliştirme sunucusunu başlat
npm run dev
# → http://localhost:5000
```

### Üretim Build

```bash
# Build al
npm run build

# Başlat
npm start
# → node dist/index.cjs
```

---

## Bulut Deployment

### Render (Önerilen)

1. [render.com](https://render.com) → **New Web Service**
2. GitHub reponuzu bağlayın
3. Ayarlar:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/index.cjs`
   - **Environment:** Node
4. **Deploy** — otomatik çalışır

> ⚠️ `dist/` klasörü repo'ya commit edilmişse Build Command sadece `npm install` olabilir.

### Railway

1. [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
2. `railway.json` dosyası zaten yapılandırılmış
3. Otomatik deploy başlar

### VPS / Sunucu (Ubuntu)

```bash
# Node.js kur
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Projeyi kopyala
git clone https://github.com/raifkurt/grista.git
cd grista

# Bağımlılıkları yükle ve build al
npm install
npm run build

# PM2 ile arka planda çalıştır
npm install -g pm2
pm2 start dist/index.cjs --name "gris-pro"
pm2 startup
pm2 save
```

---

## Ortam Değişkenleri

Projenin büyük bölümü dış API kullanmadan çalışır (statik fallback'ler vardır).

| Değişken | Açıklama | Zorunlu |
|----------|----------|---------|
| `NODE_ENV` | `production` / `development` | Evet |
| `PORT` | Sunucu portu (varsayılan: 5000) | Hayır |

---

## API Endpointleri

| Endpoint | Kaynak | Açıklama |
|----------|--------|----------|
| `/api/crypto` | CoinGecko | BTC, ETH, SOL fiyatları |
| `/api/cryptodetail` | Binance API | 20 altcoin detayı |
| `/api/news/:category` | RSS | Haber akışı |
| `/api/cities` | RSS | İstanbul & Atina haberleri |
| `/api/macro` | World Bank + ECB | Makro ekonomik veri |
| `/api/commodities` | Yahoo Finance | Emtia fiyatları |
| `/api/bankrates` | Statik | Banka TL faiz oranları |
| `/api/funds` | TEFAS | Yatırım fonları |
| `/api/us/gainers` | Yahoo Finance | ABD hisse kazananları |
| `/api/bist/gainers` | Yahoo Finance | BIST hisse verileri |
| `/api/greece/stocks` | Yahoo Finance | Yunan hisseleri |
| `/api/sentiment` | Alternative.me | Kripto korku & açgözlülük |

---

## Teknoloji Stack

**Frontend**
- React 18 + TypeScript
- Wouter (routing)
- TanStack Query (data fetching)
- Recharts (grafikler)
- Tailwind CSS + Radix UI

**Backend**
- Express 5
- tsx (TypeScript runtime)
- RSS parser, node-fetch

**Build**
- Vite 7
- esbuild

---

## Proje Yapısı

```
gris-pro/
├── client/           # React frontend
│   └── src/
│       ├── pages/    # Tüm sayfa bileşenleri
│       └── components/
├── server/           # Express backend
│   ├── index.ts      # Giriş noktası
│   └── routes.ts     # API rotaları
├── dist/             # Build çıktısı (hazır çalışır)
│   ├── index.cjs     # Server bundle
│   └── public/       # Static frontend
├── shared/           # Ortak tipler
└── package.json
```

---

## Özellikler

- 📱 **PWA** — iPhone/Android'e ana ekrana eklenebilir
- 🔄 **Pull-to-Refresh** — Aşağı kaydır, yenile
- 📰 **Çoklu Haber Kaynağı** — 94+ RSS beslemesi
- 📊 **Canlı Veriler** — Binance, Yahoo Finance, World Bank
- 🌐 **İki Dil** — Türkçe & Yunanca içerik desteği
- 🏠 **Gayrimenkul Odaklı** — İstanbul & Atina piyasa verileri

---

*Gris.Pro — İstanbul & Atina arasındaki köprü*
