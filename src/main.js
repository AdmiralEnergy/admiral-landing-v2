import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./index.css";
createRoot(document.getElementById("root")).render(_jsx(Suspense, { fallback: _jsx("div", { style: { padding: 24 }, children: "Loading\u2026" }), children: _jsx(RouterProvider, { router: router }) }));
