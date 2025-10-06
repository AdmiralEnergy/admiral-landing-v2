import { useEffect, useState } from "react";
import { router } from "../router";

const links = [
  { to: "/", label: "Landing" },
  { to: "/catalog", label: "Catalog" },
  { to: "/calculator", label: "Calculator" },
];

export default function DevNav() {
  const [pathname, setPathname] = useState(router.state.location.pathname);

  useEffect(() => {
    return router.subscribe((state) => {
      setPathname(state.location.pathname);
    });
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 16,
        left: 16,
        zIndex: 999,
        display: "flex",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.9)",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.1)",
        backdropFilter: "blur(6px)",
      }}
    >
      {links.map(({ to, label }) => {
        const isActive = pathname === to;
        return (
          <a
            key={to}
            href={to}
            onClick={(event) => {
              event.preventDefault();
              router.navigate(to);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: "none",
              color: isActive ? "#0c2f4a" : "#1a4d74",
              border: `2px solid ${isActive ? "#c9a648" : "transparent"}`,
              background: isActive ? "rgba(201,166,72,0.18)" : "transparent",
            }}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
