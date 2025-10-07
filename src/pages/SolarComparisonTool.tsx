import React, { useState, useMemo } from 'react';
import { Sun, Zap, DollarSign, TrendingDown, TrendingUp, Award, CheckCircle, AlertTriangle, Lightbulb, Building2 } from 'lucide-react';

export default function SolarComparisonTool() {
  const [clientName, setClientName] = useState('Matthew Parker');
  const [serviceAddress, setServiceAddress] = useState('1222 Tredenham Way, Durham, North Carolina, 27703, United States');
  
  // Duke Energy Side
  const [dukeBill, setDukeBill] = useState(205.04);
  const [dukeServiceFee, setDukeServiceFee] = useState(0);
  
  // Solar Side - Base Costs
  const [baseSystemCost, setBaseSystemCost] = useState(9200);
  const [addersCost, setAddersCost] = useState(1288);
  const [batteryCost, setBatteryCost] = useState(10650);
  
  const hardCosts = baseSystemCost + addersCost + batteryCost;
  
  const [systemSize, setSystemSize] = useState(3.68);
  const [batteryIncluded, setBatteryIncluded] = useState(true);
  const [batterySizeKwh, setBatterySizeKwh] = useState(5);
  const [solarOffset, setSolarOffset] = useState(30);
  const [solarServiceFee, setSolarServiceFee] = useState(0);
  
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
    
    const usableKwh = batterySizeKwh * 0.9;
    const dailyArbitrage = usableKwh * (touOnPeakRate - touOffPeakRate);
    const annual = dailyArbitrage * touCycleDays;
    
    return {
      annual,
      monthly: annual / 12
    };
  }, [applyTOUSavings, batteryIncluded, batterySizeKwh, touOnPeakRate, touOffPeakRate, touCycleDays]);
  
  // Calculate incentives
  const incentives = useMemo(() => {
    const itcAmount = applyITC ? quotedAmount * 0.30 : 0;
    
    const powerPairSolarWatts = Math.min(systemSize, 10) * 1000;
    const powerPairSolarRebate = applyPowerPair ? powerPairSolarWatts * 0.36 : 0;
    
    const powerPairBatteryKwh = batteryIncluded ? Math.min(batterySizeKwh, 13.5) : 0;
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
    
    const offsetDukeBill = dukeBill * (1 - solarOffset / 100);
    
    let dukeCosts = [];
    let solarCosts = [];
    let interestPayments = [];
    
    for (let month = 1; month <= months; month++) {
      const year = Math.floor((month - 1) / 12);
      const yearFactor = Math.pow(1 + annualIncrease, year);
      const dukeMonthly = (dukeBill * yearFactor) + dukeServiceFee;
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
        solarMonthly = solarUtilityBill + solarServiceFee + monthlyLoanPayment - touSavingsThisMonth;
      } else {
        const solarUtilityBill = offsetDukeBill * yearFactor;
        const touSavingsThisMonth = applyTOUSavings ? (touSavings.monthly * yearFactor) : 0;
        solarMonthly = solarUtilityBill + solarServiceFee - touSavingsThisMonth;
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
      monthlyAfterLoan: (dukeBill * (1 - solarOffset / 100)) * Math.pow(1 + annualIncrease, loanTerm) + solarServiceFee - (applyTOUSavings ? touSavings.monthly * Math.pow(1 + annualIncrease, loanTerm) : 0)
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

  const effectiveMonthlyCost = projections.offsetDukeBill + solarServiceFee + monthlyLoanPayment - touSavings.monthly;
  const monthlyDifference = dukeBill + dukeServiceFee - effectiveMonthlyCost;

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
    
    if (solarOffset < 50) {
      issues.push(`Solar offset is only ${solarOffset}% - customer still heavily dependent on grid`);
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
      const potentialPowerPair = (Math.min(systemSize, 10) * 1000 * 0.36) + (batteryIncluded ? Math.min(batterySizeKwh, 13.5) * 400 : 0);
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
          {/* ...existing JSX... */}
        </div>

        {/* ...rest of component content (omitted in copy) ... */}
      </div>
    </div>
  );
}
