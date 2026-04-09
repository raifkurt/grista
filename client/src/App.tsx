import { useEffect, useRef, useState } from 'react';
import { Switch, Route, Router } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import TickerTape from './components/layout/TickerTape';
import MobileNav from './components/layout/MobileNav';
import DashboardPage from './pages/DashboardPage';
import MarketPage from './pages/MarketPage';
import PropertyPage from './pages/PropertyPage';
import FinancialPage from './pages/FinancialPage';
import WellnessPage from './pages/WellnessPage';
import MarketingPage from './pages/MarketingPage';
import AgentsPage from './pages/AgentsPage';
import LiveFeedPage from './pages/LiveFeedPage';
import CitiesPage from './pages/CitiesPage';
import HealthPage from './pages/HealthPage';

export default function App() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [ptrActive, setPtrActive] = useState(false);

  /* ── Pull-to-refresh gesture ─────────────────────────────────── */
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    let startY = -1;
    let lastY  = -1;

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop <= 2) {
        startY = e.touches[0].clientY;
        lastY  = startY;
      } else {
        startY = -1;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startY < 0) return;
      lastY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      if (startY < 0) return;
      const diff = lastY - startY;
      if (diff > 65) {
        window.dispatchEvent(new Event('ptr'));
        setPtrActive(true);
        setTimeout(() => setPtrActive(false), 1400);
      }
      startY = -1;
      lastY  = -1;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove',  onTouchMove,  { passive: true });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <div className="flex h-screen bg-background overflow-hidden scanline">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TickerTape />
            <TopBar />
            <main
              ref={mainRef as any}
              className="flex-1 overflow-auto grid-bg"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' } as any}
            >
              {/* Pull-to-refresh göstergesi */}
              {ptrActive && (
                <div style={{
                  position: 'sticky', top: 0, zIndex: 50,
                  display: 'flex', justifyContent: 'center',
                  padding: '5px 0',
                  background: 'linear-gradient(to bottom, rgba(16,185,129,.18), transparent)',
                  pointerEvents: 'none',
                }}>
                  <span style={{ fontSize: 11, color: '#10b981', fontFamily: 'monospace', letterSpacing: 1 }}>
                    ↻ yenileniyor…
                  </span>
                </div>
              )}

              <Switch>
                <Route path="/"          component={DashboardPage} />
                <Route path="/market"    component={MarketPage} />
                <Route path="/property"  component={PropertyPage} />
                <Route path="/financial" component={FinancialPage} />
                <Route path="/wellness"  component={WellnessPage} />
                <Route path="/marketing" component={MarketingPage} />
                <Route path="/agents"    component={AgentsPage} />
                <Route path="/live"      component={LiveFeedPage} />
                <Route path="/cities"    component={CitiesPage} />
                <Route path="/health"    component={HealthPage} />
              </Switch>
            </main>
          </div>
        </div>
        <MobileNav />
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}
