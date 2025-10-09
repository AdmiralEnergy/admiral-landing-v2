import React, { useEffect, useState } from 'react';
import { track } from '../../../config/analytics';
import { useAdvisor } from '../state';

export default function Step1({ onNext }: { onNext: () => void }) {
  const { state, dispatch } = useAdvisor();
  const [zip, setZip] = useState(state.zip || '');
  const [utility, setUtility] = useState(state.utility || 'Other');
  const [hoa, setHoa] = useState(state.hoa || false);

  useEffect(() => {
    track('advisor_step_view', { step: 1 });
  }, []);

  const valid = /^\d{5}$/.test(zip);

  const saveAndNext = () => {
    dispatch({ type: 'patch', payload: { zip, utility, hoa } });
    onNext();
  };

  return (
    <div>
      <label className="block mb-2">ZIP</label>
      <input value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0,5))} className="w-full p-3 rounded border" />

      <label className="block mt-4 mb-2">Utility</label>
      <input value={utility} onChange={e => setUtility(e.target.value)} className="w-full p-3 rounded border" />

      <label className="flex items-center gap-2 mt-4">
        <input type="checkbox" checked={hoa} onChange={e => setHoa(e.target.checked)} /> HOA
      </label>

      <div className="flex justify-end gap-2 mt-6">
        <button disabled={!valid} onClick={saveAndNext} className="px-4 py-2 rounded bg-[#0c2f4a] text-white disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}
