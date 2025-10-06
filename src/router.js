import { jsx as _jsx } from "react/jsx-runtime";
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
const Landing = lazy(() => import("./pages/AdmiralEnergyLanding"));
const Catalog = lazy(() => import("./pages/ProductCatalog"));
const Calculator = lazy(() => import("./pages/SolarCalculator"));
export const router = createBrowserRouter([
    { path: "/", element: _jsx(Landing, {}) },
    { path: "/catalog", element: _jsx(Catalog, {}) },
    { path: "/calculator", element: _jsx(Calculator, {}) },
    { path: "*", element: _jsx(Landing, {}) },
]);
