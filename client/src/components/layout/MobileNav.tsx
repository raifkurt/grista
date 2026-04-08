import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  LayoutDashboard, TrendingUp, Building2, DollarSign,
  Heart, Megaphone, Bot, MoreHorizontal, Activity, Radio, MapPin,
} from 'lucide-react';

const PRIMARY = [
  { href: '/',       icon: LayoutDashboard, label: 'Panel' },
  { href: '/live',   icon: Radio,           label: 'Canlı' },
  { href: '/cities', icon: MapPin,          label: 'Şehirler' },
  { href: '/financial', icon: DollarSign,   label: 'Finans' },
];

const MORE = [
  { href: '/market',    icon: TrendingUp,  label: 'Piyasa İstihbaratı' },
  { href: '/property',  icon: Building2,   label: 'Emlak Değerleme' },
  { href: '/wellness',  icon: Heart,       label: 'Sağlık & Wellness' },
  { href: '/marketing', icon: Megaphone,   label: 'Pazarlama' },
  { href: '/agents',    icon: Bot,         label: 'Ajan Sistemi' },
];

export default function MobileNav() {
  const [location, navigate] = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = MORE.some(t => t.href === location);

  const go = (href: string) => {
    navigate(href);
    setShowMore(false);
  };

  return (
    <>
      {/* Backdrop */}
      {showMore && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More popup */}
      {showMore && (
        <div className="mobile-more-popup">
          <div
            className="text-xs font-mono mb-2 px-4 pt-2 pb-1 flex items-center gap-2"
            style={{ color: 'hsl(215 20% 45%)' }}
          >
            <Activity size={11} />
            DİĞER MODÜLLER
          </div>
          {MORE.map(({ href, icon: Icon, label }) => (
            <button
              key={href}
              className={`mobile-more-item ${location === href ? 'active' : ''}`}
              onClick={() => go(href)}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Bottom nav */}
      <nav className="mobile-nav">
        {PRIMARY.map(({ href, icon: Icon, label }) => {
          const active = location === href;
          return (
            <button
              key={href}
              className={`mobile-nav-btn ${active ? 'active' : ''}`}
              onClick={() => go(href)}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="mobile-nav-label">{label}</span>
            </button>
          );
        })}

        {/* More */}
        <button
          className={`mobile-nav-btn ${isMoreActive || showMore ? 'active' : ''}`}
          onClick={() => setShowMore(s => !s)}
        >
          <MoreHorizontal size={20} strokeWidth={isMoreActive || showMore ? 2.5 : 1.8} />
          <span className="mobile-nav-label">Daha</span>
        </button>
      </nav>
    </>
  );
}
