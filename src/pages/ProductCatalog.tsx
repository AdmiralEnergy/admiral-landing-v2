import Nav from "../components/Nav";

const products = [
  {
    name: "SunPower A-Series",
    details: "Premium all-black panels with 22.7% efficiency.",
  },
  {
    name: "Enphase IQ Batteries",
    details: "Modular storage with app-based monitoring and backup power.",
  },
  {
    name: "Tesla Powerwall",
    details: "Whole-home backup with 13.5 kWh capacity and storm watch mode.",
  },
];

export default function ProductCatalog() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 900, margin: "0 auto" }}>
        <header style={{ marginTop: 48 }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: 12 }}>Admiral Energy Product Catalog</h1>
          <p style={{ fontSize: "1.1rem", maxWidth: 640 }}>
            High-efficiency panels, smart inverters, and storage options engineered for Carolina
            homes. Every system includes design, permitting, installation, and ongoing monitoring.
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gap: 20,
            marginTop: 32,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {products.map((product) => (
            <article
              key={product.name}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 15px 40px rgba(15, 23, 42, 0.06)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>{product.name}</h2>
              <p style={{ marginBottom: 0 }}>{product.details}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
