// src/router.tsx
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";

// PAGES – PascalCase, default exports
const LandingPage = lazy(() => import("./pages/AdmiralEnergyLanding"));
const CalculatorPage = lazy(() => import("./pages/SolarCalculator"));
// Keep advisor feature gated by env flag, but mount canonical tool at /advisor and the wizard at /intake
const CatalogPage = lazy(() => import("./pages/ProductCatalog"));

// LIGHT LAYOUT + 404
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
function NotFound() {
  return <div style={{ padding: 24 }}>404 — Not Found</div>;
}

const ENABLE_ADVISOR = (import.meta.env.VITE_ENABLE_ADVISOR ?? 'true') === 'true';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Suspense fallback={null}><LandingPage /></Suspense> },
      // /advisor -> canonical SolarComparisonTool (lazy loaded from routes/advisor)
      ...(ENABLE_ADVISOR ? [{
        path: "advisor",
        lazy: async () => {
          const m = await import("./routes/advisor/solar-comparison-tool");
          return { Component: m.default };
        }
      }] : []),
      // /intake -> preserved advisor wizard
      ...(ENABLE_ADVISOR ? [{
        path: "intake",
        lazy: async () => {
          const m = await import("./routes/advisor/index");
          return { Component: m.default };
        }
      }] : []),
      { path: "calculator", element: <Suspense fallback={null}><CalculatorPage /></Suspense> },
      { path: "catalog", element: <Suspense fallback={null}><CatalogPage /></Suspense> },
      { path: "*", element: <NotFound /> }, // keep LAST
    ],
  },
]);

export { router };
export default function AppRouter() {
  return <RouterProvider router={router} />;
}
