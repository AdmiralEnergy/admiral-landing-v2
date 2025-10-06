import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const linkBase = "px-3 py-2 text-sm font-medium hover:opacity-80";
  const active = "text-emerald-600";
  const idle = "text-slate-700";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-4 h-14">
        <Link to="/" className="font-semibold">
          Admiral Energy
        </Link>
        <div className="flex items-center gap-1">
          <NavLink
            to="/catalog"
            className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}
          >
            Catalog
          </NavLink>
          <NavLink
            to="/calculator"
            className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}
          >
            Calculator
          </NavLink>
          <a href="#lead" className={`${linkBase} ${idle}`}>
            Get Quote
          </a>
        </div>
      </nav>
    </header>
  );
}
