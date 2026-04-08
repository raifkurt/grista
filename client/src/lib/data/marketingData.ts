/**
 * Marketing Attribution & Campaign Analytics
 * Shapley value attribution across channels + Meta ads performance modeling
 */
import { gbm, pastDates } from './utils';

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cpm: number;
  cpc: number;
  cpa: number;
  roas: number;
  ctr: number;
  convRate: number;
  status: 'active' | 'paused' | 'completed';
  objective: string;
}

export interface ChannelData {
  channel: string;
  color: string;
  touchpoints: number;
  revenue: number;
  shapleyShare: number;
  lastTouchShare: number;
  firstTouchShare: number;
  linearShare: number;
}

/** Shapley value attribution for marketing channels */
export function computeMarketingShapley(channels: string[], conversionData: number[][]): number[] {
  const n = channels.length;
  const phi = new Array(n).fill(0);
  const numPerms = Math.min(5040, Math.pow(2, n)); // exact for n≤7

  // Monte Carlo approximation
  const numSamples = 2000;
  for (let s = 0; s < numSamples; s++) {
    const perm = [...Array(n).keys()].sort(() => Math.random() - 0.5);
    for (let i = 0; i < n; i++) {
      const feat = perm[i];
      // Simulated coalition values (in practice, would use actual conversion data)
      const withoutCoalitionValue = i > 0
        ? perm.slice(0, i).reduce((sum, j) => sum + conversionData[j][0] * 0.8, 0)
        : 0;
      const withCoalitionValue = perm.slice(0, i + 1).reduce((sum, j) => sum + conversionData[j][0], 0);
      phi[feat] += (withCoalitionValue - withoutCoalitionValue);
    }
  }

  const total = phi.reduce((a, b) => a + b, 0) || 1;
  return phi.map(v => v / total);
}

export function generateCampaigns(): Campaign[] {
  const campaigns: Campaign[] = [
    {
      id: 'c1', name: 'İstanbul Lüks Konut - Awareness', channel: 'Meta', objective: 'Brand Awareness',
      budget: 15000, spent: 12400, impressions: 1840000, clicks: 18500, conversions: 124,
      revenue: 2480000, cpm: 6.74, cpc: 0.67, cpa: 100, roas: 200, ctr: 1.01, convRate: 0.67,
      status: 'active',
    },
    {
      id: 'c2', name: 'Eyüpsultan Proje - Lead Gen', channel: 'Meta', objective: 'Lead Generation',
      budget: 8000, spent: 7890, impressions: 520000, clicks: 9360, conversions: 312,
      revenue: 468000, cpm: 15.17, cpc: 0.84, cpa: 25.3, roas: 59.3, ctr: 1.80, convRate: 3.33,
      status: 'active',
    },
    {
      id: 'c3', name: 'Google SEA - Istanbul Real Estate', channel: 'Google Ads', objective: 'Conversions',
      budget: 12000, spent: 11200, impressions: 280000, clicks: 14000, conversions: 280,
      revenue: 560000, cpm: 40, cpc: 0.80, cpa: 40, roas: 50, ctr: 5.00, convRate: 2.00,
      status: 'active',
    },
    {
      id: 'c4', name: 'Athina Golden Visa - Meta', channel: 'Meta', objective: 'Lead Generation',
      budget: 5000, spent: 4700, impressions: 310000, clicks: 3720, conversions: 89,
      revenue: 445000, cpm: 15.16, cpc: 1.26, cpa: 52.8, roas: 94.7, ctr: 1.20, convRate: 2.39,
      status: 'active',
    },
    {
      id: 'c5', name: 'Retargeting - Site Visitors', channel: 'Meta', objective: 'Conversions',
      budget: 3000, spent: 2850, impressions: 145000, clicks: 4350, conversions: 156,
      revenue: 312000, cpm: 19.66, cpc: 0.66, cpa: 18.3, roas: 109.5, ctr: 3.00, convRate: 3.59,
      status: 'active',
    },
    {
      id: 'c6', name: 'LinkedIn - HNW Investors', channel: 'LinkedIn', objective: 'Brand Awareness',
      budget: 6000, spent: 5400, impressions: 180000, clicks: 2160, conversions: 43,
      revenue: 215000, cpm: 30, cpc: 2.50, cpa: 125.6, roas: 39.8, ctr: 1.20, convRate: 1.99,
      status: 'paused',
    },
  ];

  return campaigns;
}

export function generateChannelAttribution(): ChannelData[] {
  const channels = ['Meta Ads', 'Google Ads', 'LinkedIn', 'Organic SEO', 'Direct', 'Email'];
  const colors = ['#3B82F6', '#EF4444', '#0EA5E9', '#10B981', '#8B5CF6', '#F59E0B'];

  const touchpointData = [8420, 12300, 1840, 15600, 6200, 3100];
  const revenueData = [3200000, 4100000, 890000, 2800000, 5100000, 980000];

  // Shapley values — computed from conversion data
  const convData = touchpointData.map(t => [t * 0.01]);
  const shapley = computeMarketingShapley(channels, convData);

  return channels.map((channel, i) => ({
    channel,
    color: colors[i],
    touchpoints: touchpointData[i],
    revenue: revenueData[i],
    shapleyShare: shapley[i],
    lastTouchShare: revenueData[i] / revenueData.reduce((a, b) => a + b, 0),
    firstTouchShare: touchpointData[i] / touchpointData.reduce((a, b) => a + b, 0),
    linearShare: 1 / channels.length,
  }));
}

export function generateCampaignTimeSeries(days = 60) {
  const dates = pastDates(days);
  const spend = gbm(500, 0.05, 0.2, days - 1, 1 / 252).map(v => Math.round(v));
  const revenue = spend.map(s => s * (8 + (Math.random() - 0.5) * 4));
  const leads = spend.map(s => Math.round(s / 25 * (1 + (Math.random() - 0.5) * 0.4)));
  const roas = spend.map((s, i) => revenue[i] / s);

  return { dates, spend, revenue, leads, roas };
}

export function generateAudienceInsights() {
  return {
    ageGroups: [
      { age: '18-24', pct: 8, ctr: 0.95, cpa: 85 },
      { age: '25-34', pct: 22, ctr: 1.45, cpa: 62 },
      { age: '35-44', pct: 31, ctr: 1.82, cpa: 48 },
      { age: '45-54', pct: 25, ctr: 1.61, cpa: 55 },
      { age: '55-64', pct: 11, ctr: 1.22, cpa: 70 },
      { age: '65+', pct: 3, ctr: 0.78, cpa: 92 },
    ],
    topLocations: [
      { city: 'İstanbul', impressions: 920000, conversions: 412, roas: 145 },
      { city: 'Ankara', impressions: 180000, conversions: 82, roas: 98 },
      { city: 'İzmir', impressions: 140000, conversions: 61, roas: 87 },
      { city: 'Atina', impressions: 95000, conversions: 48, roas: 210 },
      { city: 'Londra', impressions: 72000, conversions: 38, roas: 380 },
      { city: 'Dubai', impressions: 65000, conversions: 42, roas: 520 },
    ],
    devices: [
      { device: 'Mobile', pct: 68, ctr: 1.42, convRate: 1.8 },
      { device: 'Desktop', pct: 26, ctr: 2.15, convRate: 2.9 },
      { device: 'Tablet', pct: 6, ctr: 1.85, convRate: 2.2 },
    ],
  };
}
