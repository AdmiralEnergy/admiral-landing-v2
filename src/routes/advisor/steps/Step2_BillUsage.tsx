import React, { useEffect, useState } from 'react';
import { track } from '../../../config/analytics';
import { useAdvisor } from '../state';

export default function Step2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { state, dispatch } = useAdvisor();
  const [avgBill, setAvgBill] = useState(state.avgBill ?? '');
  const [kwh, setKwh] = useState(state.kwh ?? '');

  useEffect(() => {
    track('advisor_step_view', { step: 2 });
  }, []);

  const billNum = Number(String(avgBill).replace(/[^0-9\.]/g, ''));
  const valid = !isNaN(billNum) && billNum >= 50 && billNum <= 900;

  const saveAndNext = () => {
    dispatch({ type: 'patch', payload: { avgBill: billNum, kwh: kwh ? Number(kwh) : null } });
    onNext();
  };

  return (
    <div>
      <label className="block mb-2">Average monthly bill ($)</label>
      <input value={avgBill as any} onChange={e => setAvgBill(e.target.value)} className="w-full p-3 rounded border" />
      {!valid && <p className="text-sm text-red-600 mt-2">Enter a number between $50 and $900</p>}

      <label className="block mt-4 mb-2">Estimated kWh/month (optional)</label>
      <input value={kwh as any} onChange={e => setKwh(e.target.value)} className="w-full p-3 rounded border" />

      <div className="flex justify-between gap-2 mt-6">
        <button onClick={onBack} className="px-4 py-2 rounded border">Back</button>
        <button disabled={!valid} onClick={saveAndNext} className="px-4 py-2 rounded bg-[#0c2f4a] text-white disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}
