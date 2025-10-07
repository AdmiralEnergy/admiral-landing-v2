import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Landing = lazy(() => import("./pages/AdmiralEnergyLanding"));
const Catalog = lazy(() => import("./pages/ProductCatalog"));
const Calculator = lazy(() => import("./pages/SolarCalculator"));
const SolarComparisonTool = lazy(() => import("./pages/SolarComparisonTool"));

export default function AppRouter() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-700">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/advisor" element={<SolarComparisonTool />} />
      </Routes>
    </Suspense>
  );
}
