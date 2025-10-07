export default function Header() {
  const linkBase = "px-3 py-2 text-sm font-medium hover:opacity-80";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-4 h-14">
        <a href="/" className="font-semibold text-slate-900 hover:opacity-80">
          Admiral Energy
        </a>

        <div className="flex items-center gap-1">
          <a href="#lead" className={`${linkBase} text-slate-700`}>Get Quote</a>
          <a href="/advisor" className={`${linkBase} text-slate-700`}>Advisor</a>
        </div>
      </nav>
    </header>
  );
}
