import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Heart } from 'lucide-react';
import { NewsItem } from '@/lib/data/liveData';

/* ══════════════════════════════════════════════════════════════════
   SAGLIK BILGI MODULLERI
══════════════════════════════════════════════════════════════════ */

/* -- 1. Vitamin Rehberi -- */
const VITAMINLER = [
  { kod:'A',  renk:'#F59E0B', ikon:'carrot',   isim:'Vitamin A',   islevler:'Gorme, bagisiklik, cilt',         eksiklik:'Gece korlugu, kuru cilt',           kaynaklar:'Havuc, ispanak, tatli patates', gunluk:'700-900 mcg' },
  { kod:'B12',renk:'#3B82F6', ikon:'meat',     isim:'Vitamin B12', islevler:'Sinir sistemi, kan hucresi',      eksiklik:'Yorgunluk, anemi, uyusma',          kaynaklar:'Et, balik, yumurta, sut',       gunluk:'2.4 mcg' },
  { kod:'C',  renk:'#10b981', ikon:'lemon',    isim:'Vitamin C',   islevler:'Bagisiklik, kolajen, antioksidan',eksiklik:'Skorbut, yavas iyilesme',           kaynaklar:'Limon, biber, brokoli',         gunluk:'65-90 mg' },
  { kod:'D',  renk:'#F7931A', ikon:'sun',      isim:'Vitamin D',   islevler:'Kemik, bagisiklik, ruh hali',     eksiklik:'Osteoporoz, depresyon',             kaynaklar:'Gunes, balik, mantar',          gunluk:'600-800 IU' },
  { kod:'E',  renk:'#84CC16', ikon:'nut',      isim:'Vitamin E',   islevler:'Antioksidan, hucre koruma',       eksiklik:'Kas zayifligi, bagisiklik azalma',  kaynaklar:'Findik, tohum, zeytinyagi',     gunluk:'15 mg' },
  { kod:'K',  renk:'#8B5CF6', ikon:'broccoli', isim:'Vitamin K',   islevler:'Pihtilasmа, kemik sagligi',       eksiklik:'Kanama bozuklugu',                  kaynaklar:'Brokoli, ispanak, kale',        gunluk:'90-120 mcg' },
  { kod:'B9', renk:'#EC4899', ikon:'bean',     isim:'Folat (B9)',   islevler:'DNA sentezi, hamilelik',          eksiklik:'Noral tup defekti, anemi',          kaynaklar:'Fasulye, mercimek, yesillik',   gunluk:'400 mcg' },
  { kod:'Mg', renk:'#06B6D4', ikon:'seed',     isim:'Magnezyum',   islevler:'300+ enzim, kas, uyku',           eksiklik:'Krampler, uykusuzluk, anksiyete',   kaynaklar:'Kabak cek., badem, ispanak',    gunluk:'310-420 mg' },
];
function VitaminRehberi() {
  const [sel, setSel] = useState(VITAMINLER[2]);
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:20}}>💊</span>
        <span className="text-sm font-semibold">Vitamin & Mineral Rehberi</span>
        <span className="text-xs text-muted-foreground ml-auto">Gunluk onerilen dozlar</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {VITAMINLER.map(v=>(
          <button key={v.kod} onClick={()=>setSel(v)}
            className="text-xs px-2.5 py-1 rounded-lg font-bold"
            style={{background:sel.kod===v.kod?v.renk:`${v.renk}20`,color:sel.kod===v.kod?'#fff':v.renk,border:`1px solid ${v.renk}40`,cursor:'pointer'}}>
            {v.kod}
          </button>
        ))}
      </div>
      <div className="p-4 rounded-xl" style={{background:'hsl(222 47% 5%)',border:`2px solid ${sel.renk}30`}}>
        <div className="text-base font-bold mb-3" style={{color:sel.renk}}>{sel.isim} — Gunluk: {sel.gunluk}</div>
        {[{l:'İslevler',v:sel.islevler},{l:'Eksiklik Belirtisi',v:sel.eksiklik},{l:'En İyi Kaynaklar',v:sel.kaynaklar}].map(r=>(
          <div key={r.l} className="flex gap-2 mb-1.5">
            <span className="text-xs font-semibold shrink-0" style={{color:sel.renk,minWidth:130}}>{r.l}</span>
            <span className="text-xs text-muted-foreground">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -- 2. Bagisiklik Guclendirici -- */
const BAGISIKLIK = [
  {isim:'Vitamin D3',       doz:'2.000-5.000 IU', kanit:5, renk:'#F7931A', etki:'T hucresi aktivasyonu, antiviral peptit uretimi'},
  {isim:'Vitamin C',        doz:'500-1.000 mg',   kanit:5, renk:'#10b981', etki:'Notrofil islevi, interferon sentezi, antioksidan'},
  {isim:'Cinko (Zinc)',     doz:'15-30 mg/gun',   kanit:4, renk:'#3B82F6', etki:'Dogal oldurucu hucre aktivasyonu, viral replikasyon engeli'},
  {isim:'Elderberry',       doz:'500 mg ekstrakt',kanit:3, renk:'#8B5CF6', etki:'Sitokin modulasyonu, viral replikasyon azaltma'},
  {isim:'Kuersetin',        doz:'500-1.000 mg',   kanit:3, renk:'#EC4899', etki:'Cinko iyonofor, antiviral, anti-inflamatuar'},
  {isim:'N-Asetil Sistein', doz:'600 mg/gun',     kanit:4, renk:'#06B6D4', etki:'Glutatyon oncusu, mukus sivi lastirici, akciger koruma'},
];
function BagisiklikGuclendirici() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:20}}>🛡️</span>
        <span className="text-sm font-semibold">Kanitа Dayali Bagisiklik Guclendirici</span>
      </div>
      {BAGISIKLIK.map((b,i)=>(
        <div key={i} className="p-2.5 rounded-xl mb-2" style={{background:'hsl(222 47% 5%)',border:`1px solid ${b.renk}20`}}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold" style={{color:b.renk}}>{b.isim}</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_,k)=><div key={k} style={{width:6,height:6,borderRadius:'50%',background:k<b.kanit?b.renk:'hsl(222 47% 15%)'}}/>)}
              </div>
              <span className="text-xs text-muted-foreground font-mono">{b.doz}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{b.etki}</div>
        </div>
      ))}
      <div className="text-xs text-muted-foreground" style={{fontSize:10}}>Nokta sayisi = kanit gucu · Takviye almadan once doktorunuza danisın</div>
    </div>
  );
}

/* -- 3. Uyku Bilimleri -- */
const UYKU_EVRELERI = [
  {evre:'N1',sure:'5 dk',renk:'#4a6080',oran:5, ac:'Uykuya dalıs, kas seğirmeleri'},
  {evre:'N2',sure:'25 dk',renk:'#3B82F6',oran:45,ac:'Bellek konsolidasyonu, uyku igcikleri'},
  {evre:'N3',sure:'35 dk',renk:'#8B5CF6',oran:25,ac:'Derin uyku, buyume hormonu, hucre onarimi'},
  {evre:'REM',sure:'22 dk',renk:'#10b981',oran:25,ac:'Ruya evresi, duygusal isleme, yaraticilik'},
];
function UykuBilimi() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:20}}>😴</span>
        <span className="text-sm font-semibold">Uyku Bilimleri — Evreler & Optimizasyon</span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">Bir uyku dongusu ~90 dakika, 4 evreden oluşur:</div>
      <div className="flex h-7 rounded-full overflow-hidden mb-2 gap-0.5">
        {UYKU_EVRELERI.map(e=>(
          <div key={e.evre} className="flex items-center justify-center" style={{width:`${e.oran}%`,background:e.renk,fontSize:9,color:'#fff',fontWeight:700}}>{e.evre}</div>
        ))}
      </div>
      <div className="space-y-1.5 mb-3">
        {UYKU_EVRELERI.map(e=>(
          <div key={e.evre} className="flex items-center gap-2">
            <div style={{width:3,height:14,background:e.renk,borderRadius:2,flexShrink:0}}/>
            <span className="text-xs font-bold" style={{color:e.renk,minWidth:40}}>{e.evre} {e.sure}</span>
            <span className="text-xs text-muted-foreground">{e.ac}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[{l:'Oda Sicakligi',v:'18-20°C'},
          {l:'Son Kafein',v:'14:00 oncesi'},
          {l:'Ekran Kapatma',v:'Yatmadan 1 saat'},
          {l:'Sabit Uyku Saati',v:'En onemli faktor'},
          {l:'18-64 yas ideal',v:'7-9 saat/gece'},
          {l:'65+ yas ideal',v:'7-8 saat/gece'},
        ].map(it=>(
          <div key={it.l} className="p-1.5 rounded-lg" style={{background:'hsl(222 47% 5%)'}}>
            <div className="text-xs font-semibold" style={{color:'#8B5CF6'}}>{it.l}</div>
            <div className="text-xs text-muted-foreground">{it.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -- 4. Blue Zone -- */
const BLUE_ZONES = [
  {bolge:'Sardunya, Italya',   yas:90,flag:'IT',renk:'#EF4444',sirlar:['Tarhana, fasulye','Her gun yuruyus','Guclu sosyal baglar','Az et, cok bitki']},
  {bolge:'Okinawa, Japonya',   yas:88,flag:'JP',renk:'#F7931A',sirlar:['Hara hachi bu %80','Mor tatli patates','Ikigai (amac)','Siki sosyal grup']},
  {bolge:'Ikaria, Yunanistan', yas:90,flag:'GR',renk:'#1d63ed',sirlar:['Akdeniz diyeti','Ogle uykusu','Zeytinyagi + bakliyat','Aktif topluluk']},
  {bolge:'Nicoya, Kosta Rika', yas:89,flag:'CR',renk:'#10b981',sirlar:['Misir, fasulye','Plan de vida','Aile odakli yasam','Fiziksel aktivite']},
  {bolge:'Loma Linda, ABD',    yas:89,flag:'US',renk:'#8B5CF6',sirlar:['Tam bitki diyeti','Cumartesi istirahat','Topluluk baglari','Sigara/alkol yok']},
];
function BlueZone() {
  const [aktif, setAktif] = useState(0);
  const bz = BLUE_ZONES[aktif];
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:20}}>🌍</span>
        <span className="text-sm font-semibold">Blue Zones — Uzun Omur Arastirmasi</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {BLUE_ZONES.map((b,i)=>(
          <button key={i} onClick={()=>setAktif(i)}
            className="text-xs px-2 py-1 rounded-lg"
            style={{background:aktif===i?b.renk:`${b.renk}20`,color:aktif===i?'#fff':b.renk,border:`1px solid ${b.renk}40`,cursor:'pointer'}}>
            {b.bolge.split(',')[0]}
          </button>
        ))}
      </div>
      <div className="p-3 rounded-xl mb-3" style={{background:'hsl(222 47% 5%)',border:`2px solid ${bz.renk}30`}}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold" style={{color:bz.renk}}>{bz.bolge}</span>
          <div className="text-right">
            <div className="text-2xl font-bold font-mono" style={{color:bz.renk}}>{bz.yas}+</div>
            <div className="text-xs text-muted-foreground">yas ort.</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {bz.sirlar.map((si,k)=>(
            <div key={k} className="text-xs text-muted-foreground flex gap-1">
              <span style={{color:bz.renk}}>✦</span>{si}
            </div>
          ))}
        </div>
      </div>
      <div className="text-xs font-bold text-emerald-400 mb-1">Tum Blue Zone'larda Ortak:</div>
      <div className="grid grid-cols-2 gap-1">
        {['Gercek gida, az islenmiş','Aktif sosyal hayat','Yasam amaci (ikigai)','Fiziksel aktivite','Az kalori, az et','Dusuk stres'].map((o,k)=>(
          <div key={k} className="text-xs text-muted-foreground">→ {o}</div>
        ))}
      </div>
    </div>
  );
}

/* -- 5. Anti-inflamatuar Gidalar -- */
const ANTI_INF = [
  {isim:'Zerdeçal + Karabiber',puan:10,renk:'#F7931A',bilim:'Curcumin + piperine biyoyararlanim x20, IL-6 inhibisyonu'},
  {isim:'Yagli Balik (Omega-3)',puan:10,renk:'#3B82F6',bilim:'EPA/DHA, prostanoid donusumu, kardiyovaskuler koruma'},
  {isim:'Yesil Cay (EGCG)',     puan:9, renk:'#10b981',bilim:'COX-2 inhibisyonu, NF-kB baskılama, antioksidan'},
  {isim:'Zeytinyagi (Extra V)', puan:9, renk:'#84CC16',bilim:'Oleokantal — ibuprofen benzeri etki, Akdeniz diyeti temeli'},
  {isim:'Kara Uryemisleri',     puan:8, renk:'#8B5CF6',bilim:'Antosiyain, resveratrol — yaban mersini, boğurtlen'},
  {isim:'Brokoli Filizleri',    puan:8, renk:'#06B6D4',bilim:'Sulforafan → Nrf2 aktivasyonu, 3-5 gunluk filizler en guclu'},
];
function AntiInflamatuar() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:20}}>🔬</span>
        <span className="text-sm font-semibold">Anti-inflamatuar Super Gidalar</span>
        <span className="text-xs text-muted-foreground ml-auto">Etki gucu 1-10</span>
      </div>
      {ANTI_INF.map((g,i)=>(
        <div key={i} className="p-2.5 rounded-xl mb-2" style={{background:'hsl(222 47% 5%)',border:`1px solid ${g.renk}20`}}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold" style={{color:g.renk}}>{g.isim}</span>
            <div className="flex gap-0.5">
              {[...Array(g.puan)].map((_,k)=><div key={k} style={{width:6,height:6,borderRadius:'50%',background:g.renk}}/>)}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{g.bilim}</div>
        </div>
      ))}
    </div>
  );
}

/* -- 6. Egzersiz -- */
const EGZERSIZ = [
  {tip:'Kuvvet Antrenam.',icon:'💪',renk:'#EF4444',hafta:'2-3x',sure:'45-60 dk',faydalar:'Kemik +, metabolizma +, testosteron +, insulin duyarlilik +'},
  {tip:'Kardiyo',         icon:'🏃',renk:'#F7931A',hafta:'3-5x',sure:'30-45 dk',faydalar:'Kalp sagligi, VO2 max +, ruh hali +, kilo kontrol'},
  {tip:'HIIT',            icon:'⚡',renk:'#10b981',hafta:'2x',  sure:'20 dk',   faydalar:'EPOC etkisi, mitokondri +, insulin ++ , zaman tasarruf'},
  {tip:'Yuruyus (7K)',    icon:'🚶',renk:'#3B82F6',hafta:'Her gun',sure:'50 dk',faydalar:'Alzheimer riski -, eklem sagligi, stres azaltma, longevity'},
  {tip:'Esneklik/Yoga',   icon:'🧘',renk:'#8B5CF6',hafta:'2-3x',sure:'30 dk',  faydalar:'Kortizol -, parasempatik +, yaralanma onleme, denge'},
];
function EgzersizSaglik() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:20}}>🏋️</span>
        <span className="text-sm font-semibold">Egzersiz Turleri & Kanitlanmis Faydalar</span>
      </div>
      {EGZERSIZ.map((e,i)=>(
        <div key={i} className="p-2.5 rounded-xl mb-2" style={{background:'hsl(222 47% 5%)',border:`1px solid ${e.renk}20`}}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span style={{fontSize:18}}>{e.icon}</span>
              <span className="text-xs font-bold" style={{color:e.renk}}>{e.tip}</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{e.hafta} · {e.sure}</span>
          </div>
          <div className="text-xs text-muted-foreground">{e.faydalar}</div>
        </div>
      ))}
      <div className="p-2 rounded-lg mt-1" style={{background:'hsl(222 47% 5%)',fontSize:10}}>
        WHO oneri: Haftada 150dk orta veya 75dk yogun kardiyo + 2x kuvvet antrenam.
      </div>
    </div>
  );
}

/* -- 7. Stres & Adaptojenler -- */
const ADAPTOJENLER = [
  {isim:'Ashwagandha (KSM-66)',renk:'#F7931A',etki:'Kortizol -%27, anksiyete -%56',doz:'300-600 mg'},
  {isim:'Rhodiola Rosea',      renk:'#EC4899',etki:'Yorgunluk -%41, bilissel +',    doz:'200-400 mg'},
  {isim:"Lion's Mane",         renk:'#84CC16',etki:'NGF sentezi, bellek, odak +',   doz:'500-1000 mg'},
  {isim:'Reishi (Ganoderma)',  renk:'#8B5CF6',etki:'Bagisiklik mod., uyku +',       doz:'1-2 g'},
  {isim:'L-Theanin + Kafein',  renk:'#06B6D4',etki:'Alfa beyin dalgasi +, odak ++', doz:'200mg + 100mg'},
];
function StresAdaptojenler() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:20}}>🧠</span>
        <span className="text-sm font-semibold">Stres Yonetimi & Adaptojen Bitkiler</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded-xl" style={{background:'hsl(222 47% 5%)',border:'1px solid #ef444430'}}>
          <div className="text-xs font-bold text-red-400 mb-1">Kronik Stres Belirtileri</div>
          {['Bas agrisi','Sindirim sorunu','Uyku bozuklugu','Sinirlilik','Bagisiklik zayiflamasi','Yuksek kan basinci'].map(b=>(
            <div key={b} className="text-xs text-muted-foreground">• {b}</div>
          ))}
        </div>
        <div className="p-2 rounded-xl" style={{background:'hsl(222 47% 5%)',border:'1px solid #10b98130'}}>
          <div className="text-xs font-bold text-emerald-400 mb-1">Anlik Stres Azaltma</div>
          {['4-7-8 nefes tekni','5 dk meditasyon','Soguk su yuze','Gunesе cik','Sukran gunlugu','Sosyal baglanti'].map(b=>(
            <div key={b} className="text-xs text-muted-foreground">• {b}</div>
          ))}
        </div>
      </div>
      {ADAPTOJENLER.map((a,i)=>(
        <div key={i} className="flex items-center gap-2 p-2 rounded-lg mb-1.5" style={{background:'hsl(222 47% 5%)'}}>
          <div style={{width:3,height:36,background:a.renk,borderRadius:2,flexShrink:0}}/>
          <div className="flex-1">
            <div className="text-xs font-bold" style={{color:a.renk}}>{a.isim}</div>
            <div className="text-xs text-muted-foreground">{a.etki}</div>
          </div>
          <div className="text-xs font-mono text-muted-foreground shrink-0">{a.doz}</div>
        </div>
      ))}
    </div>
  );
}

/* -- 8. Bilimsel Takviyeler -- */
const TAKVIYELER = [
  {isim:'Kreatin Monohidrat',kat:'Performans', kanit:5,renk:'#EF4444',doz:'3-5 g/gun',   fayda:'Guc +, kas +, bilissel +, %100 guvenli'},
  {isim:'Omega-3 (EPA/DHA)', kat:'Kalp/Beyin',kanit:5,renk:'#3B82F6',doz:'1-3 g/gun',   fayda:'Kardiovaskuler risk -, trigliserit -, beyin sagligi +'},
  {isim:'Mg L-Treonat',      kat:'Uyku/Beyin',kanit:4,renk:'#8B5CF6',doz:'300-400 mg',  fayda:'Beyin geciskenl., uyku kalitesi, anksiyete -'},
  {isim:'NMN / NR (NAD+)',  kat:'Yaslanma',   kanit:3,renk:'#F7931A',doz:'250-500 mg',  fayda:'Mitokondri enerjisi, sirtuin aktivasyonu'},
  {isim:'Berberin',          kat:'Metabolizma',kanit:4,renk:'#10b981',doz:'500 mg x3',   fayda:'Kan sekeri -, LDL -, AMPK aktivasyonu'},
  {isim:'Vitamin K2 (MK-7)',kat:'Kemik/Kalp', kanit:4,renk:'#84CC16',doz:'100-200 mcg', fayda:'Kalsiyumu damardan kemige yonlendirir'},
];
function KanitliTakviyeler() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:20}}>💉</span>
        <span className="text-sm font-semibold">Bilimsel Kanita Dayali Takviyeler</span>
      </div>
      {TAKVIYELER.map((t,i)=>(
        <div key={i} className="p-2.5 rounded-xl mb-2" style={{background:'hsl(222 47% 5%)',border:`1px solid ${t.renk}20`}}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{color:t.renk}}>{t.isim}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{background:`${t.renk}20`,color:t.renk,fontSize:9}}>{t.kat}</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_,k)=><div key={k} style={{width:5,height:5,borderRadius:'50%',background:k<t.kanit?t.renk:'hsl(222 47% 15%)'}}/>)}
              <span className="text-xs text-muted-foreground font-mono ml-1">{t.doz}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{t.fayda}</div>
        </div>
      ))}
      <div className="text-xs text-muted-foreground" style={{fontSize:10}}>Takviye almadan once saglik profesyonelinize danisın.</div>
    </div>
  );
}

/* -- 9. Hidrasyon -- */
const ELEKTROLITLER = [
  {isim:'Sodyum',   renk:'#F7931A',rol:'Sivi dengesi, sinir iletimi',   kaynak:'Deniz tuzu, tursu, zeytin',    gunluk:'1500-2300 mg'},
  {isim:'Potasyum', renk:'#10b981',rol:'Kalp ritmi, kaslar, kan basinci',kaynak:'Muz, avokado, patates',        gunluk:'2600-3400 mg'},
  {isim:'Magnezyum',renk:'#8B5CF6',rol:'300+ enzim, kas relaksasyon',   kaynak:'Kabak cek., badem, ispanak',   gunluk:'310-420 mg'},
  {isim:'Kalsiyum', renk:'#3B82F6',rol:'Kemik, dis, kas kasılma',       kaynak:'Sut, peynir, brokoli, badem',  gunluk:'1000-1200 mg'},
];
function HidrasyonElektrolit() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:20}}>💧</span>
        <span className="text-sm font-semibold">Hidrasyon & Elektrolit Dengesi</span>
      </div>
      <div className="text-xs font-semibold text-muted-foreground mb-2">Gunluk Su Ihtiyaci (Vucud Agirligina Gore)</div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[{k:'50 kg',l:'1.5-2L'},{k:'65 kg',l:'2-2.5L'},{k:'80 kg',l:'2.5-3L'},{k:'100 kg',l:'3-3.5L'}].map(s=>(
          <div key={s.k} className="p-2 rounded-xl text-center" style={{background:'hsl(222 47% 5%)',border:'1px solid #06B6D420'}}>
            <div className="text-sm font-bold font-mono" style={{color:'#06B6D4'}}>{s.l}</div>
            <div className="text-xs text-muted-foreground">{s.k}</div>
          </div>
        ))}
      </div>
      {ELEKTROLITLER.map((e,i)=>(
        <div key={i} className="p-2 rounded-xl mb-1.5" style={{background:'hsl(222 47% 5%)',border:`1px solid ${e.renk}20`}}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold" style={{color:e.renk}}>{e.isim}</span>
            <span className="text-xs font-mono text-muted-foreground">{e.gunluk}</span>
          </div>
          <div className="text-xs text-muted-foreground">{e.rol} — {e.kaynak}</div>
        </div>
      ))}
    </div>
  );
}

/* -- 10. Biyomarkerlar -- */
const BIYOMARKERLAR = [
  {isim:'Aclik Kan Sekeri',  birim:'mg/dL',normal:'70-99', iyi:'<85',  alert:'>125 = diyabet',       renk:'#10b981'},
  {isim:'HbA1c',             birim:'%',    normal:'<5.7',  iyi:'<5.3', alert:'>6.5 = diyabet',        renk:'#F7931A'},
  {isim:'LDL Kolesterol',    birim:'mg/dL',normal:'<130',  iyi:'<70',  alert:'>160 = yuksek risk',    renk:'#EF4444'},
  {isim:'HDL Kolesterol',    birim:'mg/dL',normal:'>40',   iyi:'>60',  alert:'<40 = dusuk (kotu)',    renk:'#10b981'},
  {isim:'Trigliserit',       birim:'mg/dL',normal:'<150',  iyi:'<100', alert:'>200 = yuksek',         renk:'#F7931A'},
  {isim:'Vitamin D (25-OH)', birim:'ng/mL',normal:'30-50', iyi:'50-80',alert:'<20 = ciddi eksiklik',  renk:'#F7931A'},
  {isim:'hsCRP (Inflamasyon)',birim:'mg/L', normal:'<1.0',  iyi:'<0.5', alert:'>3.0 = yuksek risk',   renk:'#EF4444'},
  {isim:'Ferritin',          birim:'ng/mL',normal:'12-300',iyi:'50-150',alert:'<12 = demir eksikligi',renk:'#8B5CF6'},
];
function Biyomarkerlar() {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <span style={{fontSize:20}}>🩸</span>
        <span className="text-sm font-semibold">Onemli Biyomarkerlar & Hedef Araliklar</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">Yilda 1-2x kan tahlilinde takip edilmesi onerilen kritik degerler</div>
      {BIYOMARKERLAR.map((b,i)=>(
        <div key={i} className="flex items-center gap-2 py-1.5" style={{borderBottom:'1px solid rgba(255,255,255,.04)'}}>
          <div style={{width:3,height:32,background:b.renk,borderRadius:2,flexShrink:0}}/>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold">{b.isim}</div>
            <div className="text-xs text-muted-foreground" style={{fontSize:9}}>Dikkat: {b.alert}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-bold font-mono" style={{color:b.renk}}>Optimal: {b.iyi} {b.birim}</div>
            <div className="text-xs text-muted-foreground" style={{fontSize:9}}>Normal: {b.normal}</div>
          </div>
        </div>
      ))}
      <div className="mt-2 p-2 rounded-lg" style={{background:'hsl(222 47% 5%)',fontSize:10}}>
        Normal araliklar ortalamaya gore belirlenir. Optimal saglik icin daha dar araliklar hedefleyin.
      </div>
    </div>
  );
}

/* -- Wrapper -- */
function SaglikModulleri() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16, marginBottom:24}}>
      <VitaminRehberi />
      <BagisiklikGuclendirici />
      <UykuBilimi />
      <BlueZone />
      <AntiInflamatuar />
      <EgzersizSaglik />
      <StresAdaptojenler />
      <KanitliTakviyeler />
      <HidrasyonElektrolit />
      <Biyomarkerlar />
    </div>
  );
}

/* ── Resim ────────────────────────────────────────────────────────── */
const KW = [
  'medical,doctor,hospital',    'science,research,laboratory', 'fitness,running,exercise',
  'nutrition,food,vegetables',  'mental,wellness,meditation',  'aging,longevity,senior',
  'heart,cardiology,pulse',     'brain,neurology,cognitive',   'medicine,pharmacy,capsules',
  'clinic,surgery,treatment',   'yoga,zen,mindfulness',        'cancer,research,oncology',
  'sleep,rest,recovery',        'biotech,genome,DNA',          'family,children,healthy',
  'sport,athletic,performance', 'water,nature,purity',         'vitamins,minerals,health',
  'biology,microscope,cells',   'immunity,vaccine,science',
];

function img(item: NewsItem) {
  if (item.image) return item.image;
  let h = 5381;
  for (const c of item.id + item.title) h = ((h << 5) + h + c.charCodeAt(0)) & 0x7fffffff;
  const a = Math.abs(h);
  return `https://loremflickr.com/800/500/${KW[a % KW.length]}?lock=${a % 9999}`;
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

  const load = useCallback(async (force = false) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/news/healthgood?${force ? 'force=1&' : ''}_=${Date.now()}`, { cache: 'no-store' });
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
    const handler = (e: Event) => load((e as CustomEvent).detail?.force ?? false);
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
        <button onClick={() => load(true)} disabled={busy} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid #1a2535', background: 'transparent', color: '#4a6080', cursor: 'pointer' }}>
          <RefreshCw size={13} style={busy ? { animation: 'spin 1s linear infinite' } : {}} />
          Yenile
        </button>
      </div>

      {/* Sağlık Modülleri */}
      <SaglikModulleri />

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
          <button onClick={() => load(true)} style={{ marginTop: 10, color: '#10b981', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Tekrar dene</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {news.map((item, k) => <Card key={item.id} item={item} i={k} />)}
        </div>
      )}
    </div>
  );
}
