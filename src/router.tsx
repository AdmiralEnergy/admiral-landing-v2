import { createBrowserRouter, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";

// Pages (default exports)
const LandingPage = lazy(() => import("./pages/AdmiralEnergyLanding"));
const CalculatorPage = lazy(() => import("./pages/SolarCalculator"));
const CatalogPage = lazy(() => import("./pages/ProductCatalog"));
const EstimatePage = lazy(() => import("./pages/Estimate"));

// Advisor routes
// /advisor -> canonical lowercase tool
// /intake  -> preserved wizard
const AdvisorPage = lazy(() => import("./routes/advisor/solar-comparison-tool"));
const IntakeWizard = lazy(() => import("./routes/advisor/index"));

import Header from "./components/layout/Header";

function Layout() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Suspense fallback={null}><LandingPage /></Suspense> },
      { path: "calculator", element: <Suspense fallback={null}><CalculatorPage /></Suspense> },
      { path: "catalog", element: <Suspense fallback={null}><CatalogPage /></Suspense> },
      { path: "estimate", element: <Suspense fallback={null}><EstimatePage /></Suspense> },
      { path: "advisor", element: <Suspense fallback={null}><AdvisorPage /></Suspense> },
      { path: "intake", element: <Suspense fallback={null}><IntakeWizard /></Suspense> },
      { path: "*", element: <Suspense fallback={null}><LandingPage /></Suspense> },
    ],
  },
]);

export default router;
