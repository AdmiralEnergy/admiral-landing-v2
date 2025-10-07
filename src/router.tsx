import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import NotFound from "./components/NotFound";

const LandingPage = lazy(() => import("./pages/AdmiralEnergyLanding"));
const CalculatorPage = lazy(() => import("./pages/SolarCalculator"));
const AdvisorPage = lazy(() => import("./pages/SolarComparisonTool"));
const CatalogPage = lazy(() => import("./pages/ProductCatalog"));

export default function AppRouter() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-700">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/** index route */}
          <Route index element={<Suspense fallback={null}><LandingPage /></Suspense>} />
          <Route path="advisor" element={<Suspense fallback={null}><AdvisorPage /></Suspense>} />
          <Route path="calculator" element={<Suspense fallback={null}><CalculatorPage /></Suspense>} />
          <Route path="catalog" element={<Suspense fallback={null}><CatalogPage /></Suspense>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
