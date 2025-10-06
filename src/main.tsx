import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import DevNav from "./components/DevNav";
import { initAnalytics } from "./lib/analytics";
import { saveUtmFromUrl } from "./lib/utm";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

initAnalytics();
saveUtmFromUrl();

const App = () => (
  <>
    {import.meta.env.DEV && <DevNav />}
    <React.Suspense fallback={<div />}> 
      <RouterProvider router={router} />
    </React.Suspense>
  </>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
