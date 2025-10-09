import React, { useEffect, useState } from 'react';
import { track, redditLead } from '../../../config/analytics';
import { useAdvisor } from '../state';

export default function Step4({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useAdvisor();
  const [firstName, setFirstName] = useState(state.firstName || '');
  const [lastName, setLastName] = useState(state.lastName || '');
  const [email, setEmail] = useState(state.email || '');
  const [phone, setPhone] = useState(state.phone || '');

  useEffect(() => {
    track('advisor_step_view', { step: 4 });
  }, []);

  const valid = firstName.trim().length > 1 && /@/.test(email) && phone.replace(/\D/g, '').length >= 10;

  const handleSubmit = () => {
    dispatch({ type: 'patch', payload: { firstName, lastName, email, phone } });

    // Mirror state into hidden Netlify form and submit
    const form = document.querySelector('form[name="advisor-intake"]') as HTMLFormElement | null;
    if (form) {
      // clear previous
      Array.from(form.querySelectorAll('input[name]')).forEach(i => {
        if ((i as HTMLInputElement).name !== 'form-name') (i as HTMLInputElement).remove();
      });

      const entries: Record<string, any> = { ...state, firstName, lastName, email, phone };
      // include utm
      if (state.utm) entries.utm = JSON.stringify(state.utm);

      Object.keys(entries).forEach(k => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = entries[k] == null ? '' : String(entries[k]);
        form.appendChild(input);
      });

      try {
        form.submit();
        track('advisor_submit_success', { utility: state.utility, batteryInterest: state.batteryInterest });
        redditLead({ utility: state.utility });
        window.location.href = '/thank-you';
      } catch (e) {
        console.error('submit error', e);
      }
    } else {
      console.warn('advisor-intake form not found');
    }
  };

  return (
    <div>
      <label className="block mb-2">First name</label>
      <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-3 rounded border" />

      <label className="block mt-4 mb-2">Last name</label>
      <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-3 rounded border" />

      <label className="block mt-4 mb-2">Email</label>
      <input value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded border" />

      <label className="block mt-4 mb-2">Phone</label>
      <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 rounded border" />

      <div className="flex justify-between gap-2 mt-6">
        <button onClick={onBack} className="px-4 py-2 rounded border">Back</button>
        <button disabled={!valid} onClick={handleSubmit} className="px-4 py-2 rounded bg-[#0c2f4a] text-white disabled:opacity-50">Submit</button>
      </div>
    </div>
  );
}
