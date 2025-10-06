import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./index.css";
import { initAnalytics } from "./lib/analytics";
import { saveUtmFromUrl } from "./lib/utm";

initAnalytics();
saveUtmFromUrl();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <React.Suspense fallback={<div />}>
      <RouterProvider router={router} />
    </React.Suspense>
  </React.StrictMode>
);
