import { useLocation, Link } from 'wouter';
import {
  LayoutDashboard, TrendingUp, Building2, DollarSign,
  Heart, Megaphone, Bot, Activity, ChevronRight, Cpu, Radio, MapPin,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { orchestrator } from '@/lib/agents/orchestrator';

const NAV = [
  { href: '/',         icon: LayoutDashboard, label: 'Komuta Merkezi' },
  { href: '/live',     icon: Radio,           label: 'Canlı Akış', badge: 'CANLI' },
  { href: '/cities',   icon: MapPin,          label: 'İstanbul & Atina', badge: 'YENİ' },
  { href: '/market',   icon: TrendingUp,      label: 'Piyasa İstihbaratı' },
  { href: '/property', icon: Building2,        label: 'Emlak Değerleme' },
  { href: '/financial',icon: DollarSign,       label: 'Finansal Risk' },
  { href: '/wellness', icon: Heart,            label: 'Sağlık & Wellness' },
  { href: '/marketing',icon: Megaphone,        label: 'Pazarlama Analitik' },
  { href: '/agents',   icon: Bot,              label: 'Ajan Sistemi' },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [health, setHealth] = useState(97);

  useEffect(() => {
    const unsub = orchestrator.onStatusChange(() => {
      setHealth(orchestrator.systemHealthScore());
    });
    return unsub;
  }, []);

  return (
    <aside className="hidden md:flex w-60 flex-shrink-0 border-r border-border flex-col"
      style={{ background: 'hsl(222 47% 6%)' }}>
      {/* Logo */}
      <div className="h-12 flex items-center px-4 border-b border-border gap-2.5">
        <div className="relative">
          <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8"
              stroke="hsl(199 95% 55%)" strokeWidth="1.5" fill="hsl(199 95% 55% / 0.08)" />
            <circle cx="14" cy="14" r="4" fill="hsl(199 95% 55%)" />
            <line x1="14" y1="10" x2="14" y2="2" stroke="hsl(199 95% 55%)" strokeWidth="1" opacity="0.5" />
            <line x1="14" y1="18" x2="14" y2="26" stroke="hsl(199 95% 55%)" strokeWidth="1" opacity="0.5" />
          </svg>
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wider text-foreground">GRISTA</div>
          <div className="text-xs text-muted-foreground font-mono" style={{ fontSize: '9px' }}>
            INTELLIGENCE v1.0
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-auto">
        {NAV.map(({ href, icon: Icon, label, badge }: any) => {
          const active = location === href;
          return (
            <Link href={href} key={href}>
              <a className={`sidebar-link ${active ? 'active' : ''}`} data-testid={`nav-${label}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                {badge && !active && (
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '9px' }}>
                    {badge}
                  </span>
                )}
                {active && <ChevronRight className="w-3 h-3 opacity-60" />}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* System health */}
      <div className="border-t border-border p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Activity className="w-3 h-3" />
            <span>Sistem Sağlığı</span>
          </div>
          <span className="font-mono font-semibold" style={{ color: 'hsl(158 64% 52%)' }}>
            {health}%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${health}%`,
              background: 'linear-gradient(to right, hsl(158 64% 42%), hsl(199 95% 55%))',
            }}
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
          <Cpu className="w-3 h-3" />
          <span className="font-mono">5 Ajan · 7 Algoritma</span>
        </div>
      </div>
    </aside>
  );
}
