/**
 * Wellness & Supplement Data
 * Pharmacokinetic modeling (1-compartment) + fitness optimization
 */

export interface Supplement {
  name: string;
  category: string;
  halfLife: number;       // hours
  tMax: number;           // hours to peak concentration
  bioavailability: number; // 0-1
  dose: number;           // mg
  timing: 'morning' | 'pre-workout' | 'post-workout' | 'evening' | 'with-food';
  mechanism: string;
  evidence: 'strong' | 'moderate' | 'limited';
  interactions: string[];
  benefits: string[];
}

/** 1-compartment pharmacokinetic model — plasma concentration over time */
export function pkModel(dose: number, bioavailability: number, halfLife: number, tMax: number, hours: number): number[] {
  const Fmax = dose * bioavailability;
  const ke = Math.log(2) / halfLife;
  const ka = Math.log(2) / (tMax * 0.693); // absorption rate

  return Array.from({ length: hours * 4 + 1 }, (_, i) => {
    const t = i / 4; // 15-min intervals
    if (ka === ke) return Fmax * ke * t * Math.exp(-ke * t);
    return (Fmax * ka / (ka - ke)) * (Math.exp(-ke * t) - Math.exp(-ka * t));
  });
}

/** Interaction severity scoring */
export function computeInteractionMatrix(supplements: Supplement[]): {
  matrix: number[][];
  warnings: { a: string; b: string; severity: 'low' | 'medium' | 'high'; note: string }[];
} {
  const n = supplements.length;
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const warnings: { a: string; b: string; severity: 'low' | 'medium' | 'high'; note: string }[] = [];

  const knownInteractions: Record<string, { with: string; severity: 'low' | 'medium' | 'high'; note: string }[]> = {
    'Magnesium': [
      { with: 'Zinc', severity: 'medium', note: 'Compete for absorption — take at different times' },
      { with: 'Vitamin D3', severity: 'low', note: 'Vitamin D enhances magnesium absorption' },
    ],
    'Vitamin D3': [
      { with: 'Vitamin K2', severity: 'low', note: 'Synergistic — K2 directs calcium deposited by D3' },
      { with: 'Calcium', severity: 'low', note: 'D3 increases calcium absorption' },
    ],
    'Iron': [
      { with: 'Vitamin C', severity: 'low', note: 'Vitamin C enhances iron absorption' },
      { with: 'Calcium', severity: 'high', note: 'Calcium significantly inhibits iron absorption' },
      { with: 'Zinc', severity: 'medium', note: 'Compete for absorption' },
    ],
    'Caffeine': [
      { with: 'L-Theanine', severity: 'low', note: 'Synergistic — theanine smooths caffeine jitteriness' },
      { with: 'Creatine', severity: 'low', note: 'May slightly reduce creatine efficacy in some individuals' },
    ],
    'Omega-3': [
      { with: 'Vitamin E', severity: 'low', note: 'Vitamin E prevents fish oil oxidation' },
      { with: 'Blood thinners', severity: 'high', note: 'Additive anticoagulant effect — consult physician' },
    ],
  };

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const intA = knownInteractions[supplements[i].name] ?? [];
      const intB = knownInteractions[supplements[j].name] ?? [];

      const found = [...intA.filter(x => x.with === supplements[j].name),
                     ...intB.filter(x => x.with === supplements[i].name)];

      if (found.length > 0) {
        const sev = found[0].severity;
        const score = sev === 'high' ? 1 : sev === 'medium' ? 0.6 : 0.3;
        matrix[i][j] = matrix[j][i] = score;
        warnings.push({ a: supplements[i].name, b: supplements[j].name, severity: sev, note: found[0].note });
      }
    }
  }

  return { matrix, warnings };
}

export const SUPPLEMENT_DATABASE: Supplement[] = [
  {
    name: 'Creatine Monohydrate',
    category: 'Performance',
    halfLife: 3, tMax: 1, bioavailability: 0.99, dose: 5000,
    timing: 'post-workout',
    mechanism: 'Replenishes phosphocreatine stores for ATP synthesis',
    evidence: 'strong',
    interactions: [],
    benefits: ['Strength +10-15%', 'Lean mass gain', 'Cognitive function', 'Recovery'],
  },
  {
    name: 'Vitamin D3',
    category: 'Hormonal',
    halfLife: 720, tMax: 24, bioavailability: 0.85, dose: 5000,
    timing: 'morning',
    mechanism: 'Precursor to calcitriol; modulates gene expression across 200+ pathways',
    evidence: 'strong',
    interactions: ['Vitamin K2', 'Calcium', 'Magnesium'],
    benefits: ['Testosterone support', 'Immune function', 'Bone density', 'Mood'],
  },
  {
    name: 'Magnesium Glycinate',
    category: 'Recovery',
    halfLife: 24, tMax: 4, bioavailability: 0.80, dose: 400,
    timing: 'evening',
    mechanism: 'Cofactor for 300+ enzymatic reactions; NMDA receptor antagonism',
    evidence: 'strong',
    interactions: ['Zinc', 'Vitamin D3'],
    benefits: ['Sleep quality', 'Muscle relaxation', 'Cortisol reduction', 'Insulin sensitivity'],
  },
  {
    name: 'Omega-3 (EPA/DHA)',
    category: 'Hormonal',
    halfLife: 48, tMax: 5, bioavailability: 0.70, dose: 2000,
    timing: 'with-food',
    mechanism: 'Anti-inflammatory prostaglandin synthesis; membrane fluidity',
    evidence: 'strong',
    interactions: ['Vitamin E', 'Blood thinners'],
    benefits: ['Cardiovascular health', 'Anti-inflammatory', 'Cognition', 'Testosterone support'],
  },
  {
    name: 'Zinc Bisglycinate',
    category: 'Hormonal',
    halfLife: 48, tMax: 2, bioavailability: 0.75, dose: 30,
    timing: 'evening',
    mechanism: 'Cofactor for testosterone synthesis enzymes (3β-HSD, 17β-HSD)',
    evidence: 'strong',
    interactions: ['Magnesium', 'Iron', 'Copper'],
    benefits: ['Testosterone support', 'Immune function', 'Wound healing', 'Fertility'],
  },
  {
    name: 'Ashwagandha (KSM-66)',
    category: 'Adaptogen',
    halfLife: 8, tMax: 3, bioavailability: 0.72, dose: 600,
    timing: 'morning',
    mechanism: 'HPA axis modulation; cortisol reduction; GABA-ergic effects',
    evidence: 'moderate',
    interactions: [],
    benefits: ['Cortisol reduction', 'Testosterone +15%', 'Strength gains', 'Anxiety reduction'],
  },
  {
    name: 'Caffeine',
    category: 'Performance',
    halfLife: 5, tMax: 0.75, bioavailability: 0.99, dose: 200,
    timing: 'pre-workout',
    mechanism: 'Adenosine receptor antagonist; sympathomimetic effects',
    evidence: 'strong',
    interactions: ['L-Theanine', 'Creatine'],
    benefits: ['Endurance +2-5%', 'Strength +3-7%', 'Alertness', 'Fat oxidation'],
  },
  {
    name: 'L-Theanine',
    category: 'Cognitive',
    halfLife: 4, tMax: 1, bioavailability: 0.90, dose: 200,
    timing: 'pre-workout',
    mechanism: 'Promotes alpha brain waves; modulates GABA and glutamate',
    evidence: 'moderate',
    interactions: ['Caffeine'],
    benefits: ['Focus without anxiety', 'Sleep quality', 'Synergy with caffeine'],
  },
];

export function generateFitnessData(weeks = 16) {
  const labels: string[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    labels.push(`H${weeks - i}`);
  }

  // Progressive overload simulation
  const strength = Array.from({ length: weeks }, (_, i) => {
    const progress = 1 + i * 0.02;
    return Math.round(100 * progress * (1 + (Math.random() - 0.5) * 0.03));
  });

  const bodyWeight = Array.from({ length: weeks }, (_, i) => {
    return +(82 - i * 0.05 + (Math.random() - 0.5) * 0.4).toFixed(1);
  });

  const bodyFat = Array.from({ length: weeks }, (_, i) => {
    return +(18 - i * 0.08 + (Math.random() - 0.5) * 0.3).toFixed(1);
  });

  const vo2max = Array.from({ length: weeks }, (_, i) => {
    return +(42 + i * 0.15 + (Math.random() - 0.5) * 0.5).toFixed(1);
  });

  const sleepScore = Array.from({ length: weeks }, () => {
    return Math.round(65 + Math.random() * 25);
  });

  return { labels, strength, bodyWeight, bodyFat, vo2max, sleepScore };
}
