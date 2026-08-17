export type MetricRating = 'optimal' | 'good' | 'moderate' | 'warning' | 'critical' | 'neutral';

export interface MetricGrade {
  rating: MetricRating;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  percentileApprox: number; // 0 to 100
}

/**
 * Returns color grades, rating badges, and percentile rankings for all climate & urban indicators
 */
export const METRIC_GRADES = {
  // 1. PM2.5 Air Quality (WHO 2021 benchmarks)
  pm25(val: number): MetricGrade {
    if (val <= 5) {
      return { rating: 'optimal', label: 'Optimal (WHO)', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/40', dotColor: '#10b981', percentileApprox: 98 };
    }
    if (val <= 12) {
      return { rating: 'good', label: 'Good', badgeBg: 'bg-[#6f8452]/20', badgeText: 'text-[#a3c482]', badgeBorder: 'border-[#6f8452]/50', dotColor: '#6f8452', percentileApprox: 85 };
    }
    if (val <= 35) {
      return { rating: 'moderate', label: 'Moderate', badgeBg: 'bg-[#b08d57]/20', badgeText: 'text-[#dfba7d]', badgeBorder: 'border-[#b08d57]/50', dotColor: '#b08d57', percentileApprox: 50 };
    }
    if (val <= 60) {
      return { rating: 'warning', label: 'Unhealthy', badgeBg: 'bg-amber-600/20', badgeText: 'text-amber-400', badgeBorder: 'border-amber-500/50', dotColor: '#f59e0b', percentileApprox: 25 };
    }
    return { rating: 'critical', label: 'Hazardous', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400', badgeBorder: 'border-red-500/50', dotColor: '#ef4444', percentileApprox: 5 };
  },

  // 2. Non-Car Commuter Modal Share (%)
  modalShare(val: number): MetricGrade {
    if (val >= 60) {
      return { rating: 'optimal', label: 'Transit Leader', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/40', dotColor: '#10b981', percentileApprox: 92 };
    }
    if (val >= 40) {
      return { rating: 'good', label: 'Balanced', badgeBg: 'bg-[#6f8452]/20', badgeText: 'text-[#a3c482]', badgeBorder: 'border-[#6f8452]/50', dotColor: '#6f8452', percentileApprox: 70 };
    }
    if (val >= 25) {
      return { rating: 'moderate', label: 'Car-Oriented', badgeBg: 'bg-[#b08d57]/20', badgeText: 'text-[#dfba7d]', badgeBorder: 'border-[#b08d57]/50', dotColor: '#b08d57', percentileApprox: 35 };
    }
    return { rating: 'critical', label: 'Car-Dependent', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400', badgeBorder: 'border-red-500/50', dotColor: '#ef4444', percentileApprox: 10 };
  },

  // 3. Tree Canopy Cover (%)
  treeCanopy(val: number): MetricGrade {
    if (val >= 30) {
      return { rating: 'optimal', label: 'Forest City', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/40', dotColor: '#10b981', percentileApprox: 90 };
    }
    if (val >= 18) {
      return { rating: 'good', label: 'Abundant', badgeBg: 'bg-[#6f8452]/20', badgeText: 'text-[#a3c482]', badgeBorder: 'border-[#6f8452]/50', dotColor: '#6f8452', percentileApprox: 65 };
    }
    if (val >= 10) {
      return { rating: 'moderate', label: 'Moderate', badgeBg: 'bg-[#b08d57]/20', badgeText: 'text-[#dfba7d]', badgeBorder: 'border-[#b08d57]/50', dotColor: '#b08d57', percentileApprox: 35 };
    }
    return { rating: 'warning', label: 'Sparse', badgeBg: 'bg-amber-600/20', badgeText: 'text-amber-400', badgeBorder: 'border-amber-500/50', dotColor: '#f59e0b', percentileApprox: 15 };
  },

  // 4. Urban Heat Island (UHI) (+°C delta)
  uhi(val: number): MetricGrade {
    if (val <= 1.5) {
      return { rating: 'optimal', label: 'Low UHI', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/40', dotColor: '#10b981', percentileApprox: 90 };
    }
    if (val <= 2.8) {
      return { rating: 'good', label: 'Moderate', badgeBg: 'bg-[#6f8452]/20', badgeText: 'text-[#a3c482]', badgeBorder: 'border-[#6f8452]/50', dotColor: '#6f8452', percentileApprox: 60 };
    }
    if (val <= 3.8) {
      return { rating: 'warning', label: 'Elevated', badgeBg: 'bg-[#b08d57]/20', badgeText: 'text-[#dfba7d]', badgeBorder: 'border-[#b08d57]/50', dotColor: '#b08d57', percentileApprox: 30 };
    }
    return { rating: 'critical', label: 'Intense Island', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400', badgeBorder: 'border-red-500/50', dotColor: '#ef4444', percentileApprox: 8 };
  },

  // 5. 2050 Temp Anomaly (+Δ°C)
  tempAnomaly(val: number): MetricGrade {
    if (val <= 1.8) {
      return { rating: 'good', label: 'Mild (≤+1.8°C)', badgeBg: 'bg-[#6f8452]/20', badgeText: 'text-[#a3c482]', badgeBorder: 'border-[#6f8452]/50', dotColor: '#6f8452', percentileApprox: 80 };
    }
    if (val <= 2.6) {
      return { rating: 'moderate', label: 'Moderate (≤+2.6°C)', badgeBg: 'bg-[#b08d57]/20', badgeText: 'text-[#dfba7d]', badgeBorder: 'border-[#b08d57]/50', dotColor: '#b08d57', percentileApprox: 45 };
    }
    return { rating: 'critical', label: 'Severe (>+2.6°C)', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400', badgeBorder: 'border-red-500/50', dotColor: '#ef4444', percentileApprox: 15 };
  },

  // 6. Heatwave Days >35°C / year
  heatwaveDays(val: number): MetricGrade {
    if (val === 0) {
      return { rating: 'optimal', label: 'No Extreme Heat', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/40', dotColor: '#10b981', percentileApprox: 95 };
    }
    if (val <= 10) {
      return { rating: 'good', label: 'Low (<10d)', badgeBg: 'bg-[#6f8452]/20', badgeText: 'text-[#a3c482]', badgeBorder: 'border-[#6f8452]/50', dotColor: '#6f8452', percentileApprox: 75 };
    }
    if (val <= 30) {
      return { rating: 'moderate', label: 'Moderate (10-30d)', badgeBg: 'bg-[#b08d57]/20', badgeText: 'text-[#dfba7d]', badgeBorder: 'border-[#b08d57]/50', dotColor: '#b08d57', percentileApprox: 40 };
    }
    return { rating: 'critical', label: 'Chronic (>30d)', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400', badgeBorder: 'border-red-500/50', dotColor: '#ef4444', percentileApprox: 10 };
  },

  // 7. Warming Rate (°C / decade)
  warmingRate(val: number): MetricGrade {
    if (val <= 0.30) {
      return { rating: 'good', label: 'Moderate (≤+0.30°/dec)', badgeBg: 'bg-[#6f8452]/20', badgeText: 'text-[#a3c482]', badgeBorder: 'border-[#6f8452]/50', dotColor: '#6f8452', percentileApprox: 80 };
    }
    if (val <= 0.45) {
      return { rating: 'warning', label: 'Accelerated', badgeBg: 'bg-[#b08d57]/20', badgeText: 'text-[#dfba7d]', badgeBorder: 'border-[#b08d57]/50', dotColor: '#b08d57', percentileApprox: 40 };
    }
    return { rating: 'critical', label: 'Hotspot (>+0.45°)', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400', badgeBorder: 'border-red-500/50', dotColor: '#ef4444', percentileApprox: 10 };
  },

  // 8. Aridity Index
  aridity(val: string): MetricGrade {
    switch (val) {
      case 'Humid':
        return { rating: 'optimal', label: 'Humid Biome', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/40', dotColor: '#10b981', percentileApprox: 85 };
      case 'Dry Sub-Humid':
        return { rating: 'good', label: 'Dry Sub-Humid', badgeBg: 'bg-[#6f8452]/20', badgeText: 'text-[#a3c482]', badgeBorder: 'border-[#6f8452]/50', dotColor: '#6f8452', percentileApprox: 60 };
      case 'Semi-Arid':
        return { rating: 'moderate', label: 'Semi-Arid Steppe', badgeBg: 'bg-[#b08d57]/20', badgeText: 'text-[#dfba7d]', badgeBorder: 'border-[#b08d57]/50', dotColor: '#b08d57', percentileApprox: 35 };
      case 'Arid':
      case 'Hyper-Arid':
      default:
        return { rating: 'critical', label: 'Extreme Aridity', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400', badgeBorder: 'border-red-500/50', dotColor: '#ef4444', percentileApprox: 10 };
    }
  },

  // 9. Carbon Footprint (tCO2e/capita/year)
  carbonFootprint(val: number): MetricGrade {
    if (val <= 4.0) {
      return { rating: 'optimal', label: 'Low Carbon (<4t)', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/40', dotColor: '#10b981', percentileApprox: 90 };
    }
    if (val <= 8.5) {
      return { rating: 'good', label: 'Moderate (4-8t)', badgeBg: 'bg-[#6f8452]/20', badgeText: 'text-[#a3c482]', badgeBorder: 'border-[#6f8452]/50', dotColor: '#6f8452', percentileApprox: 60 };
    }
    if (val <= 14.0) {
      return { rating: 'warning', label: 'Elevated (8-14t)', badgeBg: 'bg-[#b08d57]/20', badgeText: 'text-[#dfba7d]', badgeBorder: 'border-[#b08d57]/50', dotColor: '#b08d57', percentileApprox: 30 };
    }
    return { rating: 'critical', label: 'High Carbon (>14t)', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400', badgeBorder: 'border-red-500/50', dotColor: '#ef4444', percentileApprox: 10 };
  },

  // 10. 2050 Water Stress
  waterStress(tier: string): MetricGrade {
    switch (tier) {
      case 'Low':
        return { rating: 'optimal', label: 'Abundant', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/40', dotColor: '#10b981', percentileApprox: 90 };
      case 'Medium':
        return { rating: 'good', label: 'Moderate', badgeBg: 'bg-[#6f8452]/20', badgeText: 'text-[#a3c482]', badgeBorder: 'border-[#6f8452]/50', dotColor: '#6f8452', percentileApprox: 65 };
      case 'High':
        return { rating: 'warning', label: 'High Stress', badgeBg: 'bg-amber-600/20', badgeText: 'text-amber-400', badgeBorder: 'border-amber-500/50', dotColor: '#f59e0b', percentileApprox: 30 };
      case 'Extremely High':
      default:
        return { rating: 'critical', label: 'Extreme Crisis', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400', badgeBorder: 'border-red-500/50', dotColor: '#ef4444', percentileApprox: 10 };
    }
  },

  // 11. Coastal Flood Risk
  coastalRisk(risk: string): MetricGrade {
    switch (risk) {
      case 'None (Inland)':
        return { rating: 'optimal', label: 'Inland Safe', badgeBg: 'bg-slate-700/20', badgeText: 'text-slate-400', badgeBorder: 'border-slate-600/40', dotColor: '#94a3b8', percentileApprox: 85 };
      case 'Low':
        return { rating: 'good', label: 'Low Risk', badgeBg: 'bg-[#6f8452]/20', badgeText: 'text-[#a3c482]', badgeBorder: 'border-[#6f8452]/50', dotColor: '#6f8452', percentileApprox: 70 };
      case 'Moderate':
        return { rating: 'moderate', label: 'Moderate Surge', badgeBg: 'bg-[#b08d57]/20', badgeText: 'text-[#dfba7d]', badgeBorder: 'border-[#b08d57]/50', dotColor: '#b08d57', percentileApprox: 40 };
      case 'High':
        return { rating: 'warning', label: 'High Exposure', badgeBg: 'bg-amber-600/20', badgeText: 'text-amber-400', badgeBorder: 'border-amber-500/50', dotColor: '#f59e0b', percentileApprox: 20 };
      case 'Severe':
      default:
        return { rating: 'critical', label: 'Severe Subsidence', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400', badgeBorder: 'border-red-500/50', dotColor: '#ef4444', percentileApprox: 5 };
    }
  },

  // 12. GDP per Capita PPP
  gdp(val: number): MetricGrade {
    if (val >= 60000) {
      return { rating: 'optimal', label: 'High Income (Tier 1)', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/40', dotColor: '#10b981', percentileApprox: 90 };
    }
    if (val >= 35000) {
      return { rating: 'good', label: 'Upper-Mid (Tier 2)', badgeBg: 'bg-[#6f8452]/20', badgeText: 'text-[#a3c482]', badgeBorder: 'border-[#6f8452]/50', dotColor: '#6f8452', percentileApprox: 65 };
    }
    if (val >= 18000) {
      return { rating: 'moderate', label: 'Emerging (Tier 3)', badgeBg: 'bg-[#b08d57]/20', badgeText: 'text-[#dfba7d]', badgeBorder: 'border-[#b08d57]/50', dotColor: '#b08d57', percentileApprox: 35 };
    }
    return { rating: 'warning', label: 'Developing (Tier 4)', badgeBg: 'bg-amber-600/20', badgeText: 'text-amber-400', badgeBorder: 'border-amber-500/50', dotColor: '#f59e0b', percentileApprox: 15 };
  },

  // 13. Urban Density (pop/km²)
  density(val: number): MetricGrade {
    if (val >= 12000) {
      return { rating: 'warning', label: 'Hyper-Dense', badgeBg: 'bg-amber-600/20', badgeText: 'text-amber-400', badgeBorder: 'border-amber-500/50', dotColor: '#f59e0b', percentileApprox: 10 };
    }
    if (val >= 5000) {
      return { rating: 'optimal', label: 'Compact Urban', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/40', dotColor: '#10b981', percentileApprox: 85 };
    }
    if (val >= 2500) {
      return { rating: 'good', label: 'Medium Density', badgeBg: 'bg-[#6f8452]/20', badgeText: 'text-[#a3c482]', badgeBorder: 'border-[#6f8452]/50', dotColor: '#6f8452', percentileApprox: 55 };
    }
    return { rating: 'moderate', label: 'Sprawl Footprint', badgeBg: 'bg-[#b08d57]/20', badgeText: 'text-[#dfba7d]', badgeBorder: 'border-[#b08d57]/50', dotColor: '#b08d57', percentileApprox: 30 };
  },

  // 14. Köppen Shift Severity
  koppenShift(currentCode: string, futureCode: string): MetricGrade {
    if (currentCode === futureCode) {
      return { rating: 'optimal', label: 'Stable Climate', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/40', dotColor: '#10b981', percentileApprox: 85 };
    }
    const g1 = currentCode.charAt(0);
    const g2 = futureCode.charAt(0);
    if (g1 === g2) {
      return { rating: 'moderate', label: 'Sub-variant Shift', badgeBg: 'bg-[#b08d57]/20', badgeText: 'text-[#dfba7d]', badgeBorder: 'border-[#b08d57]/50', dotColor: '#b08d57', percentileApprox: 50 };
    }
    return { rating: 'critical', label: 'Biome Shift', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400', badgeBorder: 'border-red-500/50', dotColor: '#ef4444', percentileApprox: 15 };
  },

  // 15. Elevation
  elevation(val: number): MetricGrade {
    if (val > 1500) {
      return { rating: 'neutral', label: 'High Altitude', badgeBg: 'bg-cyan-500/15', badgeText: 'text-cyan-400', badgeBorder: 'border-cyan-500/40', dotColor: '#06b6d4', percentileApprox: 95 };
    }
    if (val > 300) {
      return { rating: 'neutral', label: 'Plateau / Inland', badgeBg: 'bg-slate-700/20', badgeText: 'text-slate-300', badgeBorder: 'border-slate-600/40', dotColor: '#94a3b8', percentileApprox: 60 };
    }
    if (val > 30) {
      return { rating: 'neutral', label: 'Lowland Plain', badgeBg: 'bg-slate-700/20', badgeText: 'text-slate-300', badgeBorder: 'border-slate-600/40', dotColor: '#94a3b8', percentileApprox: 30 };
    }
    return { rating: 'warning', label: 'Sea-Level Lowland', badgeBg: 'bg-amber-600/20', badgeText: 'text-amber-400', badgeBorder: 'border-amber-500/50', dotColor: '#f59e0b', percentileApprox: 10 };
  }
};
