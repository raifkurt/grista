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
