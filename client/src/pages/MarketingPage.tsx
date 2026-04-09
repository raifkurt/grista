import { useState } from 'react';
import { generateCampaigns, generateChannelAttribution, generateCampaignTimeSeries, generateAudienceInsights } from '@/lib/data/marketingData';
import { Megaphone, TrendingUp, Users, Target, DollarSign } from 'lucide-react';


/* ══ GAYRIMENKUL PAZARLAMA MODÜLLERİ — İSTANBUL & ATİNA ════════════ */

/* 1. Gayrimenkul Kanal ROI */
const GR_KANAL = [
  {kanal:'Sahibinden / Emlakjet',     roi:920,  cpl:85,   renk:'#10b981',ikon:'🏠',not:'TR portalleri — kira+satis'},
  {kanal:'Google Ads (arama)',         roi:680,  cpl:120,  renk:'#F7931A',ikon:'🔍',not:'Niyet bazlı, yuksek donusum'},
  {kanal:'Meta Reklam (video)',        roi:540,  cpl:95,   renk:'#1877F2',ikon:'📘',not:'Gorsel proje tanitimi'},
  {kanal:'Instagram Reels',           roi:480,  cpl:75,   renk:'#E1306C',ikon:'📸',not:'Daire turu, mahalle videosu'},
  {kanal:'Email (yatirimci listesi)', roi:1840, cpl:12,   renk:'#8B5CF6',ikon:'📧',not:'En yuksek ROI — sicak liste'},
  {kanal:'LinkedIn (kurumsal)',        roi:420,  cpl:180,  renk:'#0077B5',ikon:'💼',not:'Expat, kurumsal yatirimci'},
  {kanal:'WhatsApp Broadcast',        roi:720,  cpl:8,    renk:'#25D366',ikon:'💬',not:'Direkt, kisisel dokunma'},
  {kanal:'YouTube (proje turu)',       roi:380,  cpl:145,  renk:'#EF4444',ikon:'▶️',not:'Uzun vadeli marka'},
  {kanal:'Spitogatos / Atina Portali',roi:760,  cpl:110,  renk:'#1d63ed',ikon:'🇬🇷',not:'Atina icin zorunlu'},
  {kanal:'SEO / Blog (mahalle rehb.)',roi:1260, cpl:28,   renk:'#84CC16',ikon:'📝',not:'Uzun vadeli organik'},
];
function GRKanalROI() {
  const maxROI = Math.max(...GR_KANAL.map(k=>k.roi));
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-emerald-400"/>
        <span className="text-sm font-semibold">Gayrimenkul Pazarlama Kanalları — ROI & CPL</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">Maliyet/Lead (CPL) ve ROI · İstanbul & Atina portföy satışları</div>
      {GR_KANAL.sort((a,b)=>b.roi-a.roi).map(k=>(
        <div key={k.kanal} className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span style={{fontSize:13}}>{k.ikon}</span>
              <span className="text-xs font-semibold">{k.kanal}</span>
              <span className="text-xs text-muted-foreground" style={{fontSize:9}}>{k.not}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">CPL ₺{k.cpl}</span>
              <span className="text-sm font-bold font-mono" style={{color:k.renk}}>%{k.roi}</span>
            </div>
          </div>
          <div className="h-2 rounded-full" style={{background:'hsl(222 47% 8%)'}}>
            <div className="h-2 rounded-full" style={{width:`${(k.roi/maxROI)*100}%`,background:k.renk,opacity:.85}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

/* 2. Alıcı Yolculugu Huniusu */
const ALICI_HUNI = [
  {kat:'Farkındalık',  oran:100,renk:'#3B82F6',ikon:'👁',
   kim:'Kira odemekten sikkan kiracı / Yatirimci / Expat',
   mesaj:'İstanbul\'da kira mı, kredi mi? Hesapla',
   kanal:['Blog: mahalle rehberi','Instagram Reels: daire turu','Google: konut fiyatlari'],
   metrik:'Erisim, gorunum, blog okuma'},
  {kat:'İlgi',        oran:28, renk:'#8B5CF6',ikon:'🤔',
   kim:'Aktif arastiran, bolgeli hesaplar yapan',
   mesaj:'Beşiktaş\'ta 2+1 — m2 başı ₺268K · 5 dk yuruyus metro',
   kanal:['Email: bolge raporu','Retargeting: gezdigi ilanlar','WhatsApp: fiyat listesi'],
   metrik:'Lead formu, WhatsApp mesaj, email kaydi'},
  {kat:'Değerlendirme',oran:12, renk:'#EC4899',ikon:'📊',
   kim:'2-3 proje karsilastiran, fizibilite yapan',
   mesaj:'Atina vs Istanbul: €250K yatirimin 5 yil projeksiyonu',
   kanal:['1-1 Zoom gorusme','Fiziksel tur','Hesaplayici arac'],
   metrik:'Gorusme, tur rezervasyonu, teklif istegi'},
  {kat:'Karar',       oran:6,  renk:'#10b981',ikon:'✅',
   kim:'Sozlesme imzalamaya hazir',
   mesaj:'Bu hafta sozlesme: noterde randevu + tapu sureci',
   kanal:['Kisisel agent teması','Acil teklif (son 2 daire)','Referans musteri'],
   metrik:'On sozlesme, depozito, tapu'},
];
function AliciYolculugu() {
  const [sel,setSel] = useState(0);
  const h = ALICI_HUNI[sel];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-purple-400"/>
        <span className="text-sm font-semibold">Gayrimenkul Alıcı Yolculuğu — 4 Aşamalı Huni</span>
      </div>
      <div className="flex gap-1.5 mb-3">
        {ALICI_HUNI.map((ah,i)=>(
          <button key={i} onClick={()=>setSel(i)}
            className="flex-1 text-xs py-1.5 rounded-lg font-semibold"
            style={{background:sel===i?ah.renk:`${ah.renk}20`,color:sel===i?'#fff':ah.renk,border:`1px solid ${ah.renk}40`,cursor:'pointer'}}>
            {ah.kat}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-1 h-16 mb-3">
        {ALICI_HUNI.map((ah,i)=>(
          <div key={i} className="flex-1 rounded-t flex items-end justify-center"
            style={{height:`${ah.oran}%`,background:i===sel?ah.renk:`${ah.renk}40`,cursor:'pointer'}}
            onClick={()=>setSel(i)}>
            <span className="text-white font-mono font-bold" style={{fontSize:9}}>{ah.oran}%</span>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl" style={{background:'hsl(222 47% 5%)',border:`2px solid ${h.renk}30`}}>
        <div className="text-xs font-bold mb-1" style={{color:h.renk}}>{h.ikon} {h.kat} — Kim bunlar?</div>
        <div className="text-xs text-muted-foreground mb-2">{h.kim}</div>
        <div className="text-xs font-semibold mb-1" style={{color:h.renk}}>Mesaj:</div>
        <div className="text-xs text-muted-foreground italic mb-2">"{h.mesaj}"</div>
        <div className="text-xs font-semibold mb-1" style={{color:h.renk}}>Kanallar:</div>
        {h.kanal.map((c,k)=><div key={k} className="text-xs text-muted-foreground">→ {c}</div>)}
      </div>
    </div>
  );
}

/* 3. Gayrimenkul KPI'lar */
const GR_KPI = [
  {isim:'Maliyet/Lead (CPL)',      hedef:'₺50-150',        iyi:'<₺80',         renk:'#F7931A',aciklama:'Bir potansiyel alıcının elde edilme maliyeti'},
  {isim:'Lead-to-Tour Orani',      hedef:'%15-25',          iyi:'>%20',         renk:'#10b981',aciklama:'Leadlerin kaca fiziksel tur yaptiginiz'},
  {isim:'Tour-to-Offer Orani',     hedef:'%20-35',          iyi:'>%30',         renk:'#3B82F6',aciklama:'Tur yapanlarin kaca teklif verdigini'},
  {isim:'Offer-to-Close Orani',    hedef:'%60-80',          iyi:'>%70',         renk:'#8B5CF6',aciklama:'Tekliften sozlesmeye donusum'},
  {isim:'Satis Suresi (Gunden)',   hedef:'30-90 gun',       iyi:'<45 gun',      renk:'#EC4899',aciklama:'Listeden sozlesmeye gecen sure'},
  {isim:'Maliyet/Satis (CPS)',     hedef:'₺5K-25K',        iyi:'<₺12K',        renk:'#EF4444',aciklama:'Bir satis kapamak icin toplam pazarlama harcamasi'},
  {isim:'Musteri LTV',             hedef:'₺40K-150K',      iyi:'>₺80K',        renk:'#84CC16',aciklama:'Tekrar satis + yonlendirme + kira yonetimi geliri'},
  {isim:'NPS (Musteri Tavsiyesi)', hedef:'50-70',           iyi:'>60',          renk:'#06B6D4',aciklama:'Net Promoter Score — musteri memnuniyeti'},
];
function GayrimenkulKPI() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>📊</span>
        <span className="text-sm font-semibold">Gayrimenkul Pazarlama KPI Dashboard</span>
      </div>
      {GR_KPI.map((k,i)=>(
        <div key={i} className="flex items-center gap-2 py-1.5" style={{borderBottom:'1px solid rgba(255,255,255,.05)'}}>
          <div style={{width:3,height:32,background:k.renk,borderRadius:2,flexShrink:0}}/>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold">{k.isim}</div>
            <div className="text-xs text-muted-foreground" style={{fontSize:9}}>{k.aciklama}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-bold font-mono" style={{color:k.renk}}>{k.iyi}</div>
            <div className="text-xs text-muted-foreground font-mono" style={{fontSize:9}}>Ortalama: {k.hedef}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* 4. Meta Reklam — Konut */
const META_KONUT = [
  {format:'Video Tur (60sn)',   sonuc:'En yuksek CTR',  maliyet:'Orta',  ipucu:'Drone giris + daire icinden + manzara. Hook: "Bu fiyata son 2 daire"'},
  {format:'Carousel — Proje',  sonuc:'Cok unit goster',maliyet:'Dusuk', ipucu:'Her kart: farkli kat plani. Son kart: fiyat + CTA'},
  {format:'Reels — Mahalle',   sonuc:'Organik his',     maliyet:'Dusuk', ipucu:'Metro/market/okul mesafesi. Muzik trendi + altyazi'},
  {format:'Single Image — ROI',sonuc:'Yatirimci hedef', maliyet:'Dusuk', ipucu:'Rakam one ciksin: %4.8 kira getirisi, 5 yil +%112'},
  {format:'Lead Form Reklamlari',sonuc:'Anlik lead',    maliyet:'Orta',  ipucu:'3 alan max: Ad, Telefon, Ilgilendigi bolge'},
];
const META_HEDEF_KITLE = [
  {segment:'Yerel Alıcı',      yas:'28-45',gelir:'Ust orta+',ilgi:'Konut, yatirim, mortgage',renk:'#EF4444'},
  {segment:'Yabanci Yatirimci',yas:'35-55',gelir:'Yuksek',   ilgi:'Turiye, GR, global',     renk:'#1877F2'},
  {segment:'Expat Kiracı',     yas:'25-40',gelir:'Orta+',    ilgi:'Expat gruplari, Atina',   renk:'#10b981'},
  {segment:'Lookalike',        yas:'Otomatik',gelir:'Benzer',ilgi:'Mevcut musteriler x%3',  renk:'#8B5CF6'},
];
function MetaKonutReklam() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>📘</span>
        <span className="text-sm font-semibold">Meta Reklam — Konut & Proje Pazarlama</span>
      </div>
      <div className="text-xs font-semibold text-muted-foreground mb-2">Format Stratejisi (funnel asamasina gore)</div>
      <div className="space-y-1.5 mb-3">
        {META_KONUT.map((m,i)=>(
          <div key={i} className="p-2 rounded-xl" style={{background:'hsl(222 47% 5%)'}}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-bold text-blue-400">{m.format}</span>
              <div className="flex gap-2">
                <span className="text-xs text-emerald-400 font-mono">{m.sonuc}</span>
                <span className="text-xs text-muted-foreground">Maliyet:{m.maliyet}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{m.ipucu}</div>
          </div>
        ))}
      </div>
      <div className="text-xs font-semibold text-muted-foreground mb-2">Hedef Kitle Segmentleri</div>
      <div className="grid grid-cols-2 gap-2">
        {META_HEDEF_KITLE.map((hk,i)=>(
          <div key={i} className="p-2 rounded-xl" style={{background:'hsl(222 47% 5%)',border:`1px solid ${hk.renk}25`}}>
            <div className="text-xs font-bold mb-1" style={{color:hk.renk}}>{hk.segment}</div>
            <div className="text-xs text-muted-foreground">Yas: {hk.yas}</div>
            <div className="text-xs text-muted-foreground" style={{fontSize:9}}>{hk.ilgi}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 5. Google Ads — Emlak Keywords */
const ANAHTAR_KELIMELER = [
  {tur:'Yuksek Niyet (BOFU)', renk:'#10b981', kelimeler:['istanbul satilik daire','istanbul daire fiyatlari 2026','besiktas 2+1 fiyat','atina daire satin al','athens apartment buy','golden visa greece property']},
  {tur:'Orta Niyet (MOFU)',   renk:'#F7931A', kelimeler:['istanbul konut yatirim','atina gayrimenkul getiri','istanbul mahalle karsilastirma','besiktas vs kadikoy fiyat','athens real estate roi','greece property investment 2026']},
  {tur:'Bilgi Arayanlar (TOFU)',renk:'#3B82F6',kelimeler:['istanbul kira mi kredi mi','atina golden visa nedir','istanbul konut endeksi','m2 fiyatlari istanbul 2026','athens rent vs buy','greece golden visa cost']},
  {tur:'Marka + Rakip',       renk:'#8B5CF6', kelimeler:['sahibinden alternatifleri','istanbul emlak ofisi','atina ev kiralik','turkiye konut yatirim','en iyi istanbul ilce']},
];
function GoogleAdsEmlak() {
  const [sel,setSel] = useState(0);
  const ak = ANAHTAR_KELIMELER[sel];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>🎯</span>
        <span className="text-sm font-semibold">Google Ads — Gayrimenkul Anahtar Kelime Stratejisi</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ANAHTAR_KELIMELER.map((ak,i)=>(
          <button key={i} onClick={()=>setSel(i)}
            className="text-xs px-2 py-1 rounded-lg font-semibold"
            style={{background:sel===i?ak.renk:`${ak.renk}20`,color:sel===i?'#fff':ak.renk,border:`1px solid ${ak.renk}40`,cursor:'pointer'}}>
            {ak.tur}
          </button>
        ))}
      </div>
      <div className="p-3 rounded-xl" style={{background:'hsl(222 47% 5%)',border:`2px solid ${ak.renk}30`}}>
        <div className="flex flex-wrap gap-2">
          {ak.kelimeler.map((kw,i)=>(
            <span key={i} className="text-xs px-2 py-1 rounded-full" style={{background:`${ak.renk}15`,color:ak.renk,border:`1px solid ${ak.renk}30`}}>
              {kw}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {[{l:'Ort. CPC (TR)',v:'₺8-35'},{l:'Ort. CPC (GR)',v:'€0.8-3.5'},{l:'Hedef CVR',v:'%3-8'}].map(k=>(
          <div key={k.l} className="p-2 rounded-xl text-center" style={{background:'hsl(222 47% 5%)'}}>
            <div className="text-sm font-bold font-mono" style={{color:ak.renk}}>{k.v}</div>
            <div className="text-xs text-muted-foreground">{k.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 6. SEO — Mahalle & Bolge Icerik */
const SEO_ICERIK = [
  {tip:'Mahalle Rehberi',   oncelik:5,renk:'#10b981',ornekler:['Besiktas\'ta Yasam Rehberi 2026','Kadikoy vs Atasehir: Hangisi Daha Iyi?','Kolonaki, Atina: Sakin ve Fiyat Rehberi'],    aciklama:'Organik trafik icin en etkili. Uzun kuyruklu kelimeler.'},
  {tip:'Piyasa Raporu',     oncelik:5,renk:'#3B82F6',ornekler:['Istanbul Konut Fiyat Endeksi Nisan 2026','Atina Kira Piyasasi Q1 2026 Raporu','Turkiye Gayrimenkul Yatirim Rehberi'],  aciklama:'Backlink ceker, B2B ve yatirimcilara ulasirir.'},
  {tip:'Karsilastirma',     oncelik:4,renk:'#F7931A',ornekler:['Istanbul vs Atina: 250K Yatirim Karsilastirma','Kira mi Kredi mi? 2026 Hesaplamalari','Golden Visa: GR vs PT vs MT'],          aciklama:'Yuksek niyet, karar asamasindaki okuyucular.'},
  {tip:'Hesaplayici Araclar',oncelik:4,renk:'#8B5CF6',ornekler:['Istanbul Kira Getiri Hesaplayici','Mortgage Odeme Plani','Golden Visa Yatirim Tutari Hesapla'],                          aciklama:'Uzun oturma suresi, backlink, lead generator.'},
  {tip:'Sss (FAQ) Icerik',  oncelik:3,renk:'#EC4899',ornekler:['Yabanci Uyruklu Ev Alabilir mi?','Tapu Masraflari Ne Kadar?','Atina\'da Kira Getirisi Yuzde Kac?'],                         aciklama:'Google Featured Snippet icin optimize edilir.'},
];
function SEOGayrimenkul() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>🔍</span>
        <span className="text-sm font-semibold">SEO Stratejisi — Gayrimenkul İçerik Planlama</span>
      </div>
      {SEO_ICERIK.map((si,i)=>(
        <div key={i} className="p-2.5 rounded-xl mb-2" style={{background:'hsl(222 47% 5%)',border:`1px solid ${si.renk}20`}}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold" style={{color:si.renk}}>{si.tip}</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_,k)=><div key={k} style={{width:6,height:6,borderRadius:'50%',background:k<si.oncelik?si.renk:'hsl(222 47% 15%)'}}/>)}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-1" style={{fontSize:9}}>{si.aciklama}</div>
          <div className="flex flex-wrap gap-1">
            {si.ornekler.map((o,k)=><span key={k} className="text-xs px-1.5 py-0.5 rounded" style={{background:`${si.renk}15`,color:si.renk,fontSize:9}}>{o}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* 7. Email — Yatirimci Segmentleri */
const EMAIL_SEGMENTLER = [
  {segment:'Sicak Lead (siteyi gezen)',oran:'%42',ctr:'%18',konu:'[Son 2 Daire] Besiktasta Baktıgınız Proje',renk:'#10b981',
   icerik:'Goruntulenen daireyi hatırlat, kısıtlı stok vurgusu, whatsapp CTA'},
  {segment:'Soguk Yatirimci',          oran:'%21',ctr:'%6', konu:'Istanbul 2026: m2 Basına Ortalama ₺268K Neden?',renk:'#3B82F6',
   icerik:'Piyasa verisi, yatirim mantığı, bölge karşılaştırması, rapor indirme'},
  {segment:'Yabanci (EN)',             oran:'%28',ctr:'%11',konu:'Athens Golden Visa: €250K + Schengen Residency',renk:'#1d63ed',
   icerik:'Ingilizce, hukuki bilgi, ROI hesabı, konsültasyon CTA'},
  {segment:'Mevcut Musteri (Upsell)',  oran:'%38',ctr:'%14',konu:'Portfoyunuze Atina Ekleyin: €250K Baslangiç',renk:'#8B5CF6',
   icerik:'Kisisellestirilmis, onceki alim referansı, exclusive teklif'},
  {segment:'Re-engagement (6ay+)',    oran:'%15',ctr:'%4', konu:'Piyasa Cok Degisti — Ne Kaybettiniz?',renk:'#F7931A',
   icerik:'Fiyat artisi verisi, kacirilmis firsat duygusu, yeni liste'},
];
function EmailYatirimci() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>📧</span>
        <span className="text-sm font-semibold">Email Pazarlama — Yatırımcı Segmentleri & Stratejisi</span>
      </div>
      {EMAIL_SEGMENTLER.map((es,i)=>(
        <div key={i} className="p-2.5 rounded-xl mb-2" style={{background:'hsl(222 47% 5%)',border:`1px solid ${es.renk}20`}}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold" style={{color:es.renk}}>{es.segment}</span>
            <div className="flex gap-3">
              <span className="text-xs font-mono text-emerald-400">Acılma:{es.oran}</span>
              <span className="text-xs font-mono text-blue-400">CTR:{es.ctr}</span>
            </div>
          </div>
          <div className="text-xs text-amber-400 italic mb-1" style={{fontSize:10}}>Konu: "{es.konu}"</div>
          <div className="text-xs text-muted-foreground">{es.icerik}</div>
        </div>
      ))}
    </div>
  );
}

/* 8. Yabanci Yatirimci Pazarlama */
const YABANCI_SEGMENTLER = [
  {ulke:'Körfez Ülkeleri (UAE/KSA)',   renk:'#F7931A',dil:'Arapça + İngilizce',
   motivasyon:'Güvenli liman, Istanbul\'un İslami kültürü, mülkiyet hakkı',
   kanal:'Instagram (Arapça), WhatsApp, Dubai fuarları',
   mesaj:'Istanbul: Avrupa\'nın kapısında güvenli yatırım',benchmark:'CPL ~$180, LTV ~$280K'},
  {ulke:'Rusya / CIS Ülkeleri',        renk:'#EF4444',dil:'Rusça + İngilizce',
   motivasyon:'Yaptırımlardan kaçış, vatandaşlık, kıyı mülkleri',
   kanal:'Telegram, Rusça SEO, yurtdışı fuarlar',
   mesaj:'Istanbul\'da 400K$ ile Türk vatandaşlığı',benchmark:'CPL ~$210, LTV ~$420K'},
  {ulke:'Avrupa Expat (GR için)',       renk:'#1d63ed',dil:'İngilizce',
   motivasyon:'Golden Visa, Schengen ikamet, yatırım getirisi',
   kanal:'LinkedIn, Google EN, expat forumları',
   mesaj:'Athens: €250K + EU residency + %4.8 rental yield',benchmark:'CPL ~€145, LTV ~€310K'},
  {ulke:'Türk Diaspora (DE/NL/AUS)',   renk:'#10b981',dil:'Türkçe + yerel dil',
   motivasyon:'Memlekete yatırım, emeklilik, kira geliri',
   kanal:'Facebook TR grupları, YouTube, WhatsApp',
   mesaj:'Almanya\'dan İstanbul\'a Yatırım: 2026 Rehberi',benchmark:'CPL ~€85, LTV ~₺2.4M'},
];
function YabanciYatirimci() {
  const [sel,setSel] = useState(0);
  const y = YABANCI_SEGMENTLER[sel];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>🌍</span>
        <span className="text-sm font-semibold">Yabancı Yatırımcı Segmentleri — Hedefleme Stratejisi</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {YABANCI_SEGMENTLER.map((ys,i)=>(
          <button key={i} onClick={()=>setSel(i)}
            className="text-xs px-2 py-1 rounded-lg"
            style={{background:sel===i?ys.renk:`${ys.renk}20`,color:sel===i?'#fff':ys.renk,border:`1px solid ${ys.renk}40`,cursor:'pointer'}}>
            {ys.ulke.split(' ')[0]}
          </button>
        ))}
      </div>
      <div className="p-3 rounded-xl" style={{background:'hsl(222 47% 5%)',border:`2px solid ${y.renk}30`}}>
        <div className="text-sm font-bold mb-2" style={{color:y.renk}}>{y.ulke} · {y.dil}</div>
        {[{l:'Motivasyon',v:y.motivasyon},{l:'Kanallar',v:y.kanal},{l:'Ana Mesaj',v:y.mesaj},{l:'Benchmark',v:y.benchmark}].map(r=>(
          <div key={r.l} className="flex gap-2 mb-1.5">
            <span className="text-xs font-bold shrink-0" style={{color:y.renk,minWidth:80}}>{r.l}</span>
            <span className="text-xs text-muted-foreground">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 9. Proje Lansman Stratejisi */
const LANSMAN_ASAMALAR = [
  {gun:'6 Ay Once',  renk:'#3B82F6',baslik:'Pre-Marketing',adimlar:['Landing page + bekleme listesi','Teasure video (drone + render)','VIP liste: mevcut musteri + referans','PR: sehir gazetesi + yatirim haberleri']},
  {gun:'3 Ay Once',  renk:'#8B5CF6',baslik:'Soft Launch',  adimlar:['VIP onizleme: %5-10 indirim','WhatsApp broadcast: davet','Kapasite sinirli etkinlik (showroom)','Sosyal kanit: ilk rezervasyonlar']},
  {gun:'1 Ay Once',  renk:'#F7931A',baslik:'Pre-Sale',     adimlar:['Tum kanallar aktif: Meta + Google','Erken rezervasyon avantajlari','Influencer tur videosu (yerel)','Countdown timer: acilis tarihine']},
  {gun:'Acilis Gunu',renk:'#10b981',baslik:'Grand Launch', adimlar:['Canli etkinlik / fiziksel acilis','24 saat ozel fiyat kampanyasi','Basinda yer almak (PR)','Ilk gun satis hedefi: %15-20']},
];
function ProjeLansman() {
  const [sel,setSel] = useState(0);
  const la = LANSMAN_ASAMALAR[sel];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>🚀</span>
        <span className="text-sm font-semibold">Proje Lansman Stratejisi — 4 Aşamalı Plan</span>
      </div>
      <div className="flex gap-1.5 mb-3">
        {LANSMAN_ASAMALAR.map((la,i)=>(
          <button key={i} onClick={()=>setSel(i)}
            className="flex-1 text-xs py-1.5 rounded-lg"
            style={{background:sel===i?la.renk:`${la.renk}20`,color:sel===i?'#fff':la.renk,border:`1px solid ${la.renk}40`,cursor:'pointer'}}>
            {la.baslik}
          </button>
        ))}
      </div>
      <div className="p-3 rounded-xl" style={{background:'hsl(222 47% 5%)',border:`2px solid ${la.renk}30`}}>
        <div className="text-xs font-bold mb-2" style={{color:la.renk}}>⏱ {la.gun} — {la.baslik}</div>
        {la.adimlar.map((ad,i)=>(
          <div key={i} className="flex items-start gap-2 mb-1.5">
            <span className="font-bold text-xs shrink-0" style={{color:la.renk}}>{i+1}.</span>
            <span className="text-xs text-muted-foreground">{ad}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 p-2 rounded-lg" style={{background:'hsl(222 47% 5%)',fontSize:10}}>
        🎯 Hedef: Lansman gunu %20 satis, 3. ayda %60, 6. ayda tam kapasite
      </div>
    </div>
  );
}

/* 10. Fiyat Konumlandirma */
const FIYAT_STRATEJILERI = [
  {strateji:'Manzara & Konum Primi',   etki:'+%15-40',renk:'#10b981',aciklama:'Bosphorus manzarası, metro 300m, merkezi lokasyon prime fiyat yaratır'},
  {strateji:'Fiyatı Parcala',          etki:'CVR+%25', renk:'#3B82F6',aciklama:'"₺2M" yerine "aylik ₺8.500 kredi ödemesi ile" — algı yönetimi'},
  {strateji:'Karsilastirmali Sunum',   etki:'LTV+%18', renk:'#F7931A',aciklama:'"Kira mi, kredi mi?" hesaplayici: 10 yilda kira toplami > satis fiyati'},
  {strateji:'Iskonto Psikolojisi',     etki:'CVR+%30', renk:'#8B5CF6',aciklama:'%5 erken rezervasyon indirimi yerine "geri kalan 3 daire" urgency'},
  {strateji:'Deger Paketleme',         etki:'+%8-15',  renk:'#EC4899',aciklama:'Beyaz esya dahil, otopark dahil, 1 yil site aidati dahil — fiyat algisi artmaz'},
  {strateji:'Dolar / Euro Bazlı Fiyat',etki:'Stres-',  renk:'#06B6D4',aciklama:'Yabanci yatirimciya USD/EUR fiyatla: TRY volatilitesini bertaraf eder'},
];
function FiyatKonumlandirma() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-amber-400"/>
        <span className="text-sm font-semibold">Gayrimenkul Fiyat & Değer Konumlandırması</span>
      </div>
      {FIYAT_STRATEJILERI.map((fs,i)=>(
        <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl mb-2" style={{background:'hsl(222 47% 5%)',border:`1px solid ${fs.renk}20`}}>
          <div className="shrink-0">
            <div className="text-xs font-bold" style={{color:fs.renk}}>{fs.strateji}</div>
            <div className="text-xs font-mono font-bold" style={{color:fs.renk}}>{fs.etki}</div>
          </div>
          <div className="text-xs text-muted-foreground">{fs.aciklama}</div>
        </div>
      ))}
    </div>
  );
}

/* 11. LTV Gayrimenkul */
const LTV_SENARYO_GR = [
  {tip:'Tek Seferlik Alici',  ltv:85000,  cac:8500, oran:10,renk:'#EF4444',not:'Referans veya tekrar satis yok'},
  {tip:'Kira Yonetimi',       ltv:142000, cac:8500, oran:17,renk:'#F7931A',not:'+%5/yil komisyon, uzun iliski'},
  {tip:'Portfoy Yatirimci',   ltv:380000, cac:12000,oran:32,renk:'#10b981',not:'3+ islem, referans makinesi'},
  {tip:'Kurumsal / Fon',      ltv:950000, cac:25000,oran:38,renk:'#3B82F6',not:'Toplu alim, proje yatirimcisi'},
];
function GayrimenkulLTV() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-cyan-400"/>
        <span className="text-sm font-semibold">Gayrimenkul Müşteri LTV — Segment Analizi</span>
      </div>
      <div className="p-2 rounded-lg mb-3 text-xs" style={{background:'hsl(222 47% 5%)'}}>
        <div className="font-bold text-cyan-400 mb-1">Gayrimenkul LTV Formulu</div>
        <div className="text-muted-foreground">LTV = (Satis Komisyonu) + (Kira Yonetimi × Yil × %5) + (Tekrar Satis) + (Referans Degeri)</div>
        <div className="text-muted-foreground mt-1">Ort. araci komisyonu: %2-3 satis bedeli — ₺5M dairede ₺100-150K</div>
      </div>
      {LTV_SENARYO_GR.map(sc=>(
        <div key={sc.tip} className="flex items-center gap-2 p-2 rounded-lg mb-1.5" style={{background:'hsl(222 47% 5%)',border:`1px solid ${sc.renk}20`}}>
          <div className="flex-1">
            <span className="text-xs font-bold" style={{color:sc.renk}}>{sc.tip}</span>
            <div className="text-xs text-muted-foreground">CAC: ₺{sc.cac.toLocaleString('tr')} → LTV: ₺{sc.ltv.toLocaleString('tr')}</div>
            <div className="text-xs text-muted-foreground" style={{fontSize:9}}>{sc.not}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold font-mono" style={{color:sc.renk}}>{sc.oran}:1</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* 12. Sosyal Medya — Konut Icerigi */
const SM_FORMATLARI = [
  {format:'Daire Turu (Reels)',   platform:'Instagram/TikTok',eng:'%8-15',renk:'#E1306C',
   ipucu:'30-60sn, muzikli, alt ucte metin: "2+1 · 95m2 · Besiktas · ₺6.8M". Drone giris + ic mekan + manzara'},
  {format:'Mahalle Rehberi',      platform:'YouTube/Reels',  eng:'%5-10',renk:'#EF4444',
   ipucu:'"Kadikoy\'de yasam" — kahvalti kafe, metro, pazar, yesil alan. Insan yuzu kamera ceker'},
  {format:'Yatirim Infografigi',  platform:'LinkedIn/Twitter',eng:'%3-6', renk:'#0077B5',
   ipucu:'Rakam one ciksin: "10 yilda Istanbul konut +%840". Basit, okunabilir tipografi'},
  {format:'Musteri Hikayesi',     platform:'Tum Platformlar',eng:'%10-18',renk:'#10b981',
   ipucu:'"Almanya\'dan satın aldık" — gercek musteri, gercek hikaye. En guvenilir icerik'},
  {format:'Piyasa Guncelleme',    platform:'Instagram Story', eng:'%6-12',renk:'#F7931A',
   ipucu:'Her hafta: 1 rakam. "Bu hafta Besiktas ort. m2 fiyati: ₺271K". Anket ile katilim artir'},
];
function SosyalMedyaKonut() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>📱</span>
        <span className="text-sm font-semibold">Sosyal Medya — Gayrimenkul İçerik Stratejisi</span>
      </div>
      {SM_FORMATLARI.map((sm,i)=>(
        <div key={i} className="p-2.5 rounded-xl mb-2" style={{background:'hsl(222 47% 5%)',border:`1px solid ${sm.renk}20`}}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{color:sm.renk}}>{sm.format}</span>
              <span className="text-xs text-muted-foreground" style={{fontSize:9}}>{sm.platform}</span>
            </div>
            <span className="text-xs font-mono text-emerald-400">Eng:{sm.eng}</span>
          </div>
          <div className="text-xs text-muted-foreground">{sm.ipucu}</div>
        </div>
      ))}
    </div>
  );
}

/* 13. Dijital Showroom & 3D Tur */
const SHOWROOM_ARACLAR = [
  {arac:'Matterport 3D Tur', maliyet:'₺3.500-8.000',etki:'Lead kalitesi x2.4',renk:'#8B5CF6',not:'Yabanci yatirimci icin zorunlu. Uzaktan satin alma imkani'},
  {arac:'Drone Cekimi',       maliyet:'₺1.500-4.000',etki:'Sosyal media x3 erisim',renk:'#3B82F6',not:'Konum analizi icin de kullanilir. 4K video simdilerde standart'},
  {arac:'360 Foto (iphone)',  maliyet:'₺500-1.500',  etki:'Web sitesi dwell +68%',renk:'#10b981',not:'Ucuz ama etkili. Google Street View entegrasyonu'},
  {arac:'AR Mobilya Planlama',maliyet:'₺0 (app)',    etki:'Satinalma niyet +35%', renk:'#F7931A',not:'IKEA Place benzeri app — bos daireyi doldurur'},
  {arac:'AI Render (bos→dolu)',maliyet:'₺200-800',   etki:'Empati +40%',          renk:'#EC4899',not:'Bos dairenin nasil gozukecegini goster — Midjourney/AI tools'},
  {arac:'WhatsApp Video Tur', maliyet:'₺0',           etki:'Lead-to-tour +28%',   renk:'#25D366',not:'Hizli, kisisel. Ilk temas sonrasi 24 saat icinde gonder'},
];
function DijitalShowroom() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>🏗️</span>
        <span className="text-sm font-semibold">Dijital Showroom & Görsel Pazarlama Araçları</span>
      </div>
      {SHOWROOM_ARACLAR.map((sa,i)=>(
        <div key={i} className="flex items-center gap-2 p-2 rounded-lg mb-1.5" style={{background:'hsl(222 47% 5%)',border:`1px solid ${sa.renk}20`}}>
          <div style={{width:3,height:36,background:sa.renk,borderRadius:2,flexShrink:0}}/>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold" style={{color:sa.renk}}>{sa.arac}</span>
              <span className="text-xs font-mono text-emerald-400" style={{fontSize:9}}>{sa.etki}</span>
            </div>
            <div className="text-xs text-muted-foreground" style={{fontSize:9}}>{sa.not}</div>
          </div>
          <div className="text-xs font-mono text-muted-foreground shrink-0">{sa.maliyet}</div>
        </div>
      ))}
    </div>
  );
}

/* 14. CRM & Referans Sistemi */
const CRM_ASAMALAR = [
  {asan:'Lead Girisi',    renk:'#3B82F6',islem:'Form → otomatik WhatsApp: "Merhaba [isim], [bölge] ilginiz icin tesekkur ederiz..."',sure:'<5 dakika'},
  {asan:'Nitelendirme',   renk:'#F7931A',islem:'3 soru: Butce? Kullanim (oturma/yatirim)? Zaman cercevesi? CRM\'e kayit',sure:'Ilk gorusme'},
  {asan:'Tur Planlamasi', renk:'#8B5CF6',islem:'Takvim linki gonder → onay → hatirllatma (1 gun + 1 saat once)',sure:'48 saat icinde'},
  {asan:'Takip (No show)',renk:'#EF4444',islem:'48 saat: "Gosteremedigimiz icin uzgunum, yeni tarih?" — silikonvadi taktigi',sure:'48 saat'},
  {asan:'Post-Satis',     renk:'#10b981',islem:'30 gun: memnuniyet anketi. 90 gun: referans istegi. 1 yil: portfoy guncellemesi',sure:'Otomatik'},
];
const REFERANS = [
  {tip:'Musteri Referansi',      odul:'₺10.000-25.000',aktiflik:'%12 musteri referans verir',renk:'#10b981'},
  {tip:'Aracı Ortakligi',        odul:'%1-1.5 komisyon', aktiflik:'Sigorta, avukat, bankaci',renk:'#3B82F6'},
  {tip:'Influencer Ortakligi',   odul:'Sabit ucret + bonus',aktiflik:'Yerel sehir influencer',renk:'#EC4899'},
  {tip:'Otomotik Yonlendirme',  odul:'CRM izleme kodu',  aktiflik:'Hangi kanaldan geldigi',renk:'#F7931A'},
];
function CRMReferans() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:18}}>🤝</span>
        <span className="text-sm font-semibold">CRM Süreci & Referans Sistemi</span>
      </div>
      <div className="space-y-1.5 mb-3">
        {CRM_ASAMALAR.map((ca,i)=>(
          <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{background:'hsl(222 47% 5%)'}}>
            <div style={{width:3,minHeight:20,background:ca.renk,borderRadius:2,flexShrink:0,marginTop:2}}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold" style={{color:ca.renk}}>{ca.asan}</span>
                <span className="text-xs text-muted-foreground font-mono">{ca.sure}</span>
              </div>
              <div className="text-xs text-muted-foreground">{ca.islem}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs font-semibold text-muted-foreground mb-2">Referans Programa Tipleri</div>
      <div className="grid grid-cols-2 gap-2">
        {REFERANS.map((r,i)=>(
          <div key={i} className="p-2 rounded-xl" style={{background:'hsl(222 47% 5%)',border:`1px solid ${r.renk}25`}}>
            <div className="text-xs font-bold" style={{color:r.renk}}>{r.tip}</div>
            <div className="text-xs text-muted-foreground">{r.odul}</div>
            <div className="text-xs text-muted-foreground" style={{fontSize:9}}>{r.aktiflik}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 15. Reklam Metinleri & Hook'lar */
const HOOK_ORNEKLERI = [
  {kategori:'Aciliyet / Kıtlık',renk:'#EF4444',hooklar:['Bu fiyata son 3 daire — yarın zamlanıyor','Reservasyon tarihi bugün bitiyor','Bu haftaki fiyatı bir sonra göremeyebilirsiniz']},
  {kategori:'Rakam / Veri',    renk:'#F7931A',hooklar:['₺1M kira ödemek yerine — 10 yıl hesabı','%4.8 kira getirisi: paranız çalışıyor','2026\'da İstanbul m²: ₺268K — neden yükseliyor?']},
  {kategori:'Empati / Problem',renk:'#10b981',hooklar:['Kira ödedikçe ev sahibiniz zenginleşiyor — değil mi?','Her yıl kira zammı — artık yeter mi?','Almanya\'dan uzaktan ev almak mümkün mü?']},
  {kategori:'Sosyal Kanıt',    renk:'#3B82F6',hooklar:['237 aile bu yıl bizimle ev sahibi oldu','Müşterimiz Ahmet B.: "En iyi kararım"','Körfezden 89 yabancı yatırımcı seçti']},
  {kategori:'Merak / Soru',   renk:'#8B5CF6',hooklar:['Atina\'da €250K ile ne alınır?','İstanbul\'un en hızlı değerlenen 5 ilçesi','Golden Visa: neden herkes Yunanistan\'ı seçiyor?']},
];
const CTA_ORNEKLERI = ['Ücretsiz Danışmanlık Al','Fiyat Listesini Gör','Tur Rezervasyonu Yap','Bölge Raporunu İndir','WhatsApp\'tan Sor'];
function ReklamMetinleri() {
  const [sel,setSel] = useState(0);
  const ho = HOOK_ORNEKLERI[sel];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <Megaphone className="w-4 h-4 text-pink-400"/>
        <span className="text-sm font-semibold">Gayrimenkul Reklam Metinleri & Hook Stratejisi</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {HOOK_ORNEKLERI.map((ho,i)=>(
          <button key={i} onClick={()=>setSel(i)}
            className="text-xs px-2 py-1 rounded-lg"
            style={{background:sel===i?ho.renk:`${ho.renk}20`,color:sel===i?'#fff':ho.renk,border:`1px solid ${ho.renk}40`,cursor:'pointer'}}>
            {ho.kategori}
          </button>
        ))}
      </div>
      <div className="p-3 rounded-xl mb-3" style={{background:'hsl(222 47% 5%)',border:`2px solid ${ho.renk}30`}}>
        <div className="text-xs font-bold mb-2" style={{color:ho.renk}}>{ho.kategori} Hook Örnekleri:</div>
        {ho.hooklar.map((hk,i)=>(
          <div key={i} className="flex items-start gap-2 mb-1.5">
            <span className="font-bold text-xs shrink-0" style={{color:ho.renk}}>{i+1}.</span>
            <span className="text-xs text-muted-foreground italic">"{hk}"</span>
          </div>
        ))}
      </div>
      <div className="text-xs font-semibold text-muted-foreground mb-2">Gayrimenkul CTA Örnekleri (En Yüksek CVR):</div>
      <div className="flex flex-wrap gap-2">
        {CTA_ORNEKLERI.map((cta,i)=>(
          <span key={i} className="text-xs px-2.5 py-1.5 rounded-xl font-semibold"
            style={{background:'linear-gradient(135deg,#10b981,#3B82F6)',color:'#fff'}}>
            {cta}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══ WRAPPER ════════════════════════════════════════════════════════ */

/* ─── Instagram Stili Gayrimenkul Pazarlama Makale Kartları ─── */
const IG_MAKALELER = [
  {ikon:'📸',kategori:'Görsel Pazarlama',okuma:'4 dk',
   baslik:'Emlak Fotoğrafçılığı 101: İlk Bakışta Satan Kareler',
   ozet:'Doğru ışık saati, lens seçimi ve köşe çekimi tekniğiyle ilanınız %73 daha fazla tıklanıyor. Altın saat — gün batımından 1 saat önce — her türlü ışık koşulunu dengeler. Geniş açı lens (16-24mm) odaları gerçekten büyük gösterir; ama fazla kullanmak distorsiyon yaratır. Yatay çekim, dikey çekimden %2x daha fazla tıklanır.',
   ipucu:'İlk fotoğraf her zaman en parlak oda veya manzara olsun. Karanlık fotoğraf = kayıp lead.',
   detaylar:['Altın saat: güneş batımı ±1 saat','Köşe çekim: oda %30 büyük görünür','RAW formatı sonradan düzeltmeyi kolaylaştırır','Boş oda satmaz — minimal staging şart'],
   begeni:12400,goruntuleme:47200,renk:'#F7931A'},
  {ikon:'🎬',kategori:'Video İçerik',okuma:'5 dk',
   baslik:"60 Saniyede Daire Turu: Algoritmayı Yenen Format",
   ozet:"Hook (0-3 sn) → oda geçişi → manzara → fiyat + CTA. Bu sırayı bozmayın. Reels'te organik erişim %4.8 kira getirisinden daha karlı olabilir. İlk 3 saniye izleyiciyi tutmazsa algoritma videoyu gömmez. Müzik seçimi izlenme süresini %34 uzatır — trending ses kullanın.",
   ipucu:'"Bu fiyata son 3 daire" cümlesini 45. saniyeye koyun — algoritma sonuna kadar izlemeyi ödüllendirir.',
   detaylar:['0-3 sn: dikkat çekici hook cümlesi','4-30 sn: oda oda geçiş, ışıklı çekim','31-50 sn: balkon/manzara/havuz shot','51-60 sn: fiyat + WhatsApp CTA'],
   begeni:9800,goruntuleme:38100,renk:'#E1306C'},
  {ikon:'📱',kategori:'Sosyal Medya',okuma:'3 dk',
   baslik:'Instagram Stories ile 7 Günde Proje Lansmanı',
   ozet:'Gün 1: teaser (sadece logo + soru), Gün 3: konum ipucu, Gün 5: 3 avantaj sayısı, Gün 7: fiyat aralığı + CTA. Polling sticker kullanan hesaplar %2.3x daha fazla DM alıyor. Geri sayım sticker satın alma aciliyetini %41 artırıyor. Stories 24 saatte kayboluyor — Highlights klasörüne kaydedin.',
   ipucu:'Her Stories\'e link sticker ekleyin. WhatsApp\'a değil, lead form\'a yönlendirin.',
   detaylar:['Polling: "Hazır mısın?" sorusu etkileşimi patlıyor','Countdown: gün sayısı satın alma kararını hızlandırıyor','DM otomatik yanıt: anında fiyat listesi gönder','Highlights: "Proje" klasörü = kalıcı tanıtım'],
   begeni:8700,goruntuleme:31400,renk:'#8B5CF6'},
  {ikon:'🎯',kategori:'Google Ads',okuma:'6 dk',
   baslik:"Google'da Konut Satmak: BOFU Anahtar Kelime Rehberi",
   ozet:'"İstanbul satilik daire" araması ₺28 CPC\'de dönerken "besiktas 2+1 fiyat" ₺11\'de dönüşüm yapıyor. Long-tail kelimeler daha az rekabet, daha yüksek niyet demek. Arama ağı kampanyası için günlük bütçe: ₺500-1500. Hedefleme: Türkiye + Körfez ülkeleri + diaspora. Kalite puanı 7+ olmadan CPC düşmez.',
   ipucu:'"[Semt] + [oda sayısı] + [fiyat aralığı]" formatındaki anahtar kelimeler CPL\'i %40 düşürür.',
   detaylar:['BOFU: "istanbul satilik daire fiyatlari"','MOFU: "istanbul konut yatirim rehberi"','TOFU: "istanbul kira mi kredi mi hesapla"','Negatif: "kiralık" "ikinci el" "takas" ekleyin'],
   begeni:7600,goruntuleme:28900,renk:'#F7931A'},
  {ikon:'📧',kategori:'Email Marketing',okuma:'5 dk',
   baslik:'Yatırımcıya Email Yazma Sanatı: 3 Cümle Kuralı',
   ozet:'Konu satırı rakamla başlasın ("₺268K m² ile İstanbul"). İkinci cümle okuyucunun problemini adlandırsın ("Her ay kira ödeyerek varlık biriktiremiyor olabilirsiniz"). Üçüncü cümle çözümü sunup CTA\'ya bağlasın. Uzun email = çöp. %18 CTR ve %42 açılma oranı gerçek başarılan rakamlar. Kişiselleştirme zorunlu: isim + bölge ilgisi.',
   ipucu:'Konu satırında emoji kullanmayın — B2B ve yüksek gelirli segment spam filtrelerine takılıyor.',
   detaylar:['Açılma için: rakam + merak + isim kombinasyonu','Tıklama için: tek CTA — birden fazla link oranı düşürür','Gönderim saati: Salı 10:00 veya Perşembe 14:00','Unsubscribe kolay olsun — temiz liste daha değerli'],
   begeni:7100,goruntuleme:24600,renk:'#06B6D4'},
  {ikon:'💬',kategori:'WhatsApp',okuma:'4 dk',
   baslik:'WhatsApp Business ile Lead Yönetimi: Etiket Sistemi',
   ozet:'Sıcak / Ilık / Soğuk / Tur Bekliyor / Tapu Aşaması — 5 etiketle hiçbir lead kaybolmaz. Broadcast listesi ayda 1 kez, gruba değil. WhatsApp Business katalog özelliğiyle dairelerinizi doğrudan mesaj içinde sergileyin. Otomatik yanıt: çalışma saati dışındaki mesajlara anında fiyat listesi gönder. Okundu bildirimi ile sıcak lead takibi.',
   ipucu:'Broadcast mesajı sabah 09:00-10:00 arasında gönderilen listede %2.1x daha yüksek yanıt alıyor.',
   detaylar:['5 etiket sistemi: lead hiç kaybolmuyor','Katalog: daire fotoğraf + fiyat + link','Otomatik yanıt: mesai dışı fiyat listesi','Hızlı yanıt şablonları: 10 saniyelik cevap'],
   begeni:6900,goruntuleme:22300,renk:'#25D366'},
  {ikon:'🏠',kategori:'Portal Optimizasyonu',okuma:'5 dk',
   baslik:'Sahibinden İlanınızı Zirveye Taşıyan 6 Teknik',
   ozet:'Başlıkta metro mesafesi + m² + net fiyat zorunlu ("Beşiktaş Metro 2 dk · 110m² · ₺12.5M"). İlk 3 fotoğraf köşe çekim olmalı. Günde 1 güncelleme algoritma sıralamasını yükseltir. Deskripsiyon 400+ kelime olmalı — SEO etkisi var. Fiyat güncelleme taktiği: ₺10 indirim sistemi sıfırlıyor. Platinum paket organik üstten daha etkili.',
   ipucu:'İlan başlığına "acil satılık" veya "fırsat" yazmayın — güven kaybına yol açıyor.',
   detaylar:['Başlık: metro mesafesi + m² + fiyat formatı','Günde 1 küçük güncelleme: algoritma sıfırlanıyor','400+ kelime açıklama: Google SEO avantajı','15-20 fotoğraf: az fotoğraf = düşük tıklanma'],
   begeni:6400,goruntuleme:19700,renk:'#10b981'},
  {ikon:'🗺️',kategori:'SEO & İçerik',okuma:'7 dk',
   baslik:'Mahalle Rehberi İçeriği: 6 Ayda Organik Lead Makinesi',
   ozet:'"Beşiktaş\'ta yaşam rehberi" → aylık 4.200 organik arama. Okul + market + metro mesafesi + restoran haritası = kullanıcı sayfada 4 dk kalıyor. 4 dakika oturma süresi Google\'ı "bu sayfa değerli" diye düşündürüyor. Her mahalle için ayrı rehber: Beşiktaş, Kadıköy, Ataşehir, Başakşehir. Atina için: Kolonaki, Glyfada, Piraeus, Kifisia ayrı ayrı.',
   ipucu:'"[Mahalle] + kiralık daire fiyatları 2026" anahtar kelimesi ile başlayın — aylık 1.800 arama.',
   detaylar:['Okul listesi: en yakın 3 okul + mesafe','Market + AVM: yürüyüş mesafesi verin','Metro/otobüs: güzergah numarası ile','Kira fiyat aralığı: güncel tutun = backlink kaynağı'],
   begeni:5900,goruntuleme:17800,renk:'#84CC16'},
  {ikon:'🚁',kategori:'Görsel Pazarlama',okuma:'4 dk',
   baslik:'Drone Çekimi: Projenizi Farklılaştıran 90 Saniye',
   ozet:"Deniz/park/metro üst geçişi + proje girişi + çevre havadan. Drone'lu ilanlar portalda %41 daha uzun süre inceleniyor. Türkiye'de drone iznini 3 gün önceden SHGM'ye bildirin. Sabah 07:00 veya akşam 17:00 en iyi ışık açısı. 4K video sonrasında hem Reels hem portal için kesim yapılabilir. Çekim maliyeti ₺1.500-4.000 — ROI en hızlı geri dönenlerden.",
   ipucu:"Drone çekiminde projeyi en uzaktan başlayıp yaklaşarak bitirin — sinematik etki %2x daha güçlü.",
   detaylar:['SHGM izni: 3 iş günü önceden başvurun','Altın saat: sabah 07:00 veya akşam 17:00','4K + LOG formatı: sonradan renk düzenleme','90 sn final video + 10 adet still frame cut'],
   begeni:5600,goruntuleme:15300,renk:'#3B82F6'},
  {ikon:'🌍',kategori:'Yabancı Yatırımcı',okuma:'6 dk',
   baslik:'Körfezden Avrupaya: Yabancı Alıcıya Pazarlama Dili',
   ozet:'Körfez (SA, UAE, KW, QA): Arapça içerik, dolar bazlı fiyat, helal yatırım vurgusu, aile büyüklüğü vurgusu. Avrupalı expat: şeffaf ROI tablosu, Schengen bağlantısı, hukuki süreç anlatısı, İngilizce. Rus/CIS: €/$ bazlı, yatırım güvenliği, lokasyon kalitesi. Türk diaspora (DE, NL, AT): Türkçe, duygusal bağ + yatırım karması.',
   ipucu:'Körfez için pazartesi sabahı (TR saati 09:00 = Dubai 10:00) en yüksek yanıt oranı.',
   detaylar:['Körfez: Arapça başlık + $ fiyat zorunlu','Avrupalı: hukuki süreç PDF + tapu rehberi','Rus/CIS: €/$ bazlı + Telegram üzerinden iletişim','Diaspora: TL değer kaybı + yatırım mantığı anlat'],
   begeni:5400,goruntuleme:14200,renk:'#1d63ed'},
  {ikon:'💰',kategori:'Golden Visa',okuma:'5 dk',
   baslik:'Yunanistan Golden Visa: İçerik Stratejisi ve SEO Rehberi',
   ozet:'€250K eşiği, Schengen oturumu, 60 günde sonuç — bunlar hook. Detayda: hangi bölgeler sayılıyor (Atina merkez €500K, çevre €250K), tapu süreci, vergi avantajları, çocuklar için eğitim hakları. "Greece golden visa 2026" kelimesi aylık 18.000 küresel arama. İngilizce + Arapça + Rusça üç dil zorunlu.',
   ipucu:'"€250K ile Schengen oturumu" ifadesini tüm platformlarda hook olarak kullanın — küresel arama hacmi yüksek.',
   detaylar:['€250K eşiği: Atina dışı bölgeler','Schengen: 26 ülke seyahat hakkı','Süreç: 60-90 gün, noterde 1 gün','Vergi: %15 flat rate yabancı gelir için'],
   begeni:5200,goruntuleme:13600,renk:'#1d63ed'},
  {ikon:'📊',kategori:'Lead Generation',okuma:'4 dk',
   baslik:'Kira Getirisi Hesaplayıcısı: En Güçlü Lead Mıknatısı',
   ozet:"Adres + bütçe giren kullanıcı sıcak lead'e dönüşüyor. Form terk oranı %12 — piyasanın en düşüğü. Hesaplayıcı: yıllık kira geliri / toplam maliyet = brüt getiri. Net getiri: -vergi -yönetim ücreti -boşluk. İstanbul Beşiktaş brüt %3.2, Kadıköy %3.8, Başakşehir %4.5. Atina Kolonaki %3.5, Glyfada %4.2.",
   ipucu:"Hesaplayıcı sonucuna 'Bu getiriyi optimize etmek için ücretsiz danışmanlık al' CTA ekleyin — %34 CVR.",
   detaylar:['3 adım form: bütçe + bölge + amaç','Anlık hesap: brüt ve net getiri göster','Email kapısı: sonuç için email gir','Takip: 24 saat içinde sıcak arama'],
   begeni:5000,goruntuleme:12400,renk:'#EC4899'},
  {ikon:'🤝',kategori:'CRM & Referans',okuma:'5 dk',
   baslik:'Mevcut Müşteriden Yeni Satış: Referans Programı Kurulumu',
   ozet:"Her başarılı referans için ₺5-10K hediye çeki veya kira yönetimi indirimi. Referans kaynaklı leadlerin kapanma oranı %2.8x daha yüksek — zaten güvenilir. Referans veren müşteri kendini değerli hisseder, referans alan güvenle gelir. Yıllık toplantı/iftar organizasyonu: portföy sahiplerini bir araya getirin — ağız içi pazarlama patlar.",
   ipucu:"Tapu tamamlandıktan 30 gün sonra 'Tanıdığınız var mı?' sorusunu WhatsApp ile sorun — en yüksek yanıt anı.",
   detaylar:['₺5-10K hediye çeki veya kira indirimi','Referans takip sistemi: CRM\'e lead kaynağı yazın','Yıllık müşteri toplantısı: sadakat + ağ büyür','Referans leadleri: satış süresi %40 kısalıyor'],
   begeni:4800,goruntuleme:11700,renk:'#F7931A'},
  {ikon:'🖥️',kategori:'CRM',okuma:'6 dk',
   baslik:'CRM Olmadan Büyük Hacim Emlak Portföyü Yönetemezsiniz',
   ozet:'HubSpot CRM ücretsiz plan + WhatsApp entegrasyonu + otomatik takip emaili = 0 kaçan lead. Pipeline görünürlüğü satış süresini %34 kısaltıyor. Aşamalar: Gelen Lead → Nitelendirme → Tur → Teklif → Tapu. Her aşamada otomasyon: 48 saat yanıt vermeyene otomatik hatırlatma. Salesforce ve Zoho emlak sektörü için özelleştirilebilir.',
   ipucu:"Telefon görüşmesini otomatik kaydedin (izinli) — 3 ay sonra pattern analizi satış tekniğinizi yeniliyor.",
   detaylar:['HubSpot Free: 1 milyon contact, sınırsız pipeline','WhatsApp entegrasyon: Twilio veya WATI','Otomasyon: 48 saat sessizlik = otomatik takip','Raporlama: aylık CPL, CVR, satış süresi takip'],
   begeni:4700,goruntuleme:11200,renk:'#06B6D4'},
  {ikon:'🚀',kategori:'Proje Lansmanı',okuma:'7 dk',
   baslik:'Proje Lansmanı Öncesi 90 Gün: Beklenti Mühendisliği',
   ozet:'Ay 3: waitlist + teaser Reels + "çok yakında" billboard. Ay 2: virtual tur + fiyat ipucu email + broker bilgilendirme. Ay 1: soft launch (waitlist önce) + limited preview + fiyat açıklaması. Lansman günü: stok baskısı + sayım tahtası + canlı stream. Beklenti mühendisliği ile lansman günü %60 stok satılabiliyor.',
   ipucu:"Waitlist için 'erken kayıt' formu açın — 500+ isim = lansman başarısı garantilenmiş.",
   detaylar:['Ay 3: teaser + waitlist formu + sosyal medya countdown','Ay 2: broker bilgilendirme + virtual tur + fiyat ipucu','Ay 1: soft launch waitlist\'e, fiyat açıklaması','Lansman: canlı stream + fiziksel etkinlik + sayım'],
   begeni:4600,goruntuleme:10800,renk:'#8B5CF6'},
  {ikon:'💡',kategori:'Satış Tekniği',okuma:'5 dk',
   baslik:'Fiyat Müzakeresinde 5 Psikoloji Tekniği',
   ozet:'Çapa: önce yüksek fiyat söyleyin — her rakam çapaya göre değerlendiriliyor. Paketleme: dekorasyon + beyaz eşya + park + depo ekleyin, fiyatı bölmeyin. Aciliyet: "bu haftaki fiyat" sınırı gerçek olmalı. Kayıp dili: "Bu fırsatı kaçırırsanız..." cümlesi kazanç dilinden %2.3x daha etkili. Sessizlik: teklif verdikten sonra susun.',
   ipucu:"Teklif verdikten sonra 7 saniye sessiz kalın — baskı otomatik oluşur, siz konuşmayın.",
   detaylar:['Çapa etkisi: ilk rakam zihinsel referans oluyor','Paketleme: fiyatı parçalamak değeri yükseltiyor','Aciliyet: gerçek stok baskısı = etik + etkili','Kayıp dili: "kazanmak" değil "kaybetmemek" anlatın'],
   begeni:4500,goruntuleme:10100,renk:'#EF4444'},
  {ikon:'📐',kategori:'Sunum Tekniği',okuma:'4 dk',
   baslik:'Kat Planını 3 Farklı Şekilde Sunma Sanatı',
   ozet:"Alıcıya göre format seç: yaşayacak için mobilya yerleşimi + güneş açısı + komşu gürültüsü. Yatırımcı için kira bölümü potansiyeli + metrekare verimliliği + boşluk riski. Expat için uluslararası ölçü karşılaştırması (ft²/m²) + net kullanılabilir alan + depo. 3D kat planı 2D'den %56 daha uzun inceleniyor.",
   ipucu:"Kat planına güneş pusulanı ekleyin — hangi oda öğle güneşi alıyor sorusu her alıcının aklında.",
   detaylar:['Yaşayacak: mobilya + güneş + gürültü haritası','Yatırımcı: kira potansiyeli + ROI hesabı','Expat: m² = ft² dönüşümü + net vs brüt fark','3D plan: Matterport veya SketchUp ücretsiz versiyon'],
   begeni:4300,goruntuleme:9600,renk:'#3B82F6'},
  {ikon:'🇬🇷',kategori:'Atina Pazarı',okuma:'5 dk',
   baslik:"Atina'da Gayrimenkul Pazarlama: Spitogatos + Meta Formülü",
   ozet:"Spitogatos EN/EL çift dil zorunlu — tek dil ilan görünürlüğü %45 düşüyor. Meta'da Yunanistan + Körfez ülkeleri + İngiltere birlikte hedefleyin. Kolonaki ve Glyfada en yüksek CTR bölgeler. Piraeus: yatırım ROI anlatısı. Kifisia: aile ve okul vurgusu. €/m² bazlı fiyat. Airbnb getirisi vs uzun dönem kira karşılaştırması hook olarak güçlü.",
   ipucu:"Spitogatos'ta 'Golden Visa Eligible' etiketini kullanın — yabancı alıcı aramasında ön sıra garantisi.",
   detaylar:['Spitogatos: EN+EL zorunlu, €/m² fiyat format','Meta hedef: GR + AE + SA + UK kombinasyonu','Kolonaki: lüks + erişim + kültür vurgusu','Glyfada: deniz + marina + plaj yaşamı'],
   begeni:4100,goruntuleme:9100,renk:'#1d63ed'},
  {ikon:'🌆',kategori:'İstanbul Pazarı',okuma:'5 dk',
   baslik:'İstanbul İlçe Konumlandırması: Kime Hangi Semt Satılır',
   ozet:"Beşiktaş: genç profesyonel + expat — metro erişimi + sosyal yaşam vurgusu. Ataşehir: kurumsal yatırımcı — m² verimliliği + kira getirisi rakamları. Başakşehir: Körfez diasporası — büyük aile, Arapça içerik, AVM yakınlığı. Kadıköy: kira + yaşam dengesi arayan — Boğaz + ulaşım + kültür. Her semt için ayrı landing page şart.",
   ipucu:"Her ilçe için ayrı Facebook hedef kitlesi oluşturun — 'Beşiktaş + 25-40 yaş + kira arayanlar' gibi.",
   detaylar:['Beşiktaş: metro + café + expat topluluk vurgusu','Ataşehir: finansal merkez + yeni bina stoğu','Başakşehir: büyük m² + AVM + okul + camii','Kadıköy: sanat + bohem + Bağdat Caddesi erişimi'],
   begeni:4000,goruntuleme:8800,renk:'#10b981'},
  {ikon:'⭐',kategori:'Sosyal Kanıt',okuma:'4 dk',
   baslik:'Sosyal Kanıt ile Satış Hızı: Müşteri Hikayesi Formatı',
   ozet:'"3 yıl kira ödedim, şimdi ev sahibiyim" — 45 saniyelik video. Gerçek kişi + gerçek rakam + gerçek mahalle. Dönüşüm %2.1x artıyor. Yazılı referans değil video referans — güven %4x daha yüksek. Google Business profili yıldız sayısı 4.8+ olan ajanlar %28 daha fazla lead alıyor. Referans videoyu hem portal ilanına hem Reels\'e koyun.',
   ipucu:"'Kaç ayda kapattınız?' sorusunu videoya ekletin — hız = güven mesajı.",
   detaylar:['Video referans: yüz göster + rakam ver + semt belirt','Google Business: 4.8+ yıldız için müşteriye QR kod ver','Sayı verin: "3 ayda tapu teslim" cümlesi satıyor','Portal ilanı: en üste referans müşteri sözü koy'],
   begeni:3900,goruntuleme:8500,renk:'#EC4899'},
  {ikon:'🎥',kategori:'Teknoloji',okuma:'5 dk',
   baslik:"Matterport 3D Tur ile Uzaktan Satış: Körfez Yatırımcısı Kazanmak",
   ozet:"Dubai'dan İstanbul'a uçmadan tur yapan alıcı %67 daha hızlı karar veriyor. Matterport Pro3 kamera kiralaması ₺1.500/gün — tapu bedelinin binde biri. QR kod ile link + WhatsApp video toplantı = uzaktan kapanma. Atina projeleri için de zorunlu: Körfez alıcısı hiç gelmeden €250K+ ödüyor.",
   ipucu:"3D tur linkini email'e değil, WhatsApp'a gönderin — açılma oranı %4x daha yüksek.",
   detaylar:['Matterport: aylık $69 plan, sınırsız model','QR kod: ilan broşüründe 3D tura direkt link','Uzaktan kapanma: video noterde e-imza mümkün','Atina: Körfez müşterisi gelmeden satın alıyor'],
   begeni:3700,goruntuleme:8100,renk:'#F7931A'},
  {ikon:'📅',kategori:'İçerik Planlaması',okuma:'4 dk',
   baslik:'Emlak Hesabı için 30 Günlük İçerik Takvimi',
   ozet:'Pazartesi: piyasa verisi (m² fiyat, enflasyon, faiz). Çarşamba: daire turu Reels veya Stories. Cuma: müşteri hikayesi veya referans. Pazar: mahalle keşfi videosu. Sabit ritim = güven + algoritma puanı. Buffer veya Later ile haftada 1 saat oturumunda tüm haftayı planlayın. Spontane paylaşım yerine takvim sistemi %67 daha tutarlı büyüme sağlıyor.',
   ipucu:"Her ayın ilk pazartesisi 'aylık piyasa raporu' paylaşın — takipçiler beklemeye başlıyor.",
   detaylar:['Pazartesi: piyasa raporu + rakam güncellemesi','Çarşamba: proje/daire turu video','Cuma: müşteri hikayesi veya başarı','Pazar: mahalle, yaşam tarzı, keşif içeriği'],
   begeni:3600,goruntuleme:7900,renk:'#84CC16'},
  {ikon:'🔄',kategori:'Remarketing',okuma:'4 dk',
   baslik:'İlanı Gören ama Aramayan Leadleri Geri Kazanmak',
   ozet:"Meta Pixel + 30 günlük ziyaretçi hedefleme. Mesaj: \"Baktığınız daire hâlâ müsait — bugün fiyat sorun.\" Remarketing CPL'i %43 düşürüyor. Sahibinden veya portal ziyaretçilerini Google Ads ile yakalamak için RLSA (Remarketing Lists for Search Ads) kullanın. 7 gün içinde geri dönen kullanıcı satın alma niyetinin zirvesinde.",
   ipucu:"Remarketing kitlesi için 'sayfa 3 dakika üzeri okuyanlar' segmentini ayrı tutun — en sıcak kitle bu.",
   detaylar:['Meta Pixel: 30 günlük ziyaretçi liste','RLSA: arama ağında eski ziyaretçiye +%50 teklif artışı','7. gün: en yüksek remarketing dönüşüm anı','Dinamik reklam: gördüğü daireyi tekrar göster'],
   begeni:3400,goruntuleme:7500,renk:'#3B82F6'},
  {ikon:'🧪',kategori:'A/B Test',okuma:'4 dk',
   baslik:'Hangi İlan Başlığı Daha Çok Tıklanır? 5 Test Sonucu',
   ozet:'"Beşiktaş 2+1" < "Metro 3 dk · Deniz Manzaralı 2+1 · ₺12M". Rakam + özellik + lokasyon üçlüsü her seferinde kazanıyor. Test süresi minimum 72 saat, minimum 500 görüntüleme. Sahibinden başlık A/B testi: Cuma-Pazartesi arası test, Salı sonucu. Kazanan başlığı tüm platformlara uygulayın. CTR farkı %15+ ise değişiklik kayda değer.',
   ipucu:"Her ay tek bir değişkeni test edin: önce başlık, sonra fotoğraf sırası, sonra fiyat formatı.",
   detaylar:['72 saat + 500 görüntüleme minimum örneklem','Değişkenler: başlık, ilk fotoğraf, fiyat formatı','CTR %15+ fark = anlamlı sonuç','Kazananı tüm platformlara kopyalayın'],
   begeni:3300,goruntuleme:7200,renk:'#8B5CF6'},
  {ikon:'🤳',kategori:'Personal Brand',okuma:'5 dk',
   baslik:'Emlakçı Influencer Olabilir mi? 10K Takipçi Stratejisi',
   ozet:'Kendi yüzünüzü gösterin, kendi semtinizde çekin, kendi müşterinizin hikayesini anlatın. Marka hesabı değil kişisel hesap — güven 3x daha yüksek. Niche belirleyin: "İstanbul Avrupa yakası lüks konut uzmanı" veya "Atina Körfez yatırımcısı danışmanı". Haftalık 3 Reels, günlük 1 Stories ile 6 ayda 10K ulaşmak mümkün.',
   ipucu:"Bio'ya 'DM → ücretsiz bölge analizi' yazın — takipçiyi müşteriye dönüştüren en basit CTA.",
   detaylar:['Niche: semt + hedef kitle + uzmanlık alanı','Kişisel hesap: marka hesabından %3x daha güvenilir','3 Reels/hafta + 1 Stories/gün minimum ritim','6 ay = 10K takipçi = ayda 3-5 organik lead'],
   begeni:3200,goruntuleme:6900,renk:'#EC4899'},
  {ikon:'📲',kategori:'WhatsApp',okuma:'3 dk',
   baslik:'WhatsApp Kataloğu ile Proje Tanıtımı: Adım Adım Kurulum',
   ozet:'Ürün = daire (kat planı fotoğrafı), fiyat alanı = m² başı ₺ + toplam fiyat, açıklama = 3 özellik + link. Katalog paylaşımı soğuk mesajdan %5x daha yüksek yanıt alıyor. Günde 1 ürün (daire) güncelleme = yeni bildirim. Katalog paylaşım butonu DM\'de tek tık ile çalışıyor. Mevcut müşteri ağı ücretsiz viral dağıtım kanalı.',
   ipucu:"Katalog'daki her daire için 'Sadece 2 adet kaldı' ibaresi ekleyin — kıtlık hissi anında artar.",
   detaylar:['Ürün başlığı: daire tipi + kat + manzara','Fiyat: ₺/m² + toplam (iki bilgi birlikte)','Açıklama: 3 özellik + WhatsApp randevu linki','Günlük güncelleme: yeni bildirim = dikkat çekme'],
   begeni:3100,goruntuleme:6600,renk:'#25D366'},
  {ikon:'💼',kategori:'B2B & Kurumsal',okuma:'5 dk',
   baslik:'LinkedIn ile Kurumsal Gayrimenkul Pazarlama: Fon & Expat',
   ozet:"Hedef: CFO, aile ofisi yöneticisi, HR direktörü (expat relocation bütçesi olan). İçerik: piyasa raporu PDF + ROI analizi + sektör verisi. InMail CPS kurumsal segmentte %60 düşürüyor. Makale yayınlama (LinkedIn Article): haftalık 1 uzun form içerik = düşünce lideri konumu. Company page + kişisel profil birlikte çalışmalı.",
   ipucu:"LinkedIn'de 'İstanbul Real Estate Market Report 2026' başlıklı PDF paylaşın — 500+ indirme = 500 sıcak B2B lead.",
   detaylar:['ICP: CFO + aile ofisi + HR direktörü','InMail: kişiselleştirilmiş proje özeti + ROI','Article: haftalık piyasa analizi = otorite','PDF rapor: indirme = lead capture fırsatı'],
   begeni:3000,goruntuleme:6200,renk:'#0077B5'},
  {ikon:'📈',kategori:'Analitik',okuma:'5 dk',
   baslik:'GA4 ile Emlak Sitesi Analizi: Hangi Sayfa Gerçekten Satıyor',
   ozet:'Dönüşüm yolu: Blog → Proje Sayfası → İletişim %68. Doğrudan giriş sadece %12. İçerik pazarlaması kanalınızın %56\'sını oluşturuyor. GA4\'te "iletişim formu gönder" dönüşüm hedefi kurun. Oturma süresi 3 dk+ olan sayfalar lead kalitesini artırıyor. Heatmap (Hotjar ücretsiz): kullanıcı nereye tıklıyor görmek için.',
   ipucu:"GA4'te kaynak/araç raporu açın — LinkedIn mi, Google mu, WhatsApp mı daha çok lead getiriyor 30 günde görün.",
   detaylar:['Dönüşüm hedefi: form gönder + WhatsApp tık','Heatmap: Hotjar ücretsiz 35 oturum/gün','Oturma 3 dk+: kaliteli sayfaları bulun','Kaynak analizi: hangi kanal ROI pozitif'],
   begeni:2900,goruntuleme:5900,renk:'#F7931A'},
  {ikon:'🧲',kategori:'Lead Generation',okuma:'4 dk',
   baslik:'İndirilebilir Rapor ile Email Listesi Büyütme: Aylık +800 Lead',
   ozet:'"İstanbul 2026 Konut Piyasası Raporu" PDF karşılığı email — landing page CVR %34. Sıcak listeye aylık 2 email = ₺1.84M ROI. Rapor içeriği: m² fiyat trendi, ilçe karşılaştırması, yatırım önerileri, kira getirisi tablosu. İndiren kişi satın alma niyetini açıklamış oluyor — en sıcak lead tipi. Raporu her çeyrekte güncelleyin.',
   ipucu:"Rapor landing page'ine 'Bu raporu 1.240 yatırımcı indirdi' sayacı ekleyin — sosyal kanıt CVR'yi %18 artırıyor.",
   detaylar:['Başlık: güncel yıl + spesifik şehir + "rapor"','İçerik: m² trendi + ilçe tablosu + tahmin','Landing page: tek form, tek CTA, sosyal kanıt','Dağıtım: LinkedIn + Meta + email imzası'],
   begeni:2700,goruntuleme:5600,renk:'#84CC16'},
  {ikon:'💎',kategori:'Lüks Segment',okuma:'5 dk',
   baslik:'Lüks Konut Pazarlamasında Fark Yaratan 5 Detay',
   ozet:'Fiyat gösterme değil, erişim duygusu yarat. Özel davet ile tur — herkes gelemez. Mimari hikaye anlat: mimar kim, ilham neydi, malzeme nereden. Yatırım değil yaşam tarzı sat — "sabah kahvenizi Boğaz\'a karşı için". Dil: seçkin, sessiz, güvenli — büyük harf, ünlem işareti yok. Broker seçimi: sadece referanslı ve onaylı.',
   ipucu:"Lüks ilanda fiyat yazmayın, 'Fiyat bilgisi için randevu alın' yazın — erişim algısı değeri %15 artırıyor.",
   detaylar:['İlan dili: sade, seçkin, ünlemsiz','Tur: özel davet + NDA imzası = gizlilik garantisi','Fotoğraf: editöryel stil, beyaz zemin değil sahne','Broker: referanslı, seçici, az müşterili'],
   begeni:2500,goruntuleme:5100,renk:'#06B6D4'},
  /* ─── 20 YENİ MAKALE ─── */
  {ikon:'🤖',kategori:'Yapay Zeka',okuma:'5 dk',
   baslik:'ChatGPT ile Emlak İlanı Yazma: Dakikada Satışa Hazır Metin',
   ozet:'ChatGPT Prompt şablonu: "Beşiktaş\'ta 110m², 3. kat, deniz manzaralı, metro 3 dk dairesi için Türkçe + İngilizce ilan metni yaz." Output: portal açıklaması + email konu satırı + WhatsApp mesajı + Instagram caption. Hepsini 3 dakikada üretebilirsiniz. A/B test için 3 farklı ton deneyin: profesyonel, samimi, aciliyet temelli.',
   ipucu:'Claude veya GPT-4o\'ya "lüks, sıcak, davet edici" ton talimatı verin — otomatik dil farkı oluşuyor.',
   detaylar:['Prompt şablonu: semt + m² + özellik + hedef kitle','Çıktı: TR + EN + AR üç dil eş zamanlı','Ton denemesi: resmi, samimi, aciliyet — A/B test','İlan sonrası: meta açıklama + schema markup'],
   begeni:8900,goruntuleme:29400,renk:'#8B5CF6'},
  {ikon:'🎵',kategori:'TikTok',okuma:'4 dk',
   baslik:'TikTok\'ta Gayrimenkul: 0\'dan 100K Takipçiye Giden Yol',
   ozet:'TikTok algoritması YouTube\'dan 6x daha hızlı büyütüyor — yeni hesap için organik avantaj muazzam. Format: "Evinizi göstereyim mi?" Duet talebi veya "Bu fiyata şaşıracaksınız" hook. İstanbul lüks daire videosu TikTok\'ta 2M görüntüleme alabiliyor. Günde 1 video, 30 gün — hesap ivme kazanıyor. Hashtag: #istanbulapartment #gayrimenkul #evturu',
   ipucu:'İlk 5 videoya reklam harcamayın — algoritma organik olarak test ediyor, öyle büyütüyor.',
   detaylar:['Hook: "Bu fiyata şaşıracaksınız" ilk 2 saniye','Trend ses kullanın: görünürlük 4x artıyor','Hashtag: TR + EN karışık, 5-8 arası','Duet: müşteri "aldım mı almadım mı?" formatı'],
   begeni:7800,goruntuleme:26300,renk:'#010101'},
  {ikon:'🏡',kategori:'Open House',okuma:'4 dk',
   baslik:'Open House Organizasyonu: 1 Günde 20+ Ziyaretçi Formülü',
   ozet:'Cumartesi 14:00-17:00 penceresi en verimli. Davet: WhatsApp Broadcast + portal ilanı "açık ev günü" etiketi + Instagram Story sayım. Kahve + meyve suyu: ziyaretçi 45 dk daha kalıyor. Kapıda imzalı liste: lead otomatik toplanıyor. Fotoğraflı geri bildirim formu: hangi oda en çok beğenildi analizi. Sonuç: 72 saat içinde 3-5 teklif.',
   ipucu:'Open House\'u portal ilanında "Bu hafta sonu — sınırlı yer" olarak duyurun, bekleme listesi oluşturun.',
   detaylar:['Cumartesi 14:00-17:00: en yüksek katılım saati','Davet: Broadcast + Story + portal ilanı','Fiziksel form: isim + telefon + ilgilenilen oda','72 saat: takip call — en sıcak an'],
   begeni:5100,goruntuleme:16800,renk:'#10b981'},
  {ikon:'📜',kategori:'Hukuki Süreç',okuma:'6 dk',
   baslik:'Tapu Sürecini Alıcıya Anlatmanın Pazarlama Değeri',
   ozet:'Alıcının en büyük korkusu: "Aldatılır mıyım? Tapu güvende mi?" Bu soruyu yanıtlayan ajans güven + kapanma hızı kazanıyor. 5 adım: Satış Vaadi → Tapu Harcı → Noter → TKGM Randevu → Teslim. Her adım için tahmini süre + maliyet şeffaf paylaşılsın. YouTube\'da "tapu süreci" videosu aylık 12.000 arama alıyor.',
   ipucu:'"Tapu\'da yanınızdayım" garantisi verin — avukat desteği maliyeti ₺2-5K, güven değeri ölçülemez.',
   detaylar:['5 adım şeffaflık: süreç + maliyet + sorumlu','Tapu harcı: alıcı %2 + satıcı %2 toplam %4','TKGM randevu: e-randevu sistemi, 2-3 gün bekleme','Yabancı alıcı: ek belge + çeviri + apostil'],
   begeni:4600,goruntuleme:14200,renk:'#F7931A'},
  {ikon:'🎨',kategori:'Görsel Araçlar',okuma:'3 dk',
   baslik:'Canva ile Emlak Grafikleri: Profesyonel Görsel Dakikada',
   ozet:'Canva Pro aylık ₺180 — fotoğraf düzenleme + ilan tasarımı + Stories şablonu hepsi içinde. Emlak için hazır şablon kategorisi var. Renk paleti: marka renginizi kaydedin, her grafik tutarlı. "m² başı ₺268K" gibi veri grafikleri Canva ile 5 dk\'da hazır. Ekip paylaşımı: asistan veya partner aynı hesaptan düzenleyebilir.',
   ipucu:'Canva\'da "real estate" template arayın — 500+ hazır şablon, sadece metin ve renk değiştirin.',
   detaylar:['Brand Kit: marka rengi + font bir kez ayarla','Template: her platform için boyut var (Reels, Story, Feed)','Veri grafik: bar chart ile m² karşılaştırması','Ekip: 5 kişiye kadar ücretsiz paylaşım'],
   begeni:4200,goruntuleme:13100,renk:'#EC4899'},
  {ikon:'🏗️',kategori:'Off-Plan Satış',okuma:'5 dk',
   baslik:'Plan Üzeri (Off-Plan) Satış: İnşaat Öncesi Pazarlama Rehberi',
   ozet:'Off-plan avantajı: %15-25 altında fiyat + taksit esnekliği. Dezavantaj: güven sorunu + teslim riski. Pazarlama cevabı: marka güveni + geçmiş proje referansları + bankadan teminat mektubu. Render kalitesi kritik — AI render ₺500\'de profesyonel çıktı. İnşaat ilerleme videosu aylık paylaşım: alıcı "proje ilerliyor" hissiyle rahat.',
   ipucu:'Off-plan için inşaat kamerasını YouTube\'da canlı yayın olarak bırakın — 7/24 şeffaflık = güven.',
   detaylar:['Fiyat avantajı: %15-25 altı ile başlangıç','Teminat: banka teminat mektubu = güven','Render: AI ile ₺500\'de fotogerçekçi görsel','Aylık güncelleme: inşaat ilerleme videosu'],
   begeni:4400,goruntuleme:13700,renk:'#3B82F6'},
  {ikon:'📉',kategori:'Kriz Yönetimi',okuma:'5 dk',
   baslik:'Piyasa Düşüşünde Satış Stratejisi: Yavaş Dönemde Kapanma',
   ozet:'Düşen piyasada bekleyen alıcı artıyor — fırsatı kimse kaçırmak istemiyor. Strateji: "şimdi almak doğru mu?" sorusunu veriye dayalı cevapla. TL depreciation anlatısı: "Her ay beklersen ₺X kaybediyorsun." Fiyat indirimi yerine değer paketi: park yeri + depo + mobilya dahil. Yabancı alıcı için kur avantajı: "€ bazlı hesapla %18 indirim."',
   ipucu:'Düşen piyasada "acil satılık" yazma — "stratejik fiyatlandırma" de, aynı mesaj farklı etki.',
   detaylar:['Veriye dayalı cevap: enflasyon + kira + değer karşılaştırması','TL depreciation: her ay beklemenin maliyeti','Değer paketi: para indirimi yerine bonus ekle','Yabancı: € bazlı hesap ile indirim algısı yarat'],
   begeni:3800,goruntuleme:11200,renk:'#EF4444'},
  {ikon:'✈️',kategori:'Yabancı Alıcı',okuma:'5 dk',
   baslik:'Yabancı Uyruklular için Tapu Rehberi: 8 Adımda Ev Sahibi',
   ozet:'Yabancı uyruklu Türkiye\'de tapu alabilir — 183 ülke ile karşılıklılık anlaşması. Gerekli: pasaport + vergi numarası + DASK + tapu harcı. Tapu harcı: alım bedelinin %4\'ü. Askeri yasak bölge kontrolü: 2 iş günü. Ortalama süre: başvurudan tapuya 7-15 gün. Yabancı uyruklu arama Google\'da aylık 8.400 — bu içeriği yazan ajans öne çıkıyor.',
   ipucu:'"Yabancı uyruklu ev alabilir mi?" videosu YouTube\'da yükleyin — her ay 8.400 arama, sıfır rakip video.',
   detaylar:['183 ülke: TR ile karşılıklılık anlaşması mevcut','Vergi no: online başvuru, 1 iş günü','Tapu harcı: %4 (alıcı + satıcı eşit bölüşebilir)','DASK: zorunlu deprem sigortası, yıllık ₺500-2.000'],
   begeni:5300,goruntuleme:15900,renk:'#10b981'},
  {ikon:'🌊',kategori:'Atina Pazarı',okuma:'4 dk',
   baslik:'Atina Airbnb vs Uzun Dönem Kira: Yatırımcıya Doğru Analiz',
   ozet:'Airbnb brüt getiri Atina Kolonaki\'de %7-9 — uzun dönem %4-5. Ancak: Airbnb yönetim ücreti %15-25, boşluk riski, eşyalanma maliyeti. Net hesapla fark kapanıyor. Glyfada deniz manzaralı: Airbnb açıkça kazanıyor. Kifisia\'da Airbnb talep daha düşük — uzun dönem güvenli. Yasal durum: Atina\'da Airbnb kayıt zorunlu.',
   ipucu:'"Airbnb mi uzun dönem mi?" hesaplayıcısını landing page\'e ekleyin — her yatırımcının merak ettiği soru.',
   detaylar:['Airbnb brüt: %7-9, net: %5-7 (yönetim dahil)','Uzun dönem: %4-5 brüt, %3-4 net, düşük stres','Glyfada: Airbnb net kazanıyor','Kayıt: Yunanistan\'da MHTE lisansı zorunlu'],
   begeni:4700,goruntuleme:14800,renk:'#1d63ed'},
  {ikon:'🧮',kategori:'Finansal Araçlar',okuma:'4 dk',
   baslik:'Mortgage Hesaplayıcısı ile Lead Toplama: Aylık 200+ Form',
   ozet:'Alıcının ilk sorusu: "Bu daireyi aylık kaç ödemeyle alabilirim?" Hesaplayıcı: gelir × 0.4 = maks taksit, faiz oranı × anapara × süre. İstanbul\'da 20 yıl %3.5 aylık faizle 1M TL kredi = aylık ₺35.000 taksit. Form: yaş + gelir + peşinat → otomatik hesap → WhatsApp CTA. Finans danışmanı yönlendirme = ek hizmet geliri.',
   ipucu:'Hesaplayıcı sonucuna "Bu krediyi hangi bankadan alırsınız?" seçenekleri ekleyin — banka affiliate geliri.',
   detaylar:['Formül: kredi = peşinat sonrası değer × aylık faiz × süre','Görsel çıktı: pasta grafik ile peşinat/faiz/anapara','WhatsApp CTA: "Banka karşılaştırması için ulaşın"','Affiliate: banka yönlendirme komisyonu ₺500-2.000'],
   begeni:4100,goruntuleme:12300,renk:'#84CC16'},
  {ikon:'🎪',kategori:'Fuar & Etkinlik',okuma:'4 dk',
   baslik:'Gayrimenkul Fuarında Öne Çıkma: MIPIM, Cityscape ve Türkiye Fuarları',
   ozet:'MIPIM Cannes (Mart): global yatırımcı + fon erişimi. Cityscape Dubai (Ekim): Körfez yatırımcısı direkt. Real Estate Turkey (İstanbul, yıllık): yerel + diaspora. Fuar hazırlığı: 3D tur QR kodu + broşür TR/EN/AR + canlı WhatsApp randevu sistemi. Fuar bütçeti ₺50K-200K — ROI: 10+ kurumsal lead ile kapanıyor.',
   ipucu:'Fuar standında QR kodlu "anında WhatsApp randevu" sistem kurun — kartvizit değil numara almak istiyorsunuz.',
   detaylar:['MIPIM: Mart, Cannes — en prestijli global fuar','Cityscape Dubai: Ekim — Körfez odaklı','Hazırlık: 3 dil broşür + 3D tur QR + video loop','Stand: WhatsApp randevu sistemi + lead form tablet'],
   begeni:3600,goruntuleme:10800,renk:'#F7931A'},
  {ikon:'🥽',kategori:'Teknoloji',okuma:'4 dk',
   baslik:'VR ile Ev Turu: Meta Quest\'ten Ev Satmak',
   ozet:'Meta Quest 3 ile alıcı dairenin içinde yürüyor — 10.000 km uzaktan. VR tur maliyeti ₺3.000-8.000 (tek seferlik üretim). Körfez yatırımcısı için dönüşüm %2.3x artıyor. Çözüm ortakları: Paracosm, Matterport VR modu. Etkinlik: fuar standında VR gözlük demo = kalabalık çekim garantisi. Yalnızca premium projeler için ekonomik.',
   ipucu:'VR tur üretimini Matterport\'un "VR Export" özelliğiyle 3D taramadan çıkarın — ayrı üretim maliyeti yok.',
   detaylar:['Meta Quest 3: ₺8.000 donanım, 1 kez yatırım','VR tur: Matterport\'tan direkt export edilebilir','Körfez demo: fuar standında kalabalık çekiyor','ROI: bir kapanmayla üretim maliyeti karşılanıyor'],
   begeni:3400,goruntuleme:9700,renk:'#8B5CF6'},
  {ikon:'📋',kategori:'Raporlama',okuma:'5 dk',
   baslik:'Çeyreklik Piyasa Raporu: Otorite Kazanmanın En Hızlı Yolu',
   ozet:'Q1/Q2/Q3/Q4 raporları: m² fiyat değişimi + kira endeksi + işlem hacmi + yatırım trendi. Kaynaklar: TÜİK, TCMB, Bank of Greece, Eurostat. PDF format: 8-12 sayfa, infografik ağırlıklı. Dağıtım: LinkedIn + email listesi + medya gönderimi. Raporu indiren kişi = nitelikli lead. Gazetecilerin sizi kaynak olarak kullanması = ücretsiz PR.',
   ipucu:'Raporu Kadıköy Gazetesi veya Hürriyet Emlak gibi yerel medyaya gönderin — 1 haber = 10.000 organik erişim.',
   detaylar:['Çeyreklik: Ocak + Nisan + Temmuz + Ekim başı','Veri: TÜİK EVDS + TCMB + tapu istatistikleri','Format: PDF 8-12 sayfa, infografik ağırlıklı','Dağıtım: medya listesi + LinkedIn + email'],
   begeni:3200,goruntuleme:9100,renk:'#3B82F6'},
  {ikon:'🌐',kategori:'İki Pazar',okuma:'6 dk',
   baslik:'İstanbul-Dubai Köprüsü: İki Şehri Birden Satan Ajans Olmak',
   ozet:'Dubai\'da yaşayan Türk yatırımcısı: İstanbul\'a yatırım yapıp Atina\'dan Golden Visa istiyor. Bu profil için 3 dilde (TR + EN + AR) içerik + iki şehir bilgisi + vergi danışmanı network zorunlu. Dubai\'da 70.000+ Türk expat bu potansiyelin sadece bir dilimi. Instagram\'da Dubai ofisi + İstanbul ofisi birlikte göstermek = global güven.',
   ipucu:'LinkedIn\'de "İstanbul + Dubai gayrimenkul" niş keyword ile profil optimize edin — direkt arama yapan kitle var.',
   detaylar:['70.000+ Türk Dubai expat = aktif yatırım potansiyeli','3 dil: TR + EN + AR minimum','Tax advisor network: UAE + TR karşılaştırmalı vergi','Instagram: iki şehir ofisi = global algı'],
   begeni:5700,goruntuleme:17200,renk:'#F7931A'},
  {ikon:'🏊',kategori:'Atina Pazarı',okuma:'4 dk',
   baslik:'Atina Expat Kiracısı Çekme Stratejisi: Glyfada ve Kolonaki',
   ozet:'Atina\'da 120.000+ expat — Amerikalı, İngiliz, Körfezli. Glyfada: İngiliz ve Amerikalı expat için deniz + okul + marina. Kolonaki: kültür + restoran + merkezi konum. Hedef platform: Expat.com + InterNations + Facebook Expat Greece grupları. İngilizce ilan + sözleşme zorunlu. Kira garantisi: 12 ay peşin veya sigorta.',
   ipucu:'"Furnished apartment Athens Glyfada expat" Google araması ayda 2.200 — bu kelimeyle İngilizce ilan yazın.',
   detaylar:['120.000+ expat Atina\'da yaşıyor','Glyfada: plaj + ISA okulu + marina = expat tercihi','Kolonaki: kültür + yürüyüş mesafesi tüm hizmetler','Kira garantisi: expat iş vereninden referans mektubu'],
   begeni:3500,goruntuleme:10100,renk:'#1d63ed'},
  {ikon:'🔑',kategori:'Kira Yönetimi',okuma:'5 dk',
   baslik:'Yatırımcı Müşteriyi Elde Tutmanın Altın Kuralı: Kira Yönetimi',
   ozet:'Satışı kapattınız — ama asıl uzun vadeli gelir kira yönetimi hizmetinde. %8-12 komisyon + ayda 1 rapor + sorun yönetimi = müşteri size bağlı. Yatırımcı portföyü büyüdükçe sizinle büyüyor. LTV hesabı: tek satış ₺50K komisyon vs 10 yıl kira yönetimi ₺200K+. Otomasyon: Airbnb yönetim yazılımı + kiracı portal sistemi.',
   ipucu:'"Satış + 2 yıl ücretsiz kira yönetimi" paketi sunun — müşteriyi rakibe kaptırmamak için yeterli.',
   detaylar:['Komisyon: aylık kiranın %8-12\'si','Aylık rapor: gelir + gider + bakım + doluluk','LTV: satış komisyonu vs uzun dönem yönetim','Yazılım: Hostaway, Smoobu veya yerel çözüm'],
   begeni:3900,goruntuleme:11400,renk:'#10b981'},
  {ikon:'🌱',kategori:'Sürdürülebilirlik',okuma:'4 dk',
   baslik:'Yeşil Bina Pazarlaması: LEED ve BREEAM Sertifikası Nasıl Satılır',
   ozet:'LEED sertifikalı bina %8-12 daha yüksek kira getirisi, %5-10 değer artışı. Avrupa\'dan Körfez\'e her yatırımcı ESG uyumlu portföy istiyor. Pazarlama dili: "karbon nötr", "sağlıklı yaşam alanı", "geleceğe yatırım". Enerji tasarrufu rakamları somutlaştırın: "Yıllık ₺8.000 enerji tasarrufu". B2B hedef: kurumsal fon + aile ofisi + ESG fonları.',
   ipucu:'LEED sertifika plakasını entry\'de gösteren fotoğrafı ilanın 2. fotoğrafı yapın — kurumsal alıcı anında anlıyor.',
   detaylar:['LEED Gold: %8-12 kira primi + %5-10 değer artışı','Enerji rakamı: yıllık ₺X tasarruf somutlaştırın','ESG hedef: kurumsal fon + aile ofisi','Belge: sertifika fotokopisi ilana ekleyin'],
   begeni:2800,goruntuleme:7900,renk:'#84CC16'},
  {ikon:'💳',kategori:'Finansman',okuma:'5 dk',
   baslik:'Alıcıya Finansman Çözümü Sunmak: Komisyonu İkiye Katlama Yöntemi',
   ozet:'Finansman çözümü sunan ajans kapanma oranını %34 artırıyor. Banka ortaklığı: Garanti, İş, Yapı Kredi ile referans anlaşması → alıcıya özel faiz oranı. İpotek danışmanı yönlendirme komisyonu: ₺1.000-5.000 / kapanma. Yabancı alıcı için: HSBC Türkiye + Deutsche Bank Türkiye yabancı uyruklulara kredi veriyor. Kredi simülasyonu sunmak güveni pekiştiriyor.',
   ipucu:'"Banka araştırmanızı biz yapıyoruz" hizmetini standart pakete ekleyin — alıcı zaten bu konuda kaybolmuş durumda.',
   detaylar:['Banka ortaklığı: referans anlaşması + özel faiz','Komisyon: mortgage kapanmasından ₺1-5K','Yabancı kredi: HSBC + Deutsche Bank seçenekleri','Simülasyon: 10-15-20 yıl kıyaslaması sunun'],
   begeni:3300,goruntuleme:9500,renk:'#06B6D4'},
  {ikon:'🏦',kategori:'Yatırım Analizi',okuma:'5 dk',
   baslik:'Yeni Bina vs İkinci El: Hangisi Daha Karlı Yatırım',
   ozet:'Yeni bina avantajları: garantili malzeme, ısı yalıtımı, asansör, site güvenliği, ilk 10 yıl bakım yok. Dezavantaj: erken teslimat riski, çevre henüz olgunlaşmamış. İkinci el avantajı: etabli mahalle, gerçek kira geçmişi, hemen gelir. Hesap: yeni binada değer artışı potansiyeli daha yüksek — özellikle kentsel dönüşüm bölgelerinde.',
   ipucu:'"Kentsel dönüşüm kararnamesi" olan bölgelerde ikinci el alın — yıkım tazminatı yatırımı koruyor.',
   detaylar:['Yeni bina: %8-15 erken alım indirimi potansiyeli','İkinci el: anında kira geliri, sıfır bekleme','Kentsel dönüşüm: ikinci el değer 3-5 yılda 2x','Enerji sınıfı A binalar %12 daha yüksek kira'],
   begeni:4300,goruntuleme:12600,renk:'#F7931A'},
  {ikon:'🗓️',kategori:'Pazar Araştırması',okuma:'5 dk',
   baslik:'Satın Almadan Önce 5 Saatlik Bölge Analizi: Profesyonel Yöntem',
   ozet:'Adım 1: TCMB konut fiyat endeksi + TÜİK bölge istatistiği. Adım 2: Sahibinden arşiv fiyatları 6 ay geriye. Adım 3: Google Maps ile ulaşım + okul + sağlık haritası. Adım 4: Belediye imar planı sorgusu (e-devlet). Adım 5: Mahallede 30 dakika fiziksel yürüyüş. Bu 5 adım, hatalı yatırım riskini %72 azaltıyor.',
   ipucu:'E-devlet imar plan sorgulamasında "KENTGES" haritasına bakın — yapılaşma yoğunluğu ve yeşil alan planı görünüyor.',
   detaylar:['TCMB EVDS: ücretsiz, güncel konut fiyat endeksi','Sahibinden arşiv: 6 ay önceki ilan fiyatlarını karşılaştır','İmar planı: e-devlet ile 2 dk'da sorgulanıyor','Fiziksel ziyaret: ses + koku + trafik gerçeği gösterir'],
   begeni:3800,goruntuleme:11100,renk:'#84CC16'},
];

function InstagramKartlar() {
  const fmt = (n: number) => n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);
  return (
    <div style={{marginTop:48}}>
      <div style={{marginBottom:24,borderBottom:'1px solid rgba(255,255,255,.07)',paddingBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:6}}>
          <span style={{fontSize:24}}>📚</span>
          <h2 style={{fontSize:22,fontWeight:800,color:'#fff',margin:0,letterSpacing:'-0.3px'}}>
            Gayrimenkul Pazarlama — En Çok Okunan İçerikler
          </h2>
        </div>
        <p style={{fontSize:13,color:'hsl(222 47% 55%)',margin:0}}>
          En fazla beğeni ve görüntüleme alanlar önce · {IG_MAKALELER.length} makale · İstanbul & Atina pazarına özel
        </p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:18}}>
        {IG_MAKALELER.map((m,i)=>(
          <div key={i} style={{
            background:'hsl(222 47% 5%)',
            border:`1px solid ${m.renk}28`,
            borderRadius:18,
            padding:20,
            display:'flex',
            flexDirection:'column',
            gap:14,
            position:'relative',
            overflow:'hidden',
          }}>
            {/* Top bar: kategori + sıra + okuma */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:6}}>
              <span style={{
                fontSize:10,fontWeight:700,letterSpacing:.8,
                background:`${m.renk}20`,color:m.renk,
                padding:'3px 10px',borderRadius:20,
              }}>{m.kategori.toUpperCase()}</span>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <span style={{fontSize:10,color:'hsl(222 47% 45%)'}}>⏱ {m.okuma}</span>
                <span style={{fontSize:10,color:'hsl(222 47% 35%)',fontWeight:600}}>#{i+1}</span>
              </div>
            </div>
            {/* Emoji + başlık */}
            <div>
              <div style={{fontSize:32,marginBottom:8,lineHeight:1}}>{m.ikon}</div>
              <div style={{fontSize:15,fontWeight:800,color:'#fff',lineHeight:1.45,letterSpacing:'-0.2px'}}>
                {m.baslik}
              </div>
            </div>
            {/* Özet */}
            <div style={{fontSize:13,color:'hsl(222 47% 68%)',lineHeight:1.7,flex:1}}>
              {m.ozet}
            </div>
            {/* Detay maddeleri */}
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {m.detaylar.map((d,j)=>(
                <div key={j} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                  <span style={{color:m.renk,fontSize:12,marginTop:1,flexShrink:0}}>▸</span>
                  <span style={{fontSize:12,color:'hsl(222 47% 60%)',lineHeight:1.5}}>{d}</span>
                </div>
              ))}
            </div>
            {/* İpucu */}
            <div style={{
              background:`${m.renk}10`,
              border:`1px solid ${m.renk}25`,
              borderRadius:10,
              padding:'10px 12px',
            }}>
              <span style={{fontSize:10,fontWeight:700,color:m.renk,letterSpacing:.5}}>💡 PRO İPUCU</span>
              <div style={{fontSize:12,color:'hsl(222 47% 72%)',marginTop:4,lineHeight:1.55}}>
                {m.ipucu}
              </div>
            </div>
            {/* Footer */}
            <div style={{
              display:'flex',gap:16,paddingTop:10,
              borderTop:`1px solid ${m.renk}15`,
              alignItems:'center',
            }}>
              <span style={{fontSize:12,color:'#EC4899',fontWeight:700}}>❤️ {fmt(m.begeni)}</span>
              <span style={{fontSize:12,color:'hsl(222 47% 50%)',fontWeight:600}}>👁 {fmt(m.goruntuleme)}</span>
              <div style={{marginLeft:'auto',
                fontSize:9,fontWeight:700,letterSpacing:.5,
                background:`${m.renk}15`,color:m.renk,
                padding:'2px 7px',borderRadius:8,
              }}>OKUMAK İÇİN KAYDET</div>
            </div>
            {/* Bottom accent */}
            <div style={{
              position:'absolute',bottom:0,left:0,right:0,height:3,
              background:`linear-gradient(90deg,${m.renk},${m.renk}44,transparent)`,
            }}/>
          </div>
        ))}
      </div>
    </div>
  );
}


function PazarlamaModulleri() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:16, marginTop:24}}>
      <GRKanalROI />
      <AliciYolculugu />
      <GayrimenkulKPI />
      <MetaKonutReklam />
      <GoogleAdsEmlak />
      <SEOGayrimenkul />
      <EmailYatirimci />
      <YabanciYatirimci />
      <ProjeLansman />
      <FiyatKonumlandirma />
      <GayrimenkulLTV />
      <SosyalMedyaKonut />
      <DijitalShowroom />
      <CRMReferans />
      <ReklamMetinleri />
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
      <InstagramKartlar />
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
