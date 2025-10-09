// src/router.tsx
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";

// PAGES – PascalCase, default exports
const LandingPage = lazy(() => import("./pages/AdmiralEnergyLanding"));
const CalculatorPage = lazy(() => import("./pages/SolarCalculator"));
const AdvisorPage = lazy(() => import("./routes/advisor/index"));
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

const ENABLE_ADVISOR = import.meta.env.VITE_ENABLE_ADVISOR === 'true';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Suspense fallback={null}><LandingPage /></Suspense> },
      // /advisor is gated by VITE_ENABLE_ADVISOR to keep it internal by default
      ...(ENABLE_ADVISOR ? [{ path: "advisor", element: <Suspense fallback={null}><AdvisorPage /></Suspense> }] : []),
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
