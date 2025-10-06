import { useState, useMemo, useCallback } from 'react';
import { Battery, Sun, Home, Zap, TrendingUp, AlertCircle, Shield, Award, Clock } from 'lucide-react';

// ==================== CONSTANTS ====================
const CONSTANTS = {
  PEAK_SUN_HOURS: 5.0,
  AVG_KWH_RATE: 0.1184,
  INVERTER_COST: 3500,
  INSTALL_COST_PER_KW: 1000,
  PERMITTING_COST: 1500,
  FEDERAL_TAX_CREDIT_RATE: 0.30,
  POWER_PAIR_REBATE_PER_KWH: 250,
  MAX_POWER_PAIR_REBATE: 9000,
  DUKE_AVG_INCREASE_RATE: 0.025,
  DAYS_PER_YEAR: 365,
  MONTHS_PER_YEAR: 12,
  PROJECTION_YEARS: 25,
};

const BRAND_COLORS = {
  primary: '#0c2f4a',
  secondary: '#1a4d74',
  accent: '#c9a648',
  accentDark: '#b89539',
  background: '#f7f5f2',
  success: '#10b981',
  successDark: '#059669',
  danger: '#ef4444',
  warning: '#f97316',
};

// ==================== PRODUCT DATA ====================
const SOLAR_PANELS = [
  { 
    id: 'qcells-415', 
    name: 'QCELLS Q.PEAK DUO BLK ML-G10+', 
    watts: 415, 
    efficiency: 20.6, 
    cost: 280,
    color: '#000000',
    features: ['All-Black Design', 'Anti-Reflective', 'Q.ANTUM Technology']
  },
  { 
    id: 'rec-460', 
    name: 'REC REC460AA Pure-RX', 
    watts: 460, 
    efficiency: 21.7, 
    cost: 320,
    color: '#1a1a1a',
    features: ['Highest Efficiency', 'Heterojunction Cells', 'Low Temperature Coefficient']
  },
  { 
    id: 'aptos-460', 
    name: 'Aptos DNA-120-MF10-460W', 
    watts: 460, 
    efficiency: 21.5, 
    cost: 310,
    color: '#2d2d2d',
    features: ['Bifacial Technology', 'Extended Warranty', 'High Performance']
  },
  { 
    id: 'silfab-440', 
    name: 'Silfab Solar SIL-440 QD', 
    watts: 440, 
    efficiency: 21.2, 
    cost: 300,
    color: '#1a1a2e',
    features: ['Made in USA', 'Elite Premium', 'High Snow Load']
  },
  { 
    id: 'ja-405', 
    name: 'JA Solar JAM54S3-405/MR', 
    watts: 405, 
    efficiency: 20.9, 
    cost: 270,
    color: '#16213e',
    features: ['PERC Technology', 'Value Leader', 'Proven Track Record']
  },
  { 
    id: 'jinko-425', 
    name: 'Jinko Solar JKM425N-54HL4-B', 
    watts: 425, 
    efficiency: 21.0, 
    cost: 285,
    color: '#0f3460',
    features: ['Tiger Neo', 'High Reliability', 'Global Brand']
  }
];

const BATTERIES = [
  { 
    id: 'powerwall3', 
    name: 'Tesla Powerwall 3', 
    capacity: 13.5, 
    power: 11.5, 
    peakPower: 15.4,
    cost: 11500, 
    warranty: 10,
    roundTripEff: 0.90,
    chemistry: 'LFP',
    color: '#cc0000',
    features: ['Integrated Inverter', 'Whole Home Backup', 'Flood Resistant']
  },
  { 
    id: 'eg4-280', 
    name: 'EG4 PowerPro WallMount 280Ah', 
    capacity: 14.3, 
    power: 11.5, 
    peakPower: 14.3,
    cost: 7500, 
    warranty: 10,
    roundTripEff: 0.89,
    chemistry: 'LFP',
    color: '#2196F3',
    features: ['Budget Friendly', 'Weather Rated', 'Built-in BMS']
  },
  { 
    id: 'enphase-5p', 
    name: 'Enphase IQ Battery 5P', 
    capacity: 5.0, 
    power: 3.84, 
    peakPower: 7.68,
    cost: 6500, 
    warranty: 15,
    roundTripEff: 0.90,
    chemistry: 'LFP',
    color: '#f47920',
    features: ['Compact Design', 'Modular', '15-Year Warranty']
  },
  { 
    id: 'enphase-10c', 
    name: 'Enphase IQ Battery 10C', 
    capacity: 10.0, 
    power: 7.08, 
    peakPower: 14.16,
    cost: 12000, 
    warranty: 15,
    roundTripEff: 0.90,
    chemistry: 'LFP',
    color: '#f47920',
    features: ['Neutral Forming', 'Extended Warranty', 'Safe Chemistry']
  },
  { 
    id: 'franklin-apower2', 
    name: 'FranklinWH aPower 2', 
    capacity: 15.0, 
    power: 10.0, 
    peakPower: 15.0,
    cost: 13000, 
    warranty: 15,
    roundTripEff: 0.90,
    chemistry: 'LFP',
    color: '#1e3a8a',
    features: ['Largest Capacity', 'AC-Coupled', 'Off-Grid Ready']
  }
];

const RATE_PLANS = {
  netMetering: {
    name: '1:1 Net Metering (Legacy)',
    buyRate: 0.1184,
    sellRate: 0.1184,
    available: false,
    description: 'Legacy plan - no longer available for new installs'
  },
  bridge: {
    name: 'Bridge Net Billing',
    buyRate: 0.1184,
    sellRate: 0.08,
    available: true,
    description: 'Transition plan - retail rate minus distribution charge'
  },
  tou: {
    name: 'Time of Use (TOU)',
    onPeakRate: 0.18,
    offPeakRate: 0.07,
    peakHours: { start: 16, end: 21 },
    available: true,
    description: 'Best for battery owners - shift usage to off-peak'
  }
};

// ==================== UTILITY FUNCTIONS ====================
const formatCurrency = (amount: number, decimals = 0) => {
  return `$${amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const calculateSystemSize = (panelWatts: number, panelCount: number) => {
  return (panelWatts * panelCount) / 1000;
};

const calculateProduction = (systemSize: number, shadingPercent: number, efficiency: number) => {
  const shadingFactor = (100 - shadingPercent) / 100;
  const dailyProduction = systemSize * CONSTANTS.PEAK_SUN_HOURS * shadingFactor * (efficiency / 100);
  return {
    daily: dailyProduction,
    annual: dailyProduction * CONSTANTS.DAYS_PER_YEAR
  };
};

const calculateUsage = (monthlyBill: number) => {
  const monthlyUsage = monthlyBill / CONSTANTS.AVG_KWH_RATE;
  return {
    monthly: monthlyUsage,
    annual: monthlyUsage * CONSTANTS.MONTHS_PER_YEAR
  };
};

const calculateSystemCosts = (
  panelCost: number, panelCount: number, batteryCost: number, batteryCount: number, systemSize: number, includeInstall: boolean
) => {
  const panels = panelCost * panelCount;
  const batteries = batteryCost * batteryCount;
  const inverter = CONSTANTS.INVERTER_COST;
  const labor = includeInstall ? (systemSize * CONSTANTS.INSTALL_COST_PER_KW) : 0;
  const permitting = CONSTANTS.PERMITTING_COST;
  
  return {
    panels,
    batteries,
    inverter,
    labor,
    permitting,
    total: panels + batteries + inverter + labor + permitting
  };
};

const calculateIncentives = (totalCost: number, batteryCapacity: number) => {
  const powerPairRebate = Math.min(
    batteryCapacity * CONSTANTS.POWER_PAIR_REBATE_PER_KWH, 
    CONSTANTS.MAX_POWER_PAIR_REBATE
  );
  const federalTaxCredit = totalCost * CONSTANTS.FEDERAL_TAX_CREDIT_RATE;
  
  return {
    powerPairRebate,
    federalTaxCredit,
    total: powerPairRebate + federalTaxCredit
  };
};

const calculateSavings = (annualProduction: number, annualUsage: number, ratePlan: string) => {
  let annualSavings = 0;
  let breakdown = '';
  
  if (ratePlan === 'tou') {
    const offPeakCharge = annualProduction * 0.4 * RATE_PLANS.tou.offPeakRate;
    const onPeakOffset = annualProduction * 0.6 * RATE_PLANS.tou.onPeakRate;
    const gridPurchase = Math.max(0, annualUsage - annualProduction) * 0.3 * RATE_PLANS.tou.onPeakRate;
    annualSavings = onPeakOffset - offPeakCharge - gridPurchase;
    breakdown = `Peak offset: ${formatCurrency(onPeakOffset)}/yr - Off-peak: ${formatCurrency(offPeakCharge)}/yr`;
  } else if (ratePlan === 'bridge') {
    const productionValue = Math.min(annualProduction, annualUsage) * RATE_PLANS.bridge.buyRate;
    const excessCredit = Math.max(0, annualProduction - annualUsage) * RATE_PLANS.bridge.sellRate;
    annualSavings = productionValue + excessCredit;
    breakdown = `Self-use: ${formatCurrency(productionValue)}/yr + Export: ${formatCurrency(excessCredit)}/yr`;
  } else {
    annualSavings = Math.min(annualProduction, annualUsage) * RATE_PLANS.netMetering.sellRate;
    breakdown = `1:1 credit: ${formatCurrency(annualSavings)}/yr`;
  }
  
  return { annualSavings, breakdown };
};

const calculateLongTermProjections = (netCost: number, annualSavings: number, monthlyBill: number) => {
  const paybackPeriod = netCost / annualSavings;
  const twentyFiveYearSavings = (annualSavings * CONSTANTS.PROJECTION_YEARS) - netCost;
  
  const dukeTotal = (monthlyBill * CONSTANTS.MONTHS_PER_YEAR) * 
    ((Math.pow(1 + CONSTANTS.DUKE_AVG_INCREASE_RATE, CONSTANTS.PROJECTION_YEARS) - 1) / CONSTANTS.DUKE_AVG_INCREASE_RATE);
  
  return {
    paybackPeriod,
    twentyFiveYearSavings,
    dukeTotal,
    totalSavingsVsDuke: dukeTotal - netCost
  };
};

// ==================== CARD COMPONENTS ====================
const SolarPanelCard = ({ panel, isSelected, onClick }: any) => (
  <div 
    onClick={onClick}
    className="cursor-pointer transition-all duration-300 rounded-xl"
    style={{
      background: isSelected ? `linear-gradient(135deg, ${panel.color} 0%, #000 100%)` : 'white',
      border: `3px solid ${isSelected ? BRAND_COLORS.accent : '#e2e8f0'}`,
      padding: '20px',
      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
      boxShadow: isSelected ? '0 8px 30px rgba(201, 166, 72, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
      color: isSelected ? 'white' : '#2d3748'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
      <div style={{ 
        width: '60px', 
        height: '60px', 
        background: `linear-gradient(135deg, ${panel.color}, #1a1a1a)`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `2px solid ${BRAND_COLORS.accent}`
      }}>
        <Sun size={30} color={BRAND_COLORS.accent} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '4px' }}>
          {panel.name.split(' ')[0]}
        </div>
        <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
          {panel.watts}W • {panel.efficiency}%
        </div>
      </div>
    </div>
    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '8px' }}>
      {panel.features.join(' • ')}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isSelected ? BRAND_COLORS.accent : BRAND_COLORS.primary }}>
        ${panel.cost}/panel
      </span>
      {isSelected && <Award size={20} color={BRAND_COLORS.accent} />}
    </div>
  </div>
);

const BatteryCard = ({ battery, isSelected, onClick }: any) => (
  <div 
    onClick={onClick}
    className="cursor-pointer transition-all duration-300 rounded-xl"
    style={{
      background: isSelected ? `linear-gradient(135deg, ${battery.color} 0%, rgba(0,0,0,0.8) 100%)` : 'white',
      border: `3px solid ${isSelected ? BRAND_COLORS.accent : '#e2e8f0'}`,
      padding: '20px',
      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
      boxShadow: isSelected ? '0 8px 30px rgba(201, 166, 72, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
      color: isSelected ? 'white' : '#2d3748'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
      <div style={{ 
        width: '60px', 
        height: '60px', 
        background: `linear-gradient(135deg, ${battery.color}, rgba(0,0,0,0.5))`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `2px solid ${BRAND_COLORS.accent}`
      }}>
        <Battery size={30} color={BRAND_COLORS.accent} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '4px' }}>
          {battery.name.split(' ')[0]}
        </div>
        <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
          {battery.capacity}kWh • {battery.power}kW
        </div>
      </div>
    </div>
    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '8px' }}>
      {battery.features.join(' • ')}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isSelected ? BRAND_COLORS.accent : BRAND_COLORS.primary }}>
        ${(battery.cost/1000).toFixed(1)}k
      </span>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <Shield size={16} color={isSelected ? BRAND_COLORS.accent : '#718096'} />
        <span style={{ fontSize: '0.75rem' }}>{battery.warranty}yr</span>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const SolarCalculator = () => {
  const [config, setConfig] = useState({
    monthlyBill: 150,
    roofShading: 10,
    selectedPanel: SOLAR_PANELS[0].id,
    panelCount: 20,
    selectedBattery: BATTERIES[0].id,
    batteryCount: 1,
    ratePlan: 'tou',
    includeInstallCost: true
  });

  const selectedPanel = SOLAR_PANELS.find(p => p.id === config.selectedPanel);
  const selectedBattery = BATTERIES.find(b => b.id === config.selectedBattery);

  const handleConfigUpdate = useCallback((updates: any) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const handlePanelSelect = useCallback((panelId: any) => {
    handleConfigUpdate({ selectedPanel: panelId });
  }, [handleConfigUpdate]);

  const handleBatterySelect = useCallback((batteryId: any) => {
    handleConfigUpdate({ selectedBattery: batteryId });
  }, [handleConfigUpdate]);

  const handleCTAClick = useCallback(() => {
    alert('🎉 Awesome! An Admiral Energy solar expert will contact you within 24 hours to finalize your custom system design and schedule your free site assessment. Get ready to own your power!');
  }, []);

  const calculations = useMemo(() => {
    if (!selectedPanel || !selectedBattery) return null as any;
    const systemSize = calculateSystemSize(selectedPanel.watts ?? 0, config.panelCount);
    const production = calculateProduction(systemSize, config.roofShading, selectedPanel.efficiency ?? 0);
    const usage = calculateUsage(config.monthlyBill);
    
    const costs = calculateSystemCosts(
      selectedPanel.cost ?? 0,
      config.panelCount,
      selectedBattery.cost ?? 0,
      config.batteryCount,
      systemSize,
      config.includeInstallCost
    );
    
  const totalBatteryCapacity = (selectedBattery.capacity ?? 0) * config.batteryCount;
  const backupHours = (totalBatteryCapacity / (usage.monthly / 30 / 24)) * (selectedBattery.roundTripEff ?? 1);
    
    const incentives = calculateIncentives(costs.total, totalBatteryCapacity);
    const netSystemCost = costs.total - incentives.total;
    
    const { annualSavings, breakdown } = calculateSavings(
      production.annual,
      usage.annual,
      config.ratePlan
    );
    
    const projections = calculateLongTermProjections(
      netSystemCost,
      annualSavings,
      config.monthlyBill
    );
    
    return {
      systemSize,
      dailyProduction: production.daily,
      annualProduction: production.annual,
      monthlyUsage: usage.monthly,
      annualUsage: usage.annual,
      totalSystemCost: costs.total,
      powerPairRebate: incentives.powerPairRebate,
      federalTaxCredit: incentives.federalTaxCredit,
      netSystemCost,
      annualSavings,
      savingsBreakdown: breakdown,
      paybackPeriod: projections.paybackPeriod,
      twentyFiveYearSavings: projections.twentyFiveYearSavings,
      dukeTotal25Years: projections.dukeTotal,
      totalSavingsVsDuke: projections.totalSavingsVsDuke,
      backupHours,
      totalBatteryCapacity,
      offsetPercentage: (production.annual / usage.annual) * 100
    };
  }, [config, selectedPanel, selectedBattery]);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.secondary} 100%)`,
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        background: BRAND_COLORS.background,
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          paddingBottom: '30px',
          borderBottom: `3px solid ${BRAND_COLORS.accent}`
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '20px',
            marginBottom: '15px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary})`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `3px solid ${BRAND_COLORS.accent}`,
              boxShadow: '0 4px 12px rgba(201, 166, 72, 0.3)'
            }}>
              <Sun size={40} color={BRAND_COLORS.accent} />
            </div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              margin: 0,
              color: BRAND_COLORS.primary,
              fontWeight: '900'
            }}>
              ADMIRAL ENERGY
            </h1>
          </div>
          <h2 style={{ 
            fontSize: '1.5rem',
            color: BRAND_COLORS.accent,
            fontWeight: '700',
            margin: '10px 0'
          }}>
            Solar System Designer
          </h2>
          <p style={{ 
            color: '#4a5568', 
            fontSize: '1rem',
            maxWidth: '600px',
            margin: '10px auto 0'
          }}>
            Build your perfect solar + battery system • Duke Energy rebates included
          </p>
        </div>

        {/* Home Profile */}
        <div style={{ 
          background: `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary})`,
          color: BRAND_COLORS.background,
          padding: '30px',
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 8px 20px rgba(12, 47, 74, 0.3)'
        }}>
          <h3 style={{ 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1.5rem'
          }}>
            <Home size={28} />
            Your Home Profile
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px'
          }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', opacity: 0.9 }}>
                Monthly Electric Bill
              </label>
              <input
                type="range"
                min="50"
                max="500"
                value={config.monthlyBill}
                onChange={(e) => handleConfigUpdate({ monthlyBill: parseInt(e.target.value) })}
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: BRAND_COLORS.accent }}>
                ${config.monthlyBill}/mo
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', opacity: 0.9 }}>
                Roof Shading (Trees)
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={config.roofShading}
                onChange={(e) => handleConfigUpdate({ roofShading: parseInt(e.target.value) })}
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: config.roofShading > 30 ? BRAND_COLORS.danger : BRAND_COLORS.success }}>
                {config.roofShading}% shade
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', opacity: 0.9 }}>
                Duke Energy Rate Plan
              </label>
              <select
                value={config.ratePlan}
                onChange={(e) => handleConfigUpdate({ ratePlan: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1rem',
                  background: BRAND_COLORS.background,
                  color: BRAND_COLORS.primary,
                  fontWeight: '600',
                  marginBottom: '12px'
                }}
              >
                <option value="tou">⚡ Time of Use (TOU)</option>
                <option value="bridge">🔄 Bridge Net Billing</option>
                <option value="netMetering">🛡️ 1:1 Net Metering (Legacy)</option>
              </select>
              
              {config.ratePlan === 'tou' && (
                <div style={{ 
                  background: BRAND_COLORS.background,
                  border: `2px solid ${BRAND_COLORS.success}`,
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.8rem',
                  lineHeight: '1.4',
                  color: '#064e3b'
                }}>
                  <strong style={{ display: 'block', marginBottom: '6px' }}>⚡ Best for batteries!</strong>
                  Peak (4pm-9pm): $0.18/kWh<br/>
                  Off-peak: $0.07/kWh<br/>
                  <em>Save $0.11/kWh with battery arbitrage</em>
                </div>
              )}
              
              {config.ratePlan === 'bridge' && (
                <div style={{ 
                  background: BRAND_COLORS.background,
                  border: `2px solid ${BRAND_COLORS.warning}`,
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.8rem',
                  lineHeight: '1.4',
                  color: '#7c2d12'
                }}>
                  <strong style={{ display: 'block', marginBottom: '6px' }}>🔄 Standard for new solar</strong>
                  Buy: $0.1184/kWh<br/>
                  Sell excess: $0.08/kWh<br/>
                  <em>Good for sized-to-match systems</em>
                </div>
              )}
              
              {config.ratePlan === 'netMetering' && (
                <div style={{ 
                  background: BRAND_COLORS.background,
                  border: `2px solid ${BRAND_COLORS.danger}`,
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.8rem',
                  lineHeight: '1.4',
                  color: '#7f1d1d'
                }}>
                  <strong style={{ display: 'block', marginBottom: '6px' }}>🛡️ Grandfathered only</strong>
                  Full credit: $0.1184/kWh<br/>
                  Ended 2023 for new installs<br/>
                  <em>⏰ 15-year protection period</em>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Educational Rate Plan Comparison */}
        <div style={{ 
          background: 'white',
          padding: '40px',
          borderRadius: '15px',
          marginBottom: '30px',
          border: `3px solid ${BRAND_COLORS.accent}`
        }}>
          <h3 style={{ 
            marginBottom: '25px',
            fontSize: '2rem',
            textAlign: 'center',
            color: BRAND_COLORS.primary
          }}>
            📚 Understanding Duke Energy Rate Plans
          </h3>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* TOU Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              border: `3px solid ${BRAND_COLORS.success}`,
              borderRadius: '12px',
              padding: '25px'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <Zap size={24} color="#065f46" />
                <h4 style={{ fontSize: '1.25rem', color: '#065f46', margin: 0, fontWeight: 'bold' }}>
                  Time of Use (TOU)
                </h4>
              </div>
              <div style={{ 
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#065f46', fontWeight: '600' }}>Peak (4pm-9pm)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: BRAND_COLORS.danger }}>
                    $0.18/kWh
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#065f46', fontWeight: '600' }}>Off-Peak (other times)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: BRAND_COLORS.success }}>
                    $0.07/kWh
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '10px', color: '#064e3b' }}>
                <strong>Best for:</strong> Battery owners who can store cheap off-peak energy and use it during expensive peak hours.
              </p>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: '#064e3b' }}>
                <strong>Savings strategy:</strong> Charge battery at night for $0.07/kWh, use during peak to avoid $0.18/kWh. Save $0.11/kWh!
              </p>
              <div style={{ 
                marginTop: '15px',
                padding: '10px',
                background: BRAND_COLORS.success,
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                textAlign: 'center'
              }}>
                ✅ Available now | Best ROI with battery
              </div>
            </div>

            {/* Bridge Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #fed7aa, #fdba74)',
              border: `3px solid ${BRAND_COLORS.warning}`,
              borderRadius: '12px',
              padding: '25px'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <TrendingUp size={24} color="#7c2d12" />
                <h4 style={{ fontSize: '1.25rem', color: '#7c2d12', margin: 0, fontWeight: 'bold' }}>
                  Bridge Net Billing
                </h4>
              </div>
              <div style={{ 
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#7c2d12', fontWeight: '600' }}>Buy from Duke</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: BRAND_COLORS.danger }}>
                    $0.1184/kWh
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#7c2d12', fontWeight: '600' }}>Sell to Duke</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: BRAND_COLORS.warning }}>
                    $0.08/kWh
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '10px', color: '#7c2d12' }}>
                <strong>Best for:</strong> Solar-only systems sized to match your usage (not oversized).
              </p>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '10px', color: '#7c2d12' }}>
                <strong>How it works:</strong> Every kWh you use from your solar saves $0.1184. Extra solar you export earns $0.08 credit.
              </p>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: '#7c2d12' }}>
                <strong>Why "Bridge":</strong> Duke's transition from 1:1 to future rates.
              </p>
              <div style={{ 
                marginTop: '15px',
                padding: '10px',
                background: BRAND_COLORS.warning,
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                textAlign: 'center'
              }}>
                ✅ Available now | Standard for new solar
              </div>
            </div>

            {/* 1:1 Net Metering Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #fecaca, #fca5a5)',
              border: `3px solid ${BRAND_COLORS.danger}`,
              borderRadius: '12px',
              padding: '25px'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <Shield size={24} color="#7f1d1d" />
                <h4 style={{ fontSize: '1.25rem', color: '#7f1d1d', margin: 0, fontWeight: 'bold' }}>
                  1:1 Net Metering
                </h4>
              </div>
              <div style={{ 
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#7f1d1d', fontWeight: '600' }}>Buy & Sell</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: BRAND_COLORS.success }}>
                    $0.1184/kWh
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: '600' }}>
                  Full retail credit for excess solar
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '10px', color: '#7f1d1d' }}>
                <strong>Why it was amazing:</strong> True 1:1 credit. Every kWh sent to grid = $0.1184 credit. Meter spun backwards!
              </p>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '10px', color: '#7f1d1d' }}>
                <strong>What happened:</strong> Ended in 2023 for new customers. Duke replaced it with Bridge Net Billing.
              </p>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: '#7f1d1d' }}>
                <strong>⏰ If you have it:</strong> Grandfathered for 15 years from interconnection date.
              </p>
              <div style={{ 
                marginTop: '15px',
                padding: '10px',
                background: BRAND_COLORS.danger,
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                textAlign: 'center'
              }}>
                ❌ No longer available | Grandfathered only
              </div>
            </div>
          </div>

          {/* Educational callout */}
          <div style={{ 
            marginTop: '30px',
            padding: '25px',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: `3px solid ${BRAND_COLORS.accent}`,
            borderRadius: '12px'
          }}>
            <h4 style={{ color: '#78350f', marginBottom: '15px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={24} />
              💡 Pro Tip: Why TOU + Battery is the Winner Now
            </h4>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '10px', color: '#78350f' }}>
              With the old 1:1 Net Metering gone forever, <strong>Time of Use with a battery is now your best financial choice.</strong> Here's why:
            </p>
            <ul style={{ fontSize: '0.95rem', lineHeight: '1.7', marginLeft: '20px', color: '#78350f' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Bigger spread:</strong> $0.18 peak vs $0.07 off-peak = $0.11/kWh arbitrage opportunity
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Battery value:</strong> Every kWh stored at $0.07 and used at peak saves you $0.11
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>No export penalty:</strong> Use all your solar yourself instead of selling cheap to Duke
              </li>
              <li>
                <strong>Backup power bonus:</strong> Get energy security during outages too!
              </li>
            </ul>
          </div>
        </div>

        {/* Solar Panel Selection */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            marginBottom: '20px',
            color: BRAND_COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1.75rem'
          }}>
            <Sun size={28} color={BRAND_COLORS.accent} />
            Choose Your Solar Panels
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            {SOLAR_PANELS.map(panel => (
              <SolarPanelCard
                key={panel.id}
                panel={panel}
                isSelected={config.selectedPanel === panel.id}
                onClick={() => handlePanelSelect(panel.id)}
              />
            ))}
          </div>
          <div style={{ 
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            border: `2px solid ${BRAND_COLORS.accent}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: BRAND_COLORS.primary }}>
                Number of Panels
              </label>
              <input
                type="number"
                min="10"
                max="40"
                value={config.panelCount}
                onChange={(e) => handleConfigUpdate({ panelCount: parseInt(e.target.value) || 10 })}
                style={{ 
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${BRAND_COLORS.accent}`,
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  width: '120px',
                  color: BRAND_COLORS.primary
                }}
              />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '4px' }}>System Size</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: BRAND_COLORS.accent }}>
                {calculations.systemSize.toFixed(2)} kW
              </div>
            </div>
          </div>
        </div>

        {/* Battery Selection */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            marginBottom: '20px',
            color: BRAND_COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1.75rem'
          }}>
            <Battery size={28} color={BRAND_COLORS.accent} />
            Choose Your Battery Backup
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            {BATTERIES.map(battery => (
              <BatteryCard
                key={battery.id}
                battery={battery}
                isSelected={config.selectedBattery === battery.id}
                onClick={() => handleBatterySelect(battery.id)}
              />
            ))}
          </div>
          <div style={{ 
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            border: `2px solid ${BRAND_COLORS.accent}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: BRAND_COLORS.primary }}>
                Number of Batteries
              </label>
              <input
                type="number"
                min="1"
                max="4"
                value={config.batteryCount}
                onChange={(e) => handleConfigUpdate({ batteryCount: parseInt(e.target.value) || 1 })}
                style={{ 
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${BRAND_COLORS.accent}`,
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  width: '120px',
                  color: BRAND_COLORS.primary
                }}
              />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '4px' }}>Total Storage</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: BRAND_COLORS.accent }}>
                {calculations.totalBatteryCapacity.toFixed(1)} kWh
              </div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginTop: '4px' }}>
                ~{calculations.backupHours.toFixed(1)} hours backup
              </div>
            </div>
          </div>
        </div>

        {/* System Summary */}
        <div style={{ 
          background: `linear-gradient(135deg, ${BRAND_COLORS.accent} 0%, ${BRAND_COLORS.accentDark} 100%)`,
          color: BRAND_COLORS.primary,
          padding: '30px',
          borderRadius: '15px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.75rem', fontWeight: 'bold' }}>
            💰 Your Custom System Cost
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px'
          }}>
            <div style={{ background: 'rgba(247, 245, 242, 0.9)', padding: '20px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '8px', opacity: 0.8 }}>System Cost</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {formatCurrency(calculations.totalSystemCost)}
              </div>
            </div>

            <div style={{ background: 'rgba(247, 245, 242, 0.9)', padding: '20px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '8px', opacity: 0.8 }}>Power Pair Rebate</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: BRAND_COLORS.success }}>
                -{formatCurrency(calculations.powerPairRebate)}
              </div>
            </div>

            <div style={{ background: 'rgba(247, 245, 242, 0.9)', padding: '20px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '8px', opacity: 0.8 }}>Federal Tax Credit</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: BRAND_COLORS.success }}>
                -{formatCurrency(calculations.federalTaxCredit)}
              </div>
            </div>

            <div style={{ background: 'rgba(247, 245, 242, 0.9)', padding: '20px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '8px', opacity: 0.8 }}>Net Cost</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: BRAND_COLORS.primary }}>
                {formatCurrency(calculations.netSystemCost)}
              </div>
            </div>
          </div>
        </div>

        {/* Savings */}
        <div style={{ 
          background: 'white',
          padding: '30px',
          borderRadius: '15px',
          border: `3px solid ${BRAND_COLORS.accent}`,
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            marginBottom: '20px',
            color: BRAND_COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1.75rem'
          }}>
            <TrendingUp size={28} color={BRAND_COLORS.accent} />
            Your Savings Projection
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px'
          }}>
            <div style={{ 
              background: `linear-gradient(135deg, ${BRAND_COLORS.success}, ${BRAND_COLORS.successDark})`,
              color: 'white',
              padding: '25px',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '8px', opacity: 0.9 }}>Annual Savings</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                {formatCurrency(calculations.annualSavings)}/yr
              </div>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              padding: '25px',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '8px', opacity: 0.9 }}>Payback Period</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                {calculations.paybackPeriod.toFixed(1)} yrs
              </div>
            </div>

            <div style={{ 
              background: `linear-gradient(135deg, ${BRAND_COLORS.accent}, ${BRAND_COLORS.accentDark})`,
              color: BRAND_COLORS.primary,
              padding: '25px',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '8px', opacity: 0.9 }}>25-Year Savings</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                {formatCurrency(calculations.twentyFiveYearSavings / 1000)}k
              </div>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              padding: '25px',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '8px', opacity: 0.9 }}>Energy Offset</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                {calculations.offsetPercentage.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Own vs Rent Comparison */}
        <div style={{ 
          marginBottom: '30px',
          background: 'white',
          padding: '40px',
          borderRadius: '15px',
          border: `3px solid ${BRAND_COLORS.accent}`
        }}>
          <h2 style={{ 
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '10px',
            color: BRAND_COLORS.primary
          }}>
            🏠 Own Your Power vs. 💸 Rent from Duke
          </h2>
          <p style={{ 
            textAlign: 'center',
            fontSize: '1.2rem',
            color: '#718096',
            marginBottom: '30px'
          }}>
            See the real cost difference over 25 years
          </p>

          {/* Duke Rate History */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '30px',
            border: `2px solid ${BRAND_COLORS.danger}`
          }}>
            <h3 style={{ 
              color: '#991b1b',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={24} />
              Duke Energy's Rate Increase History
            </h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: '#7f1d1d', fontWeight: '600' }}>2018</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>+12.8%</div>
                <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>$18.72/mo increase</div>
              </div>
              <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: '#7f1d1d', fontWeight: '600' }}>2024</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>+8.3%</div>
                <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>$10.04/mo increase</div>
              </div>
              <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: '#7f1d1d', fontWeight: '600' }}>2025</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>+3.3%</div>
                <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>$4.10/mo increase</div>
              </div>
              <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: '#7f1d1d', fontWeight: '600' }}>2026</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>+3.0%</div>
                <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>Est. $4.48/mo increase</div>
              </div>
            </div>
            <p style={{ 
              fontSize: '0.875rem',
              color: '#7f1d1d',
              marginTop: '10px',
              fontStyle: 'italic'
            }}>
              ⚠️ Duke projects an average 2.1% annual increase going forward. Your bills will only go UP.
            </p>
          </div>

          {/* Graph */}
          <div style={{ 
            background: BRAND_COLORS.background,
            padding: '30px',
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            <h3 style={{ 
              textAlign: 'center',
              marginBottom: '20px',
              color: BRAND_COLORS.primary,
              fontSize: '1.5rem'
            }}>
              25-Year Cost Comparison
            </h3>
            
            <div style={{ position: 'relative', height: '400px', marginBottom: '20px' }}>
              <div style={{ 
                position: 'absolute',
                left: '0',
                top: '0',
                bottom: '40px',
                width: '60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                paddingRight: '10px',
                fontSize: '0.75rem',
                color: '#718096'
              }}>
                <div>$100k</div>
                <div>$75k</div>
                <div>$50k</div>
                <div>$25k</div>
                <div>$0</div>
              </div>

              <div style={{ 
                position: 'absolute',
                left: '60px',
                right: '0',
                top: '0',
                bottom: '40px',
                background: 'white',
                borderRadius: '8px',
                padding: '20px',
                border: '2px solid #e5e7eb'
              }}>
                <svg style={{ position: 'absolute', width: 'calc(100% - 40px)', height: 'calc(100% - 40px)', left: 20, top: 20 }} viewBox="0 0 540 360">
                  <defs>
                    <linearGradient id="dukeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: BRAND_COLORS.danger, stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: BRAND_COLORS.danger, stopOpacity: 0.05 }} />
                    </linearGradient>
                    <linearGradient id="solarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: BRAND_COLORS.success, stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: BRAND_COLORS.success, stopOpacity: 0.05 }} />
                    </linearGradient>
                  </defs>
                  
                  <path
                    d={`M 20,340 
                        L 20,${340 - (config.monthlyBill * 12 / 100000 * 340)}
                        Q 150,${340 - (config.monthlyBill * 12 * 5 * 1.15 / 100000 * 340)} 
                        280,${340 - (config.monthlyBill * 12 * 10 * 1.35 / 100000 * 340)}
                        T 520,${340 - (config.monthlyBill * 12 * 25 * 1.85 / 100000 * 340)}
                        L 520,340 Z`}
                    fill="url(#dukeGradient)"
                  />
                  
                  <path
                    d={`M 20,${340 - (config.monthlyBill * 12 / 100000 * 340)} 
                        Q 150,${340 - (config.monthlyBill * 12 * 5 * 1.15 / 100000 * 340)} 
                        280,${340 - (config.monthlyBill * 12 * 10 * 1.35 / 100000 * 340)}
                        T 520,${340 - (config.monthlyBill * 12 * 25 * 1.85 / 100000 * 340)}`}
                    fill="none"
                    stroke={BRAND_COLORS.danger}
                    strokeWidth="4"
                  />
                  
                  <path
                    d={`M 20,340
                        L 20,${340 - (calculations.netSystemCost / 25 / 12 / 100000 * 340)} 
                        L ${20 + (calculations.paybackPeriod / 25 * 500)},${340 - (calculations.netSystemCost / 25 / 12 / 100000 * 340)}
                        L 520,${340 - (0)}
                        L 520,340 Z`}
                    fill="url(#solarGradient)"
                  />
                  
                  <path
                    d={`M 20,${340 - (calculations.netSystemCost / 25 / 12 / 100000 * 340)} 
                        L ${20 + (calculations.paybackPeriod / 25 * 500)},${340 - (calculations.netSystemCost / 25 / 12 / 100000 * 340)}
                        L 520,340`}
                    fill="none"
                    stroke={BRAND_COLORS.success}
                    strokeWidth="4"
                  />
                </svg>

                <div style={{ 
                  position: 'absolute',
                  top: '30px',
                  right: '30px',
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '30px', height: '4px', background: BRAND_COLORS.danger }}></div>
                    <span style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: '600' }}>
                      Renting from Duke
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '4px', background: BRAND_COLORS.success }}></div>
                    <span style={{ fontSize: '0.875rem', color: '#065f46', fontWeight: '600' }}>
                      Owning Solar
                    </span>
                  </div>
                </div>

                <div style={{
                  position: 'absolute',
                  left: `${(calculations.paybackPeriod / 25 * 90)}%`,
                  top: '45%',
                  transform: 'translateX(-50%)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    background: BRAND_COLORS.accent,
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(201, 166, 72, 0.3)'
                  }}>
                    🎉 Paid Off!<br/>Year {calculations.paybackPeriod.toFixed(1)}
                  </div>
                  <div style={{
                    width: '2px',
                    height: '40px',
                    background: BRAND_COLORS.accent,
                    margin: '0 auto',
                    marginTop: '5px'
                  }}></div>
                </div>
              </div>

              <div style={{ 
                position: 'absolute',
                left: '60px',
                right: '0',
                bottom: '0',
                height: '40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: '#718096',
                paddingTop: '10px'
              }}>
                <div>Year 1</div>
                <div>Year 5</div>
                <div>Year 10</div>
                <div>Year 15</div>
                <div>Year 20</div>
                <div>Year 25</div>
              </div>
            </div>

            {/* Comparison Cards */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                padding: '25px',
                borderRadius: '12px',
                border: `2px solid ${BRAND_COLORS.danger}`
              }}>
                <h4 style={{ 
                  color: '#991b1b',
                  marginBottom: '15px',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Zap size={24} />
                  RENT from Duke Energy
                </h4>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '5px' }}>
                    Current Monthly Bill
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
                    ${config.monthlyBill}/mo
                  </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '5px' }}>
                    Projected in Year 10
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
                    ${(config.monthlyBill * Math.pow(1.025, 10)).toFixed(0)}/mo
                  </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '5px' }}>
                    Projected in Year 25
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
                    ${(config.monthlyBill * Math.pow(1.025, 25)).toFixed(0)}/mo
                  </div>
                </div>
                <div style={{ 
                  borderTop: `2px solid ${BRAND_COLORS.danger}`,
                  paddingTop: '15px',
                  marginTop: '15px'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '5px' }}>
                    Total Paid Over 25 Years
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                    {formatCurrency(calculations.dukeTotal25Years)}
                  </div>
                </div>
                <div style={{ 
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#7f1d1d', fontWeight: '600', lineHeight: '1.6' }}>
                    ❌ Never own it<br/>
                    ❌ Rates keep rising<br/>
                    ❌ No protection from outages<br/>
                    ❌ Dependent on the grid
                  </p>
                </div>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                padding: '25px',
                borderRadius: '12px',
                border: `2px solid ${BRAND_COLORS.success}`
              }}>
                <h4 style={{ 
                  color: '#065f46',
                  marginBottom: '15px',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Sun size={24} />
                  OWN with Solar + Battery
                </h4>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#064e3b', marginBottom: '5px' }}>
                    Monthly Payment (if financed)
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
                    ${(calculations.netSystemCost / (calculations.paybackPeriod * 12)).toFixed(0)}/mo
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '5px' }}>
                    For {calculations.paybackPeriod.toFixed(1)} years, then $0
                  </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#064e3b', marginBottom: '5px' }}>
                    Payment in Year 10
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
                    ${calculations.paybackPeriod > 10 ? (calculations.netSystemCost / (calculations.paybackPeriod * 12)).toFixed(0) : '0'}/mo
                  </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#064e3b', marginBottom: '5px' }}>
                    Payment in Year 25
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
                    $0/mo
                  </div>
                </div>
                <div style={{ 
                  borderTop: `2px solid ${BRAND_COLORS.success}`,
                  paddingTop: '15px',
                  marginTop: '15px'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#064e3b', marginBottom: '5px' }}>
                    Total Paid Over 25 Years
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#059669' }}>
                    {formatCurrency(calculations.netSystemCost)}
                  </div>
                </div>
                <div style={{ 
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#064e3b', fontWeight: '600', lineHeight: '1.6' }}>
                    ✅ You own it forever<br/>
                    ✅ Fixed costs, no rate increases<br/>
                    ✅ Battery backup for outages<br/>
                    ✅ Energy independence
                  </p>
                </div>
              </div>
            </div>

            {/* Savings Callout */}
            <div style={{ 
              marginTop: '30px',
              background: `linear-gradient(135deg, ${BRAND_COLORS.accent}, ${BRAND_COLORS.accentDark})`,
              color: BRAND_COLORS.primary,
              padding: '30px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 8px 20px rgba(201, 166, 72, 0.4)'
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '10px' }}>
                🎉 Your Total Savings by Going Solar
              </div>
              <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '10px' }}>
                {formatCurrency(calculations.totalSavingsVsDuke)}
              </div>
              <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                Over 25 years compared to staying with Duke Energy
              </div>
              <div style={{ 
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}>
                💰 That's enough to pay for a new car, home renovations, or your kids' college tuition
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={handleCTAClick}
            style={{
              background: `linear-gradient(135deg, ${BRAND_COLORS.accent}, ${BRAND_COLORS.accentDark})`,
              color: BRAND_COLORS.primary,
              padding: '20px 50px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(201, 166, 72, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            Stop Renting, Start Owning Your Power →
          </button>
          <p style={{ marginTop: '20px', color: '#718096', fontSize: '0.875rem' }}>
            © 2025 Admiral Energy • Charlotte, NC • Veteran-Owned & Operated
          </p>
        </div>
      </div>
    </div>
  );
};

export default SolarCalculator;