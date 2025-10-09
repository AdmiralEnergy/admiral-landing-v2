import React, { useState } from 'react';
import { AdvisorProvider } from './state';
import Step1 from './steps/Step1_AddressUtility';
import Step2 from './steps/Step2_BillUsage';
import Step3 from './steps/Step3_RoofBackup';
import Step4 from './steps/Step4_ContactReview';
import { track } from '../../config/analytics';

const steps = [
  { id: 1, title: 'Address & Utility' },
  { id: 2, title: 'Bill & Usage' },
  { id: 3, title: 'Roof & Backup' },
  { id: 4, title: 'Contact & Review' },
];

function Stepper({ active }: { active: number }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {steps.map(s => (
        <div key={s.id} className={`flex-1 text-center py-2 rounded-full ${s.id === active ? 'bg-[#c9a648] text-[#0c2f4a] font-bold' : 'bg-[#f1f5f9] text-[#0c2f4a]/80'}`}>
          {s.id}. {s.title}
        </div>
      ))}
    </div>
  );
}

export default function AdvisorApp() {
  const [active, setActive] = useState(1);

  React.useEffect(() => {
    track('advisor_step_view', { step: active });
  }, [active]);

  return (
    <AdvisorProvider>
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-2xl p-6 shadow-md" style={{ backgroundColor: '#f7f5f2' }}>
          <Stepper active={active} />

          <div>
            {active === 1 && <Step1 onNext={() => setActive(2)} />}
            {active === 2 && <Step2 onNext={() => setActive(3)} onBack={() => setActive(1)} />}
            {active === 3 && <Step3 onNext={() => setActive(4)} onBack={() => setActive(2)} />}
            {active === 4 && <Step4 onBack={() => setActive(3)} />}
          </div>
        </div>
      </div>
    </AdvisorProvider>
  );
}
