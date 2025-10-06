import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Sun, Battery, Shield, Award, CheckCircle, TrendingUp, Star, Zap } from 'lucide-react';
const BRAND = {
    navy: '#0c2f4a',
    navyLight: '#1a4d74',
    gold: '#c9a648',
    goldDark: '#b89539',
    cream: '#f7f5f2',
    creamDark: '#e8e6e3'
};
const SOLAR_PANELS = [
    {
        id: 'qcells-415',
        manufacturer: 'QCELLS',
        model: 'Q.PEAK DUO BLK ML-G10+',
        watts: 415,
        efficiency: 20.6,
        cost: 280,
        warranty: 25,
        color: '#000000',
        badge: 'Premium Choice',
        badgeColor: '#8b5cf6',
        savings: 'Save $2,100/year',
        features: [
            'Sleek all-black design increases home value',
            'Q.ANTUM Technology produces 5% more energy',
            'Anti-reflective coating maximizes light',
            'Excellent low-light performance',
            'Protected against degradation',
            '25-year complete warranty',
            'Guaranteed 85% output at year 25'
        ],
        bestFor: 'Homeowners wanting premium aesthetics with excellent performance',
        whyBuy: 'Most popular choice for Charlotte homeowners who care about curb appeal'
    },
    {
        id: 'rec-460',
        manufacturer: 'REC Solar',
        model: 'REC460AA Pure-RX',
        watts: 460,
        efficiency: 21.7,
        cost: 320,
        warranty: 25,
        color: '#1a1a1a',
        badge: 'Highest Efficiency',
        badgeColor: '#10b981',
        savings: 'Save $2,350/year',
        features: [
            'Industry-leading 21.7% efficiency',
            'Heterojunction technology',
            'Best temperature performance',
            '15% more power in hot weather',
            'Lead-free manufacturing',
            '25-year warranty',
            'Maintains 92% output at year 25'
        ],
        bestFor: 'Limited roof space or hot climates',
        whyBuy: 'Maximum electricity per panel - ideal for small roofs'
    },
    {
        id: 'aptos-460',
        manufacturer: 'Aptos Solar',
        model: 'DNA-120-MF10-460W',
        watts: 460,
        efficiency: 21.5,
        cost: 310,
        warranty: 30,
        color: '#2d2d2d',
        badge: 'Longest Warranty',
        badgeColor: '#f59e0b',
        savings: 'Save $2,400/year',
        features: [
            'Bifacial captures ground reflection - 30% boost',
            'Extended 30-year warranty',
            'Dual-glass construction',
            'Made in USA',
            'High diffuse light performance',
            'Superior durability',
            'Maintains 87.4% output at year 30'
        ],
        bestFor: 'Ground mounts and elevated installations',
        whyBuy: '30-year warranty - longest protection available'
    },
    {
        id: 'silfab-440',
        manufacturer: 'Silfab Solar',
        model: 'SIL-440 QD Elite',
        watts: 440,
        efficiency: 21.2,
        cost: 300,
        warranty: 30,
        color: '#1a1a2e',
        badge: 'Made in USA',
        badgeColor: '#dc2626',
        savings: 'Save $2,250/year',
        features: [
            'Made in Washington state',
            'Elite Premium rating',
            'High snow load rated',
            '30-year warranty',
            'Buy America compliant',
            'Superior quality control',
            'Guaranteed 85% at year 30'
        ],
        bestFor: 'American manufacturing, heavy snow areas',
        whyBuy: 'Support American jobs - premium quality'
    },
    {
        id: 'ja-405',
        manufacturer: 'JA Solar',
        model: 'JAM54S3-405/MR',
        watts: 405,
        efficiency: 20.9,
        cost: 270,
        warranty: 25,
        color: '#16213e',
        badge: 'Best Value',
        badgeColor: '#3b82f6',
        savings: 'Save $2,050/year',
        features: [
            'Exceptional value pricing',
            'Proven PERC technology',
            'Tier 1 manufacturer',
            'Reliable performance',
            '25-year warranty',
            'Cost-performance balance',
            'Maintains 84.8% at year 25'
        ],
        bestFor: 'Budget-conscious quality buyers',
        whyBuy: 'Premium brand at best price'
    },
    {
        id: 'jinko-425',
        manufacturer: 'Jinko Solar',
        model: 'Tiger Neo N-Type',
        watts: 425,
        efficiency: 21.0,
        cost: 285,
        warranty: 25,
        color: '#0f3460',
        badge: 'Best Seller',
        badgeColor: '#ec4899',
        savings: 'Save $2,175/year',
        features: [
            'Advanced N-type technology',
            'Better temperature performance',
            'Lower degradation rate',
            'Global brand reliability',
            'High power output',
            '25-year warranty',
            'Maintains 87.4% at year 25'
        ],
        bestFor: 'Modern technology at great price',
        whyBuy: 'Most popular nationwide - perfect balance'
    }
];
const BATTERIES = [
    {
        id: 'powerwall3',
        manufacturer: 'Tesla',
        model: 'Powerwall 3',
        capacity: 13.5,
        power: 11.5,
        cost: 11500,
        warranty: 10,
        color: '#cc0000',
        badge: 'Premium Brand',
        badgeColor: '#8b5cf6',
        backupTime: '12-18 hours',
        powerPairRebate: 5400,
        powerPairQualifies: true,
        features: [
            'Built-in solar inverter saves $3,500',
            'Whole home backup capability',
            'Flood-resistant rating',
            'Scale up to 4 units',
            'Mobile app control',
            'Tesla brand quality',
            'Off-grid capable'
        ],
        bestFor: 'All-in-one solution with brand recognition',
        whyBuy: 'Integrated inverter makes this the smart choice'
    },
    {
        id: 'eg4-280',
        manufacturer: 'EG4 Electronics',
        model: 'PowerPro 280Ah',
        capacity: 14.3,
        power: 11.5,
        cost: 7500,
        warranty: 10,
        color: '#2196F3',
        badge: 'Best Value',
        badgeColor: '#3b82f6',
        backupTime: '13-19 hours',
        powerPairRebate: 5400,
        powerPairQualifies: true,
        powerPairNote: 'Qualifies for MAXIMUM $5,400',
        features: [
            'Save $4,000 vs Tesla',
            'MORE capacity - 14.3kWh',
            'Weather-rated install anywhere',
            'Built-in safety management',
            'Modular expansion',
            'Works in cold weather',
            '6,000+ cycle life'
        ],
        bestFor: 'Premium performance without overpaying',
        whyBuy: 'Same performance, $4k less'
    },
    {
        id: 'enphase-5p',
        manufacturer: 'Enphase',
        model: 'IQ Battery 5P',
        capacity: 5.0,
        power: 3.84,
        cost: 6500,
        warranty: 15,
        color: '#f47920',
        badge: 'Modular System',
        badgeColor: '#10b981',
        backupTime: '5-7 hours',
        powerPairRebate: 2000,
        powerPairQualifies: true,
        features: [
            'Start small, grow anytime',
            '15-year warranty (longest)',
            'Safest LFP chemistry',
            'Stack up to 20 units',
            'Perfect for Enphase systems',
            'Compact design',
            'App monitoring'
        ],
        bestFor: 'Flexible expansion over time',
        whyBuy: 'Pay less now, add more later'
    },
    {
        id: 'enphase-10c',
        manufacturer: 'Enphase',
        model: 'IQ Battery 10C',
        capacity: 10.0,
        power: 7.68,
        cost: 12000,
        warranty: 15,
        color: '#f47920',
        badge: '15-Year Warranty',
        badgeColor: '#f59e0b',
        backupTime: '10-14 hours',
        powerPairRebate: 4000,
        powerPairQualifies: true,
        features: [
            'Double capacity for longer backup',
            '15-year warranty protection',
            'No neutral disconnect needed',
            'Higher 7.68kW power output',
            'Safe LFP chemistry',
            'Enphase integration',
            'Gateway included'
        ],
        bestFor: 'Larger homes with extended warranty',
        whyBuy: 'Longest warranty in the business'
    },
    {
        id: 'franklin-apower2',
        manufacturer: 'FranklinWH',
        model: 'aPower 2',
        capacity: 15.0,
        power: 10.0,
        cost: 13000,
        warranty: 15,
        color: '#1e3a8a',
        badge: 'Largest Capacity',
        badgeColor: '#dc2626',
        backupTime: '14-21 hours',
        powerPairRebate: 5400,
        powerPairQualifies: true,
        powerPairNote: 'Qualifies for MAXIMUM $5,400',
        features: [
            'Massive 15kWh single unit',
            'Works with any solar system',
            'Off-grid ready',
            'True whole-home backup',
            'Smart energy management',
            '15-year warranty',
            'Expandable system'
        ],
        bestFor: 'Maximum backup and off-grid living',
        whyBuy: 'Biggest single unit available'
    }
];
const ProductCatalog = () => {
    const [view, setView] = useState('panels');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const PanelCard = ({ panel }) => (_jsxs("div", { onClick: () => setSelectedProduct(panel), style: {
            background: BRAND.cream,
            border: `3px solid ${BRAND.creamDark}`,
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative'
        }, onMouseEnter: (e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = `0 12px 40px rgba(201, 166, 72, 0.4)`;
            e.currentTarget.style.borderColor = BRAND.gold;
        }, onMouseLeave: (e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = BRAND.creamDark;
        }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: panel.badgeColor,
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 30
                }, children: panel.badge }), _jsxs("div", { style: {
                    width: '100%',
                    height: '180px',
                    background: `linear-gradient(135deg, ${panel.color}, #1a1a1a)`,
                    borderRadius: '12px',
                    marginBottom: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gridTemplateRows: 'repeat(10, 1fr)',
                    gap: '2px',
                    padding: '8px',
                    position: 'relative',
                    zIndex: 0
                }, children: [Array.from({ length: 60 }).map((_, i) => (_jsx("div", { style: {
                            background: 'rgba(201, 166, 72, 0.15)',
                            border: '1px solid rgba(201, 166, 72, 0.4)',
                            borderRadius: '2px'
                        } }, i))), _jsxs("div", { style: {
                            position: 'absolute',
                            bottom: '8px',
                            left: '8px',
                            background: `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldDark})`,
                            color: BRAND.navy,
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            zIndex: 20
                        }, children: [panel.watts, "W"] })] }), _jsx("div", { style: { color: BRAND.gold, fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '0.05em' }, children: panel.manufacturer }), _jsx("h3", { style: { color: BRAND.navy, fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', lineHeight: '1.3' }, children: panel.model }), _jsxs("div", { style: {
                    background: `linear-gradient(135deg, #d1fae5, #a7f3d0)`,
                    border: `3px solid #10b981`,
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }, children: [_jsx(TrendingUp, { size: 20, style: { color: '#065f46' } }), _jsx("span", { style: { color: '#065f46', fontWeight: 'bold', fontSize: '14px' }, children: panel.savings })] }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px',
                    paddingBottom: '16px',
                    borderBottom: `2px solid ${BRAND.creamDark}`
                }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }, children: "POWER" }), _jsxs("div", { style: { fontSize: '22px', fontWeight: 'bold', color: BRAND.navy }, children: [panel.watts, "W"] })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }, children: "EFFICIENCY" }), _jsxs("div", { style: { fontSize: '22px', fontWeight: 'bold', color: '#10b981' }, children: [panel.efficiency, "%"] })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }, children: "WARRANTY" }), _jsxs("div", { style: { fontSize: '16px', fontWeight: 'bold', color: BRAND.navy }, children: [panel.warranty, " yrs"] })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }, children: "PRICE" }), _jsxs("div", { style: { fontSize: '16px', fontWeight: 'bold', color: BRAND.gold }, children: ["$", panel.cost] })] })] }), _jsx("div", { style: {
                    background: `linear-gradient(135deg, #dbeafe, #bfdbfe)`,
                    border: '3px solid #3b82f6',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '12px'
                }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', gap: '8px' }, children: [_jsx(Star, { size: 18, style: { color: '#1e40af', flexShrink: 0, marginTop: '2px' } }), _jsx("p", { style: { fontSize: '13px', color: '#1e40af', fontWeight: 'bold', lineHeight: '1.4', margin: 0 }, children: panel.whyBuy })] }) }), _jsx("button", { style: {
                    width: '100%',
                    padding: '14px',
                    background: `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldDark})`,
                    color: BRAND.navy,
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(201, 166, 72, 0.3)',
                    transition: 'all 0.3s ease'
                }, children: "See Full Details \u2192" })] }));
    const BatteryCard = ({ battery }) => (_jsxs("div", { onClick: () => setSelectedProduct(battery), style: {
            background: BRAND.cream,
            border: `3px solid ${BRAND.creamDark}`,
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative'
        }, onMouseEnter: (e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = `0 12px 40px rgba(201, 166, 72, 0.4)`;
            e.currentTarget.style.borderColor = BRAND.gold;
        }, onMouseLeave: (e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = BRAND.creamDark;
        }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: battery.badgeColor,
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 30
                }, children: battery.badge }), _jsxs("div", { style: {
                    width: '100%',
                    height: '180px',
                    background: `linear-gradient(135deg, ${battery.color}, rgba(0,0,0,0.8))`,
                    borderRadius: '12px',
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 0
                }, children: [_jsx(Battery, { size: 64, style: { color: BRAND.gold }, strokeWidth: 1.5 }), _jsxs("div", { style: {
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            zIndex: 20
                        }, children: [battery.capacity, " kWh"] }), _jsx("div", { style: { display: 'flex', gap: '4px', marginTop: '16px' }, children: Array.from({ length: 5 }).map((_, i) => (_jsx("div", { style: {
                                width: '8px',
                                background: BRAND.gold,
                                borderRadius: '2px',
                                height: i < 4 ? '24px' : '32px'
                            } }, i))) })] }), _jsx("div", { style: { color: BRAND.gold, fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '0.05em' }, children: battery.manufacturer }), _jsx("h3", { style: { color: BRAND.navy, fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', lineHeight: '1.3' }, children: battery.model }), _jsxs("div", { style: {
                    background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                    border: '3px solid #a855f7',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }, children: [_jsx(Zap, { size: 20, style: { color: '#6b21a8' } }), _jsxs("span", { style: { color: '#6b21a8', fontWeight: 'bold', fontSize: '14px' }, children: ["Powers home ", battery.backupTime] })] }), _jsxs("div", { style: {
                    background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                    border: '3px solid #fef3c7',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '16px'
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }, children: [_jsx(Award, { size: 18, style: { color: '#fef3c7' } }), _jsx("span", { style: { color: '#fef3c7', fontSize: '12px', fontWeight: 'bold' }, children: "DUKE POWERPAIR REBATE" })] }), _jsxs("div", { style: { color: '#fef3c7', fontSize: '22px', fontWeight: 'bold' }, children: ["$", battery.powerPairRebate.toLocaleString(), " Back"] }), battery.powerPairNote && (_jsx("div", { style: { color: '#fef3c7', fontSize: '11px', fontWeight: '600', marginTop: '4px' }, children: battery.powerPairNote }))] }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px',
                    paddingBottom: '16px',
                    borderBottom: `2px solid ${BRAND.creamDark}`
                }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }, children: "CAPACITY" }), _jsxs("div", { style: { fontSize: '22px', fontWeight: 'bold', color: BRAND.navy }, children: [battery.capacity, " kWh"] })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }, children: "POWER" }), _jsxs("div", { style: { fontSize: '22px', fontWeight: 'bold', color: '#10b981' }, children: [battery.power, " kW"] })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }, children: "WARRANTY" }), _jsxs("div", { style: { fontSize: '16px', fontWeight: 'bold', color: BRAND.navy }, children: [battery.warranty, " yrs"] })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }, children: "PRICE" }), _jsxs("div", { style: { fontSize: '16px', fontWeight: 'bold', color: BRAND.gold }, children: ["$", (battery.cost / 1000).toFixed(1), "k"] })] })] }), _jsxs("div", { style: {
                    background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                    border: '3px solid #10b981',
                    borderRadius: '10px',
                    padding: '10px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }, children: [_jsx(Shield, { size: 18, style: { color: '#065f46' } }), _jsx("span", { style: { fontSize: '13px', color: '#065f46', fontWeight: 'bold' }, children: "LFP - Safest Chemistry" })] }), _jsx("div", { style: {
                    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                    border: '3px solid #3b82f6',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '12px'
                }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', gap: '8px' }, children: [_jsx(Star, { size: 18, style: { color: '#1e40af', flexShrink: 0, marginTop: '2px' } }), _jsx("p", { style: { fontSize: '13px', color: '#1e40af', fontWeight: 'bold', lineHeight: '1.4', margin: 0 }, children: battery.whyBuy })] }) }), _jsx("button", { style: {
                    width: '100%',
                    padding: '14px',
                    background: `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldDark})`,
                    color: BRAND.navy,
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(201, 166, 72, 0.3)'
                }, children: "See Full Details \u2192" })] }));
    const DetailModal = ({ product, onClose }) => {
        const isPanel = product.watts !== undefined;
        return (_jsx("div", { style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(12, 47, 74, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }, onClick: onClose, children: _jsxs("div", { style: {
                    background: BRAND.cream,
                    borderRadius: '20px',
                    maxWidth: '900px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    padding: '40px'
                }, onClick: (e) => e.stopPropagation(), children: [_jsx("div", { style: {
                            display: 'inline-block',
                            background: product.badgeColor,
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            marginBottom: '16px'
                        }, children: product.badge }), _jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("div", { style: { color: BRAND.gold, fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.05em' }, children: product.manufacturer }), _jsx("h2", { style: { color: BRAND.navy, fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', lineHeight: '1.2' }, children: product.model }), _jsxs("div", { style: { fontSize: '32px', fontWeight: 'bold', color: BRAND.gold }, children: ["$", isPanel ? product.cost : (product.cost / 1000).toFixed(1) + 'k'] })] }), _jsxs("div", { style: {
                            background: `linear-gradient(135deg, #dbeafe, #bfdbfe)`,
                            border: `4px solid #3b82f6`,
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '32px'
                        }, children: [_jsxs("h3", { style: { color: '#1e40af', fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx(Star, { size: 24 }), "Why Choose This?"] }), _jsx("p", { style: { color: '#1e40af', fontSize: '18px', fontWeight: 'bold', lineHeight: '1.6', margin: 0 }, children: isPanel ? product.whyBuy : product.whyBuy })] }), _jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h3", { style: { color: BRAND.navy, fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }, children: "Key Benefits" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: product.features.map((feature, idx) => (_jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                                        border: '2px solid #10b981',
                                        borderRadius: '10px',
                                        padding: '14px'
                                    }, children: [_jsx(CheckCircle, { size: 24, style: { color: '#065f46', flexShrink: 0, marginTop: '2px' } }), _jsx("span", { style: { color: '#065f46', fontSize: '15px', fontWeight: '600', lineHeight: '1.5' }, children: feature })] }, idx))) })] }), _jsxs("div", { style: {
                            background: `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldDark})`,
                            border: `4px solid ${BRAND.goldDark}`,
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '32px'
                        }, children: [_jsx("h4", { style: { color: BRAND.navy, fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }, children: "Perfect For:" }), _jsx("p", { style: { color: BRAND.navy, fontSize: '18px', fontWeight: 'bold', lineHeight: '1.6', margin: 0 }, children: product.bestFor })] }), _jsx("button", { onClick: onClose, style: {
                            width: '100%',
                            padding: '18px',
                            background: BRAND.navy,
                            color: BRAND.cream,
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(12, 47, 74, 0.3)'
                        }, children: "Close & Compare Options" })] }) }));
    };
    return (_jsxs("div", { style: {
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyLight} 50%, ${BRAND.navy} 100%)`,
            padding: '60px 20px'
        }, children: [_jsxs("div", { style: { maxWidth: '1400px', margin: '0 auto' }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '48px' }, children: [_jsx("div", { style: {
                                    display: 'inline-block',
                                    background: `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldDark})`,
                                    color: BRAND.navy,
                                    padding: '10px 24px',
                                    borderRadius: '25px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    marginBottom: '16px',
                                    boxShadow: '0 4px 12px rgba(201, 166, 72, 0.4)'
                                }, children: "CERTIFIED DUKE ENERGY TRADE ALLY" }), _jsx("h1", { style: {
                                    fontSize: '56px',
                                    fontWeight: 'bold',
                                    marginBottom: '16px',
                                    background: `linear-gradient(135deg, ${BRAND.gold}, #ffd700, ${BRAND.gold})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }, children: "ADMIRAL ENERGY" }), _jsx("h2", { style: { color: BRAND.cream, fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }, children: "Premium Solar & Battery Systems" }), _jsx("p", { style: { color: BRAND.cream, fontSize: '20px', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }, children: "Stop renting power from Duke Energy. Own your energy independence with America's top-rated equipment." })] }), _jsxs("div", { style: {
                            background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                            border: '4px solid #fef3c7',
                            borderRadius: '20px',
                            padding: '32px',
                            marginBottom: '48px',
                            boxShadow: '0 12px 40px rgba(220, 38, 38, 0.4)'
                        }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '24px' }, children: [_jsx("div", { style: {
                                            display: 'inline-block',
                                            background: '#fef3c7',
                                            color: '#78350f',
                                            padding: '8px 20px',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            marginBottom: '12px'
                                        }, children: "\u26A1 LIMITED TIME - CAPACITY FILLING FAST" }), _jsx("h3", { style: { color: '#fef3c7', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }, children: "Duke Energy PowerPair Rebate" }), _jsx("p", { style: { color: '#fef3c7', fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }, children: "Get Up to $9,000 Back" }), _jsx("p", { style: { color: '#fef3c7', fontSize: '18px', marginBottom: '0' }, children: "+ 30% Federal Tax Credit (Expires Dec 31, 2025)" })] }), _jsxs("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: '20px',
                                    marginBottom: '24px'
                                }, children: [_jsxs("div", { style: { background: 'rgba(254, 243, 199, 0.95)', borderRadius: '12px', padding: '20px' }, children: [_jsx("div", { style: { color: '#78350f', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }, children: "SOLAR PANELS REBATE" }), _jsx("div", { style: { color: '#78350f', fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }, children: "$0.36/watt" }), _jsx("div", { style: { color: '#78350f', fontSize: '16px', fontWeight: '600' }, children: "Up to $3,600 (10kW max)" })] }), _jsxs("div", { style: { background: 'rgba(254, 243, 199, 0.95)', borderRadius: '12px', padding: '20px' }, children: [_jsx("div", { style: { color: '#78350f', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }, children: "BATTERY STORAGE REBATE" }), _jsx("div", { style: { color: '#78350f', fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }, children: "$400/kWh" }), _jsx("div", { style: { color: '#78350f', fontSize: '16px', fontWeight: '600' }, children: "Up to $5,400 (13.5kWh max)" })] }), _jsxs("div", { style: { background: 'rgba(254, 243, 199, 0.95)', borderRadius: '12px', padding: '20px' }, children: [_jsx("div", { style: { color: '#78350f', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }, children: "FEDERAL TAX CREDIT" }), _jsx("div", { style: { color: '#78350f', fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }, children: "30% Back" }), _jsx("div", { style: { color: '#78350f', fontSize: '16px', fontWeight: '600' }, children: "On entire system cost" })] })] }), _jsxs("div", { style: {
                                    background: 'rgba(254, 243, 199, 0.95)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '16px'
                                }, children: [_jsxs("div", { style: { borderRight: '2px solid #78350f', paddingRight: '16px' }, children: [_jsx("div", { style: { color: '#dc2626', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }, children: "\u26A0\uFE0F PROGRAM STATUS" }), _jsx("div", { style: { color: '#78350f', fontSize: '14px', fontWeight: '600' }, children: "Capacity filling - first come, first served" })] }), _jsxs("div", { style: { borderRight: '2px solid #78350f', paddingRight: '16px' }, children: [_jsx("div", { style: { color: '#dc2626', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }, children: "\u23F0 INSTALL DEADLINE" }), _jsx("div", { style: { color: '#78350f', fontSize: '14px', fontWeight: '600' }, children: "270 days after reservation" })] }), _jsxs("div", { children: [_jsx("div", { style: { color: '#dc2626', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }, children: "\uD83D\uDCCB REQUIREMENT" }), _jsx("div", { style: { color: '#78350f', fontSize: '14px', fontWeight: '600' }, children: "10-year program commitment" })] })] })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '48px' }, children: [_jsxs("button", { onClick: () => setView('panels'), style: {
                                    padding: '18px 40px',
                                    borderRadius: '16px',
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: 'none',
                                    background: view === 'panels'
                                        ? `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldDark})`
                                        : BRAND.cream,
                                    color: view === 'panels' ? BRAND.navy : BRAND.navy,
                                    boxShadow: view === 'panels'
                                        ? '0 8px 24px rgba(201, 166, 72, 0.5)'
                                        : '0 4px 12px rgba(247, 245, 242, 0.2)'
                                }, children: [_jsx(Sun, { size: 28 }), "Solar Panels (", SOLAR_PANELS.length, ")"] }), _jsxs("button", { onClick: () => setView('batteries'), style: {
                                    padding: '18px 40px',
                                    borderRadius: '16px',
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: 'none',
                                    background: view === 'batteries'
                                        ? `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldDark})`
                                        : BRAND.cream,
                                    color: view === 'batteries' ? BRAND.navy : BRAND.navy,
                                    boxShadow: view === 'batteries'
                                        ? '0 8px 24px rgba(201, 166, 72, 0.5)'
                                        : '0 4px 12px rgba(247, 245, 242, 0.2)'
                                }, children: [_jsx(Battery, { size: 28 }), "Battery Systems (", BATTERIES.length, ")"] })] }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                            gap: '28px',
                            marginBottom: '60px'
                        }, children: view === 'panels'
                            ? SOLAR_PANELS.map(panel => _jsx(PanelCard, { panel: panel }, panel.id))
                            : BATTERIES.map(battery => _jsx(BatteryCard, { battery: battery }, battery.id)) }), _jsxs("div", { style: {
                            background: `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldDark})`,
                            borderRadius: '20px',
                            padding: '48px',
                            textAlign: 'center',
                            boxShadow: '0 12px 40px rgba(201, 166, 72, 0.4)'
                        }, children: [_jsx("h3", { style: { color: BRAND.navy, fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }, children: "Ready to Design Your Perfect System?" }), _jsx("p", { style: { color: BRAND.navy, fontSize: '20px', fontWeight: '600', marginBottom: '24px' }, children: "See exactly how much you'll save with our free calculator" }), _jsx("button", { style: {
                                    background: BRAND.navy,
                                    color: BRAND.cream,
                                    padding: '20px 48px',
                                    borderRadius: '14px',
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 24px rgba(12, 47, 74, 0.4)'
                                }, children: "Calculate My Savings Now \u2192" })] })] }), selectedProduct && _jsx(DetailModal, { product: selectedProduct, onClose: () => setSelectedProduct(null) })] }));
};
export default ProductCatalog;
