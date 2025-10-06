import { useMemo, useState } from "react";
import { getSavedUtm } from "../lib/utm";

type CalculatorState = {
  monthlyBill: number;
  roofShade: "full" | "partial" | "none";
};

const savingsMultiplier: Record<CalculatorState["roofShade"], number> = {
  none: 1,
  partial: 0.85,
  full: 0.65,
};

export default function SolarCalculator() {
  const [inputs, setInputs] = useState<CalculatorState>({ monthlyBill: 160, roofShade: "partial" });
  const utm = useMemo(() => getSavedUtm(), []);

  const projectedSavings = Math.round(inputs.monthlyBill * 0.9 * savingsMultiplier[inputs.roofShade]);
  const systemSizeKw = Math.max(4, Math.round((inputs.monthlyBill / 15) * savingsMultiplier[inputs.roofShade]));

  return (
    <main>
      <div className="container" style={{ display: "grid", gap: 32 }}>
        <header style={{ paddingTop: 24, maxWidth: 720 }}>
          <h1 style={{ fontSize: "clamp(2.25rem, 2vw + 1rem, 3rem)", marginBottom: 12 }}>NC Solar Calculator</h1>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
            Estimate your monthly savings and recommended system size based on your Duke Energy bill. We’ll
            email you a full report with financing options and utility incentives.
          </p>
        </header>

        <section
          style={{
            padding: 28,
            borderRadius: 20,
            background: "#fff",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
            display: "grid",
            gap: 24,
            maxWidth: 640,
          }}
        >
          <div style={{ display: "grid", gap: 16 }}>
            <label style={{ display: "flex", flexDirection: "column", fontWeight: 600 }}>
              Average monthly Duke bill ($)
              <input
                type="number"
                min={50}
                name="monthlyBill"
                value={inputs.monthlyBill}
                onChange={(event) =>
                  setInputs((state) => ({ ...state, monthlyBill: Number(event.target.value) }))
                }
                style={{ padding: "0.85rem", borderRadius: 10, border: "1px solid #cbd5f5" }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", fontWeight: 600 }}>
              Roof shading
              <select
                name="roofShade"
                value={inputs.roofShade}
                onChange={(event) =>
                  setInputs((state) => ({ ...state, roofShade: event.target.value as CalculatorState["roofShade"] }))
                }
                style={{ padding: "0.85rem", borderRadius: 10, border: "1px solid #cbd5f5" }}
              >
                <option value="none">Full sun</option>
                <option value="partial">Partial shade</option>
                <option value="full">Significant shade</option>
              </select>
            </label>
          </div>

          <div style={{ padding: 16, borderRadius: 12, background: "#f1f5f9" }}>
            <p style={{ margin: "0 0 8px" }}>Projected monthly savings</p>
            <strong style={{ fontSize: "1.75rem" }}>${projectedSavings}</strong>
            <p style={{ margin: "12px 0 0" }}>Recommended system size: {systemSizeKw} kW</p>
          </div>

          <p style={{ margin: 0, fontSize: "0.95rem", color: "#1e293b" }}>
            Ready for the full design? We’ll use these inputs{Object.keys(utm).length ? " and your saved UTM parameters" : ""}
            to prepare a proposal within 24 hours.
          </p>
        </section>
      </div>
    </main>
  );
}
