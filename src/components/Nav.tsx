import { Link, useLocation } from "react-router-dom";
import { ReactNode } from "react";

type LinkElProps = {
  to: string;
  children: ReactNode;
};

export default function Nav() {
  const { pathname } = useLocation();

  const LinkEl = ({ to, children }: LinkElProps) => (
    <Link
      to={to}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        fontWeight: 700,
        textDecoration: "none",
        color: pathname === to ? "#0c2f4a" : "#1a4d74",
        background: pathname === to ? "rgba(201,166,72,0.25)" : "transparent",
        border: pathname === to ? "2px solid #c9a648" : "2px solid transparent",
        marginRight: 8,
      }}
    >
      {children}
    </Link>
  );

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        padding: 12,
        position: "fixed",
        top: 8,
        left: 8,
        zIndex: 99,
        background: "rgba(255,255,255,.85)",
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,.08)",
      }}
    >
      <LinkEl to="/">Landing</LinkEl>
      <LinkEl to="/catalog">Catalog</LinkEl>
      <LinkEl to="/calculator">Calculator</LinkEl>
    </div>
  );
}
