import React, { useState, useMemo } from 'react';
import { Sun, Zap, DollarSign, TrendingDown, TrendingUp, Award, CheckCircle, AlertTriangle, Lightbulb, Building2 } from 'lucide-react';

export default function SolarComparisonTool() {
  // helpers to coerce '' into 0 for safe arithmetic
  const safe = (v: number | '' | undefined) => (typeof v === 'number' ? v : 0);
  // initial defaults grouped for easy reset (start mostly blank to avoid baked-in quotes)
  const initialDefaults = {
    clientName: '',
    serviceAddress: '',
    dukeBill: '',
    dukeServiceFee: '',
    baseSystemCost: '',
    addersCost: '',
    batteryCost: '',
    systemSize: '',
    batteryIncluded: true,
    batterySizeKwh: '',
    solarOffset: '',
    solarServiceFee: '',
    loanPayment: '',
  };

  const [clientName, setClientName] = useState<string | ''>(initialDefaults.clientName);
  const [serviceAddress, setServiceAddress] = useState<string | ''>(initialDefaults.serviceAddress);

  // Duke Energy Side (editable by user)
  const [dukeBill, setDukeBill] = useState<number | ''>(initialDefaults.dukeBill as any);
  const [dukeServiceFee, setDukeServiceFee] = useState<number | ''>(initialDefaults.dukeServiceFee as any);
  const [autoApplyOffset, setAutoApplyOffset] = useState(true);
  const [dukeBillAfterOffsetManual, setDukeBillAfterOffsetManual] = useState<number | ''>('');

  // Solar Side - Base Costs
  const [baseSystemCost, setBaseSystemCost] = useState<number | ''>(initialDefaults.baseSystemCost as any);
  const [addersCost, setAddersCost] = useState<number | ''>(initialDefaults.addersCost as any);
  const [batteryCost, setBatteryCost] = useState<number | ''>(initialDefaults.batteryCost as any);
  
  // numeric coercions to avoid arithmetic on ''
  const nBaseSystemCost = safe(baseSystemCost);
  const nAddersCost = safe(addersCost);
  const nBatteryCost = safe(batteryCost);
  const hardCosts = nBaseSystemCost + nAddersCost + nBatteryCost;
  
  const [systemSize, setSystemSize] = useState<number | ''>(initialDefaults.systemSize as any);
  const [batteryIncluded, setBatteryIncluded] = useState(initialDefaults.batteryIncluded);
  const [batterySizeKwh, setBatterySizeKwh] = useState<number | ''>(initialDefaults.batterySizeKwh as any);
  const [solarOffset, setSolarOffset] = useState<number | ''>(initialDefaults.solarOffset as any);
  const [solarServiceFee, setSolarServiceFee] = useState<number | ''>(initialDefaults.solarServiceFee as any);
  const [loanPayment, setLoanPayment] = useState<number | ''>(initialDefaults.loanPayment as any);

  // top-level numeric aliases
  const nSystemSize = safe(systemSize);
  const nBatterySizeKwh = safe(batterySizeKwh);
  const nSolarOffset = safe(solarOffset);
  const nDukeBill = safe(dukeBill);
  const nDukeServiceFee = safe(dukeServiceFee);
  const nSolarServiceFee = safe(solarServiceFee);
  
  // Sungage Financing Options
  const sungageRates = [
    { rate: 9.74, dealerFee: 0, term: 25, label: "9.74% / 25yr (Zero Fee)" },
    { rate: 9.49, dealerFee: 653.75, term: 25, label: "9.49% / 25yr" },
    { rate: 8.99, dealerFee: 1227.89, term: 25, label: "8.99% / 25yr" },
    { rate: 7.99, dealerFee: 2609.89, term: 25, label: "7.99% / 25yr" },
    { rate: 6.99, dealerFee: 4326.40, term: 25, label: "6.99% / 25yr" },
    { rate: 5.99, dealerFee: 6133.32, term: 25, label: "5.99% / 25yr" },
    { rate: 3.99, dealerFee: 10406.55, term: 25, label: "3.99% / 25yr" },
    { rate: 2.99, dealerFee: 9492.34, term: 15, label: "2.99% / 15yr (Best Value)" }
  ];
  
  const [useSungageFinancing, setUseSungageFinancing] = useState(true);
  const [selectedSungageRate, setSelectedSungageRate] = useState(7); // Default to 2.99%
  const [customLoanRate, setCustomLoanRate] = useState(3.99);
  const [customLoanTerm, setCustomLoanTerm] = useState(25);
  const [customDealerFee, setCustomDealerFee] = useState(0);
  
  // Get current financing terms
  const currentFinancing = useMemo(() => {
    if (useSungageFinancing) {
      const selected = sungageRates[selectedSungageRate];
      return {
        rate: selected.rate,
        term: selected.term,
        dealerFee: selected.dealerFee
      };
    } else {
      return {
        rate: customLoanRate,
        term: customLoanTerm,
        dealerFee: customDealerFee
      };
    }
  }, [useSungageFinancing, selectedSungageRate, customLoanRate, customLoanTerm, customDealerFee]);
  
  const quotedAmount = hardCosts + currentFinancing.dealerFee;
  const loanRate = currentFinancing.rate;
  const loanTerm = currentFinancing.term;
  
  // Incentives
  const [applyITC, setApplyITC] = useState(true);
  const [applyPowerPair, setApplyPowerPair] = useState(true);
  
  // Deal Optimization Options
  const [applyTOUSavings, setApplyTOUSavings] = useState(false);
  const [touOnPeakRate, setTouOnPeakRate] = useState(0.22);
  const [touOffPeakRate, setTouOffPeakRate] = useState(0.10);
  const [touCycleDays, setTouCycleDays] = useState(250);
  
  // TOU Arbitrage Calculation
  const touSavings = useMemo(() => {
  if (!applyTOUSavings || !batteryIncluded) return { monthly: 0, annual: 0 };
    
  const usableKwh = safe(batterySizeKwh) * 0.9;
    const dailyArbitrage = usableKwh * (touOnPeakRate - touOffPeakRate);
    const annual = dailyArbitrage * touCycleDays;
    
    return {
      annual,
      monthly: annual / 12
    };
  }, [applyTOUSavings, batteryIncluded, batterySizeKwh, touOnPeakRate, touOffPeakRate, touCycleDays]);

  // derived duke bill after offset (single source of truth)
  const offsetPct = safe(solarOffset);
  const dukeBillAfterSolar = useMemo(() => {
    const bill = safe(dukeBill);
    const computed = Math.max(0, bill * (1 - offsetPct / 100));
    if (!autoApplyOffset && typeof dukeBillAfterOffsetManual === 'number') return dukeBillAfterOffsetManual;
    return computed;
  }, [dukeBill, offsetPct, autoApplyOffset, dukeBillAfterOffsetManual]);
  
  // Calculate incentives
  const incentives = useMemo(() => {
  const itcAmount = applyITC ? quotedAmount * 0.30 : 0;

  const powerPairSolarWatts = Math.min(nSystemSize, 10) * 1000;
  const powerPairSolarRebate = applyPowerPair ? powerPairSolarWatts * 0.36 : 0;

  const powerPairBatteryKwh = batteryIncluded ? Math.min(nBatterySizeKwh, 13.5) : 0;
  const powerPairBatteryRebate = applyPowerPair ? powerPairBatteryKwh * 400 : 0;
    
    const totalPowerPairRebate = powerPairSolarRebate + powerPairBatteryRebate;
    const totalIncentives = itcAmount + totalPowerPairRebate;
    const effectiveCost = quotedAmount - totalIncentives;
    
    return {
      itcAmount,
      powerPairSolarRebate,
      powerPairBatteryRebate,
      totalPowerPairRebate,
      totalIncentives,
      effectiveCost
    };
  }, [quotedAmount, systemSize, batteryIncluded, batterySizeKwh, applyITC, applyPowerPair]);
  
  const loanPrincipal = incentives.effectiveCost;
  
  const monthlyLoanPayment = useMemo(() => {
    const principal = loanPrincipal;
    const monthlyRate = loanRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    if (monthlyRate === 0) return principal / numberOfPayments;
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }, [loanPrincipal, loanRate, loanTerm]);
  
  const projections = useMemo(() => {
    const months = 300;
    const annualIncrease = 0.04;
    const monthlyRate = loanRate / 100 / 12;
    const loanMonths = loanTerm * 12;
    
    let dukeTotal = 0;
    let solarTotal = 0;
    let remainingBalance = loanPrincipal;
    
  const offsetDukeBill = safe(dukeBill) * (1 - safe(solarOffset) / 100);
    
    let dukeCosts = [];
    let solarCosts = [];
    let interestPayments = [];
    
    for (let month = 1; month <= months; month++) {
      const year = Math.floor((month - 1) / 12);
      const yearFactor = Math.pow(1 + annualIncrease, year);
  const dukeMonthly = (safe(dukeBill) * yearFactor) + safe(dukeServiceFee);
      dukeTotal += dukeMonthly;
      dukeCosts.push(dukeTotal);
      
      let solarMonthly;
      let interestThisMonth = 0;
      
      if (month <= loanMonths) {
        interestThisMonth = remainingBalance * monthlyRate;
        const principalThisMonth = monthlyLoanPayment - interestThisMonth;
        remainingBalance = Math.max(0, remainingBalance - principalThisMonth);
        
  const solarUtilityBill = offsetDukeBill * yearFactor;
  const touSavingsThisMonth = applyTOUSavings ? (touSavings.monthly * yearFactor) : 0;
  solarMonthly = solarUtilityBill + safe(solarServiceFee) + safe(monthlyLoanPayment) - touSavingsThisMonth;
      } else {
  const solarUtilityBill = offsetDukeBill * yearFactor;
  const touSavingsThisMonth = applyTOUSavings ? (touSavings.monthly * yearFactor) : 0;
  solarMonthly = solarUtilityBill + safe(solarServiceFee) - touSavingsThisMonth;
      }
      
      solarTotal += solarMonthly;
      solarCosts.push(solarTotal);
      interestPayments.push(interestThisMonth);
    }
    
    return {
      duke5: dukeCosts[59],
      duke10: dukeCosts[119],
      duke25: dukeCosts[299],
      solar5: solarCosts[59],
      solar10: solarCosts[119],
      solar25: solarCosts[299],
      totalInterest: interestPayments.reduce((a, b) => a + b, 0),
      interest5: interestPayments.slice(0, 60).reduce((a, b) => a + b, 0),
      interest10: interestPayments.slice(0, 120).reduce((a, b) => a + b, 0),
      interest25: interestPayments.reduce((a, b) => a + b, 0),
      offsetDukeBill,
      dukeCosts,
      solarCosts,
      loanMonths,
  monthlyAfterLoan: (safe(dukeBill) * (1 - safe(solarOffset) / 100)) * Math.pow(1 + annualIncrease, loanTerm) + safe(solarServiceFee) - (applyTOUSavings ? touSavings.monthly * Math.pow(1 + annualIncrease, loanTerm) : 0)
    };
  }, [dukeBill, dukeServiceFee, loanPrincipal, solarOffset, loanRate, loanTerm, solarServiceFee, monthlyLoanPayment, touSavings, applyTOUSavings]);
  
  const savings = {
    five: projections.duke5 - projections.solar5,
    ten: projections.duke10 - projections.solar10,
    twentyFive: projections.duke25 - projections.solar25
  };

  const breakevenMonth = useMemo(() => {
    for (let i = 0; i < projections.dukeCosts.length; i++) {
      if (projections.solarCosts[i] < projections.dukeCosts[i]) {
        return i + 1;
      }
    }
    return null;
  }, [projections]);

  const roiAnalysis = useMemo(() => {
    const totalPaid = monthlyLoanPayment * loanTerm * 12 + projections.totalInterest;
    const netCost = loanPrincipal;
    const roi25Year = (savings.twentyFive / (netCost + projections.interest25)) * 100;
    
    return {
      totalPaid,
      netCost,
      roi25Year,
      effectiveDiscount: (incentives.totalIncentives / quotedAmount) * 100,
      dealerFeeImpact: (currentFinancing.dealerFee / quotedAmount) * 100
    };
  }, [quotedAmount, incentives.totalIncentives, savings.twentyFive, projections.totalInterest, monthlyLoanPayment, loanTerm, projections.interest25, loanPrincipal, currentFinancing.dealerFee]);

  // ensure numeric operations are safe even when inputs are blank
  const effectiveMonthlyCost = safe(projections.offsetDukeBill) + safe(solarServiceFee) + safe(monthlyLoanPayment) - touSavings.monthly;
  const monthlyDifference = safe(dukeBill) + safe(dukeServiceFee) - effectiveMonthlyCost;

  // alias the derived duke bill from dukeBillAfterSolar so we have the expected name in the UI
  const dukeBillAfterOffset = dukeBillAfterSolar;

  const recommendations = useMemo(() => {
    const issues = [];
    const solutions = [];
    
    if (savings.twentyFive < 0) {
      issues.push("System will cost MORE than staying with Duke Energy over 25 years");
      solutions.push("Apply all available incentives (ITC + PowerPair)");
      solutions.push("Consider a lower interest rate option");
      solutions.push("Increase system size if roof space allows");
    }
    
    if (roiAnalysis.roi25Year < 20 && savings.twentyFive > 0) {
      issues.push("ROI is below 20% - very modest returns");
      solutions.push("Enable TOU rate arbitrage if customer has time-of-use rates");
      solutions.push("Consider shorter loan term for less interest");
      solutions.push("Select a better interest rate option");
    }
    
    if (safe(solarOffset) < 50) {
      issues.push(`Solar offset is only ${safe(solarOffset)}% - customer still heavily dependent on grid`);
      solutions.push("Increase system size to 75-95% offset for better savings");
      solutions.push("Consider ground mount or carport if roof space limited");
    }
    
    if (monthlyDifference < -20) {
      issues.push(`First year cost is $${Math.abs(monthlyDifference).toFixed(0)}/month MORE than current bill`);
      solutions.push("Emphasize equity building and long-term savings");
      if (!applyTOUSavings && batteryIncluded) {
        solutions.push("Enable TOU arbitrage savings to improve monthly costs");
      }
    }
    
    if (!applyPowerPair) {
      const potentialPowerPair = (Math.min(nSystemSize, 10) * 1000 * 0.36) + (batteryIncluded ? Math.min(nBatterySizeKwh, 13.5) * 400 : 0);
      issues.push("PowerPair rebates not applied - missing significant incentives");
      solutions.push(`Enable PowerPair rebates (worth $${potentialPowerPair.toFixed(0)})`);
    }
    
    if (!applyITC) {
      issues.push("Federal ITC not applied - missing 30% tax credit");
      solutions.push(`Enable Federal ITC (worth $${(quotedAmount * 0.30).toFixed(0)})`);
    }
    
    const goodDeal = savings.twentyFive > 0 && roiAnalysis.roi25Year > 50;
    const excellentDeal = savings.twentyFive > 0 && roiAnalysis.roi25Year > 100;
    
    return {
      issues,
      solutions,
      goodDeal,
      excellentDeal,
      hasIssues: issues.length > 0
    };
  }, [savings.twentyFive, roiAnalysis.roi25Year, solarOffset, monthlyDifference, applyPowerPair, applyITC, applyTOUSavings, batteryIncluded, systemSize, batterySizeKwh, quotedAmount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sun className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl font-bold text-gray-800">Solar Energy Analysis</h1>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Service Address</label>
              <input
                type="text"
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* System Cost Breakdown */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Solar System Details & Costs
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Base System Cost ($)</label>
              <input
                type="number"
                value={baseSystemCost}
                onChange={(e) => setBaseSystemCost(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-white/30 bg-white/20 rounded-lg focus:border-white focus:outline-none text-white placeholder-white/60"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Adders Cost ($)</label>
              <input
                type="number"
                value={addersCost}
                onChange={(e) => setAddersCost(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-white/30 bg-white/20 rounded-lg focus:border-white focus:outline-none text-white placeholder-white/60"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Battery Cost ($)</label>
              <input
                type="number"
                value={batteryCost}
                onChange={(e) => setBatteryCost(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-white/30 bg-white/20 rounded-lg focus:border-white focus:outline-none text-white placeholder-white/60"
              />
            </div>
            <div className="bg-white/30 rounded-lg p-3">
              <label className="block text-sm font-semibold mb-1">Hard Costs Subtotal</label>
              <p className="text-2xl font-bold">${hardCosts.toLocaleString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="block text-sm font-semibold mb-2">System Size (kW)</label>
              <input
                type="number"
                step="0.1"
                value={systemSize}
                onChange={(e) => setSystemSize(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-white/30 bg-white/20 rounded-lg focus:border-white focus:outline-none text-white placeholder-white/60"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Battery Included</label>
              <select
                value={batteryIncluded ? 'yes' : 'no'}
                onChange={(e) => setBatteryIncluded(e.target.value === 'yes')}
                className="w-full px-4 py-3 border-2 border-white/30 bg-white/20 rounded-lg focus:border-white focus:outline-none text-white"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Battery Size (kWh)</label>
              <input
                type="number"
                step="0.1"
                value={batterySizeKwh}
                onChange={(e) => setBatterySizeKwh(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-white/30 bg-white/20 rounded-lg focus:border-white focus:outline-none text-white placeholder-white/60"
                disabled={!batteryIncluded}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Solar Offset (%)</label>
              <input
                type="number"
                value={solarOffset}
                onChange={(e) => setSolarOffset(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-white/30 bg-white/20 rounded-lg focus:border-white focus:outline-none text-white placeholder-white/60"
              />
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* full canonical UI continues (identical to src/pages/SolarComparisonTool.tsx) */}
=======
        {/* Sungage Financing Options */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Sungage Financing Options</h2>
          </div>
          
          <div className="bg-white/20 backdrop-blur rounded-xl p-6 mb-6">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={useSungageFinancing}
                onChange={(e) => setUseSungageFinancing(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="text-lg font-semibold">Use Sungage Financing (with dealer fee schedule)</span>
            </label>
            
            {useSungageFinancing && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Select Interest Rate & Term</label>
                  <select
                    value={selectedSungageRate}
                    onChange={(e) => setSelectedSungageRate(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-white/30 bg-white/20 rounded-lg focus:border-white focus:outline-none text-white text-lg"
                  >
                    {sungageRates.map((rate, idx) => (
                      <option key={idx} value={idx}>
                        {rate.label} - Dealer Fee: ${rate.dealerFee.toFixed(0)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="bg-white/30 rounded-lg p-4">
                  <h3 className="font-bold mb-3">Current Selection:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="opacity-80">Interest Rate:</p>
                      <p className="text-2xl font-bold">{currentFinancing.rate}%</p>
                    </div>
                    <div>
                      <p className="opacity-80">Loan Term:</p>
                      <p className="text-2xl font-bold">{currentFinancing.term} years</p>
                    </div>
                    <div>
                      <p className="opacity-80">Dealer Fee:</p>
                      <p className="text-2xl font-bold">${currentFinancing.dealerFee.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="opacity-80">Gross Price:</p>
                      <p className="text-2xl font-bold">${quotedAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {!useSungageFinancing && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Custom Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customLoanRate}
                    onChange={(e) => setCustomLoanRate(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-white/30 bg-white/20 rounded-lg focus:border-white focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Term (years)</label>
                  <input
                    type="number"
                    value={customLoanTerm}
                    onChange={(e) => setCustomLoanTerm(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-white/30 bg-white/20 rounded-lg focus:border-white focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Dealer Fee ($)</label>
                  <input
                    type="number"
                    value={customDealerFee}
                    onChange={(e) => setCustomDealerFee(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-white/30 bg-white/20 rounded-lg focus:border-white focus:outline-none text-white"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-yellow-400/20 border-2 border-yellow-300 rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">💡 Sungage Dealer Fee Pattern:</p>
            <p className="text-xs opacity-90">
              Dealer fees increase as interest rates decrease (25-year loans). The 2.99% / 15-year option has a subsidized dealer fee despite the lowest rate. This is systematic, not random.
            </p>
          </div>
        </div>

        {/* Deal Optimization Strategies */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Deal Optimization Strategies</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/20 backdrop-blur rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">TOU Rate Arbitrage</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyTOUSavings}
                    onChange={(e) => setApplyTOUSavings(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm">Apply Time-of-Use savings</span>
                </label>
                {applyTOUSavings && (
                  <>
                    <div>
                      <label className="block text-xs mb-1">Peak Rate ($/kWh)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={touOnPeakRate}
                        onChange={(e) => setTouOnPeakRate(Number(e.target.value))}
                        className="w-full px-3 py-2 border-2 border-white/30 bg-white/20 rounded-lg text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Off-Peak Rate ($/kWh)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={touOffPeakRate}
                        onChange={(e) => setTouOffPeakRate(Number(e.target.value))}
                        className="w-full px-3 py-2 border-2 border-white/30 bg-white/20 rounded-lg text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Cycle Days/Year</label>
                      <input
                        type="number"
                        value={touCycleDays}
                        onChange={(e) => setTouCycleDays(Number(e.target.value))}
                        className="w-full px-3 py-2 border-2 border-white/30 bg-white/20 rounded-lg text-white text-sm"
                      />
                    </div>
                    <div className="text-sm font-bold pt-2 border-t border-white/30">
                      Monthly Savings: ${touSavings.monthly.toFixed(2)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.hasIssues && (
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Deal Analysis & Recommendations</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/20 backdrop-blur rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Issues Identified
                </h3>
                <ul className="space-y-2">
                  {recommendations.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-yellow-300 font-bold">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white/20 backdrop-blur rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Recommended Solutions
                </h3>
                <ul className="space-y-2">
                  {recommendations.solutions.map((solution, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-green-300 font-bold">✓</span>
                      <span>{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Incentives Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Available Incentives</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/20 backdrop-blur rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Federal 30% ITC</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyITC}
                    onChange={(e) => setApplyITC(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm">Apply</span>
                </label>
              </div>
              <p className="text-sm mb-3">Investment Tax Credit - 30% of system cost</p>
              <div className="text-3xl font-bold">
                {applyITC ? `-$${incentives.itcAmount.toFixed(0)}` : '$0'}
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Duke PowerPair Rebate</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyPowerPair}
                    onChange={(e) => setApplyPowerPair(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm">Apply</span>
                </label>
              </div>
              <div className="text-sm space-y-2 mb-3">
                <div className="flex justify-between">
                  <span>Solar: ${(Math.min(nSystemSize, 10) * 1000 * 0.36).toFixed(0)}</span>
                  <span className="text-xs opacity-80">($0.36/watt up to 10kW)</span>
                </div>
                {batteryIncluded && (
                  <div className="flex justify-between">
                    <span>Battery: ${(Math.min(nBatterySizeKwh, 13.5) * 400).toFixed(0)}</span>
                    <span className="text-xs opacity-80">($400/kWh up to 13.5kWh)</span>
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold">
                {applyPowerPair ? `-$${incentives.totalPowerPairRebate.toFixed(0)}` : '$0'}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hard Costs</p>
                <p className="text-2xl font-bold">${hardCosts.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Dealer Fee ({currentFinancing.rate}%)</p>
                <p className="text-2xl font-bold text-blue-600">+${currentFinancing.dealerFee.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-1">{roiAnalysis.dealerFeeImpact.toFixed(1)}% of total</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Incentives</p>
                <p className="text-2xl font-bold text-green-600">-${incentives.totalIncentives.toFixed(0)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Effective Cost (Loan Amount)</p>
                <p className="text-3xl font-bold text-green-700">${incentives.effectiveCost.toFixed(0)}</p>
                <p className="text-xs text-green-600 mt-1">
                  {roiAnalysis.effectiveDiscount.toFixed(1)}% discount from incentives!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Duke Energy */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Duke Energy (Increasing)
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b-2 border-gray-200">
                <label className="font-semibold text-gray-700">Duke Bill (Today):</label>
                <input
                  type="number"
                  value={dukeBill}
                  onChange={(e) => setDukeBill(Number(e.target.value))}
                  className="w-32 px-3 py-2 border-2 border-gray-200 rounded-lg text-right focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-between items-center pb-3 border-b-2 border-gray-200">
                <label className="font-semibold text-gray-700">Duke Bill (after offset):</label>
                {autoApplyOffset ? (
                  <span className="text-gray-900 font-bold">${dukeBillAfterOffset.toFixed(2)}</span>
                ) : (
                  <input
                    type="number"
                    value={dukeBillAfterOffsetManual ?? dukeBillAfterOffset}
                    onChange={(e) => setDukeBillAfterOffsetManual(Number(e.target.value))}
                    className="w-32 px-3 py-2 border-2 border-gray-200 rounded-lg text-right focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>
              <div className="flex items-center gap-3 py-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={autoApplyOffset} onChange={(e) => setAutoApplyOffset(e.target.checked)} className="w-4 h-4" />
                  Auto-apply solar offset to Duke bill
                </label>
              </div>
              <div className="flex justify-between items-center pb-3 border-b-2 border-gray-200">
                <label className="font-semibold text-gray-700">Service Fee:</label>
                <input
                  type="number"
                  value={dukeServiceFee}
                  onChange={(e) => setDukeServiceFee(Number(e.target.value))}
                  className="w-32 px-3 py-2 border-2 border-gray-200 rounded-lg text-right focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-between items-center pb-3 border-b-2 border-gray-200">
                <label className="font-semibold text-gray-700">Loan Payment:</label>
                <span className="text-gray-900 font-bold">$0.00</span>
              </div>
              <div className="flex justify-between items-center pt-3 bg-blue-50 p-4 rounded-lg">
                <label className="text-xl font-bold text-blue-800">Total (Month 1):</label>
                <span className="text-2xl font-bold text-blue-900">
                  ${(safe(dukeBill) + safe(dukeServiceFee)).toFixed(2)}/mo
                </span>
              </div>
              <div className="mt-4 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <p className="text-sm font-semibold text-red-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Increases 4% annually
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Year 10: ${((safe(dukeBill) * Math.pow(1.04, 10)) + safe(dukeServiceFee)).toFixed(2)}/mo
                </p>
                <p className="text-xs text-red-700">
                  Year 25: ${((safe(dukeBill) * Math.pow(1.04, 25)) + safe(dukeServiceFee)).toFixed(2)}/mo
                </p>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  className="px-4 py-2 bg-gray-100 rounded border text-sm"
                  onClick={() => {
                    // reset to initial defaults (set numeric fields to blank '')
                    setClientName('');
                    setServiceAddress('');
                    setDukeBill('');
                    setDukeServiceFee('');
                    setBaseSystemCost('');
                    setAddersCost('');
                    setBatteryCost('');
                    setSystemSize('');
                    setBatteryIncluded(true);
                    setBatterySizeKwh('');
                    setSolarOffset('');
                    setSolarServiceFee('');
                    setLoanPayment('');
                    setAutoApplyOffset(true);
                    setDukeBillAfterOffsetManual('');
                  }}
                >
                  Clear all fields
                </button>
              </div>
            </div>
          </div>

          {/* Solar */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-800 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-6 h-6" />
                Solar (Decreasing)
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b-2 border-gray-200">
                <label className="font-semibold text-gray-700">Duke Bill ({solarOffset}% offset):</label>
                <span className="text-gray-900 font-bold">
                  ${projections.offsetDukeBill.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b-2 border-gray-200">
                <label className="font-semibold text-gray-700">Service Fee:</label>
                <input
                  type="number"
                  value={solarServiceFee}
                  onChange={(e) => setSolarServiceFee(Number(e.target.value))}
                  className="w-32 px-3 py-2 border-2 border-gray-200 rounded-lg text-right focus:border-green-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-between items-center pb-3 border-b-2 border-gray-200">
                <label className="font-semibold text-gray-700">Loan Payment:</label>
                <span className="text-gray-900 font-bold">${monthlyLoanPayment.toFixed(2)}</span>
              </div>
              {applyTOUSavings && touSavings.monthly > 0 && (
                <div className="flex justify-between items-center pb-3 border-b-2 border-green-200 bg-green-50 -mx-6 px-6 py-2">
                  <label className="font-semibold text-green-700">TOU Arbitrage:</label>
                  <span className="text-green-700 font-bold">-${touSavings.monthly.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 bg-green-50 p-4 rounded-lg">
                <label className="text-xl font-bold text-green-800">
                  {applyTOUSavings ? 'Effective Cost:' : 'Total (Month 1):'}
                </label>
                <span className="text-2xl font-bold text-green-900">
                  ${effectiveMonthlyCost.toFixed(2)}/mo
                </span>
              </div>
              <div className={`mt-4 p-4 rounded-lg border-2 ${monthlyDifference >= 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <p className={`text-sm font-semibold flex items-center gap-2 ${monthlyDifference >= 0 ? 'text-green-800' : 'text-orange-800'}`}>
                  {monthlyDifference >= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  {monthlyDifference >= 0 ? 'Immediate Savings' : 'Building Equity'}
                </p>
                <p className={`text-xs mt-1 ${monthlyDifference >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                  {monthlyDifference >= 0 
                    ? `Saving $${monthlyDifference.toFixed(2)}/month from day one!`
                    : `Paying $${Math.abs(monthlyDifference).toFixed(2)}/month more, but building equity in your system`
                  }
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  After loan payoff (Year {loanTerm}): ${projections.monthlyAfterLoan.toFixed(2)}/mo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Banner for Bad Deals */}
        {savings.twentyFive < 0 && (
          <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl shadow-xl p-6 mb-8 text-white">
            <div className="flex items-center gap-3">
              <div className="text-4xl">⚠️</div>
              <div>
                <h2 className="text-2xl font-bold mb-2">WARNING: This Quote Will Cost You Money!</h2>
                <p className="text-lg">
                  Based on this proposal, you'll pay ${Math.abs(savings.twentyFive).toFixed(0)} MORE over 25 years than staying with Duke Energy. 
                  Review the recommendations above to improve this deal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Breakeven Alert */}
        {breakevenMonth && breakevenMonth <= 300 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8" />
              <div>
                <h3 className="text-2xl font-bold">Breakeven Point Reached!</h3>
                <p className="text-lg">
                  Solar becomes cheaper than Duke Energy in month {breakevenMonth} 
                  ({Math.floor(breakevenMonth / 12)} years, {breakevenMonth % 12} months)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Deal Analysis */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Deal Quality Assessment</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/20 backdrop-blur rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Effective System Cost</h3>
              <p className="text-4xl font-bold mb-2">${incentives.effectiveCost.toFixed(0)}</p>
              <p className="text-sm opacity-90">
                After ${incentives.totalIncentives.toFixed(0)} in incentives
              </p>
            </div>
            
            <div className="bg-white/20 backdrop-blur rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">25-Year Savings</h3>
              <p className={`text-4xl font-bold mb-2 ${savings.twentyFive > 0 ? 'text-yellow-300' : 'text-red-300'}`}>
                {savings.twentyFive > 0 ? '+' : ''}${savings.twentyFive.toFixed(0)}
              </p>
              <p className="text-sm opacity-90">
                {savings.twentyFive > 0 ? 'Total saved vs Duke Energy' : 'Additional cost vs Duke Energy'}
              </p>
            </div>
            
            <div className="bg-white/20 backdrop-blur rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Return on Investment</h3>
              <p className={`text-4xl font-bold mb-2 ${roiAnalysis.roi25Year > 0 ? 'text-green-300' : 'text-red-300'}`}>
                {roiAnalysis.roi25Year.toFixed(0)}%
              </p>
              <p className="text-sm opacity-90">
                Over 25 years
              </p>
            </div>
          </div>
          
          <div className="mt-6 bg-white rounded-xl p-6 text-gray-800">
            <h3 className="text-xl font-bold mb-4">The Bottom Line</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${savings.twentyFive > 0 ? 'text-green-600' : 'text-red-600'}`} />
                <p>
                  <span className="font-semibold">Financing:</span> {currentFinancing.rate}% rate over {currentFinancing.term} years with ${currentFinancing.dealerFee.toFixed(0)} dealer fee ({roiAnalysis.dealerFeeImpact.toFixed(1)}% of system cost).
                  Total incentives of ${incentives.totalIncentives.toFixed(0)} ({roiAnalysis.effectiveDiscount.toFixed(1)}% off) brings effective cost to ${incentives.effectiveCost.toFixed(0)}.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${savings.twentyFive > 0 ? 'text-green-600' : 'text-red-600'}`} />
                <p>
                  <span className="font-semibold">Monthly Impact:</span>
                  {monthlyDifference >= 0 
                    ? ` Saving $${monthlyDifference.toFixed(2)}/month from day one!`
                    : ` Paying $${Math.abs(monthlyDifference).toFixed(2)}/month more initially, but building equity.`
                  }
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${savings.twentyFive > 0 ? 'text-green-600' : 'text-red-600'}`} />
                <p>
                  <span className="font-semibold">Long-term Value:</span> Over 25 years, you'll {savings.twentyFive > 0 ? 'save' : 'pay'} ${Math.abs(savings.twentyFive).toFixed(0)} 
                  compared to Duke Energy - that's a {roiAnalysis.roi25Year.toFixed(0)}% return on your investment.
                </p>
              </div>
              {breakevenMonth && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <span className="font-semibold">Break-even:</span> You'll reach cumulative break-even in month {breakevenMonth} 
                    ({Math.floor(breakevenMonth / 12)} years, {breakevenMonth % 12} months).
                  </p>
                </div>
              )}
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold">After Loan Payoff:</span> In year {loanTerm + 1} and beyond, your monthly energy cost 
                  drops to just ${projections.monthlyAfterLoan.toFixed(2)}/month while Duke customers are paying 
                  ${((safe(dukeBill) * Math.pow(1.04, loanTerm)) + safe(dukeServiceFee)).toFixed(2)}/month.
                </p>
              </div>
              {applyTOUSavings && touSavings.annual > 0 && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <span className="font-semibold">TOU Arbitrage Bonus:</span> Battery saves an additional ${touSavings.annual.toFixed(0)}/year 
                    (${touSavings.monthly.toFixed(2)}/month) by charging at off-peak rates and discharging during peak hours.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg border-2 border-green-300">
              <p className="text-lg font-bold text-green-800 text-center mb-2">
                {recommendations.excellentDeal
                  ? "✅ EXCELLENT DEAL - Strong recommendation!" 
                  : recommendations.goodDeal
                  ? "✅ GOOD DEAL - Solid investment!"
                  : savings.twentyFive > 0 && roiAnalysis.roi25Year > 20
                  ? "⚠️ MARGINAL - Very modest returns"
                  : savings.twentyFive > 0 
                  ? "⚠️ POOR - Minimal savings, consider alternatives"
                  : "❌ NOT RECOMMENDED - You will lose money"}
              </p>
              {savings.twentyFive < 0 && (
                <p className="text-sm text-red-700 text-center mt-2">
                  System is too small ({solarOffset}% offset) for the investment. Review recommendations above to improve this deal.
                </p>
              )}
              {savings.twentyFive > 0 && roiAnalysis.roi25Year < 20 && (
                <p className="text-sm text-orange-700 text-center mt-2">
                  System only offsets {solarOffset}% of usage. Consider increasing system size or trying a better financing option.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Long-term Projections */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            Cumulative Cost Analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 5 Year */}
            <div className="border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">5 Year Total</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Duke Energy</p>
                  <p className="text-xs text-gray-500 mb-2">Bills increasing at 4%/year</p>
                  <p className="text-2xl font-bold text-blue-800">${projections.duke5.toFixed(0)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Solar</p>
                  <p className="text-xs text-gray-500 mb-2">Interest charges decreasing</p>
                  <p className="text-2xl font-bold text-green-800">${projections.solar5.toFixed(0)}</p>
                  <p className="text-xs text-green-600 mt-2 font-semibold">Interest paid: ${projections.interest5.toFixed(0)}</p>
                </div>
                <div className={`p-4 rounded-lg ${savings.five > 0 ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <p className="text-sm text-gray-600 mb-1">{savings.five > 0 ? 'Your Savings' : 'Investment Period'}</p>
                  <p className={`text-2xl font-bold ${savings.five > 0 ? 'text-green-700' : 'text-orange-700'}`}>
                    {savings.five > 0 ? '+' : ''} ${savings.five.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>

            {/* 10 Year */}
            <div className="border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">10 Year Total</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Duke Energy</p>
                  <p className="text-xs text-gray-500 mb-2">Bills increasing at 4%/year</p>
                  <p className="text-2xl font-bold text-blue-800">${projections.duke10.toFixed(0)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Solar</p>
                  <p className="text-xs text-gray-500 mb-2">Interest charges decreasing</p>
                  <p className="text-2xl font-bold text-green-800">${projections.solar10.toFixed(0)}</p>
                  <p className="text-xs text-green-600 mt-2 font-semibold">Interest paid: ${projections.interest10.toFixed(0)}</p>
                </div>
                <div className={`p-4 rounded-lg ${savings.ten > 0 ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <p className="text-sm text-gray-600 mb-1">{savings.ten > 0 ? 'Your Savings' : 'Investment Period'}</p>
                  <p className={`text-2xl font-bold ${savings.ten > 0 ? 'text-green-700' : 'text-orange-700'}`}>
                    {savings.ten > 0 ? '+' : ''} ${savings.ten.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>

            {/* 25 Year */}
            <div className="border-2 border-green-300 rounded-xl p-6 bg-green-50">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">25 Year Total</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Duke Energy</p>
                  <p className="text-xs text-gray-500 mb-2">Bills increasing at 4%/year</p>
                  <p className="text-2xl font-bold text-blue-800">${projections.duke25.toFixed(0)}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Solar</p>
                  <p className="text-xs text-gray-500 mb-2">Loan paid off - minimal costs!</p>
                  <p className="text-2xl font-bold text-green-800">${projections.solar25.toFixed(0)}</p>
                  <p className="text-xs text-green-600 mt-2 font-semibold">Total interest: ${projections.interest25.toFixed(0)}</p>
                </div>
                <div className={`p-4 rounded-lg ${savings.twentyFive > 0 ? 'bg-green-200' : 'bg-red-100'}`}>
                  <p className="text-sm text-gray-600 mb-1">{savings.twentyFive > 0 ? 'Total Savings' : 'Total Loss'}</p>
                  <p className={`text-3xl font-bold ${savings.twentyFive > 0 ? 'text-green-800' : 'text-red-800'}`}>
                    {savings.twentyFive > 0 ? '+' : ''}${savings.twentyFive.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-yellow-100 to-green-100 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-700" />
              <h3 className="text-xl font-bold text-gray-800">Financial Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">System hard costs:</span>
                  <span className="font-bold text-gray-800">${hardCosts.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-blue-700">
                  <span>Dealer fee ({currentFinancing.rate}%):</span>
                  <span className="font-bold">+${currentFinancing.dealerFee.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Federal ITC (30%):</span>
                  <span className="font-bold">-${incentives.itcAmount.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>PowerPair Rebate:</span>
                  <span className="font-bold">-${incentives.totalPowerPairRebate.toFixed(0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t-2 border-green-300">
                  <span className="font-semibold text-gray-800">Effective cost (financed):</span>
                  <span className="font-bold text-green-700">${incentives.effectiveCost.toFixed(0)}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Monthly loan payment:</span>
                  <span className="font-bold text-gray-800">${monthlyLoanPayment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Total interest paid:</span>
                  <span className="font-bold text-orange-700">${projections.totalInterest.toFixed(0)}</span>
                </div>
                {applyTOUSavings && touSavings.annual > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Annual TOU savings:</span>
                    <span className="font-bold">${touSavings.annual.toFixed(0)}/year</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t-2 border-green-300">
                  <span className="text-gray-700">After payoff (Year {loanTerm}):</span>
                  <span className="font-bold text-green-700">${projections.monthlyAfterLoan.toFixed(2)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">25-year ROI:</span>
                  <span className={`font-bold ${roiAnalysis.roi25Year > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {roiAnalysis.roi25Year.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
>>>>>>> origin/fix/advisor-sync-canonical
      </div>
    </div>
  );
}
