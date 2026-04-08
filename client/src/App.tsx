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
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <div className="flex h-screen bg-background overflow-hidden scanline">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TickerTape />
            <TopBar />
            <main className="flex-1 overflow-auto grid-bg" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' } as any}>
              <Switch>
                <Route path="/" component={DashboardPage} />
                <Route path="/market" component={MarketPage} />
                <Route path="/property" component={PropertyPage} />
                <Route path="/financial" component={FinancialPage} />
                <Route path="/wellness" component={WellnessPage} />
                <Route path="/marketing" component={MarketingPage} />
                <Route path="/agents" component={AgentsPage} />
                <Route path="/live" component={LiveFeedPage} />
                <Route path="/cities" component={CitiesPage} />
                <Route path="/health" component={HealthPage} />
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
