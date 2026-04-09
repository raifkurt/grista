import { useState } from 'react';
import { generateCampaigns, generateChannelAttribution, generateCampaignTimeSeries, generateAudienceInsights } from '@/lib/data/marketingData';
import { Megaphone, TrendingUp, Users, Target, DollarSign } from 'lucide-react';


/* ══ PAZARLAMA BİLGİ MODÜLLERİ ══════════════════════════════════════ */

/* 1. Kanal ROI Karsilastirma */
const KANAL_ROI = [
  {kanal:"SEO / Organik",   roi:748,  cac:28,   renk:"#10b981", ikon:"🔍", not:"Uzun vadeli, dusuk CAC"},
  {kanal:"Email Pazarlama", roi:4200, cac:12,   renk:"#3B82F6", ikon:"📧", not:"En yuksek ROI kanalı"},
  {kanal:"Google Ads (PPC)",roi:200,  cac:85,   renk:"#F7931A", ikon:"🎯", not:"Anlık trafik, yuksek CAC"},
  {kanal:"Meta Reklam",     roi:180,  cac:92,   renk:"#1877F2", ikon:"📘", not:"Genis hedefleme, gorseller"},
  {kanal:"Influencer",      roi:520,  cac:45,   renk:"#EC4899", ikon:"👤", not:"Marka guveni + erisim"},
  {kanal:"YouTube Ads",     roi:160,  cac:110,  renk:"#EF4444", ikon:"▶️", not:"Video dikkat suresi uzun"},
  {kanal:"LinkedIn Ads",    roi:280,  cac:155,  renk:"#0077B5", ikon:"💼", not:"B2B icin en etkili"},
  {kanal:"Affiliate",       roi:340,  cac:32,   renk:"#8B5CF6", ikon:"🔗", not:"Performans bazli odeme"},
];
function KanalROI() {
  const maxROI = Math.max(...KANAL_ROI.map(k=>k.roi));
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-emerald-400"/>
        <span className="text-sm font-semibold">Dijital Pazarlama Kanalları — ROI Karşılaştırması</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">Sektör ortalaması · ROI = (Gelir-Maliyet)/Maliyet × 100</div>
      {KANAL_ROI.sort((a,b)=>b.roi-a.roi).map(k=>(
        <div key={k.kanal} className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span style={{fontSize:14}}>{k.ikon}</span>
              <span className="text-xs font-semibold">{k.kanal}</span>
              <span className="text-xs text-muted-foreground">{k.not}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">CAC ₺{k.cac}</span>
              <span className="text-sm font-bold font-mono" style={{color:k.renk}}>%{k.roi}</span>
            </div>
          </div>
          <div className="h-2 rounded-full" style={{background:"hsl(222 47% 8%)"}}>
            <div className="h-2 rounded-full" style={{width:`${(k.roi/maxROI)*100}%`,background:k.renk,opacity:.85}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

/* 2. Donusum Hunisi */
const HUNI = [
  {kat:"TOFU",full:"Farkındalık (Awareness)",oran:100,renk:"#3B82F6",ikon:"👁️",
   icerik:['Blog yazısı','Sosyal medya','YouTube video','Podcast'],
   metrik:"Erisim, Gorunum, Tiklama"},
  {kat:"MOFU",full:"Degerlendirme (Consideration)",oran:22,renk:"#8B5CF6",ikon:"🤔",
   icerik:['Webinar','Case study','Demo','Karsilastirma'],
   metrik:"Lead, Form, Email kaydı"},
  {kat:"BOFU",full:"Karar (Decision)",oran:8,renk:"#EC4899",ikon:"✅",
   icerik:['Ucretsiz deneme','Referanslar','Ozel teklif','1-1 gorusme'],
   metrik:"Satis, Anlaşma, ROAS"},
  {kat:"Sadakat",full:"Elde Tutma (Retention)",oran:5,renk:"#10b981",ikon:"💚",
   icerik:['Onboarding','NPS anketi','Loyalty program','Upsell'],
   metrik:"LTV, Churn rate, NPS"},
];
function DonusumHunisi() {
  const [sel,setSel] = useState(0);
  const h = HUNI[sel];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-purple-400"/>
        <span className="text-sm font-semibold">Dönüşüm Hunisi — TOFU / MOFU / BOFU</span>
      </div>
      <div className="flex gap-1.5 mb-3">
        {HUNI.map((ht,i)=>(
          <button key={i} onClick={()=>setSel(i)}
            className="flex-1 text-xs py-1.5 rounded-lg font-semibold"
            style={{background:sel===i?ht.renk:`${ht.renk}20`,color:sel===i?'#fff':ht.renk,border:`1px solid ${ht.renk}40`,cursor:"pointer"}}>
            {ht.kat}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-1 h-20 mb-3">
        {HUNI.map((ht,i)=>(
          <div key={i} className="flex-1 rounded-t flex items-end justify-center"
            style={{height:`${ht.oran}%`,background:i===sel?ht.renk:`${ht.renk}40`,cursor:"pointer"}}
            onClick={()=>setSel(i)}>
            <span className="text-white font-mono font-bold" style={{fontSize:9}}>{ht.oran}%</span>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl" style={{background:"hsl(222 47% 5%)",border:`2px solid ${h.renk}30`}}>
        <div className="text-xs font-bold mb-2" style={{color:h.renk}}>{h.ikon} {h.full}</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">İçerik Türleri</div>
            {h.icerik.map(ic=><div key={ic} className="text-xs text-muted-foreground">• {ic}</div>)}
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">Takip Metrikleri</div>
            <div className="text-xs text-muted-foreground">{h.metrik}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 3. Temel Pazarlama Formulleri */
const FORMULLER = [
  {isim:"ROAS",         form:"Reklam Geliri ÷ Reklam Harcaması",     ornek:"₺500K ÷ ₺100K = 5x ROAS", iyi:"≥3x iyi, ≥5x mükemmel",renk:"#10b981"},
  {isim:"CAC",          form:"Toplam Pazarlama Maliyeti ÷ Yeni Müşteri",ornek:"₺50K ÷ 100 = ₺500 CAC",iyi:"CAC < LTV/3 olmalı",renk:"#F7931A"},
  {isim:"LTV/CLV",      form:"Ort.Satış × Satın Alma Sıklığı × Müşteri Ömrü",ornek:"₺1K × 4 × 3yıl = ₺12K",iyi:"LTV:CAC > 3:1 hedef",renk:"#3B82F6"},
  {isim:"CTR",          form:"Tıklama ÷ Gösterim × 100",              ornek:"500 ÷ 50K × 100 = %1 CTR",iyi:"Display %0.5, Search %5-10",renk:"#8B5CF6"},
  {isim:"CVR",          form:"Dönüşüm ÷ Ziyaretçi × 100",            ornek:"50 ÷ 2K × 100 = %2.5",    iyi:"E-ticaret ort. %2-4",renk:"#EC4899"},
  {isim:"CPA",          form:"Toplam Harcama ÷ Dönüşüm Sayısı",      ornek:"₺50K ÷ 200 = ₺250",       iyi:"Ürün margin'ın %30'u altı",renk:"#EF4444"},
];
function PazarlamaFormulleri() {
  const [sel,setSel] = useState(0);
  const f = FORMULLER[sel];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-amber-400"/>
        <span className="text-sm font-semibold">Temel Pazarlama Formülleri & Benchmark</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {FORMULLER.map((fo,i)=>(
          <button key={i} onClick={()=>setSel(i)}
            className="text-xs px-2.5 py-1 rounded-lg font-bold"
            style={{background:sel===i?fo.renk:`${fo.renk}20`,color:sel===i?'#fff':fo.renk,border:`1px solid ${fo.renk}40`,cursor:"pointer"}}>
            {fo.isim}
          </button>
        ))}
      </div>
      <div className="p-4 rounded-xl" style={{background:"hsl(222 47% 5%)",border:`2px solid ${f.renk}30`}}>
        <div className="text-base font-bold mb-3" style={{color:f.renk}}>{f.isim}</div>
        {[{l:"Formül",v:f.form},{l:"Örnek",v:f.ornek},{l:"İyi Benchmark",v:f.iyi}].map(r=>(
          <div key={r.l} className="flex gap-2 mb-2">
            <span className="text-xs font-semibold shrink-0" style={{color:f.renk,minWidth:100}}>{r.l}</span>
            <span className="text-xs text-muted-foreground">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 4. Meta Reklam Rehberi */
const META_FORMATLAR = [
  {tip:"Single Image",  boyut:"1200×628",ogrenme:50,kullanim:"Urun, marka fark.",en:"Basit, hizli test"},
  {tip:"Carousel",      boyut:"1080×1080",ogrenme:75,kullanim:"Cok urun, hikaye",en:"CTR x3 yuksek"},
  {tip:"Video (15sn)",  boyut:"1080×1080",ogrenme:100,kullanim:"Dikkat, RetargetEN",en:"Thumb-stop onemli"},
  {tip:"Reels",         boyut:"1080×1920",ogrenme:120,kullanim:"GenZ, organik hiss",en:"Dogal icerik"},
  {tip:"Stories",       boyut:"1080×1920",ogrenme:80,kullanim:"Hizli teklif",en:"Tam ekran etki"},
  {tip:"Collection",    boyut:"1200×628",ogrenme:90,kullanim:"E-ticaret katalog",en:"Anlik satin alma"},
];
const META_HEDEFLER = ['Farkındalık','Erisim','Trafik','Etkileşim','Lead','Uygulama','Video Goruntulemesi','Satis'];
function MetaReklamRehberi() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>📘</span>
        <span className="text-sm font-semibold">Meta (Facebook & Instagram) Reklam Rehberi</span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">Reklam formatları ve optimum kullanım:</div>
      <div className="space-y-1.5 mb-3">
        {META_FORMATLAR.map(f=>(
          <div key={f.tip} className="flex items-center gap-2 p-2 rounded-lg" style={{background:"hsl(222 47% 5%)"}}>
            <span className="text-xs font-bold text-blue-400 shrink-0" style={{minWidth:90}}>{f.tip}</span>
            <span className="text-xs text-muted-foreground shrink-0 font-mono" style={{minWidth:75,fontSize:9}}>{f.boyut}</span>
            <div className="flex-1 h-2 rounded-full" style={{background:"hsl(222 47% 8%)"}}>
              <div className="h-2 rounded-full" style={{width:`${(f.ogrenme/120)*100}%`,background:"#1877F2"}}/>
            </div>
            <span className="text-xs text-muted-foreground shrink-0" style={{maxWidth:120}}>{f.en}</span>
          </div>
        ))}
      </div>
      <div className="text-xs font-semibold text-blue-400 mb-1">Kampanya Hedefleri (Funnel'a gore sec):</div>
      <div className="flex flex-wrap gap-1">
        {META_HEDEFLER.map(h=>(
          <span key={h} className="text-xs px-2 py-0.5 rounded-full" style={{background:"#1877F220",color:"#1877F2",border:"1px solid #1877F230"}}>{h}</span>
        ))}
      </div>
    </div>
  );
}

/* 5. Google Ads Optimizasyon */
const ESLESME_TIPLERI = [
  {tip:"Genel Eşleme",  ikon:"[...]",renk:"#EF4444",kapsam:"En genis",maliyet:"Dusuk CPC",kullanim:"Kefs, kitleyi genislet"},
  {tip:"Ifade Eslesme", ikon:'"..."',renk:"#F7931A",kapsam:"Orta",    maliyet:"Orta CPC",  kullanim:"Yeni kampanyalar"},
  {tip:"Tam Eslesme",   ikon:"[...]",renk:"#10b981",kapsam:"Dar",     maliyet:"Yuksek CPC",kullanim:"Donusum kampanyasi"},
];
const KALITE_PUAN = [
  {faktor:"Beklenen TTO (CTR)",agirlik:"%35",ipucu:"Reklam metni test et, duygusal baslik kullan"},
  {faktor:"Reklam Alaka Duzeyi",agirlik:"%35",ipucu:"Anahtar kelime reklam metninde gecmeli"},
  {faktor:"Acilis Sayfasi",      agirlik:"%30",ipucu:"Sayfa hizi, mobil, kullanici niyeti eslesmeli"},
];
function GoogleAdsOptimizasyon() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>🎯</span>
        <span className="text-sm font-semibold">Google Ads — Kalite Puanı & Optimizasyon</span>
      </div>
      <div className="text-xs font-semibold text-muted-foreground mb-2">Anahtar Kelime Eşleme Tipleri</div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {ESLESME_TIPLERI.map(e=>(
          <div key={e.tip} className="p-2 rounded-xl" style={{background:"hsl(222 47% 5%)",border:`1px solid ${e.renk}30`}}>
            <div className="text-xs font-bold font-mono mb-1" style={{color:e.renk}}>{e.ikon}</div>
            <div className="text-xs font-semibold" style={{color:e.renk}}>{e.tip}</div>
            <div className="text-xs text-muted-foreground">{e.kapsam} · {e.maliyet}</div>
            <div className="text-xs text-muted-foreground mt-1" style={{fontSize:9}}>{e.kullanim}</div>
          </div>
        ))}
      </div>
      <div className="text-xs font-semibold text-muted-foreground mb-2">Kalite Puanı Faktörleri (CPC'yi doğrudan etkiler)</div>
      {KALITE_PUAN.map(kp=>(
        <div key={kp.faktor} className="flex items-start gap-2 p-2 rounded-lg mb-1.5" style={{background:"hsl(222 47% 5%)"}}>
          <div className="shrink-0">
            <div className="text-xs font-bold text-amber-400">{kp.faktor}</div>
            <div className="text-xs font-mono" style={{color:"#10b981"}}>{kp.agirlik}</div>
          </div>
          <div className="text-xs text-muted-foreground">{kp.ipucu}</div>
        </div>
      ))}
      <div className="p-2 rounded-lg mt-1" style={{background:"hsl(222 47% 5%)",fontSize:10}}>
        Kalite Puanı 1-10: 7+ = CPC indirim, 4- = CPC ek maliyet. Hedef: 8-10.
      </div>
    </div>
  );
}

/* 6. SEO Temelleri */
const SEO_KATEGORI = [
  {kat:"On-Page SEO",renk:"#10b981",maddeler:[
    'Title tag: 50-60 karakter, anahtar kelime basta',
    'Meta description: 150-160 karakter, CTA icermeli',
    'H1 bir tane, H2-H6 hiyerarsi',
    'URL kisa, anlamli, kucuk harf',
    'Alt text her gorsele',
    'IC linkleme: ortalama 3-5 link/sayfa',
  ]},
  {kat:"Off-Page SEO",renk:"#3B82F6",maddeler:[
    'Backlink kalitesi > miktari',
    'DA/DR yuksek sitelerden link',
    'Anchor text cesitlendirme',
    'Guest post, HARO, dijital PR',
    'Sosyal sinyal: paylasilabilir icerik',
    'E-E-A-T: Uzmanlik, Deneyim, Otorite, Guven',
  ]},
  {kat:"Teknik SEO",renk:"#F7931A",maddeler:[
    'Core Web Vitals: LCP <2.5sn, CLS <0.1',
    'Mobil uyumluluk (Mobile-First Index)',
    'HTTPS zorunlu',
    'Sitemap.xml ve robots.txt',
    'Canonical tag ile kopya icerik onleme',
    'Schema markup / structured data',
  ]},
];
function SeoTemelleri() {
  const [sel,setSel] = useState(0);
  const sc = SEO_KATEGORI[sel];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>🔍</span>
        <span className="text-sm font-semibold">SEO & İçerik Pazarlaması Kontrol Listesi</span>
      </div>
      <div className="flex gap-2 mb-3">
        {SEO_KATEGORI.map((sk,i)=>(
          <button key={i} onClick={()=>setSel(i)}
            className="flex-1 text-xs py-1.5 rounded-lg font-semibold"
            style={{background:sel===i?sk.renk:`${sk.renk}20`,color:sel===i?'#fff':sk.renk,border:`1px solid ${sk.renk}40`,cursor:"pointer"}}>
            {sk.kat}
          </button>
        ))}
      </div>
      <div className="p-3 rounded-xl" style={{background:"hsl(222 47% 5%)",border:`2px solid ${sc.renk}30`}}>
        {sc.maddeler.map((m,i)=>(
          <div key={i} className="flex items-start gap-2 mb-1.5">
            <span style={{color:sc.renk,flexShrink:0}}>✓</span>
            <span className="text-xs text-muted-foreground">{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 7. Email Pazarlama Benchmark */
const EMAIL_SEKTORLER = [
  {sektor:"E-ticaret",     acilma:"%15.7",tiklama:"%2.1",iptal:"%0.1",renk:"#10b981"},
  {sektor:"SaaS / Teknoloji",acilma:"%21.3",tiklama:"%2.8",iptal:"%0.2",renk:"#3B82F6"},
  {sektor:"B2B",           acilma:"%24.8",tiklama:"%3.6",iptal:"%0.3",renk:"#F7931A"},
  {sektor:"Finans",        acilma:"%20.4",tiklama:"%2.5",iptal:"%0.2",renk:"#8B5CF6"},
  {sektor:"Gayrimenkul",   acilma:"%18.9",tiklama:"%1.9",iptal:"%0.1",renk:"#EC4899"},
];
const EMAIL_IPUCLARI = [
  {l:"Gonderim Saati",v:"Sali-Persembe, 10:00 veya 15:00"},
  {l:"Konu Satiri",v:"40-50 karakter, emoji dikkat ceker, kisisellestirilmis"},
  {l:"Segmentasyon",v:"Davranissal (tiklama, satin alma) listeleri x4 acilma orani"},
  {l:"A/B Testi",v:"Konu satiri en onemli, %20 liste ile test"},
];
function EmailPazarlama() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>📧</span>
        <span className="text-sm font-semibold">Email Pazarlama — Sektör Benchmark 2025</span>
      </div>
      <div className="grid grid-cols-4 gap-1 mb-1">
        {['Sektör','Açılma','Tıklama','İptal'].map(h=>(
          <div key={h} className="text-xs font-semibold text-muted-foreground text-center">{h}</div>
        ))}
      </div>
      {EMAIL_SEKTORLER.map(e=>(
        <div key={e.sektor} className="grid grid-cols-4 gap-1 py-1.5" style={{borderBottom:"1px solid rgba(255,255,255,.04)"}}>
          <div className="text-xs font-semibold" style={{color:e.renk}}>{e.sektor}</div>
          <div className="text-xs font-mono text-center text-emerald-400">{e.acilma}</div>
          <div className="text-xs font-mono text-center text-blue-400">{e.tiklama}</div>
          <div className="text-xs font-mono text-center text-muted-foreground">{e.iptal}</div>
        </div>
      ))}
      <div className="space-y-1.5 mt-3">
        {EMAIL_IPUCLARI.map((ip,i)=>(
          <div key={i} className="flex gap-2">
            <span className="text-xs font-bold text-amber-400 shrink-0" style={{minWidth:90}}>{ip.l}</span>
            <span className="text-xs text-muted-foreground">{ip.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 8. Musteri Yasam Boyu Degeri */
const LTV_SENARYO = [
  {tip:"Duşük LTV",     cac:50,  ltv:150,  oran:3, renk:"#EF4444",not:"Kabul edilebilir minimum"},
  {tip:"Orta LTV",      cac:100, ltv:500,  oran:5, renk:"#F7931A",not:"Saglikli isletme"},
  {tip:"Yuksek LTV",    cac:200, ltv:2000, oran:10,renk:"#10b981",not:"Olceklenir buyume"},
  {tip:"Elite LTV",     cac:500, ltv:10000,oran:20,renk:"#3B82F6",not:"SaaS, premium hizmet"},
];
function MusteriLTVAnaliz() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-cyan-400"/>
        <span className="text-sm font-semibold">Müşteri Yaşam Boyu Değeri (LTV) Analizi</span>
      </div>
      <div className="p-2 rounded-lg mb-3 text-xs" style={{background:"hsl(222 47% 5%)"}}>
        <div className="font-bold text-cyan-400 mb-1">LTV Formülü</div>
        <div className="text-muted-foreground">LTV = Ort.Sipariş Değeri × Yıllık Satın Alma × Müşteri Ömrü (yıl)</div>
        <div className="text-muted-foreground mt-1">Örnek: ₺500 × 4/yıl × 3 yıl = <span className="text-cyan-400 font-bold">₺6.000 LTV</span></div>
      </div>
      <div className="text-xs font-semibold text-muted-foreground mb-2">LTV:CAC Oranı Senaryoları</div>
      {LTV_SENARYO.map(sc=>(
        <div key={sc.tip} className="flex items-center gap-2 p-2 rounded-lg mb-1.5" style={{background:"hsl(222 47% 5%)",border:`1px solid ${sc.renk}20`}}>
          <div className="flex-1">
            <span className="text-xs font-bold" style={{color:sc.renk}}>{sc.tip}</span>
            <div className="text-xs text-muted-foreground">CAC: ₺{sc.cac} → LTV: ₺{sc.ltv.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold font-mono" style={{color:sc.renk}}>{sc.oran}:1</div>
            <div className="text-xs text-muted-foreground" style={{fontSize:9}}>{sc.not}</div>
          </div>
        </div>
      ))}
      <div className="text-xs text-emerald-400 mt-2">Hedef: LTV:CAC orani min 3:1, ideal 5:1+</div>
    </div>
  );
}

/* 9. AB Testi Rehberi */
const AB_ELEMENTLER = [
  {el:"Başlık (H1)",   etki:5, sure:"1-2 hafta", ipucu:"En etkili degisken — ilk deneyin"},
  {el:"CTA Butonu",   etki:4, sure:"1-2 hafta", ipucu:"Renk, metin, yer — tek degisen test"},
  {el:"Gorsel/Video", etki:4, sure:"2-3 hafta", ipucu:"Insan yuzu vs urun — kontekste gore"},
  {el:'Fiyat Gorunum',etki:3, sure:'2-4 hafta', ipucu:'Fiyat cerceveleme: aylik vs yillik paket karsilastirma'},
  {el:"Form Alanlar", etki:3, sure:"1-2 hafta", ipucu:"Az alan = yuksek tamamlama orani"},
  {el:"Sayfa Yapisi", etki:2, sure:"3-4 hafta", ipucu:"Buyuk degisim, cok ziyaretci gerek"},
];
function ABTestRehberi() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>🧪</span>
        <span className="text-sm font-semibold">A/B Testi Rehberi — Metodoloji & Öncelikler</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[{l:"Minimum Trafik",v:"1.000+/varyant",renk:"#F7931A"},{l:"Güven Seviyesi",v:"%95 istatistiksel",renk:"#10b981"},{l:"Test Süresi",v:"Min. 2 hafta",renk:"#3B82F6"}].map(k=>(
          <div key={k.l} className="p-2 rounded-xl text-center" style={{background:"hsl(222 47% 5%)"}}>
            <div className="text-sm font-bold font-mono" style={{color:k.renk}}>{k.v}</div>
            <div className="text-xs text-muted-foreground">{k.l}</div>
          </div>
        ))}
      </div>
      <div className="text-xs font-semibold text-muted-foreground mb-2">Test Edilecek Elementler (Öncelik Sırasına Göre)</div>
      {AB_ELEMENTLER.map(ab=>(
        <div key={ab.el} className="flex items-center gap-2 py-1.5" style={{borderBottom:"1px solid rgba(255,255,255,.04)"}}>
          <div style={{width:3,height:28,background:"#8B5CF6",opacity:ab.etki/5,borderRadius:2,flexShrink:0}}/>
          <div className="flex-1">
            <div className="text-xs font-semibold">{ab.el}</div>
            <div className="text-xs text-muted-foreground" style={{fontSize:9}}>{ab.ipucu}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex gap-0.5 justify-end mb-0.5">
              {[...Array(5)].map((_,k)=><div key={k} style={{width:6,height:6,borderRadius:"50%",background:k<ab.etki?'#8B5CF6':'hsl(222 47% 15%)'}}/>)}
            </div>
            <div className="text-xs text-muted-foreground font-mono" style={{fontSize:9}}>{ab.sure}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* 10. Attribution Modelleri */
const ATTRIBUTION = [
  {model:"Son Tıklama",    renk:"#EF4444",puan:[0,0,0,0,100],   aciklama:"Satışı son kanala verir. Google Ads favorisi. Dönüşüm kanalını ödüllendirir."},
  {model:"İlk Tıklama",   renk:"#F7931A",puan:[100,0,0,0,0],   aciklama:"Keşif kanalını ödüllendirir. Marka farkındalığı kampanyaları için uygun."},
  {model:"Doğrusal",       renk:"#10b981",puan:[20,20,20,20,20],aciklama:"Tüm kanallar eşit kredi alır. Basit ama gerçekçi değil."},
  {model:"Zamana Dayalı",  renk:"#3B82F6",puan:[5,10,20,30,35], aciklama:"Satışa yakın temas noktaları daha fazla kredi alır."},
  {model:"Shapley (Data)", renk:"#8B5CF6",puan:[15,25,22,18,20],aciklama:"Oyun teorisi tabanlı, gerçek katkıyı ölçer. En doğru model."},
];
const KANALLAR = ['SEO','Email','Meta','Display','Google'];
function AttributionModelleri() {
  const [sel,setSel] = useState(4);
  const at = ATTRIBUTION[sel];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Megaphone className="w-4 h-4 text-purple-400"/>
        <span className="text-sm font-semibold">Pazarlama Attribution Modelleri</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ATTRIBUTION.map((at,i)=>(
          <button key={i} onClick={()=>setSel(i)}
            className="text-xs px-2 py-1 rounded-lg"
            style={{background:sel===i?at.renk:`${at.renk}20`,color:sel===i?'#fff':at.renk,border:`1px solid ${at.renk}40`,cursor:"pointer"}}>
            {at.model}
          </button>
        ))}
      </div>
      <div className="p-3 rounded-xl mb-3" style={{background:"hsl(222 47% 5%)",border:`2px solid ${at.renk}30`}}>
        <div className="text-xs text-muted-foreground mb-2">{at.aciklama}</div>
        <div className="flex items-end gap-2 h-16">
          {at.puan.map((p,i)=>(
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-mono font-bold" style={{color:at.renk}}>{p}%</span>
              <div className="w-full rounded-t" style={{height:`${Math.max(4,(p/100)*48)}px`,background:at.renk,opacity:.85}}/>
              <span className="text-muted-foreground" style={{fontSize:8}}>{KANALLAR[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 11. Sosyal Medya Algoritma Rehberi */
const SM_PLATFORMLAR = [
  {p:"Instagram",renk:"#E1306C",sıralar:['Kaydetme ve paylaşım > beğeni','Reels organik erişim x4','Story anket/soru: katılım artırır','İlk 30 dakika performansı kritik','Hashtag: 5-10 ilgili, niş tercih et']},
  {p:"TikTok",  renk:"#010101",siralar:["Tamamlanma oranı en onemli metrik","Ses trendi gorunurluk artırır","Dikey video, alt ucte metin","Ilk 3 saniye hook zorunlu","Niche toplulugu hedefle FYP"]},
  {p:"LinkedIn",renk:"#0077B5",sıralar:['Metin odaklı gönderi daha fazla erişim','Bağlantı olmadan harici link','Yorum sayısı paylaşımdan değerli','PDF carousel: x3 etkileşim','Kişisel profil > şirket sayfası']},
  {p:"YouTube", renk:"#EF4444",sıralar:['İzleme süresi > tıklama oranı','Thumbnail CTR: %4-10 hedef','İlk 30sn izleyici bağlama','Oynatma listesi saat geçirme süresini artırır','Anahtar kelime başlık + açıklama ilk 2 satır']},
];
function SosyalMedyaAlgoritmalar() {
  const [sel,setSel] = useState(0);
  const sm = SM_PLATFORMLAR[sel];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>📱</span>
        <span className="text-sm font-semibold">Sosyal Medya Algoritma Rehberi 2025</span>
      </div>
      <div className="flex gap-2 mb-3">
        {SM_PLATFORMLAR.map((pl,i)=>(
          <button key={i} onClick={()=>setSel(i)}
            className="flex-1 text-xs py-1.5 rounded-lg font-semibold"
            style={{background:sel===i?pl.renk:`${pl.renk}20`,color:sel===i?'#fff':pl.renk,border:`1px solid ${pl.renk}40`,cursor:"pointer"}}>
            {pl.p}
          </button>
        ))}
      </div>
      <div className="p-3 rounded-xl" style={{background:"hsl(222 47% 5%)",border:`2px solid ${sm.renk}30`}}>
        {sm.sıralar.map((si,i)=>(
          <div key={i} className="flex items-start gap-2 mb-1.5">
            <span className="font-bold shrink-0 text-xs" style={{color:sm.renk}}>{i+1}.</span>
            <span className="text-xs text-muted-foreground">{si}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 12. Influencer Pazarlama */
const INFLUENCER_TIPLERI = [
  {tip:"Nano",   takipci:"1K-10K",  eng:"%5-10",cpe:"Dusuk", renk:"#10b981",guclu:"Guvenir, niş, samimi"},
  {tip:"Micro",  takipci:"10K-100K",eng:"%3-5", cpe:"Orta",  renk:"#3B82F6",guclu:"Hedefli kitle, iyi ROI"},
  {tip:"Macro",  takipci:"100K-1M", eng:"%1-3", cpe:"Yuksek",renk:"#F7931A",guclu:"Genis erisim, marka"},
  {tip:"Mega/C", takipci:"1M+",     eng:"%0.5-1",cpe:"Cok Y",renk:"#8B5CF6",guclu:"Maxim goruntuleme"},
];
function InfluencerPazarlama() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>👤</span>
        <span className="text-sm font-semibold">Influencer Pazarlama — Tier Analizi & Metrikler</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {INFLUENCER_TIPLERI.map(it=>(
          <div key={it.tip} className="p-2.5 rounded-xl" style={{background:"hsl(222 47% 5%)",border:`1px solid ${it.renk}25`}}>
            <div className="text-xs font-bold mb-1" style={{color:it.renk}}>{it.tip} Influencer</div>
            <div className="text-xs text-muted-foreground">{it.takipci} takipçi</div>
            <div className="text-xs text-muted-foreground">Eng: {it.eng} · CPE: {it.cpe}</div>
            <div className="text-xs mt-1" style={{color:it.renk,fontSize:9}}>✦ {it.guclu}</div>
          </div>
        ))}
      </div>
      <div className="text-xs font-semibold text-muted-foreground mb-2">Performans Metrikleri</div>
      {[
        {l:"CPE (Etkileşim Başı Maliyet)",f:"Toplam Maliyet ÷ Toplam Etkileşim"},
        {l:"EMV (Kazanılan Medya Değeri)",f:"Etkileşim × Medya Değer Katsayısı"},
        {l:"Engagement Rate",             f:"(Beğeni+Yorum+Paylaşım) ÷ Takipçi × 100"},
        {l:"Story CTR",                   f:"Yukarı Kaydırma ÷ Görüntüleme × 100"},
      ].map(m=>(
        <div key={m.l} className="flex gap-2 py-1" style={{borderBottom:"1px solid rgba(255,255,255,.04)"}}>
          <span className="text-xs font-semibold text-pink-400 shrink-0" style={{minWidth:140}}>{m.l}</span>
          <span className="text-xs text-muted-foreground">{m.f}</span>
        </div>
      ))}
    </div>
  );
}

/* 13. Marka Konumlandirma */
const KONUMLANDIRMA_MATRISI = [
  {marka:"Premium/Uzman",   fiyat:"Yuksek",kalite:"Yuksek",renk:"#10b981",ornek:"Apple, Rolex, McKinsey"},
  {marka:"Deger Odakli",    fiyat:"Orta",  kalite:"Yuksek",renk:"#3B82F6",ornek:"IKEA, Zara, Toyota"},
  {marka:"Lider & Hacimci", fiyat:"Dusuk", kalite:"Orta",  renk:"#F7931A",ornek:"Amazon, Walmart, Shein"},
  {marka:"Niş Uzman",       fiyat:"Yuksek",kalite:"Niş",   renk:"#8B5CF6",ornek:"Red Bull, GoPro, Tesla"},
];
const KONUM_ADİMLARI = [
  'Hedef kitleyi net tanımla (Jobs-to-be-done)',
  'Rakipler analizi: güçlü/zayıf yönler haritala',
  'Benzersiz değer önerisi (UVP) yaz: "X için Y yapan tek Z"',
  'Marka sesi ve ton belirleme (formal/samimi/teknik)',
  'Tutarlı görsel kimlik: renk, tipografi, ikon',
  'Mesaj testi: hangi önerme en yüksek CTR?',
];
function MarkaKonumlandirma() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>🏆</span>
        <span className="text-sm font-semibold">Marka Konumlandırma Matrisi & Stratejisi</span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">Fiyat — Kalite Ekseni Konumlandırma:</div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {KONUMLANDIRMA_MATRISI.map(k=>(
          <div key={k.marka} className="p-2.5 rounded-xl" style={{background:"hsl(222 47% 5%)",border:`1px solid ${k.renk}25`}}>
            <div className="text-xs font-bold" style={{color:k.renk}}>{k.marka}</div>
            <div className="text-xs text-muted-foreground">Fiyat: {k.fiyat} · Kalite: {k.kalite}</div>
            <div className="text-xs mt-1 text-muted-foreground" style={{fontSize:9}}>Örnek: {k.ornek}</div>
          </div>
        ))}
      </div>
      <div className="text-xs font-semibold text-muted-foreground mb-1">Konumlandırma Adımları:</div>
      {KONUM_ADİMLARI.map((ad,i)=>(
        <div key={i} className="flex gap-2 py-1" style={{borderBottom:"1px solid rgba(255,255,255,.04)"}}>
          <span className="text-xs font-bold shrink-0" style={{color:"#8B5CF6",minWidth:16}}>{i+1}.</span>
          <span className="text-xs text-muted-foreground">{ad}</span>
        </div>
      ))}
    </div>
  );
}

/* 14. Pazarlama Metrikleri KPI Dashboard */
const KPI_METRIKLER = [
  {grup:"Trafik",    renk:"#3B82F6",metrikler:[
    {isim:"Organik Trafik",      hedef:">%10/ay art.",birim:''},
    {isim:"Bounсe Rate",         hedef:"<%50",         birim:''},
    {isim:"Sayfa/Oturum",        hedef:">2.5",         birim:''},
    {isim:"Ort. Oturum Suresi",  hedef:">2 dk",        birim:''},
  ]},
  {grup:"Donusum",   renk:"#10b981",metrikler:[
    {isim:"CVR (Genel)",         hedef:"%2-4",          birim:''},
    {isim:"Lead CVR",            hedef:"%5-15",         birim:''},
    {isim:"Cart Abandon Rate",   hedef:"<%70",          birim:''},
    {isim:"Checkout CVR",        hedef:"%2-5",          birim:''},
  ]},
  {grup:"Musteri",   renk:"#F7931A",metrikler:[
    {isim:"NPS Puanı",           hedef:">50 = iyi",     birim:''},
    {isim:"Churn Rate (SaaS)",   hedef:"<%5/ay",        birim:''},
    {isim:"MRR Buyume",          hedef:">%10/ay",       birim:''},
    {isim:"CSAT Skoru",          hedef:">%80 memnun",   birim:''},
  ]},
];
function PazarlamaKPIDashboard() {
  const [sel,setSel] = useState(0);
  const gk = KPI_METRIKLER[sel];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>📊</span>
        <span className="text-sm font-semibold">Pazarlama KPI Dashboard — Takip Edilmesi Gerekenler</span>
      </div>
      <div className="flex gap-2 mb-3">
        {KPI_METRIKLER.map((gk,i)=>(
          <button key={i} onClick={()=>setSel(i)}
            className="flex-1 text-xs py-1.5 rounded-lg font-semibold"
            style={{background:sel===i?gk.renk:`${gk.renk}20`,color:sel===i?'#fff':gk.renk,border:`1px solid ${gk.renk}40`,cursor:"pointer"}}>
            {gk.grup}
          </button>
        ))}
      </div>
      <div className="p-3 rounded-xl" style={{background:"hsl(222 47% 5%)",border:`2px solid ${gk.renk}30`}}>
        {gk.metrikler.map((m,i)=>(
          <div key={i} className="flex items-center justify-between py-1.5" style={{borderBottom:i<3?'1px solid rgba(255,255,255,.05)':''}}>
            <span className="text-xs font-semibold">{m.isim}</span>
            <span className="text-xs font-mono font-bold" style={{color:gk.renk}}>{m.hedef}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 15. Pazarlama Otomasyon Aracları */
const OTOMASYON_ARACLAR = [
  {kategori:"Email Mkt",    renk:"#3B82F6",araclar:['Klaviyo (e-tic, segment)','Mailchimp (baslangic)','ActiveCampaign (otomasyon)','HubSpot (CRM entegre)']},
  {kategori:"CRM",          renk:"#10b981",araclar:['HubSpot (ucretsiz plan+)','Salesforce (kurumsal)','Pipedrive (satis odakli)','Notion CRM (basit)']},
  {kategori:"Sosyal Medya", renk:"#EC4899",araclar:['Buffer (planlama)','Hootsuite (analitik+)','Later (Instagram odakli)','Sprout Social (ajans)']},
  {kategori:"Analitik",     renk:"#F7931A",araclar:['GA4 (zorunlu)','Hotjar (isi haritasi)','Mixpanel (davranissal)','Amplitude (product)']},
  {kategori:"SEO",          renk:"#8B5CF6",araclar:['Ahrefs (backlink)','SEMrush (anahtar kl.)','Screaming Frog (teknik)','Surfer SEO (icerik)']},
];
function PazarlamaOtomasyon() {
  const [sel,setSel] = useState(0);
  const ot = OTOMASYON_ARACLAR[sel];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>⚙️</span>
        <span className="text-sm font-semibold">Pazarlama Araçları & Otomasyon Stack</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {OTOMASYON_ARACLAR.map((ot,i)=>(
          <button key={i} onClick={()=>setSel(i)}
            className="text-xs px-2.5 py-1 rounded-lg font-semibold"
            style={{background:sel===i?ot.renk:`${ot.renk}20`,color:sel===i?'#fff':ot.renk,border:`1px solid ${ot.renk}40`,cursor:"pointer"}}>
            {ot.kategori}
          </button>
        ))}
      </div>
      <div className="p-3 rounded-xl" style={{background:"hsl(222 47% 5%)",border:`2px solid ${ot.renk}30`}}>
        {ot.araclar.map((ar,i)=>(
          <div key={i} className="flex items-center gap-2 py-1.5" style={{borderBottom:i<3?'1px solid rgba(255,255,255,.05)':''}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:ot.renk,flexShrink:0}}/>
            <span className="text-xs text-muted-foreground">{ar}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 p-2 rounded-lg" style={{background:"hsl(222 47% 5%)",fontSize:10}}>
        Otomasyon Altın Kuralı: Önce süreci optimize et, sonra otomatikleştir. Kötü sürecin otomasyonu kötü sonuçları hızlandırır.
      </div>
    </div>
  );
}

/* ══ WRAPPER ════════════════════════════════════════════════════════ */
function PazarlamaModulleri() {
  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:16, marginTop:24}}>
      <KanalROI />
      <DonusumHunisi />
      <PazarlamaFormulleri />
      <MetaReklamRehberi />
      <GoogleAdsOptimizasyon />
      <SeoTemelleri />
      <EmailPazarlama />
      <MusteriLTVAnaliz />
      <ABTestRehberi />
      <AttributionModelleri />
      <SosyalMedyaAlgoritmalar />
      <InfluencerPazarlama />
      <MarkaKonumlandirma />
      <PazarlamaKPIDashboard />
      <PazarlamaOtomasyon />
    </div>
  );
}

export default function MarketingPage() {
  const [campaigns] = useState(generateCampaigns());
  const [attribution] = useState(generateChannelAttribution());
  const [timeSeries] = useState(generateCampaignTimeSeries(60));
  const [audience] = useState(generateAudienceInsights());
  const [activeTab, setActiveTab] = useState<'campaigns' | 'attribution' | 'audience'>('campaigns');

  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const totalSpend = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const avgROAS = totalRevenue / totalSpend;

  return (
    <div className="p-4 space-y-4 max-w-screen-2xl mx-auto">
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Toplam Harcama', value: `₺${(totalSpend / 1000).toFixed(0)}K`, color: '#00d4ff', sub: `${campaigns.filter(c => c.status === 'active').length} aktif kampanya` },
          { label: 'Toplam Gelir', value: `₺${(totalRevenue / 1e6).toFixed(2)}M`, color: '#10b981', sub: `ROAS: ×${avgROAS.toFixed(1)}` },
          { label: 'Toplam Dönüşüm', value: totalConversions.toLocaleString(), color: '#8b5cf6', sub: `Ort. CPA: ₺${(totalSpend / totalConversions).toFixed(0)}` },
          { label: 'Shapley Atıf', value: 'Aktif', color: '#f59e0b', sub: 'Oyun teorisi tabanlı' },
        ].map(k => (
          <div key={k.label} className="metric-card card-hover">
            <div className="text-lg font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="text-xs font-mono mt-0.5" style={{ color: k.color, opacity: 0.7, fontSize: '10px' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['campaigns', 'attribution', 'audience'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'tab-active' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab === 'campaigns' ? '📊 Kampanyalar' : tab === 'attribution' ? '🔬 Shapley Atıf' : '👥 Kitle Analizi'}
          </button>
        ))}
      </div>

      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="metric-card overflow-auto">
            <table className="w-full text-xs data-table">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  {['Kampanya', 'Kanal', 'Harcama', 'Gelir', 'ROAS', 'Dönüşüm', 'CPA', 'CTR', 'Durum'].map(h => (
                    <th key={h} className={`pb-2 font-medium ${h === 'Kampanya' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-b border-border/30">
                    <td className="py-2 font-medium text-foreground pr-4">{c.name}</td>
                    <td className="py-2 text-right text-muted-foreground">{c.channel}</td>
                    <td className="py-2 text-right font-mono">₺{c.spent.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono text-emerald-400">₺{(c.revenue / 1000).toFixed(0)}K</td>
                    <td className="py-2 text-right font-mono font-semibold" style={{ color: c.roas > 50 ? '#10b981' : c.roas > 20 ? '#f59e0b' : '#ef4444' }}>
                      ×{c.roas.toFixed(1)}
                    </td>
                    <td className="py-2 text-right font-mono">{c.conversions}</td>
                    <td className="py-2 text-right font-mono">₺{c.cpa.toFixed(0)}</td>
                    <td className="py-2 text-right font-mono">{c.ctr.toFixed(2)}%</td>
                    <td className="py-2 text-right">
                      <span className="px-1.5 py-0.5 rounded text-xs" style={{
                        background: c.status === 'active' ? 'hsl(158 64% 42% / 0.15)' : 'hsl(38 92% 50% / 0.15)',
                        color: c.status === 'active' ? '#10b981' : '#f59e0b',
                      }}>
                        {c.status === 'active' ? 'Aktif' : 'Duraklatıldı'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Time series */}
          <div className="grid grid-cols-2 gap-3">
            <div className="metric-card">
              <div className="text-sm font-semibold mb-1">Günlük Harcama & Gelir</div>
              <div className="text-xs text-muted-foreground mb-2">60 gün · GBM simülasyon</div>
              <DoubleLineChart d1={timeSeries.spend} d2={timeSeries.revenue.map(r => r / 10)} c1="hsl(0 84% 60%)" c2="hsl(158 64% 52%)" height={80} />
              <div className="flex gap-3 text-xs mt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-red-400 inline-block" /> Harcama (×10)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-400 inline-block" /> Gelir (/10)</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="text-sm font-semibold mb-1">ROAS Trendi</div>
              <div className="text-xs text-muted-foreground mb-2">60 gün · Rolling average</div>
              <DoubleLineChart d1={timeSeries.roas} d2={[]} c1="hsl(199 95% 55%)" c2="" height={80} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attribution' && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5 metric-card">
            <div className="text-sm font-semibold mb-1">Shapley Değeri Atıf Modeli</div>
            <div className="text-xs text-muted-foreground mb-4">
              Oyun teorisi tabanlı · Koalisyon katkıları · 2.000 Monte Carlo permütasyon
            </div>
            <div className="space-y-3">
              {attribution.map(ch => (
                <div key={ch.channel} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: ch.color }} />
                      <span className="text-foreground font-medium">{ch.channel}</span>
                    </div>
                    <div className="flex gap-3 font-mono text-muted-foreground">
                      <span className="font-semibold" style={{ color: ch.color }}>{(ch.shapleyShare * 100).toFixed(1)}%</span>
                      <span>₺{(ch.revenue / 1e6).toFixed(1)}M</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-muted">
                    <div className="h-full rounded-l" style={{ width: `${ch.shapleyShare * 100}%`, background: ch.color }} />
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground" style={{ fontSize: '10px' }}>
                    <span>Son temas: {(ch.lastTouchShare * 100).toFixed(1)}%</span>
                    <span>İlk temas: {(ch.firstTouchShare * 100).toFixed(1)}%</span>
                    <span>Lineer: {(ch.linearShare * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-7 metric-card">
            <div className="text-sm font-semibold mb-3">Atıf Modeli Karşılaştırması</div>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left pb-2">Kanal</th>
                    <th className="text-right pb-2">Shapley</th>
                    <th className="text-right pb-2">Son Temas</th>
                    <th className="text-right pb-2">İlk Temas</th>
                    <th className="text-right pb-2">Lineer</th>
                    <th className="text-right pb-2">Gelir</th>
                  </tr>
                </thead>
                <tbody>
                  {attribution.map(ch => (
                    <tr key={ch.channel} className="border-b border-border/30">
                      <td className="py-2 font-medium" style={{ color: ch.color }}>{ch.channel}</td>
                      <td className="py-2 text-right font-mono font-bold" style={{ color: ch.color }}>{(ch.shapleyShare * 100).toFixed(1)}%</td>
                      <td className="py-2 text-right font-mono text-muted-foreground">{(ch.lastTouchShare * 100).toFixed(1)}%</td>
                      <td className="py-2 text-right font-mono text-muted-foreground">{(ch.firstTouchShare * 100).toFixed(1)}%</td>
                      <td className="py-2 text-right font-mono text-muted-foreground">{(ch.linearShare * 100).toFixed(1)}%</td>
                      <td className="py-2 text-right font-mono text-emerald-400">₺{(ch.revenue / 1e6).toFixed(1)}M</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audience' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="metric-card">
            <div className="text-sm font-semibold mb-3">Yaş Grubu Analizi</div>
            <div className="space-y-2">
              {audience.ageGroups.map(g => (
                <div key={g.age} className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{g.age}</span>
                    <span className="font-mono text-foreground">{g.pct}% · CPA ₺{g.cpa} · CTR {g.ctr}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${g.pct * 3}%`, background: 'hsl(199 95% 55%)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="metric-card">
            <div className="text-sm font-semibold mb-3">En İyi Lokasyonlar</div>
            <div className="space-y-2">
              {audience.topLocations.map(l => (
                <div key={l.city} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'hsl(222 47% 5%)' }}>
                  <span className="text-xs font-medium text-foreground">{l.city}</span>
                  <div className="text-right text-xs font-mono">
                    <div className="text-emerald-400">ROAS ×{l.roas}</div>
                    <div className="text-muted-foreground">{l.conversions} konv.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="metric-card">
            <div className="text-sm font-semibold mb-3">Cihaz Dağılımı</div>
            <div className="space-y-3">
              {audience.devices.map(d => (
                <div key={d.device} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{d.device}</span>
                    <span className="font-mono text-foreground">{d.pct}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: 'hsl(271 91% 65%)' }} />
                  </div>
                  <div className="text-xs text-muted-foreground" style={{ fontSize: '10px' }}>
                    CTR {d.ctr}% · Dönüşüm %{d.convRate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <PazarlamaModulleri />
    </div>
  );
}

function DoubleLineChart({ d1, d2, c1, c2, height }: { d1: number[]; d2: number[]; c1: string; c2: string; height: number }) {
  const all = [...d1, ...d2].filter(Boolean);
  if (all.length === 0) return null;
  const min = Math.min(...all) * 0.95, max = Math.max(...all) * 1.05;
  const n = d1.length;
  const toX = (i: number) => (i / (n - 1)) * 100;
  const toY = (v: number) => height - ((v - min) / (max - min)) * height;
  const p1 = d1.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
  const p2 = d2.length > 0 ? d2.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ') : '';
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height, display: 'block' }} preserveAspectRatio="none">
      <path d={`${p1} L100,${height} L0,${height} Z`} fill={c1} opacity="0.06" />
      <path d={p1} fill="none" stroke={c1} strokeWidth="0.6" />
      {p2 && <path d={p2} fill="none" stroke={c2} strokeWidth="0.6" />}
    </svg>
  );
}
