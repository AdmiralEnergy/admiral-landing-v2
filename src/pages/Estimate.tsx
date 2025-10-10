import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { track } from "../config/analytics";

type FormState = {
  name: string;
  email: string;
  phone: string;
  zip: string;
  message: string;
  source: string;
  botField: string; // honeypot
};

export default function Estimate() {
  const [params] = useSearchParams();
  const initialSource = useMemo(() => params.get("source") || "direct", [params]);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    zip: "",
    message: "",
    source: initialSource,
    botField: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.phone.trim()) next.phone = "Phone is required";
    if (!form.zip.trim()) next.zip = "ZIP code is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const encode = (data: Record<string, string>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(data)) params.append(k, v);
    return params.toString();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    if (form.botField) return; // honeypot filled -> ignore

    setStatus("submitting");
    try {
      const body = encode({
        "form-name": "estimate",
        name: form.name,
        email: form.email,
        phone: form.phone,
        zip: form.zip,
        message: form.message,
        source: form.source,
      });
      const res = await fetch("/?no-cache=1", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Fire GA4 generate_lead if GA is configured
      if (import.meta.env.VITE_GA_ID) {
        try {
          track("generate_lead", { source: form.source, form: "estimate" });
        } catch {}
      }

      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-2">Thanks! We received your request.</h1>
        <p className="text-slate-600">
          Our team will reach out shortly with your custom estimate.
          You can close this tab or continue browsing.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Request Your Estimate</h1>
      <p className="text-slate-600 mb-8">
        Tell us a bit about your home. We’ll prepare a tailored solar or battery estimate.
      </p>

      <form
        name="estimate"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        onSubmit={onSubmit}
        className="grid gap-4"
      >
        {/* Netlify wiring */}
        <input type="hidden" name="form-name" value="estimate" />
        <input type="hidden" name="source" value={form.source} />
        <input type="text" name="bot-field" value={form.botField} onChange={onChange} className="hidden" aria-hidden="true" />

        <div className="grid gap-1">
          <label className="text-sm font-medium" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={onChange}
            className="rounded-md border px-3 py-2"
            placeholder="Jane Doe"
            required
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            className="rounded-md border px-3 py-2"
            placeholder="jane@example.com"
            required
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium" htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="rounded-md border px-3 py-2"
            placeholder="(555) 123-4567"
            required
          />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium" htmlFor="zip">ZIP code</label>
          <input
            id="zip"
            name="zip"
            value={form.zip}
            onChange={onChange}
            className="rounded-md border px-3 py-2"
            placeholder="28202"
            required
          />
          {errors.zip && <p className="text-sm text-red-600">{errors.zip}</p>}
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium" htmlFor="message">Message (optional)</label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={onChange}
            className="rounded-md border px-3 py-2 min-h-[96px]"
            placeholder="Tell us about your goals, roof, backup needs, etc."
          />
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-2 inline-flex items-center justify-center rounded-md bg-emerald-600 px-6 py-3 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting…" : "Request Estimate →"}
        </button>

        {status === "error" && (
          <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
        )}
      </form>
    </section>
  );
}
