import React, { useEffect, useState } from 'react';
import { track } from '../../../config/analytics';
import { useAdvisor } from '../state';

export default function Step3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { state, dispatch } = useAdvisor();
  const [roofType, setRoofType] = useState(state.roofType || 'asphalt');
  const [shade, setShade] = useState(state.shade || 'none');
  const [batteryInterest, setBatteryInterest] = useState(state.batteryInterest || 'no');

  useEffect(() => {
    track('advisor_step_view', { step: 3 });
  }, []);

  const saveAndNext = () => {
    dispatch({ type: 'patch', payload: { roofType, shade, batteryInterest } });
    onNext();
  };

  return (
    <div>
      <label className="block mb-2">Roof Type</label>
      <select value={roofType} onChange={e => setRoofType(e.target.value as any)} className="w-full p-3 rounded border">
        <option value="asphalt">Asphalt</option>
        <option value="metal">Metal</option>
        <option value="tile">Tile</option>
        <option value="other">Other</option>
      </select>

      <label className="block mt-4 mb-2">Shade</label>
      <select value={shade} onChange={e => setShade(e.target.value as any)} className="w-full p-3 rounded border">
        <option value="none">None</option>
        <option value="some">Some</option>
        <option value="heavy">Heavy</option>
      </select>

      <label className="block mt-4 mb-2">Interested in battery backup?</label>
      <select value={batteryInterest} onChange={e => setBatteryInterest(e.target.value as any)} className="w-full p-3 rounded border">
        <option value="yes">Yes</option>
        <option value="maybe">Maybe</option>
        <option value="no">No</option>
      </select>

      <div className="flex justify-between gap-2 mt-6">
        <button onClick={onBack} className="px-4 py-2 rounded border">Back</button>
        <button onClick={saveAndNext} className="px-4 py-2 rounded bg-[#0c2f4a] text-white">Next</button>
      </div>
    </div>
  );
}
