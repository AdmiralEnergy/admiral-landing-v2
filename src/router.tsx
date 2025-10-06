import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const Landing = lazy(() => import("./pages/AdmiralEnergyLanding"));
const Catalog = lazy(() => import("./pages/ProductCatalog"));
const Calculator = lazy(() => import("./pages/SolarCalculator"));

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/catalog", element: <Catalog /> },
  { path: "/calculator", element: <Calculator /> },
  { path: "*", element: <Landing /> },
]);
