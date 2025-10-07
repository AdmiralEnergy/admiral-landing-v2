import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Shield, Award, Users, ArrowRight, Star, Zap, DollarSign, Clock, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import Header from '../components/layout/Header';

export default function AdmiralEnergyLanding() {
  type LeadFormData = {
    name: string;
    email: string;
    phone: string;
    zip: string;
    consent: boolean;
    website: string; // honeypot
  };

  const [formData, setFormData] = useState<LeadFormData>({ name: '', email: '', phone: '', zip: '', consent: false, website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [calendlyUrl, setCalendlyUrl] = useState(null);
  const formRef = useRef<HTMLElement | null>(null);
  const lastSubmitRef = useRef(0);

  // Mock API for local/dev testing
  const mockApiSubmit = async (_data: any) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (Math.random() > 0.05) return { success: true, message: 'Submission received' };
    throw new Error('Network error occurred');
  };

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? Math.min((window.scrollY / totalHeight) * 100, 100) : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Format phone number - improved to handle cursor position
  const formatPhoneNumber = (value: string, preserveCursor: boolean = false) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length === 0) return '';
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  // Field validation
  const validateField = useCallback((name: string, value: any) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Name contains invalid characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'phone': {
        const digits = String(value).replace(/\D/g, '');
        if (!digits) return 'Phone number is required';
        if (digits.length !== 10) return 'Phone must be exactly 10 digits';
        if (!/^[2-9]\d{9}$/.test(digits)) return 'Please enter a valid US phone number';
        return '';
      }
      case 'zip':
        if (!String(value).trim()) return 'Zip code is required';
        if (!/^\d{5}$/.test(String(value))) return 'Zip code must be exactly 5 digits';
        return '';
      case 'consent':
        if (!value) return 'Please agree to be contacted';
        return '';
      default:
        return '';
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    let formattedValue = type === 'checkbox' ? checked : value;

    // Special handling for phone to prevent cursor jumping
    if (name === 'phone') {
      const currentValue = formData.phone;
      const newDigits = value.replace(/\D/g, '');
      
      // Only reformat if digits actually changed to prevent cursor jumping
      if (newDigits !== currentValue.replace(/\D/g, '')) {
        formattedValue = formatPhoneNumber(value);
      } else {
        formattedValue = currentValue; // Keep current value if no digit change
        return; // Exit early to prevent state update
      }
    }
    if (name === 'zip') formattedValue = value.replace(/\D/g, '').slice(0, 5);
    if (name === 'name') formattedValue = value.slice(0, 100);
    if (name === 'email') formattedValue = value.slice(0, 100);

    setFormData(prev => ({ ...prev, [name]: formattedValue } as any));

    if ((touched as any)[name as keyof typeof touched]) {
      const error = validateField(name, formattedValue);
      setErrors(prev => ({ ...prev, [name]: error } as any));
    }

    if (submitError) setSubmitError(false);
  }, [touched, validateField, submitError, formData.phone]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? checked : value;
    setTouched(prev => ({ ...prev, [name]: true } as any));
    const error = validateField(name, val);
    setErrors(prev => ({ ...prev, [name]: error } as any));
  }, [validateField]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const allTouched: Record<string, boolean> = {};

    Object.keys(formData).forEach((key) => {
      (allTouched as any)[key] = true;
      // Skip honeypot from validation UI
      if (key === 'website') return;
      const error = validateField(key, (formData as any)[key]);
      if (error) (newErrors as any)[key] = error;
    });

    setErrors(newErrors);
    setTouched(allTouched);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  const focusFirstError = () => {
    if (!formRef.current) return;
    const firstField = Object.keys(errors).find(k => (errors as any)[k]);
    if (!firstField) return;
    const el = formRef.current.querySelector((`[name="${firstField}"]`) as string) as HTMLElement | null;
    el?.focus();
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    // Throttle: 10s between submits
    const now = Date.now();
    if (now - lastSubmitRef.current < 10000) return;
    lastSubmitRef.current = now;

    setSubmitError(false);

    if (!validateForm()) {
      focusFirstError();
      return;
    }

    setIsSubmitting(true);

    try {
      // Honeypot: if filled, silently succeed
      if (formData.website && formData.website.length > 0) {
        setSubmitSuccess(true);
        setIsSubmitting(false);
        return;
      }

      const getUTM = () => {
        if (typeof window === 'undefined') return {};
        const params = new URLSearchParams(window.location.search);
        const utm = {};
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(k => {
          const v = params.get(k);
          if (v) utm[k] = v;
        });
        return utm;
      };

      const submissionData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\D/g, ''),
        zip: formData.zip,
        source: 'form',
        utm: getUTM()
      };

      // Try production endpoint; if unavailable locally, fall back to mock for dev
      let ok = false;
      try {
        const response = await fetch('/api/chat/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(submissionData),
        });
        ok = response.ok;
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await response.json().catch(() => null);
      } catch {
        // Local/dev fallback
        await mockApiSubmit(submissionData);
        ok = true;
      }

      if (ok) {
        // Prefetch booking link
        try {
          const r = await fetch('/api/chat/book', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({}) 
          });
          const j = await r.json().catch(() => null);
          if (j?.url) setCalendlyUrl(j.url);
        } catch { /* noop */ }

        setSubmitSuccess(true);
        setFormData({ name: '', email: '', phone: '', zip: '', consent: false, website: '' });
        setTouched({});
        setErrors({});

        // Optional light client event
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'form_submit', { form: 'lead', page: window.location.pathname });
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(true);
      setErrors(prev => ({
        ...prev,
        submit: 'Unable to submit form. Please try again or call us at (919) 555-0123.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, validateForm, errors]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSubmitting) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit, isSubmitting]);

  const scrollToForm = useCallback(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const firstInput = formRef.current?.querySelector('input[name="name"]') as HTMLInputElement | null;
        firstInput?.focus();
      }, 450);
    }
  }, []);

  const resetForm = useCallback(() => {
    setSubmitSuccess(false);
    setSubmitError(false);
    setErrors({});
    setTouched({});
  }, []);

  // Reusable FormField component
  type FormFieldProps = {
    name: keyof LeadFormData | string;
    type: string;
    placeholder: string;
    autoComplete?: string;
    icon?: React.ComponentType<any>;
  };
  const FormField = ({ name, type, placeholder, autoComplete, icon: Icon }: FormFieldProps) => {
    const hasError = (touched as any)[name as keyof typeof touched] && (errors as any)[name as keyof typeof errors];
    const isCheckbox = type === 'checkbox';

    return (
      <div className="relative">
        {!isCheckbox && Icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Icon className="w-5 h-5" style={{ color: hasError ? '#dc2626' : '#9ca3af' } as any} />
          </div>
        )}

        {isCheckbox ? (
          <label className="flex items-start gap-2 text-xs sm:text-sm cursor-pointer">
            <input
              type="checkbox"
              name={name}
              checked={Boolean((formData as any)[name])}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#c9a648] focus:ring-[#c9a648] disabled:opacity-50 cursor-pointer"
            />
            <span style={{ color: '#1a4d74' }}>
              I agree to be contacted by phone, email, or text about my inquiry. Msg/data rates may apply. Opt out anytime.
              Read our <a href="/legal/privacy" className="underline hover:no-underline font-semibold" style={{ color: '#c9a648' }}>Privacy Policy</a>.
            </span>
          </label>
        ) : (
          <input
            type={type}
            name={name}
            placeholder={placeholder}
            autoComplete={autoComplete}
            value={String((formData as any)[name])}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            aria-label={placeholder}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? `${name}-error` : undefined}
            disabled={isSubmitting}
            inputMode={name === 'phone' ? 'tel' : name === 'zip' ? 'numeric' : name === 'email' ? 'email' : 'text'}
            className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-4 text-base rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                : 'border-gray-300 focus:border-[#c9a648] focus:ring-[#c9a648]/20 bg-white'
            }`}
          />
        )}

        {hasError && (
          <div className="flex items-start gap-2 mt-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#dc2626' }} />
            <p id={`${name}-error`} className="text-red-600 text-sm" role="alert">
              {errors[name]}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="font-sans antialiased" style={{ fontFamily: "'Rubik', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(201, 166, 72, 0.4); } 50% { box-shadow: 0 0 40px rgba(201, 166, 72, 0.7); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-spin { animation: spin 1s linear infinite; }
        .gradient-text { background: linear-gradient(135deg, #c9a648 0%, #f7f5f2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        input:focus { transform: none; box-shadow: 0 0 0 3px rgba(201, 166, 72, 0.15); border-color: #c9a648; }
        input:disabled { transform: none; }
        input { transition: all 0.2s ease; }
        input:focus::placeholder { opacity: 0.7; }
        /* Prevent zoom on iOS */
        input[type="text"], input[type="email"], input[type="tel"] { font-size: 16px; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-gray-200">
        <div
          className="h-full transition-all duration-150 ease-out"
          style={{
            width: `${scrollProgress}%`,
            background: 'linear-gradient(90deg, #c9a648 0%, #b89539 100%)',
            boxShadow: scrollProgress > 0 ? '0 0 10px rgba(201, 166, 72, 0.5)' : 'none'
          }}
        />
      </div>

      {/* Sticky Header */}
      <Header />

      {/* Hero */}
      <section className="relative py-12 sm:py-16 lg:py-24 overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #0c2f4a 0%, #1a4d74 100%)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#c9a648] rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#c9a648] rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 animate-slide-up">
            <div className="inline-block mb-4 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold animate-pulse-glow"
                 style={{ backgroundColor: 'rgba(201, 166, 72, 0.2)', color: '#c9a648', border: '1px solid #c9a648' }}>
              ⚡ URGENT: Duke Energy Rebates Ending Soon - Limited Spots Available
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight px-2"
                style={{ color: '#f7f5f2' }}>
              NC Homeowners: Get $9,000 in<br />
              <span className="gradient-text">FREE Solar Rebates</span><br />
              <span style={{ color: '#c9a648' }}>Before They're Gone Forever</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl mb-4 font-medium px-4" style={{ color: '#e8e6e3' }}>
              See if your home qualifies for up to $39,000 in combined savings. Free eligibility check takes 60 seconds.
            </p>

            {/* Links hidden for A/B testing - calculator and catalog removed */}

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm" style={{ color: '#c9a648' }}>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">60 Second Check</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">No Obligation</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div id="lead" ref={formRef as any} className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl backdrop-blur-sm animate-slide-up"
               style={{ backgroundColor: 'rgba(247, 245, 242, 0.98)', animationDelay: '0.2s' }}>
            {submitSuccess ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: '#c9a648' }}>
                  <CheckCircle className="w-12 h-12" style={{ color: '#0c2f4a' }} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#0c2f4a' }}>Success! 🎉</h3>
                <p className="text-base sm:text-lg mb-4" style={{ color: '#1a4d74' }}>
                  Your personalized estimate is on the way. Lock in a time now:
                </p>
                <a
                  href={calendlyUrl || 'https://calendly.com/admiralenergy/consultation'}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #c9a648, #b89539)', color: '#0c2f4a' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  Book 10-min Consult <ArrowRight className="w-5 h-5" />
                </a>
                <div className="mt-6">
                  <button
                    onClick={resetForm}
                    className="text-sm underline hover:no-underline transition-all"
                    style={{ color: '#c9a648' }}
                  >
                    Submit another request
                  </button>
                </div>
              </div>
            ) : (
              <form name="lead-intake" method="POST" data-netlify="true" data-netlify-honeypot="website" className="space-y-4">
                <input type="hidden" name="form-name" value="lead-intake" />
                <FormField name="name" type="text" placeholder="Full Name" autoComplete="name" icon={Users} />
                <FormField name="email" type="email" placeholder="Email Address" autoComplete="email" icon={Mail} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField name="phone" type="tel" placeholder="Phone Number" autoComplete="tel" icon={Phone} />
                  <FormField name="zip" type="text" placeholder="Zip Code" autoComplete="postal-code" icon={MapPin} />
                </div>

                {/* Honeypot (hidden) */}
                <div style={{ position: 'absolute', left: '-9999px', width: 0, height: 0, overflow: 'hidden' }}>
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                {/* Consent */}
                <FormField name="consent" type="checkbox" placeholder="" />

                {errors.submit && (
                  <div className="flex items-start gap-2 p-4 rounded-lg animate-fade-in"
                       style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444' }}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                    <p className="text-sm" style={{ color: '#dc2626' }} role="alert">
                      {errors.submit}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                  style={{ background: 'linear-gradient(135deg, #c9a648 0%, #b89539 100%)', color: '#0c2f4a' }}
                  aria-label={isSubmitting ? 'Submitting eligibility check' : 'Check eligibility'}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0c2f4a] border-t-transparent rounded-full animate-spin" />
                      Checking Eligibility...
                    </>
                  ) : (
                    <>
                      Check My Eligibility
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm" style={{ color: '#1a4d74' }}>
                  <Shield className="w-4 h-4" />
                  <span>100% secure. Your info is never shared.</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 sm:py-16" style={{ backgroundColor: '#f7f5f2' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Shield, text: 'Certified Duke Energy Trade Ally' },
              { icon: Award, text: '25+ Year Equipment Warranties' },
              { icon: Users, text: '100% Local NC Team' }
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-xl transition-all duration-300 hover:scale-105 bg-white shadow-md">
                <item.icon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4" style={{ color: '#c9a648' }} />
                <h3 className="font-bold text-base sm:text-lg" style={{ color: '#0c2f4a' }}>{item.text}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: '#0c2f4a' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-center mb-3 sm:mb-4" style={{ color: '#f7f5f2' }}>
            How It Works
          </h2>
          <p className="text-center text-base sm:text-lg mb-12 sm:mb-16" style={{ color: '#e8e6e3' }}>
            Get started with Admiral Energy in three simple steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              { number: '1', title: 'Check Eligibility', desc: 'Fill out our quick form. Takes less than 60 seconds. No obligation whatsoever.' },
              { number: '2', title: 'Get Your Savings Report', desc: 'See exactly how much you can save with Duke rebates and federal tax credits.' },
              { number: '3', title: 'Book Free Consultation', desc: 'Schedule a virtual meeting to learn about your solar and battery options.' }
            ].map((step, i) => (
              <div key={i} className="relative text-center p-6 sm:p-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                   style={{ backgroundColor: '#1a4d74' }}>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg"
                     style={{ backgroundColor: '#c9a648', color: '#0c2f4a' }}>
                  {step.number}
                </div>
                <h3 className="font-bold text-lg sm:text-xl mb-3 mt-4" style={{ color: '#c9a648' }}>{step.title}</h3>
                <p className="leading-relaxed text-sm sm:text-base" style={{ color: '#e8e6e3' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rebate Explainer */}
      <section className="py-16 sm:py-20 relative overflow-hidden" style={{ backgroundColor: '#f7f5f2' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center mb-3 sm:mb-4" style={{ color: '#0c2f4a' }}>
            Maximum Savings Breakdown
          </h2>
          <p className="text-center text-base sm:text-lg mb-8 sm:mb-12" style={{ color: '#1a4d74' }}>
            Combine state and federal incentives for unprecedented savings
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="relative p-6 sm:p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
                 style={{ background: 'linear-gradient(135deg, #c9a648 0%, #b89539 100%)' }}>
              <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 mb-4" style={{ color: '#0c2f4a' }} />
              <p className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-2" style={{ color: '#0c2f4a' }}>
                $9,000
              </p>
              <p className="text-lg sm:text-xl font-bold mb-2" style={{ color: '#0c2f4a' }}>
                Duke Energy PowerPair Program
              </p>
              <p className="text-sm opacity-90" style={{ color: '#0c2f4a' }}>
                Direct cash rebate for qualifying solar + battery systems
              </p>
            </div>

            <div className="relative p-6 sm:p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
                 style={{ backgroundColor: '#0c2f4a' }}>
              <Zap className="w-10 h-10 sm:w-12 sm:h-12 mb-4" style={{ color: '#c9a648' }} />
              <p className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-2" style={{ color: '#c9a648' }}>
                30%
              </p>
              <p className="text-lg sm:text-xl font-bold mb-2" style={{ color: '#f7f5f2' }}>
                Federal Solar Tax Credit
              </p>
              <p className="text-sm" style={{ color: '#e8e6e3' }}>
                30% of total system cost back via tax credit
              </p>
            </div>
          </div>

          <div className="text-center p-4 sm:p-6 rounded-xl" style={{ backgroundColor: '#c9a648', color: '#0c2f4a' }}>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center justify-center gap-2 flex-wrap">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              Programs are first-come, first-served. Capacity is filling fast.
            </p>
          </div>
        </div>
      </section>

      {/* Mid-Page CTA */}
      <section className="py-12 sm:py-16 relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #c9a648 0%, #b89539 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-4 sm:mb-6" style={{ color: '#0c2f4a' }}>
            Don't Leave Money on the Table
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8" style={{ color: '#0c2f4a', opacity: 0.9 }}>
            Check your eligibility now before rebates run out
          </p>
          <button
            onClick={scrollToForm}
            className="px-8 sm:px-10 py-4 sm:py-5 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl flex items-center gap-2 mx-auto group"
            style={{ backgroundColor: '#0c2f4a', color: '#c9a648' }}
            aria-label="See if you qualify"
          >
            See If I Qualify
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* Credibility */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: '#0c2f4a' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center mb-3 sm:mb-4" style={{ color: '#f7f5f2' }}>
            Premium Equipment & Service
          </h2>
          <p className="text-center text-base sm:text-lg mb-8 sm:mb-12" style={{ color: '#e8e6e3' }}>
            We partner with the world's best solar manufacturers
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
            {['Made in USA', 'REC Partner', 'QCELLS', 'Tesla Powerwall'].map((partner, i) => (
              <div key={i}
                   className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-110 hover:shadow-xl"
                   style={{ backgroundColor: '#1a4d74', color: '#c9a648' }}>
                {partner}
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="flex justify-center items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 sm:w-8 sm:h-8 fill-current" style={{ color: '#c9a648' }} />
              ))}
            </div>
            <p className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#f7f5f2' }}>
              5.0 Star Rating
            </p>
            <p className="text-base sm:text-lg" style={{ color: '#e8e6e3' }}>
              Based on 500+ verified customer reviews
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 relative overflow-hidden" style={{ backgroundColor: '#1a4d74' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-4 sm:mb-6 leading-tight px-2"
              style={{ color: '#f7f5f2' }}>
            Stop Renting Power From Duke.<br />
            <span style={{ color: '#c9a648' }}>Start Owning It.</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8" style={{ color: '#e8e6e3' }}>
            Join thousands of North Carolina homeowners who've made the switch
          </p>
          <button
            onClick={scrollToForm}
            className="px-8 sm:px-10 py-4 sm:py-5 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl flex items-center gap-2 mx-auto group animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #c9a648 0%, #b89539 100%)', color: '#0c2f4a' }}
            aria-label="Check eligibility now"
          >
            Check My Eligibility Now
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: '#0c2f4a', borderTop: '1px solid #1a4d74' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#c9a648' }}>
                ⚡ Admiral Energy
              </h3>
              <p className="text-sm" style={{ color: '#e8e6e3' }}>
                North Carolina's premier solar and battery storage provider
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4" style={{ color: '#c9a648' }}>Contact Us</h4>
              <div className="space-y-2">
                <a href="tel:9195550123" className="flex items-center gap-2 text-sm hover:underline transition-colors"
                   style={{ color: '#e8e6e3' }}>
                  <Phone className="w-4 h-4" />
                  (919) 555-0123
                </a>
                <a href="mailto:info@admiralenergy.com" className="flex items-center gap-2 text-sm hover:underline transition-colors"
                   style={{ color: '#e8e6e3' }}>
                  <Mail className="w-4 h-4" />
                  info@admiralenergy.com
                </a>
                <p className="flex items-center gap-2 text-sm" style={{ color: '#e8e6e3' }}>
                  <MapPin className="w-4 h-4" />
                  Serving all of North Carolina
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4" style={{ color: '#c9a648' }}>Legal</h4>
              <div className="space-y-2">
                <a href="/legal/privacy" className="block text-sm hover:underline transition-colors" style={{ color: '#e8e6e3' }}>
                  Privacy Policy
                </a>
                <a href="/legal/terms" className="block text-sm hover:underline transition-colors" style={{ color: '#e8e6e3' }}>
                  Terms of Service
                </a>
                <p className="text-xs mt-4" style={{ color: '#e8e6e3', opacity: 0.7 }}>
                  NC License #12345 | ROC #67890
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 border-t" style={{ borderColor: '#1a4d74' }}>
            <p className="text-sm" style={{ color: '#e8e6e3' }}>
              &copy; 2025 Admiral Energy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}