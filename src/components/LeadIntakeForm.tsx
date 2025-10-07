import { useEffect, useRef } from "react";

export default function LeadIntakeForm() {
  const formRef = useRef<HTMLFormElement>(null);

  // UTM → hidden inputs (no React state)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    ["utm_source","utm_medium","utm_campaign","utm_content"].forEach((n) => {
      const val = params.get(n);
      if (!val || !formRef.current) return;
      let input = formRef.current.querySelector<HTMLInputElement>(`input[name="${n}"]`);
      if (!input) {
        input = document.createElement("input");
        input.type = "hidden"; input.name = n;
        formRef.current.appendChild(input);
      }
      input.value = val;
    });
  }, []);

  const formatOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const d = e.currentTarget.value.replace(/\D/g, "").slice(0, 10);
    if (!d) return;
    e.currentTarget.value =
      d.length <= 3 ? d :
      d.length <= 6 ? `(${d.slice(0,3)}) ${d.slice(3)}` :
      `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };

  return (
    <form ref={formRef} name="lead-intake" method="POST" action="/thank-you" data-netlify="true" data-netlify-honeypot="website" className="space-y-4">
      <input type="hidden" name="form-name" value="lead-intake" />

      <input name="name" placeholder="Full Name" autoComplete="name" maxLength={100} required
             className="w-full pl-12 pr-4 py-4 text-base rounded-lg border-2 border-gray-300 focus:border-[#c9a648]" />

      <input type="email" name="email" placeholder="Email Address" autoComplete="email" maxLength={100} required
             className="w-full pl-12 pr-4 py-4 text-base rounded-lg border-2 border-gray-300 focus:border-[#c9a648]" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="tel" name="phone" placeholder="(555) 123-4567" inputMode="tel"
               pattern="\d{10}" title="Enter 10 digits" onBlur={formatOnBlur} required
               className="w-full pl-12 pr-4 py-4 text-base rounded-lg border-2 border-gray-300 focus:border-[#c9a648]" />
        <input name="zip" placeholder="Zip Code" inputMode="numeric" pattern="\d{5}" title="5-digit ZIP"
               autoComplete="postal-code" maxLength={5} required
               className="w-full pl-12 pr-4 py-4 text-base rounded-lg border-2 border-gray-300 focus:border-[#c9a648]" />
      </div>

      {/* Honeypot */}
      <div className="hidden">
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <label className="flex items-start gap-2 text-xs sm:text-sm cursor-pointer">
        <input type="checkbox" name="consent" required className="mt-1 w-4 h-4 rounded border-gray-300 text-[#c9a648]" />
        <span style={{color:'#1a4d74'}}>
          I agree to be contacted by phone, email, or text about my inquiry. Msg/data rates may apply. Opt out anytime.
          Read our <a href="/legal/privacy" className="underline font-semibold" style={{color:'#c9a648'}}>Privacy Policy</a>.
        </span>
      </label>

      <style>{`input[type="text"], input[type="email"], input[type="tel"] { font-size:16px; }`}</style>

      <button type="submit" className="w-full bg-[#c9a648] text-white font-semibold py-4 rounded-lg">
        Check My Eligibility →
      </button>
    </form>
  );
}
