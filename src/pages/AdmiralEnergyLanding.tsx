import { FormEvent, useMemo, useState } from "react";
import { netlifySubmit } from "../lib/netlifyForm";
import { getSavedUtm } from "../lib/utm";

type LeadFormState = {
  name: string;
  email: string;
  phone: string;
  zip: string;
  botField: string;
};

const initialState: LeadFormState = {
  name: "",
  email: "",
  phone: "",
  zip: "",
  botField: "",
};

export default function AdmiralEnergyLanding() {
  const [formState, setFormState] = useState<LeadFormState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const utm = useMemo(() => getSavedUtm(), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formState.botField) return;

    setStatus("submitting");

    const payload: Record<string, string> = {
      name: formState.name,
      email: formState.email,
      phone: formState.phone,
      zip: formState.zip,
      ...utm,
    };
    payload["bot-field"] = formState.botField;

    try {
      await netlifySubmit("lead", payload);
      setStatus("success");
      setFormState(initialState);

      if ((window as any).gtag) {
        (window as any).gtag("event", "lead_submit", { page: location.pathname });
      }
      if ((window as any).rdt) {
        (window as any).rdt("track", "Lead");
      }
    } catch (error) {
      console.error("Lead form submission failed", error);
      setStatus("error");
    }
  };

  const fireGaTestEvent = () => {
    if ((window as any).gtag) {
      (window as any).gtag("event", "test_event", { page: location.pathname });
      console.info("GA test_event dispatched");
    }
  };

  const fireRedditLead = () => {
    if ((window as any).rdt) {
      (window as any).rdt("track", "Lead");
      console.info("Reddit Lead event dispatched");
    }
  };

  const dumpUtm = () => {
    console.info("Saved UTM", getSavedUtm());
  };

  return (
    <>
      <main>
        <div className="container" style={{ display: "grid", gap: 40, alignItems: "start" }}>
          <section style={{ paddingTop: 24, maxWidth: 680 }}>
            <h1 style={{ fontSize: "clamp(2.5rem, 3vw + 1rem, 3.5rem)", marginBottom: "1rem" }}>
              Admiral Energy — Solar Made Straightforward
            </h1>
            <p style={{ fontSize: "1.15rem", lineHeight: 1.7 }}>
              We analyze your roof, usage, and available incentives to design a solar system that lowers
              your Duke Energy bill and boosts your home value. Tell us a bit about yourself to get your
              personalized plan.
            </p>
          </section>

          <section
            style={{
              padding: 28,
              borderRadius: 20,
              background: "#ffffff",
              boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
              width: "min(100%, 520px)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Start your free solar assessment</h2>
            <form
              name="lead"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              style={{ display: "grid", gap: 16 }}
            >
              <input type="hidden" name="form-name" value="lead" />
              <label style={{ display: "flex", flexDirection: "column", fontWeight: 600 }}>
                Name
                <input
                  required
                  name="name"
                  value={formState.name}
                  onChange={(event) => setFormState((state) => ({ ...state, name: event.target.value }))}
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
                  onChange={(event) => setFormState((state) => ({ ...state, email: event.target.value }))}
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
                  onChange={(event) => setFormState((state) => ({ ...state, phone: event.target.value }))}
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
                  onChange={(event) => setFormState((state) => ({ ...state, zip: event.target.value }))}
                  placeholder="28202"
                  style={{ padding: "0.85rem", borderRadius: 10, border: "1px solid #cbd5f5" }}
                />
              </label>
              <input
                type="text"
                name="bot-field"
                tabIndex={-1}
                autoComplete="off"
                value={formState.botField}
                onChange={(event) => setFormState((state) => ({ ...state, botField: event.target.value }))}
                style={{ display: "none" }}
              />
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
              <div aria-live="polite" style={{ minHeight: 24 }}>
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
              </div>
            </form>
          </section>
        </div>
      </main>

      {import.meta.env.DEV && (
        <footer
          className="container"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            paddingBottom: 48,
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={fireGaTestEvent}
            style={{ padding: "0.6rem 1rem", borderRadius: 8, border: "1px solid #cbd5f5", background: "#fff" }}
          >
            Fire GA test_event
          </button>
          <button
            type="button"
            onClick={fireRedditLead}
            style={{ padding: "0.6rem 1rem", borderRadius: 8, border: "1px solid #cbd5f5", background: "#fff" }}
          >
            Fire Reddit Lead
          </button>
          <button
            type="button"
            onClick={dumpUtm}
            style={{ padding: "0.6rem 1rem", borderRadius: 8, border: "1px solid #cbd5f5", background: "#fff" }}
          >
            Dump UTM
          </button>
        </footer>
      )}
    </>
  );
}
