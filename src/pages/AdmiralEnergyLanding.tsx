import { FormEvent, useMemo, useState } from "react";
import Nav from "../components/Nav";
import { getSavedUtm } from "../lib/utm";

const encode = (data: Record<string, string>) =>
  Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

type LeadFormState = {
  name: string;
  email: string;
  phone: string;
  zip: string;
  botField: string;
};

export default function AdmiralEnergyLanding() {
  const [formState, setFormState] = useState<LeadFormState>({
    name: "",
    email: "",
    phone: "",
    zip: "",
    botField: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const utm = useMemo(() => getSavedUtm(), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formState.botField) return;

    setStatus("submitting");
    const data = {
      "form-name": "lead",
      name: formState.name,
      email: formState.email,
      phone: formState.phone,
      zip: formState.zip,
      ...utm,
    } as Record<string, string>;

    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(data),
      });

      setStatus("success");
      setFormState({ name: "", email: "", phone: "", zip: "", botField: "" });

      if ((window as any).gtag) {
        (window as any).gtag("event", "lead_submit", { page: location.pathname });
      }
      if ((window as any).rdt) {
        (window as any).rdt("track", "Lead");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 800, margin: "0 auto" }}>
        <section style={{ marginTop: 48 }}>
          <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
            Admiral Energy — Solar Made Straightforward
          </h1>
          <p style={{ fontSize: "1.2rem", lineHeight: 1.7, maxWidth: 640 }}>
            We analyze your roof, usage, and available incentives to design a solar system that
            lowers your Duke Energy bill and boosts your home value. Tell us a bit about yourself to
            get your personalized plan.
          </p>
        </section>

        <section
          style={{
            marginTop: 32,
            padding: 24,
            borderRadius: 16,
            background: "#ffffff",
            boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Start your free solar assessment</h2>
          <form name="lead" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleSubmit}>
            <input type="hidden" name="form-name" value="lead" />
            <label style={{ display: "flex", flexDirection: "column", fontWeight: 600 }}>
              Name
              <input
                required
                name="name"
                value={formState.name}
                onChange={(event) => setFormState((s) => ({ ...s, name: event.target.value }))}
                placeholder="Jane Solar"
                style={{ padding: "0.85rem", borderRadius: 10, border: "1px solid #cbd5f5" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontWeight: 600 }}>
              Email
              <input
                required
                type="email"
                name="email"
                value={formState.email}
                onChange={(event) => setFormState((s) => ({ ...s, email: event.target.value }))}
                placeholder="you@example.com"
                style={{ padding: "0.85rem", borderRadius: 10, border: "1px solid #cbd5f5" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontWeight: 600 }}>
              Phone
              <input
                required
                name="phone"
                value={formState.phone}
                onChange={(event) => setFormState((s) => ({ ...s, phone: event.target.value }))}
                placeholder="(704) 555-0123"
                style={{ padding: "0.85rem", borderRadius: 10, border: "1px solid #cbd5f5" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontWeight: 600 }}>
              ZIP Code
              <input
                required
                name="zip"
                value={formState.zip}
                onChange={(event) => setFormState((s) => ({ ...s, zip: event.target.value }))}
                placeholder="28202"
                style={{ padding: "0.85rem", borderRadius: 10, border: "1px solid #cbd5f5" }}
              />
            </label>
            <div style={{ display: "none" }}>
              <label>
                Don’t fill this out
                <input
                  name="bot-field"
                  value={formState.botField}
                  onChange={(event) => setFormState((s) => ({ ...s, botField: event.target.value }))}
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={status === "submitting"}
              style={{
                padding: "0.9rem 1.2rem",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #c9a648, #f4d867)",
                color: "#0c2f4a",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              {status === "submitting" ? "Sending..." : "Book My Solar Review"}
            </button>
            {status === "success" && (
              <p style={{ color: "#15803d", margin: "0.5rem 0 0" }}>
                Thanks! We’ll be in touch shortly with your custom plan.
              </p>
            )}
            {status === "error" && (
              <p style={{ color: "#b91c1c", margin: "0.5rem 0 0" }}>
                Something went wrong. Please try again or email hello@admiralenergy.ai.
              </p>
            )}
          </form>
        </section>
      </main>
    </>
  );
}
