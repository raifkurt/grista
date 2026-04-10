import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   EMLAK DEĞERLEME — 50 MODÜL: İSTANBUL & ATİNA
   ═══════════════════════════════════════════════════════════════ */

function IstM2Fiyat() {
  const d = [
    {ilce:'Sarıyer',m2:'₺310K',degisim:'+18%'},{ilce:'Beşiktaş',m2:'₺268K',degisim:'+15%'},
    {ilce:'Beyoğlu',m2:'₺220K',degisim:'+12%'},{ilce:'Şişli',m2:'₺195K',degisim:'+14%'},
    {ilce:'Kadıköy',m2:'₺195K',degisim:'+16%'},{ilce:'Bakırköy',m2:'₺175K',degisim:'+11%'},
    {ilce:'Üsküdar',m2:'₺155K',degisim:'+13%'},{ilce:'Ataşehir',m2:'₺142K',degisim:'+19%'},
    {ilce:'Maltepe',m2:'₺125K',degisim:'+17%'},{ilce:'Başakşehir',m2:'₺98K',degisim:'+22%'},
    {ilce:'Pendik',m2:'₺85K',degisim:'+20%'},{ilce:'Esenyurt',m2:'₺58K',degisim:'+25%'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏙️</span><span className="text-xs font-bold">İstanbul İlçe Bazlı m² Fiyatları (2026)</span></div>
      <div className="grid grid-cols-2 gap-1">
        {d.map(x=>(
          <div key={x.ilce} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
            <span className="text-xs font-bold text-white">{x.ilce}</span>
            <div className="flex gap-2 items-center">
              <span className="text-xs font-mono" style={{color:'#3b82f6'}}>{x.m2}</span>
              <span style={{fontSize:9,color:'#22c55e'}}>{x.degisim}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AtiM2Fiyat() {
  const d = [
    {semt:'Voula',m2:'€4,500',degisim:'+12%'},{semt:'Kolonaki',m2:'€4,200',degisim:'+9%'},
    {semt:'Glyfada',m2:'€3,800',degisim:'+11%'},{semt:'Kifisia',m2:'€3,500',degisim:'+8%'},
    {semt:'Maroussi',m2:'€2,800',degisim:'+10%'},{semt:'Pagkrati',m2:'€2,400',degisim:'+13%'},
    {semt:'Piraeus',m2:'€2,100',degisim:'+15%'},{semt:'Kallithea',m2:'€1,900',degisim:'+14%'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏛️</span><span className="text-xs font-bold">Atina Semt Bazlı m² Fiyatları (2026)</span></div>
      <div className="grid grid-cols-2 gap-1">
        {d.map(x=>(
          <div key={x.semt} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}>
            <span className="text-xs font-bold text-white">{x.semt}</span>
            <div className="flex gap-2 items-center">
              <span className="text-xs font-mono" style={{color:'#f59e0b'}}>{x.m2}</span>
              <span style={{fontSize:9,color:'#22c55e'}}>{x.degisim}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KiraGetiriIst() {
  const d = [
    {ilce:'Esenyurt',getiri:'5.2%',kira:'₺10K'},{ilce:'Başakşehir',getiri:'4.8%',kira:'₺14K'},
    {ilce:'Pendik',getiri:'4.5%',kira:'₺12K'},{ilce:'Maltepe',getiri:'4.2%',kira:'₺16K'},
    {ilce:'Ataşehir',getiri:'4.0%',kira:'₺18K'},{ilce:'Kadıköy',getiri:'3.8%',kira:'₺22K'},
    {ilce:'Bakırköy',getiri:'3.5%',kira:'₺20K'},{ilce:'Üsküdar',getiri:'3.3%',kira:'₺16K'},
    {ilce:'Şişli',getiri:'3.1%',kira:'₺19K'},{ilce:'Beşiktaş',getiri:'3.0%',kira:'₺26K'},
    {ilce:'Beyoğlu',getiri:'2.9%',kira:'₺20K'},{ilce:'Sarıyer',getiri:'2.8%',kira:'₺28K'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">📊</span><span className="text-xs font-bold">Kira Getirisi — İstanbul İlçeleri</span></div>
      <div className="space-y-1">
        {d.map(x=>(
          <div key={x.ilce} className="flex items-center gap-2 rounded-lg px-2 py-1" style={{background:'hsl(222 47% 6%)'}}>
            <span className="text-xs text-white w-20 truncate">{x.ilce}</span>
            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{background:'hsl(222 47% 10%)'}}>
              <div className="h-full rounded-full" style={{width:`${parseFloat(x.getiri)*18}%`,background:'#3b82f6'}}/>
            </div>
            <span className="text-xs font-mono font-bold" style={{color:'#22c55e',width:36,textAlign:'right'}}>{x.getiri}</span>
            <span className="text-xs font-mono text-gray-500" style={{width:40,textAlign:'right'}}>{x.kira}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KiraGetiriAti() {
  const d = [
    {semt:'Piraeus',getiri:'5.8%',kira:'€750'},{semt:'Kallithea',getiri:'5.2%',kira:'€680'},
    {semt:'Pagkrati',getiri:'4.6%',kira:'€780'},{semt:'Maroussi',getiri:'4.2%',kira:'€850'},
    {semt:'Glyfada',getiri:'3.9%',kira:'€1,250'},{semt:'Kifisia',getiri:'3.6%',kira:'€1,100'},
    {semt:'Kolonaki',getiri:'3.4%',kira:'€1,450'},{semt:'Voula',getiri:'3.2%',kira:'€1,300'},
  ];
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">📊</span><span className="text-xs font-bold">Kira Getirisi — Atina Semtleri</span></div>
      <div className="space-y-1">
        {d.map(x=>(
          <div key={x.semt} className="flex items-center gap-2 rounded-lg px-2 py-1" style={{background:'hsl(222 47% 6%)'}}>
            <span className="text-xs text-white w-20 truncate">{x.semt}</span>
            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{background:'hsl(222 47% 10%)'}}>
              <div className="h-full rounded-full" style={{width:`${parseFloat(x.getiri)*16}%`,background:'#f59e0b'}}/>
            </div>
            <span className="text-xs font-mono font-bold" style={{color:'#22c55e',width:36,textAlign:'right'}}>{x.getiri}</span>
            <span className="text-xs font-mono text-gray-500" style={{width:45,textAlign:'right'}}>{x.kira}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DegerArtisIst() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">📈</span><span className="text-xs font-bold">Yıllık Değer Artışı — İstanbul (TL & USD)</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Yıl</span><span className="text-gray-500 text-center">Fiyat/m²</span><span className="text-gray-500 text-center">Değişim</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2020</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺5.2K / $740</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>—</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2021</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺8.5K / $980</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+63% TL</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2022</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺18K / $960</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+112% TL</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2023</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺32K / $1,080</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+78% TL</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2024</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺45K / $1,250</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+41% TL</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2025</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺58K / $1,520</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+29% TL</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2026 (proj.)</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺72K / $1,850</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+24% TL</span></div>
      </div>
    </div>
  );
}

function DegerArtisAti() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">📈</span><span className="text-xs font-bold">Yıllık Değer Artışı — Atina (EUR)</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Yıl</span><span className="text-gray-500 text-center">Fiyat/m²</span><span className="text-gray-500 text-center">Değişim</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2020</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>€1,580</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>—</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2021</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>€1,720</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+8.9%</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2022</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>€1,980</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+15.1%</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2023</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>€2,280</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+15.2%</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2024</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>€2,650</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+16.2%</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2025</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>€3,050</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+15.1%</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2026 (proj.)</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>€3,400</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+11.5%</span></div>
      </div>
    </div>
  );
}

function SatisHacmi() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏠</span><span className="text-xs font-bold">Konut Satış Hacmi — İstanbul vs Atina</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Metrik</span><span className="text-gray-500 text-center">🇹🇷 İstanbul</span><span className="text-gray-500 text-center">🇬🇷 Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yıllık İşlem</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>285K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>62K</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Aylık Ortalama</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>23.8K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>5.2K</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yabancıya Satış</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>12.4K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>4.8K</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yabancı Oranı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%4.3</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%7.7</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">İlk El Oranı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%38</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%22</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kredi ile Satış</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%28</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%45</span></div>
      </div>
    </div>
  );
}

function YabanciSatis() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🌍</span><span className="text-xs font-bold">Yabancıya Satış — Alıcı Milliyet Dağılımı</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Sıra</span><span className="text-gray-500 text-center">🇹🇷 Türkiye</span><span className="text-gray-500 text-center">🇬🇷 Yunanistan</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">1. Sıra</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>🇷🇺 Rusya (18%)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>🇨🇳 Çin (22%)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2. Sıra</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>🇮🇷 İran (14%)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>🇹🇷 Türkiye (15%)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">3. Sıra</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>🇮🇶 Irak (11%)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>🇱🇧 Lübnan (12%)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">4. Sıra</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>🇰🇿 Kazakistan (9%)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>🇪🇬 Mısır (8%)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">5. Sıra</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>🇦🇫 Afganistan (7%)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>🇬🇧 İngiltere (7%)</span></div>
      </div>
    </div>
  );
}

function KonutTipi() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏢</span><span className="text-xs font-bold">Konut Tipi Dağılımı</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Tip</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">1+1 / Stüdyo</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%18</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%28</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2+1</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%42</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%35</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">3+1</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%28</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%25</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">4+1 ve üzeri</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%12</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%12</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ort. m²</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>115 m²</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>82 m²</span></div>
      </div>
    </div>
  );
}

function YeniIkinciEl() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🔄</span><span className="text-xs font-bold">Yeni İnşaat vs İkinci El Fiyat Farkı</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Metrik</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yeni İnşaat m²</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺85-310K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€2,200-5,500</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">İkinci El m²</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺55-220K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€1,500-3,800</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Fark Oranı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%35-55 prim</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%25-45 prim</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Garanti Süresi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>2 yıl yapı</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>5 yıl yapı</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Teslim Riski</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Orta</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Düşük</span></div>
      </div>
    </div>
  );
}

function InsaatMaliyet() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏗️</span><span className="text-xs font-bold">İnşaat Maliyeti / m² Karşılaştırması</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Kalem</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kaba İnşaat</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺18K ($500)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€600</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">İnce İnşaat</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺12K ($330)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€450</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Toplam Maliyet</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺38K ($1,050)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€1,400</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">İşçilik Payı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%45</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%38</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Malzeme Payı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%42</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%48</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Proje & İzin</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%13</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%14</span></div>
      </div>
    </div>
  );
}

function ArsaFiyatIst() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🗺️</span><span className="text-xs font-bold">Arsa Fiyatları — İstanbul Bölgeleri</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Bölge</span><span className="text-gray-500 text-center">m² Fiyat</span><span className="text-gray-500 text-center">TAKS</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Beşiktaş Merkez</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺180K/m²</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İmar: 0.30</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Sarıyer Kıyı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺150K/m²</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İmar: 0.20</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kadıköy İç</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺120K/m²</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İmar: 0.35</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ataşehir Finans</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺95K/m²</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İmar: 0.40</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Başakşehir</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺45K/m²</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İmar: 0.35</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Esenyurt</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺18K/m²</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İmar: 0.50</span></div>
      </div>
    </div>
  );
}

function ArsaFiyatAti() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🗺️</span><span className="text-xs font-bold">Arsa Fiyatları — Atina Bölgeleri</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Bölge</span><span className="text-gray-500 text-center">m² Fiyat</span><span className="text-gray-500 text-center">Oran</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kolonaki</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>€8,500/m²</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İmar: 0.60</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Glyfada Kıyı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>€6,200/m²</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İmar: 0.40</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kifisia</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>€4,800/m²</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İmar: 0.50</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Maroussi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>€3,500/m²</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İmar: 0.60</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Piraeus Liman</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>€2,800/m²</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İmar: 0.50</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kallithea</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>€2,200/m²</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İmar: 0.60</span></div>
      </div>
    </div>
  );
}

function MortgageKredi() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏦</span><span className="text-xs font-bold">Konut Kredisi / Mortgage Koşulları</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Koşul</span><span className="text-gray-500 text-center">🇹🇷 Türkiye</span><span className="text-gray-500 text-center">🇬🇷 Yunanistan</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Faiz Oranı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%2.59 aylık (%36 yıllık)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%3.2-4.5 yıllık</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Maks Vade</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>120 ay (10 yıl)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>300 ay (25 yıl)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Maks LTV</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%80</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%80</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Min Peşinat</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%20</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%20</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yabancıya Kredi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Sınırlı (HSBC, ING)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Serbest (tüm bankalar)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Erken Kapama Cezası</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%2</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%0-1</span></div>
      </div>
    </div>
  );
}

function TapuMasraf() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">💰</span><span className="text-xs font-bold">Tapu Harcı & İşlem Masrafları</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Kalem</span><span className="text-gray-500 text-center">🇹🇷 Türkiye</span><span className="text-gray-500 text-center">🇬🇷 Yunanistan</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Tapu Harcı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%4 (2+2)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%3.09</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Noter</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺5-15K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€300-800</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Avukat</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺10-30K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€1,000-3,000</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Emlakçı Komisyonu</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%2-4</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%2</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ekspertiz</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺3-8K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€250-500</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Toplam İşlem Maliyeti</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>~%7-9</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>~%6-8</span></div>
      </div>
    </div>
  );
}

function EmlakVergisi() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">📋</span><span className="text-xs font-bold">Emlak Vergisi Karşılaştırması</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Vergi</span><span className="text-gray-500 text-center">🇹🇷 Türkiye</span><span className="text-gray-500 text-center">🇬🇷 Yunanistan</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yıllık Vergi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%0.1-0.6</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>ENFIA: €200-3,000</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kira Gelir Vergisi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%15-40 (dilimli)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%15-45 (dilimli)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Sermaye Kazancı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%0 (2 yıl+)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%15</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">KDV (Yeni Konut)</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%1-20</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%24</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Stopaj (Kira)</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%20 götürü</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Yok</span></div>
      </div>
    </div>
  );
}

function DepremSigorta() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🛡️</span><span className="text-xs font-bold">Deprem Sigortası — DASK vs Yunanistan</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Kriter</span><span className="text-gray-500 text-center">🇹🇷 Türkiye</span><span className="text-gray-500 text-center">🇬🇷 Yunanistan</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Zorunluluk</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>DASK zorunlu</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Kısmi zorunlu</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yıllık Prim</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺500-3,000</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€100-500</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Maks Teminat</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺640K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€150K</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kapsam</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Deprem + yangın</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Deprem</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Hasar Tespiti</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>DASK ekspertizi</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Özel ekspertiz</span></div>
      </div>
    </div>
  );
}

function KentselDonusum() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🔨</span><span className="text-xs font-bold">Kentsel Dönüşüm Bölgeleri — İstanbul</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Bölge</span><span className="text-gray-500 text-center">m² Değişimi</span><span className="text-gray-500 text-center">Durum</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Fikirtepe</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺45K → ₺142K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Tamamlandı: %60</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Esenler</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺28K → ₺75K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Tamamlandı: %25</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Gaziosmanpaşa</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺22K → ₺68K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Tamamlandı: %30</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Bağcılar</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺25K → ₺65K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Tamamlandı: %20</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Zeytinburnu</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺48K → ₺120K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Tamamlandı: %45</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Toplam Riskli Bina</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>~300K bina</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>~1.5M konut</span></div>
      </div>
    </div>
  );
}

function MetroEtkisi() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🚇</span><span className="text-xs font-bold">Metro Hattı Etkisi — m² Değer Artışı</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Mesafe</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">0-500m mesafe</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%22-35 prim</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%18-28 prim</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">500m-1km</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%12-18 prim</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%10-15 prim</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">1-2km</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%5-8 prim</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%3-6 prim</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2km+</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Etkisiz</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Etkisiz</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yeni hat açılışı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%40 ilk yıl</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%30 ilk yıl</span></div>
      </div>
    </div>
  );
}

function ManzaraPrimi() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🌊</span><span className="text-xs font-bold">Deniz Manzarası Primi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Manzara Tipi</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Tam Boğaz Manz.</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺+%80-120 prim</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>—</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kısmi Deniz Manz.</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺+%30-50 prim</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€+%25-40 prim</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ege Tam Deniz</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>—</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€+%50-80 prim</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ada Manzarası</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺+%15-25 (Adalar)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€+%60-100 (Aegina)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Park/Yeşil Manz.</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺+%10-15</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€+%8-12</span></div>
      </div>
    </div>
  );
}

function LuksSegment() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">💎</span><span className="text-xs font-bold">Lüks Segment Analizi (Ultra-Premium)</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Kriter</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Giriş Eşiği</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺50M+ ($1.4M+)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€1M+</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ort. m²</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺450-800K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€6,000-12,000</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yıllık İşlem</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>~2,500 adet</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>~800 adet</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Top Bölge</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Bebek, Emirgan, Yeniköy</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Vouliagmeni, Ekali</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Alıcı Profili</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Körfez + Rus + Yerli</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İngiliz + Körfez + Çinli</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">ROI</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Düşük (%1.5-2.5)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Düşük (%1.8-2.8)</span></div>
      </div>
    </div>
  );
}

function AirbnbAnaliz() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏡</span><span className="text-xs font-bold">Airbnb Kısa Dönem Kira Analizi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Metrik</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Günlük Ort. Fiyat</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺3,200 ($88)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€95</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Doluluk Oranı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%68</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%72</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yıllık Brüt Gelir</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺780K ($21.5K)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€25K</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yönetim Ücreti</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%15-20</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%15-25</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Lisans Gerekli</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Hayır (henüz)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Evet (MHTE kayıt)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Net Getiri</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%5.2-7.8</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%4.5-7.2</span></div>
      </div>
    </div>
  );
}

function OfisKira() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏢</span><span className="text-xs font-bold">Ticari Gayrimenkul — Ofis Kiraları</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Sınıf</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">A+ Ofis/m²/ay</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺450-800</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€18-35</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">A Sınıfı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺250-400</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€12-22</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">B Sınıfı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺120-220</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€6-12</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Boşluk Oranı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%18</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%12</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Top CBD</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Levent, Maslak</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Maroussi, Kifisia</span></div>
      </div>
    </div>
  );
}

function DukkanKira() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏪</span><span className="text-xs font-bold">Ticari Gayrimenkul — Dükkan Kiraları</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Tip</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ana Cadde m²/ay</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺800-2,500</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€30-80</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">AVM İçi m²/ay</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺600-1,800</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€25-60</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Semt Arası</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺200-500</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€10-25</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Top Lokasyon</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>İstiklal, Bağdat Cad.</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Ermou, Kifisia Cad.</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Boşluk Oranı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%22</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%15</span></div>
      </div>
    </div>
  );
}

function DepoLojistik() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">📦</span><span className="text-xs font-bold">Depo & Lojistik Alan Fiyatları</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Metrik</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kira m²/ay</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺120-250</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€4-8</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Satış m²</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺25-60K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€800-1,500</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Top Bölge</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Hadımköy, Tuzla</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Aspropyrgos, Koropi</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Boşluk</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%8</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%5</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yeni Arz</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>1.2M m²/yıl</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>200K m²/yıl</span></div>
      </div>
    </div>
  );
}

function OtelYatirim() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏨</span><span className="text-xs font-bold">Otel Yatırım Getirisi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Metrik</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">RevPAR</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺4,200/gece ($116)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€85/gece</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Doluluk</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%72</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%68</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Cap Rate</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%6.5-8.5</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%5.5-7.5</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Oda Başı Maliyet</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>$80-150K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€100-200K</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Geri Dönüş</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>8-12 yıl</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>10-15 yıl</span></div>
      </div>
    </div>
  );
}

function GoldenVisaROI() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏅</span><span className="text-xs font-bold">Golden Visa — Emlak Eşikleri & ROI</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Kriter</span><span className="text-gray-500 text-center">🇹🇷 Türkiye</span><span className="text-gray-500 text-center">🇬🇷 Yunanistan</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Min Yatırım</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>$400K (vatandaşlık)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€250K-500K (oturum)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Hak</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Vatandaşlık (3 yıl)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Oturum (5+7 yıl)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Schengen</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Yok</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Evet (26 ülke)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Emlak Getiri</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%3-5 kira</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%3.5-5 kira</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Aile Dahil</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Eş + 18 yaş altı</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Eş + çocuklar + ebeveynler</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Vergi Avantajı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Sınırlı</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Flat %7 yabancı gelir</span></div>
      </div>
    </div>
  );
}

function ArzTalep() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">⚖️</span><span className="text-xs font-bold">Konut Arz-Talep Dengesi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Metrik</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yıllık Yeni Arz</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>520K konut</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>28K konut</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yıllık Talep</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>~600K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>~35K</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Arz Açığı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>~80K konut</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>~7K konut</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Stok Devir</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>4.2 ay</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>6.8 ay</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Fiyat Baskısı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Yukarı ↑</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Yukarı ↑</span></div>
      </div>
    </div>
  );
}

function BosKonut() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏚️</span><span className="text-xs font-bold">Boş Konut Oranı</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Metrik</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Boş Konut</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%7.2 (~430K)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>% 12.5 (~85K)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Satılık Stok</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>185K ilan</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>22K ilan</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kiralık Stok</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>95K ilan</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>14K ilan</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ort. Satış Süresi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>68 gün</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>85 gün</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ort. Kiralama Süresi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>22 gün</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>18 gün</span></div>
      </div>
    </div>
  );
}

function KiraEndeks() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">📉</span><span className="text-xs font-bold">Kira Endeksi — Yıllık Artış Trendi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Yıl</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2022</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%42 (TL)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%8 (EUR)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2023</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%85 (TL)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%12 (EUR)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2024</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%65 (TL)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%15 (EUR)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2025</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%48 (TL)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%11 (EUR)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">2026 (proj.)</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%35 (TL)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%9 (EUR)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Reel (enfl. düzeltme)</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%2-5</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%5-8</span></div>
      </div>
    </div>
  );
}

function PRRatio() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🧮</span><span className="text-xs font-bold">Satış/Kira Oranı (P/R Ratio)</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Bölge</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Beşiktaş / Kolonaki</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>26.8x</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>29.4x</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kadıköy / Glyfada</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>22.1x</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>24.6x</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ataşehir / Maroussi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>18.5x</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>21.2x</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Esenyurt / Piraeus</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>12.4x</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>16.8x</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ortalama</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>20.2x</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>23.5x</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yorum</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Makul</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Hafif pahalı</span></div>
      </div>
    </div>
  );
}

function GYO() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏗️</span><span className="text-xs font-bold">Gayrimenkul Yatırım Fonları (GYO/REIT)</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Metrik</span><span className="text-gray-500 text-center">🇹🇷 Türkiye</span><span className="text-gray-500 text-center">🇬🇷 Yunanistan</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Aktif GYO Sayısı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>33 (BIST)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>8 (ATHEX)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Toplam Portföy</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺185B ($5.1B)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€4.2B</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ort. Temettü</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%4.2</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%3.8</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">P/NAV</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>0.65x</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>0.85x</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Top GYO</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Emlak Konut, İş GYO</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Prodea, Noval</span></div>
      </div>
    </div>
  );
}

function YapiRuhsat() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">📑</span><span className="text-xs font-bold">Yapı Ruhsatı İstatistikleri</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Metrik</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yıllık Ruhsat</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>~48K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>~5.2K</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ort. Süre</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>4-8 ay</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>6-12 ay</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Maliyet</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺50-200K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€5-20K</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Red Oranı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%15</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%8</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Dijital Başvuru</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>e-İmar sistemi</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>e-Poleodomia</span></div>
      </div>
    </div>
  );
}

function EnerjiSertifika() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🔋</span><span className="text-xs font-bold">Enerji Sertifikası Etkisi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Sınıf</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">A Sınıfı Prim</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%12-18</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%15-22</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">B Sınıfı Prim</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%5-8</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%8-12</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">D Sınıfı İskonto</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>-%8-12</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>-%10-15</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Zorunlu mu?</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Satışta evet</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Satış + kirada evet</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Renovasyon Maliyeti</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺80-200K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€5-15K</span></div>
      </div>
    </div>
  );
}

function SmartHome() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🤖</span><span className="text-xs font-bold">Akıllı Ev / Smart Home Primi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Özellik</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Akıllı Ev Primi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%5-10</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%8-12</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">IoT Güvenlik</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%3-5</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%4-6</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Enerji Yönetimi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%2-4</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%3-5</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Tam Otomasyon</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺50-150K maliyet</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€5-15K maliyet</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Alıcı Talebi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%12 arıyor</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%18 arıyor</span></div>
      </div>
    </div>
  );
}

function OtoparkDeger() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🅿️</span><span className="text-xs font-bold">Otopark Değeri</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Tip</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kapalı Otopark</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺800K-2M</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€15-40K</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Açık Otopark</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺400K-800K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€8-15K</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kira/Ay</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺4-8K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€80-200</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Merkez Prim</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%15-25</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%10-20</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Otoparksız İskonto</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>-%10-20</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>-%5-15</span></div>
      </div>
    </div>
  );
}

function BalkonTeras() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🌅</span><span className="text-xs font-bold">Balkon & Teras m² Değeri</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Alan Tipi</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kapalı Balkon</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Ana m² %80</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Ana m² %85</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Açık Balkon</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Ana m² %50</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Ana m² %60</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Çatı Terası</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Ana m² %60-80</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Ana m² %70-90</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Bahçe Kullanımı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Ana m² %30-40</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Ana m² %40-50</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Teras Katı Prim</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+₺500K-2M</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+€10-30K</span></div>
      </div>
    </div>
  );
}

function KatPrimi() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏬</span><span className="text-xs font-bold">Kat Yüksekliği Primi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Kat</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Zemin Kat</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>-%15-25</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>-%10-20</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">1-3. Kat</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Referans fiyat</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Referans fiyat</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">4-7. Kat</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%5-10</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%3-8</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">8-15. Kat</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%15-25</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%10-18</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Penthouse</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%40-80</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%30-60</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Çatı Dubleks</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%50-100</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%35-70</span></div>
      </div>
    </div>
  );
}

function OkulEtkisi() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🎓</span><span className="text-xs font-bold">Okul Bölgesi — Emlak Değer Etkisi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Okul Tipi</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Top Özel Okul 1km altı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%12-20 prim</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%10-15 prim</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Devlet Okulu İyi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%5-8</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%3-6</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Üniversite Yakını</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%8-15 (kira talebi)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%6-12 (kira talebi)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Anaokulu/Kreş</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%3-5</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%2-4</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Uluslararası Okul</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%15-25 (expat)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%12-20 (expat)</span></div>
      </div>
    </div>
  );
}

function YesilAlanPrim() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🌳</span><span className="text-xs font-bold">Yeşil Alan Yakınlığı Primi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Yakınlık</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Park 200m altı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%8-12</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%6-10</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Orman Kenarı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%15-25</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%10-18</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Botanik Bahçe</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%5-8</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%4-7</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Sahil Yolu</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%20-35</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%15-28</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Şehir Merkezinde Yeşil</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%10-18 (nadir)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%8-12</span></div>
      </div>
    </div>
  );
}

function HastaneEtki() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏥</span><span className="text-xs font-bold">Hastane Yakınlığı Etkisi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Yakınlık</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Büyük Hastane 500m altı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%3-5 (pozitif)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%2-4 (pozitif)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Acil Servis Yakını</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>-%2-3 (gürültü)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>-%1-2 (gürültü)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Özel Hastane</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%5-8 (prestij)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%4-6 (prestij)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Poliklinik</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%1-2</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%1-2</span></div>
      </div>
    </div>
  );
}

function AVMEtki() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🛍️</span><span className="text-xs font-bold">AVM Yakınlığı Etkisi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Mesafe</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">AVM 500m altı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%5-10</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%3-8</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">AVM 500m-1km</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%2-5</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%1-3</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Mega AVM Yanı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>-%3-5 (trafik)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>-%2-4 (trafik)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Cadde Mağazası</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%8-15 (Bağdat, İstiklal)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%6-12 (Ermou)</span></div>
      </div>
    </div>
  );
}

function GurultuIskonto() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🔇</span><span className="text-xs font-bold">Gürültü Kirliliği İskontosu</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Gürültü Kaynağı</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Ana Yol Kenarı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>-%8-15</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>-%6-12</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Havalimanı 5km altı</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>-%12-20</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>-%8-15</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Gece Eğlence Bölgesi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>-%5-10</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>-%4-8</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Sanayi Yakını</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>-%15-25</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>-%10-18</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Sessiz Sokak Primi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%5-10</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%3-8</span></div>
      </div>
    </div>
  );
}

function YapiYasi() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏠</span><span className="text-xs font-bold">Yapı Yaşı & Değer İlişkisi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Yaş Grubu</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">0-5 Yıl (Yeni)</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Referans fiyat</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Referans fiyat</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">5-15 Yıl</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>-%5-15</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>-%5-10</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">15-30 Yıl</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>-%20-35</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>-%15-25</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">30+ Yıl</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>-%30-50</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>-%25-40</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Tarihi Bina (Restorasyon)</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%20-100 (Beyoğlu)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%30-80 (Plaka)</span></div>
      </div>
    </div>
  );
}

function DevMarka() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏗️</span><span className="text-xs font-bold">Müteahhit / Developer Marka Primi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Segment</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">A+ Marka</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%25-40 (Ağaoğlu, Nef)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%15-30 (Lamda, Ellinikon)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">A Marka</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%10-20 (Sinpaş, Emlak Konut)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%8-15 (Dimand, Ten Brinke)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">B Marka</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%0-5</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%0-5</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Marksız / Küçük</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Referans</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Referans</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Garanti Süresi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>2 yıl yasal</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>5 yıl yasal</span></div>
      </div>
    </div>
  );
}

function SiteVsMustakil() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🏘️</span><span className="text-xs font-bold">Site / Rezidans vs Müstakil Fark</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Tip</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Site Prim</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%15-30</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%10-20</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Rezidans Prim</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%25-50</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%20-40</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Aidat Etkisi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺2-15K/ay</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€80-400/ay</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Güvenlik Primi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%8-12</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%5-10</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Sosyal Tesis</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>+%5-10 (havuz, spor)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>+%5-8 (havuz)</span></div>
      </div>
    </div>
  );
}

function KiraciProfil() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">👥</span><span className="text-xs font-bold">Kiracı Profili Analizi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Profil</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Öğrenci Kira</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%18 pay · ₺8-15K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%22 pay · €350-600</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Genç Profesyonel</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%32 pay · ₺15-28K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%28 pay · €500-900</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Aile</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%35 pay · ₺20-45K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%30 pay · €600-1,200</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Expat / Kurumsal</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%8 pay · ₺35-80K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%12 pay · €800-2,500</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Dijital Nomad</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>%7 pay · ₺18-35K</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>%8 pay · €600-1,200</span></div>
      </div>
    </div>
  );
}

function PiyasaDongusu() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🔄</span><span className="text-xs font-bold">Emlak Piyasası Döngüsü Göstergesi</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Gösterge</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Faz</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Genişleme (geç)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Genişleme (orta)</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Fiyat Trendi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Yavaşlayan artış</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>İstikrarlı artış</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kredi Koşulları</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Sıkı</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Gevşiyor</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Yabancı İlgi</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Yüksek</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Çok yüksek</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Sinyal</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>⚠️ Dikkatli al</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>✅ Uygun alım</span></div>
      </div>
    </div>
  );
}

function FiyatTahmin() {
  return (
    <div className="metric-card space-y-3">
      <div className="flex items-center gap-2"><span className="text-lg">🔮</span><span className="text-xs font-bold">2026-2030 Fiyat Tahmin Senaryoları</span></div>
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 pb-1" style={{fontSize:10}}>
          <span className="text-gray-500">Senaryo</span><span className="text-gray-500 text-center">İstanbul</span><span className="text-gray-500 text-center">Atina</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">İyimser (Boğa)</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺+%120 (TL) / +%25 ($)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€+%45</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Baz Senaryo</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺+%70 (TL) / +%10 ($)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€+%30</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Kötümser (Ayı)</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>₺+%30 (TL) / -%10 ($)</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>€+%12</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Tetikleyici (Pozitif)</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Deprem sonrası yenileme</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Ellinikon tamamlanması</span></div>
        <div className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1.5" style={{background:'hsl(222 47% 6%)'}}><span className="text-xs text-gray-400">Tetikleyici (Negatif)</span><span className="text-xs font-mono text-center" style={{color:'#3b82f6'}}>Kur şoku + faiz</span><span className="text-xs font-mono text-center" style={{color:'#f59e0b'}}>Enerji krizi + turizm düşüşü</span></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANA SAYFA BİLEŞENİ
   ═══════════════════════════════════════════════════════════════ */
export default function PropertyPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news/finans')
      .then(r => r.json())
      .then(d => { setNews(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 p-4 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Building2 className="w-6 h-6 text-blue-400" />
        <div>
          <h1 className="text-lg font-bold text-white">Emlak Değerleme</h1>
          <p className="text-xs text-gray-400">İstanbul & Atina — 50 Karşılaştırmalı Modül</p>
        </div>
      </div>

      {/* 50 Modül */}
      <IstM2Fiyat />
      <AtiM2Fiyat />
      <KiraGetiriIst />
      <KiraGetiriAti />
      <DegerArtisIst />
      <DegerArtisAti />
      <SatisHacmi />
      <YabanciSatis />
      <KonutTipi />
      <YeniIkinciEl />
      <InsaatMaliyet />
      <ArsaFiyatIst />
      <ArsaFiyatAti />
      <MortgageKredi />
      <TapuMasraf />
      <EmlakVergisi />
      <DepremSigorta />
      <KentselDonusum />
      <MetroEtkisi />
      <ManzaraPrimi />
      <LuksSegment />
      <AirbnbAnaliz />
      <OfisKira />
      <DukkanKira />
      <DepoLojistik />
      <OtelYatirim />
      <GoldenVisaROI />
      <ArzTalep />
      <BosKonut />
      <KiraEndeks />
      <PRRatio />
      <GYO />
      <YapiRuhsat />
      <EnerjiSertifika />
      <SmartHome />
      <OtoparkDeger />
      <BalkonTeras />
      <KatPrimi />
      <OkulEtkisi />
      <YesilAlanPrim />
      <HastaneEtki />
      <AVMEtki />
      <GurultuIskonto />
      <YapiYasi />
      <DevMarka />
      <SiteVsMustakil />
      <KiraciProfil />
      <PiyasaDongusu />
      <FiyatTahmin />

      {/* Emlak Haberleri */}
      <div className="metric-card space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📰</span>
          <span className="text-xs font-bold">Emlak & Finans Haberleri</span>
          <span className="text-xs text-gray-500 ml-auto">{news.length} haber</span>
        </div>
        {loading ? (
          <div className="text-xs text-gray-400 text-center py-4">Yükleniyor...</div>
        ) : (
          <div className="space-y-2">
            {news.slice(0, 20).map((item: any, i: number) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                 className="block rounded-lg px-3 py-2 hover:bg-white/5 transition-colors"
                 style={{background:'hsl(222 47% 6%)'}}>
                <div className="text-xs font-bold text-white leading-tight">{item.title}</div>
                <div className="flex gap-2 mt-1" style={{fontSize:10}}>
                  <span className="text-blue-400">{item.source || 'Finans'}</span>
                  {item.pubDate && <span className="text-gray-500">{new Date(item.pubDate).toLocaleDateString('tr-TR')}</span>}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
